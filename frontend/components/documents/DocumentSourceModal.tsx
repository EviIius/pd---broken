import React, { useState } from 'react';
import { X, FileText, MapPin, Zap, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';

interface DocumentSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: {
    text: string;
    page: number;
    section: string;
    confidence: number;
  } | null;
  document: {
    id: string;
    name: string;
    analysis?: {
      title: string;
      subheaders: Array<{
        level: number;
        text: string;
        page?: number;
        content?: string;
      }>;
      metadata: {
        pageCount: number;
      };
    };
  } | null;
}

const DocumentSourceModal: React.FC<DocumentSourceModalProps> = ({
  isOpen,
  onClose,
  source,
  document
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  if (!isOpen || !source || !document) return null;

  // Generate mock document content for the specified page
  const generatePageContent = (pageNum: number) => {
    const baseContent = `
${document.analysis?.title || 'Document Title'}

Page ${pageNum}

This is the content of page ${pageNum} of the document. The document contains comprehensive information about regulatory compliance and implementation procedures.

${source.section}

${source.text}

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Additional content related to ${source.section} and implementation procedures follows. This section provides detailed guidance on compliance requirements and best practices for organizational implementation.

The document emphasizes the importance of following established protocols and maintaining proper documentation throughout the process.
    `.trim();

    return baseContent;
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight) return text;
    
    const parts = text.split(new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === highlight.toLowerCase() ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const pageContent = generatePageContent(source.page);
  const highlightedContent = highlightText(pageContent, source.text.substring(0, 50));

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'bg-green-100 text-green-800';
    if (confidence >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'High Confidence';
    if (confidence >= 0.7) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-semibold">Document Source</h2>
              <p className="text-sm text-gray-600">{document.name}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Source Info */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-xs text-gray-600">Page {source.page}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Section</p>
                    <p className="text-xs text-gray-600 truncate">{source.section}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">Confidence</p>
                    <Badge className={`text-xs ${getConfidenceColor(source.confidence)}`}>
                      {getConfidenceLabel(source.confidence)} ({Math.round(source.confidence * 100)}%)
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Page {source.page} Content</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {document.analysis?.metadata.pageCount || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(document.analysis?.metadata.pageCount || 1, currentPage + 1))}
                disabled={currentPage >= (document.analysis?.metadata.pageCount || 1)}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="h-96 border rounded-lg">
            <div className="p-6 bg-white">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {highlightedContent}
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Source Context */}
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Referenced Text:</h4>
            <p className="text-sm text-yellow-700 italic">"{source.text}"</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Source extracted from {source.section} with {Math.round(source.confidence * 100)}% confidence
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button>
                Export Source
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentSourceModal;
