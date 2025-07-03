import React from 'react';
import { FileText, BookOpen, Hash, Clock, Globe, Tag, Eye, Download, Share, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import DocumentChatbot from './DocumentChatbot';

interface DocumentAnalysisResultsProps {
  document: {
    id: string;
    name: string;
    status: string;
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
  };
}

const DocumentAnalysisResults: React.FC<DocumentAnalysisResultsProps> = ({ document }) => {
  if (document.status === 'uploading' || document.status === 'processing') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Processing Document</span>
          </CardTitle>
          <CardDescription>Analyzing {document.name}...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Extracting text content...</span>
                <span>80%</span>
              </div>
              <Progress value={80} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analyzing document structure...</span>
                <span>60%</span>
              </div>
              <Progress value={60} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generating insights...</span>
                <span>40%</span>
              </div>
              <Progress value={40} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (document.status === 'error') {
    return (
      <Card>
        <CardContent className="p-8 text-center text-red-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-red-300" />
          <p>Failed to analyze document</p>
          <Button variant="outline" className="mt-4">
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!document.analysis) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No analysis available</p>
        </CardContent>
      </Card>
    );
  }

  const { analysis } = document;

  const getHeaderLevelIcon = (level: number) => {
    const icons = ['📋', '📄', '📝', '📌', '🔹', '🔸'];
    return icons[level - 1] || '•';
  };

  const getHeaderLevelClass = (level: number) => {
    const classes = [
      'text-lg font-bold text-gray-900',
      'text-base font-semibold text-gray-800',
      'text-sm font-medium text-gray-700',
      'text-sm text-gray-600',
      'text-xs text-gray-500',
      'text-xs text-gray-400'
    ];
    return classes[level - 1] || 'text-xs text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Document Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>{analysis.title}</span>
              </CardTitle>
              <CardDescription>Analysis completed • {document.name}</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
        </CardContent>
      </Card>

      {/* Document Metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{analysis.metadata.pageCount}</div>
            <div className="text-sm text-gray-500">Pages</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Hash className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{analysis.metadata.wordCount.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Words</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Globe className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{analysis.metadata.language}</div>
            <div className="text-sm text-gray-500">Language</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <div className="text-2xl font-bold">{analysis.metadata.fileType}</div>
            <div className="text-sm text-gray-500">Format</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis Tabs */}
      <Tabs defaultValue="structure" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="structure">Structure</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="topics">Key Topics</TabsTrigger>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="chat">
            <MessageCircle className="h-4 w-4 mr-1" />
            Q&A Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="structure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Structure Overview</CardTitle>
              <CardDescription>
                High-level organization and flow of the document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.documentStructure.map((section, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-gray-900">{section.section}</h4>
                      <Badge variant="outline">Pages {section.pages}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{section.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="headers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Headers & Subheaders</CardTitle>
              <CardDescription>
                Hierarchical structure of headings found in the document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {analysis.subheaders.map((header, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                    <div className="flex-shrink-0 w-8 text-center">
                      <span className="text-lg">{getHeaderLevelIcon(header.level)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={getHeaderLevelClass(header.level)}>{header.text}</h4>
                        {header.page && (
                          <Badge variant="secondary" className="text-xs">
                            Page {header.page}
                          </Badge>
                        )}
                      </div>
                      {header.content && (
                        <p className="text-xs text-gray-500 truncate">{header.content}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Topics & Themes</CardTitle>
              <CardDescription>
                Important topics and themes identified in the document
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysis.keyTopics.map((topic, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    <Tag className="h-3 w-3 mr-1" />
                    {topic}
                  </Badge>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">AI Insights</h4>
                <p className="text-sm text-blue-800">
                  This document appears to focus on {analysis.keyTopics.slice(0, 3).join(', ').toLowerCase()}, 
                  with comprehensive coverage across {analysis.metadata.pageCount} pages. 
                  The structured approach and detailed subsections suggest this is a formal policy or guideline document.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Section Analysis</CardTitle>
              <CardDescription>
                Detailed breakdown of each major section
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analysis.documentStructure.map((section, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-gray-900">{section.section}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Pages {section.pages}</Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-600">{section.description}</p>
                    <div className="h-px bg-gray-200"></div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <DocumentChatbot document={{ 
            id: document.id, 
            name: document.name, 
            analysis: document.analysis 
          }} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentAnalysisResults;
