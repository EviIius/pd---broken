"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Copy, Check, MessageSquare, ChevronRight, ChevronDown, ThumbsUp, ThumbsDown, Trash2, Download } from "lucide-react";
import type { Document, AIFeedback } from '../types';
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { ConfirmDialog } from "./ui/confirm-dialog";
import ReactMarkdown from 'react-markdown';

interface ChatAssistantProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  selectedDocuments: Document[];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  sources?: Array<{
    title: string;
    source_url: string;
    regulation_type: string;
    document_type: string;
  }>;
  confidence?: string;
}

const ChatMessageBubble: React.FC<{ 
    message: ChatMessage; 
    onCopyToClipboard: (text: string, id: string) => void; 
    copiedMessageId: string | null; 
    onFeedback: (feedback: AIFeedback) => void; 
}> = ({ message, onCopyToClipboard, copiedMessageId, onFeedback }) => {
    return (
        <div className={cn("flex items-start gap-3", message.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("rounded-lg px-4 py-3 max-w-[85%] break-words", 
                message.role === "user" 
                ? "bg-primary text-primary-foreground"
                : "bg-muted"
            )}>
                {message.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown
                            components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="mb-2 ml-4 list-disc">{children}</ul>,
                                ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal">{children}</ol>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                                code: ({ children }) => <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm">{children}</code>,
                                h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                                h2: ({ children }) => <h2 className="text-md font-semibold mb-2">{children}</h2>,
                                h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                            }}
                        >
                            {message.content}
                        </ReactMarkdown>
                    </div>
                ) : (
                    <p className="text-sm">{message.content}</p>
                )}
                
                {/* Sources section for assistant messages */}
                {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Sources:</p>
                        <div className="space-y-1">
                            {message.sources.map((source, index) => (
                                <div key={index} className="text-xs text-muted-foreground">
                                    <a 
                                        href={source.source_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                    >
                                        {source.title}
                                    </a>
                                    <span className="ml-1 text-blue-600">({source.regulation_type})</span>
                                </div>
                            ))}
                        </div>
                        {message.confidence && (
                            <div className="mt-2">
                                <span className={cn("text-xs px-2 py-1 rounded-full", 
                                    message.confidence === 'high' ? "bg-green-100 text-green-700" :
                                    message.confidence === 'medium' ? "bg-yellow-100 text-yellow-700" :
                                    "bg-red-100 text-red-700"
                                )}>
                                    {message.confidence} confidence
                                </span>
                            </div>
                        )}
                    </div>
                )}
                
                {/* Action buttons for assistant messages */}
                {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/30">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onCopyToClipboard(message.content, message.id)}
                            className="h-6 px-2 text-xs"
                        >
                            {copiedMessageId === message.id ? (
                                <Check className="h-3 w-3 mr-1" />
                            ) : (
                                <Copy className="h-3 w-3 mr-1" />
                            )}
                            {copiedMessageId === message.id ? 'Copied' : 'Copy'}
                        </Button>                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onFeedback({ messageId: message.id, rating: 'helpful', timestamp: new Date() })}
                            className="h-6 px-2 text-xs"
                        >
                            <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onFeedback({ messageId: message.id, rating: 'not_helpful', timestamp: new Date() })}
                            className="h-6 px-2 text-xs"
                        >
                            <ThumbsDown className="h-3 w-3" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function ChatAssistant({ isExpanded, onToggleExpand, selectedDocuments }: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentQuestion = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: currentQuestion,
          selected_documents: selectedDocuments.map(doc => doc.title)
        }),
      });

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer || "I apologize, but I couldn't generate a response. Please try again.",
        timestamp: new Date(),
        sources: data.sources || [],
        confidence: data.confidence || "medium"
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error calling API:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I encountered an error while processing your question. Please make sure the backend service is running and try again.",
        timestamp: new Date(),
        confidence: "error"
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleFeedback = (feedback: AIFeedback) => {
    console.log('Feedback received:', feedback);
  };

  const clearChat = () => {
    if (messages.length === 0) return;
    setShowClearConfirm(true);
  };

  const handleClearConfirm = () => {
    setMessages([]);
    setShowClearConfirm(false);
  };

  const downloadChat = () => {
    if (messages.length === 0) {
      setDownloadStatus('No chat history to download.');
      setTimeout(() => setDownloadStatus(null), 3000);
      return;
    }

    const chatContent = messages.map(message => {
      const timestamp = message.timestamp.toLocaleString();
      const role = message.role === 'user' ? 'You' : 'Policy Assistant';
      return `[${timestamp}] ${role}: ${message.content}`;
    }).join('\n\n');

    const selectedDocsInfo = selectedDocuments.length > 0 
      ? `Selected Documents: ${selectedDocuments.map(doc => doc.title).join(', ')}\n\n`
      : 'No documents were selected during this conversation.\n\n';

    const fullContent = `Policy Assistant Chat History\nGenerated on: ${new Date().toLocaleString()}\n\n${selectedDocsInfo}${chatContent}`;

    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `policy-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadStatus('Chat history downloaded successfully!');
    setTimeout(() => setDownloadStatus(null), 3000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Collapsible Header */}
      <div className="flex items-center justify-between py-2 px-4 bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer" onClick={onToggleExpand}>
        <h2 className="text-base font-medium text-red-600">PolicyQ Assistant</h2>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-400" />
        )}
      </div>

      {/* Chat Content - Only show when expanded */}
      {isExpanded && (
        <>
          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-1 px-4 py-2 bg-white border-b">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={downloadChat}
              disabled={messages.length === 0}
              className="text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 hover:scale-105 h-8 w-8 p-0"
              title="Download chat history"
            >
              <Download className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearChat}
              disabled={messages.length === 0}
              className="text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all duration-200 hover:scale-105 h-8 w-8 p-0"
              title="Clear chat history"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>

          {/* Status Notification */}
          {downloadStatus && (
            <div className="mx-4 mb-2 transform transition-all duration-300 ease-out animate-in slide-in-from-top-2 fade-in-0">
              <div className="bg-green-50 border border-green-200 rounded-md p-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-sm text-green-800 font-medium">{downloadStatus}</p>
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <ScrollArea className="flex-1 p-3 min-h-[150px]" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.length > 0 ? (
                <>
                  {messages.map((message) => (
                    <ChatMessageBubble 
                      key={message.id} 
                      message={message} 
                      onCopyToClipboard={copyToClipboard} 
                      copiedMessageId={copiedMessageId}
                      onFeedback={handleFeedback}
                    />
                  ))}
                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                      <div className="rounded-lg px-4 py-3 bg-muted max-w-[85%]">
                        <div className="flex items-center gap-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                          <span className="text-sm text-muted-foreground">AI is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground min-h-[120px]">
                  <MessageSquare className="h-6 w-6 mb-2" />
                  <p className="text-sm">Ask a question about the selected documents</p>
                  <p className="text-xs mt-1">
                    {selectedDocuments.length === 0
                      ? "No documents selected. Select documents to get more accurate answers."
                      : `${selectedDocuments.length} document(s) selected`}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Form */}
          <div className="p-3 border-t">
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask a question about the selected documents..."
                className="flex-grow resize-none min-h-[36px] max-h-[80px] text-sm"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                rows={1}
                style={{
                  height: 'auto',
                  minHeight: '36px',
                  maxHeight: '80px'
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 80) + 'px';
                }}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!inputValue.trim() || isLoading} 
                className="bg-blue-600 hover:bg-blue-700 h-9 w-9 flex-shrink-0"
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
            <div className="text-xs text-muted-foreground mt-1">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearConfirm}
        title="Clear Chat History"
        message="Are you sure you want to clear the chat history? This action cannot be undone."
        confirmText="Clear"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
