import React, { useState } from 'react';
import { Upload, FileText, Download, Eye, Loader2, CheckCircle, AlertCircle, GitCompare } from 'lucide-react';
import Layout from '../components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import DocumentUploadZone from '../components/documents/DocumentUploadZone';
import DocumentAnalysisResults from '../components/documents/DocumentAnalysisResults';
import DocumentComparison from '../components/documents/DocumentComparison';

interface UploadedDocument {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  analysis?: {
    title: string;
    summary: string;
    subheaders: Array<{
      level: number;
      text: string;
      page?: number;
      content?: string;
    }>;
    metadata: {
      pageCount: number;
      wordCount: number;
      language: string;
      fileType: string;
      lastModified?: string;
    };
    keyTopics: string[];
    documentStructure: Array<{
      section: string;
      pages: string;
      description: string;
    }>;
  };
  error?: string;
}

const DocumentAnalyzer: React.FC = () => {
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<UploadedDocument | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<UploadedDocument[]>([]);

  const handleFileUpload = async (files: File[]) => {
    const newDocuments: UploadedDocument[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date(),
      status: 'uploading',
      progress: 0
    }));

    setDocuments(prev => [...prev, ...newDocuments]);

    // Upload files to API with progress tracking
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      // Create XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          newDocuments.forEach(doc => {
            setDocuments(prev => prev.map(d => 
              d.id === doc.id && d.status === 'uploading' ? {
                ...d,
                progress: percentComplete
              } : d
            ));
          });
        }
      });

      // Handle completion
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const result = JSON.parse(xhr.responseText);
            
            // Update documents with analysis results
            result.files.forEach((fileResult: any, index: number) => {
              const docId = newDocuments[index]?.id;
              if (docId) {
                setDocuments(prev => prev.map(doc => 
                  doc.id === docId ? {
                    ...doc,
                    status: fileResult.status,
                    progress: 100,
                    analysis: fileResult.analysis,
                    error: fileResult.error
                  } : doc
                ));
              }
            });
          } catch (parseError) {
            console.error('Error parsing response:', parseError);
            throw new Error('Invalid response from server');
          }
        } else {
          throw new Error(`Upload failed with status ${xhr.status}`);
        }
      });

      // Handle errors
      xhr.addEventListener('error', () => {
        throw new Error('Network error during upload');
      });

      // Start upload
      xhr.open('POST', '/api/documents/upload');
      xhr.send(formData);

    } catch (error) {
      console.error('Upload error:', error);
      // Mark all new documents as failed
      newDocuments.forEach(doc => {
        setDocuments(prev => prev.map(d => 
          d.id === doc.id ? {
            ...d,
            status: 'error',
            error: error instanceof Error ? error.message : 'Upload failed'
          } : d
        ));
      });
    }
  };

  const handleDocumentSelect = (document: UploadedDocument) => {
    if (comparisonMode) {
      // In comparison mode, allow selecting multiple documents
      setSelectedDocuments(prev => {
        const isAlreadySelected = prev.some(doc => doc.id === document.id);
        if (isAlreadySelected) {
          return prev.filter(doc => doc.id !== document.id);
        } else if (prev.length < 2) {
          return [...prev, document];
        } else {
          // Replace the first document if already have 2 selected
          return [prev[1], document];
        }
      });
    } else {
      setSelectedDocument(document);
    }
  };

  const toggleComparisonMode = () => {
    setComparisonMode(!comparisonMode);
    setSelectedDocuments([]);
    if (!comparisonMode) {
      setSelectedDocument(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Layout>
      {/* Top Banner */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-purple-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Document Analysis & Intelligence</h1>
                  <p className="text-gray-600">Upload documents to extract structure, analyze content, and generate AI-powered insights</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">

          {documents.length === 0 ? (
            <div className="space-y-6">
              {/* Upload Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="h-5 w-5 text-purple-600" />
                    <span>Upload Documents</span>
                  </CardTitle>
                  <CardDescription>
                    Supported formats: PDF (.pdf), Word (.docx, .doc). Maximum file size: 50MB per file.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentUploadZone onFilesSelected={handleFileUpload} />
                </CardContent>
              </Card>

              {/* Features Overview */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <span>Structure Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Automatically extract document structure, headers, and subheaders with intelligent content organization.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Eye className="h-5 w-5 text-blue-600" />
                      <span>Content Insights</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Generate summaries, extract key topics, and analyze document metadata for comprehensive understanding.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <GitCompare className="h-5 w-5 text-green-600" />
                      <span>Smart Comparison</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Compare multiple documents side-by-side with similarity analysis and structural differences.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Compact Upload Bar */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Upload className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium">Add More Documents</p>
                        <p className="text-xs text-gray-500">PDF, Word • Max 50MB per file</p>
                      </div>
                    </div>
                    <DocumentUploadZone onFilesSelected={handleFileUpload} compact={true} />
                  </div>
                  {comparisonMode && (
                    <Alert className="mt-4">
                      <GitCompare className="h-4 w-4" />
                      <AlertDescription>
                        Comparison mode active. Select 2 completed documents to compare them side-by-side.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Documents List */}
                <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center space-x-2">
                        <FileText className="h-5 w-5" />
                        <span>Uploaded Documents</span>
                      </span>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{documents.length}</Badge>
                        <Button
                          variant={comparisonMode ? "default" : "outline"}
                          size="sm"
                          onClick={toggleComparisonMode}
                          disabled={documents.filter(doc => doc.status === 'completed').length < 2}
                        >
                          <GitCompare className="h-4 w-4 mr-1" />
                          Compare
                        </Button>
                      </div>
                    </CardTitle>
                    {comparisonMode && (
                      <CardDescription>
                        Select 2 documents to compare side-by-side ({selectedDocuments.length}/2 selected)
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                    {documents.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No documents uploaded yet</p>
                      </div>
                    ) : (
                      documents.map((doc) => (
                        <div
                          key={doc.id}
                          className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                            comparisonMode
                              ? selectedDocuments.some(selected => selected.id === doc.id)
                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              : selectedDocument?.id === doc.id
                                ? 'border-purple-500 bg-purple-50 shadow-sm'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          } ${doc.status !== 'completed' && comparisonMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => doc.status === 'completed' && handleDocumentSelect(doc)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(doc.status)}
                                <span className="text-sm font-medium truncate">{doc.name}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatFileSize(doc.size)} • {doc.uploadDate.toLocaleDateString()}
                              </p>
                              {(doc.status === 'uploading' || doc.status === 'processing') && (
                                <div className="mt-2">
                                  <Progress value={doc.progress} className="w-full" />
                                  <p className="text-xs text-gray-500 mt-1">
                                    {doc.status === 'uploading' ? 'Uploading...' : 'Processing...'} {doc.progress}%
                                  </p>
                                </div>
                              )}
                              {doc.status === 'error' && doc.error && (
                                <Alert className="mt-2">
                                  <AlertCircle className="h-4 w-4" />
                                  <AlertDescription className="text-xs">{doc.error}</AlertDescription>
                                </Alert>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Analysis Results */}
              <div className="lg:col-span-2">
                {comparisonMode ? (
                  <DocumentComparison documents={selectedDocuments} />
                ) : selectedDocument ? (
                  <DocumentAnalysisResults document={selectedDocument} />
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center text-gray-500">
                      <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2 text-gray-700">Select a Document</h3>
                      <p>Choose a completed document from the list to view detailed analysis results and start asking questions.</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DocumentAnalyzer;
