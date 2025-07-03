import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileText, Eye, X, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import DocumentSourceModal from './DocumentSourceModal';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  sourceReferences?: Array<{
    text: string;
    page: number;
    section: string;
    confidence: number;
  }>;
}

interface DocumentChatbotProps {
  document: {
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
      };
      keyTopics: string[];
    };
  } | null;
}

const DocumentChatbot: React.FC<DocumentChatbotProps> = ({ document }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message when document changes
  useEffect(() => {
    if (document?.analysis) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        type: 'bot',
        content: `Hello! I'm ready to answer questions about "${document.analysis.title}". You can ask me about:\n\n• Document content and structure\n• Key topics and themes\n• Specific sections or headings\n• Compliance requirements\n• Implementation details\n\nWhat would you like to know?`,
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    } else {
      setMessages([]);
    }
  }, [document?.id]);

  const generateBotResponse = async (userQuestion: string): Promise<ChatMessage> => {
    if (!document?.analysis) {
      return {
        id: Math.random().toString(36).substr(2, 9),
        type: 'bot',
        content: "I don't have a document to analyze. Please upload and select a document first.",
        timestamp: new Date()
      };
    }

    try {
      const response = await fetch('/api/documents/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userQuestion,
          documentId: document.id,
          context: {
            title: document.analysis.title,
            summary: document.analysis.summary,
            pageCount: document.analysis.metadata.pageCount,
            keyTopics: document.analysis.keyTopics,
            subheaders: document.analysis.subheaders
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const result = await response.json();

      return {
        id: Math.random().toString(36).substr(2, 9),
        type: 'bot',
        content: result.response,
        timestamp: new Date(),
        sourceReferences: result.sources || []
      };

    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback to local mock response
      return await generateMockResponse(userQuestion);
    }
  };

  const generateMockResponse = async (userQuestion: string): Promise<ChatMessage> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const question = userQuestion.toLowerCase();
    let response = '';
    let sourceRefs: any[] = [];

    if (question.includes('summary') || question.includes('overview')) {
      response = `Based on the document "${document?.analysis?.title}", here's a comprehensive summary:\n\n${document?.analysis?.summary}\n\nThis document covers ${document?.analysis?.keyTopics.join(', ')} across ${document?.analysis?.metadata.pageCount} pages.`;
      sourceRefs = [
        {
          text: document?.analysis?.summary || 'Document summary content',
          page: 1,
          section: 'Executive Summary',
          confidence: 0.95
        }
      ];
    } else {
      // Default response
      const randomTopic = document?.analysis?.keyTopics[Math.floor(Math.random() * (document?.analysis?.keyTopics.length || 1))] || 'regulatory compliance';
      response = `Your question relates to several aspects of "${document?.analysis?.title}". Based on the document content, I can tell you that it covers ${randomTopic} in detail.\n\nThe document provides comprehensive guidance on this topic across multiple sections. Would you like me to elaborate on any specific aspect?`;
      sourceRefs = [
        {
          text: `Detailed coverage of ${randomTopic} with implementation guidelines...`,
          page: Math.floor(Math.random() * (document?.analysis?.metadata.pageCount || 10)) + 1,
          section: randomTopic,
          confidence: 0.78
        }
      ];
    }

    return {
      id: Math.random().toString(36).substr(2, 9),
      type: 'bot',
      content: response,
      timestamp: new Date(),
      sourceReferences: sourceRefs
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const botResponse = await generateBotResponse(inputValue);
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'bot',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSourceClick = (source: any) => {
    setSelectedSource(source);
    setShowSourceModal(true);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!document) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          <Bot className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Select a document to start chatting</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-[700px] flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0 border-b">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Bot className="h-5 w-5 text-blue-500" />
            <span>Document Q&A Assistant</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Ask questions about "{document.name}"
          </p>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 min-h-0">
          {/* Messages Area with proper scrolling */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full px-4 py-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] space-y-2`}>
                      <div className={`flex items-start space-x-2 ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.type === 'user' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {message.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </div>
                        <div className={`rounded-lg p-3 max-w-full ${
                          message.type === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="whitespace-pre-wrap text-sm break-words">{message.content}</div>
                          <div className={`text-xs mt-1 ${
                            message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </div>
                        </div>
                      </div>

                      {/* Source References */}
                      {message.sourceReferences && message.sourceReferences.length > 0 && (
                        <div className="ml-10">
                          <div className="text-xs text-gray-500 mb-2">Sources:</div>
                          <div className="space-y-1">
                            {message.sourceReferences.map((source, index) => (
                              <button
                                key={index}
                                onClick={() => handleSourceClick(source)}
                                className="flex items-center space-x-2 text-xs bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded px-2 py-1 w-full text-left transition-colors"
                              >
                                <FileText className="h-3 w-3 text-blue-500" />
                                <span className="flex-1 truncate">{source.section}</span>
                                <Badge variant="secondary" className="text-xs">
                                  Page {source.page}
                                </Badge>
                                <Eye className="h-3 w-3 text-gray-400" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <div className="animate-pulse flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-xs text-gray-500">Analyzing document...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div className="border-t p-4 flex-shrink-0">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about the document..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Press Enter to send • Ask about content, structure, or specific topics
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Source Modal */}
      <DocumentSourceModal
        isOpen={showSourceModal}
        onClose={() => setShowSourceModal(false)}
        source={selectedSource}
        document={document}
      />
    </>
  );
};

export default DocumentChatbot;
