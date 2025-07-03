import React from 'react';
import { FileText, GitCompare, Target, TrendingUp, Calendar, Hash, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface Document {
  id: string;
  name: string;
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
}

interface DocumentComparisonProps {
  documents: Document[];
}

const DocumentComparison: React.FC<DocumentComparisonProps> = ({ documents }) => {
  if (documents.length !== 2) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          <GitCompare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Select exactly 2 documents to compare</p>
        </CardContent>
      </Card>
    );
  }

  const [doc1, doc2] = documents;

  const getSimilarityScore = (topics1: string[], topics2: string[]) => {
    const set1 = new Set(topics1.map(t => t.toLowerCase()));
    const set2 = new Set(topics2.map(t => t.toLowerCase()));
    
    // Convert sets to arrays for intersection calculation
    const arr1 = Array.from(set1);
    const arr2 = Array.from(set2);
    
    const intersection = arr1.filter(x => set2.has(x));
    const union = Array.from(new Set([...arr1, ...arr2]));
    
    return Math.round((intersection.length / union.length) * 100);
  };

  const getCommonTopics = (topics1: string[], topics2: string[]) => {
    const set1 = new Set(topics1.map(t => t.toLowerCase()));
    const set2 = new Set(topics2.map(t => t.toLowerCase()));
    return topics1.filter(topic => set2.has(topic.toLowerCase()));
  };

  const getUniqueTopics = (topics1: string[], topics2: string[]) => {
    const set2 = new Set(topics2.map(t => t.toLowerCase()));
    return topics1.filter(topic => !set2.has(topic.toLowerCase()));
  };

  const similarity = getSimilarityScore(
    doc1.analysis?.keyTopics || [],
    doc2.analysis?.keyTopics || []
  );

  const commonTopics = getCommonTopics(
    doc1.analysis?.keyTopics || [],
    doc2.analysis?.keyTopics || []
  );

  return (
    <div className="space-y-6">
      {/* Comparison Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GitCompare className="h-5 w-5 text-blue-500" />
            <span>Document Comparison</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Document 1 */}
            <div className="text-center p-4 border rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h3 className="font-semibold truncate">{doc1.name}</h3>
              <p className="text-sm text-gray-500">{doc1.analysis?.title}</p>
            </div>

            {/* Similarity Score */}
            <div className="text-center p-4 border rounded-lg bg-gradient-to-r from-green-50 to-blue-50">
              <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-600">{similarity}%</div>
              <p className="text-sm text-gray-600">Similarity Score</p>
              <Progress value={similarity} className="mt-2" />
            </div>

            {/* Document 2 */}
            <div className="text-center p-4 border rounded-lg">
              <FileText className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <h3 className="font-semibold truncate">{doc2.name}</h3>
              <p className="text-sm text-gray-500">{doc2.analysis?.title}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Comparison */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="topics">Topics</TabsTrigger>
          <TabsTrigger value="structure">Structure</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Document 1 Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>{doc1.analysis?.title || doc1.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {doc1.analysis?.summary || 'No summary available'}
                </p>
              </CardContent>
            </Card>

            {/* Document 2 Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span>{doc2.analysis?.title || doc2.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {doc2.analysis?.summary || 'No summary available'}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[doc1, doc2].map((doc, index) => (
              <Card key={doc.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <div className={`w-3 h-3 ${index === 0 ? 'bg-blue-500' : 'bg-purple-500'} rounded-full`}></div>
                    <span>{doc.name}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <Calendar className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                      <div className="text-lg font-semibold">{doc.analysis?.metadata.pageCount || 0}</div>
                      <div className="text-xs text-gray-500">Pages</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <Hash className="h-6 w-6 mx-auto mb-1 text-gray-600" />
                      <div className="text-lg font-semibold">{doc.analysis?.metadata.wordCount?.toLocaleString() || 0}</div>
                      <div className="text-xs text-gray-500">Words</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Language:</span>
                      <span className="font-medium">{doc.analysis?.metadata.language || 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">File Type:</span>
                      <span className="font-medium">{doc.analysis?.metadata.fileType || 'Unknown'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="topics" className="space-y-4">
          {/* Common Topics */}
          {commonTopics.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-600">Common Topics</CardTitle>
                <p className="text-sm text-gray-600">Topics found in both documents</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {commonTopics.map((topic, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Unique Topics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[doc1, doc2].map((doc, index) => {
              const otherDoc = index === 0 ? doc2 : doc1;
              const uniqueTopics = getUniqueTopics(
                doc.analysis?.keyTopics || [],
                otherDoc.analysis?.keyTopics || []
              );

              return (
                <Card key={doc.id}>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <div className={`w-3 h-3 ${index === 0 ? 'bg-blue-500' : 'bg-purple-500'} rounded-full`}></div>
                      <span>Unique Topics</span>
                    </CardTitle>
                    <p className="text-sm text-gray-600">Topics only in {doc.name}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {uniqueTopics.map((topic, topicIndex) => (
                        <Badge 
                          key={topicIndex} 
                          variant="outline" 
                          className={index === 0 ? 'border-blue-300 text-blue-700' : 'border-purple-300 text-purple-700'}
                        >
                          {topic}
                        </Badge>
                      ))}
                      {uniqueTopics.length === 0 && (
                        <p className="text-gray-500 text-sm">No unique topics found</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="structure" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[doc1, doc2].map((doc, index) => (
              <Card key={doc.id}>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <div className={`w-3 h-3 ${index === 0 ? 'bg-blue-500' : 'bg-purple-500'} rounded-full`}></div>
                    <span>Document Structure</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {doc.analysis?.documentStructure?.map((section, sectionIndex) => (
                      <div key={sectionIndex} className="border-l-4 border-gray-300 pl-4 py-2">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm">{section.section}</h4>
                          <Badge variant="outline" className="text-xs">
                            Pages {section.pages}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600">{section.description}</p>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-sm">No structure information available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentComparison;
