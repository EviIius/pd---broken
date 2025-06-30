"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Copy, Check, MessageSquare, ChevronRight, ChevronLeft, ThumbsUp, ThumbsDown, Trash2, Download, Bot, Search } from "lucide-react";
import type { Document, AIFeedback } from '../types';
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { ConfirmDialog } from "./ui/confirm-dialog";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatAssistantProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  selectedDocuments: Document[];
  suggestedPrompts?: string[];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  mode?: "rag" | "basic"; // Track which mode was used
  sources?: Array<{
    title: string;
    source_url: string;
    regulation_type: string;
    document_type: string;
    similarity_score?: number;
    chunk_text?: string;
    document_id?: string;
    document_link?: string;
    view_in_documents?: boolean;
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
                    <>                        {/* Enhanced Mode indicator for assistant messages */}
                        {message.mode && (
                            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/20">
                                <div className={cn(
                                    "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium message-mode-badge",
                                    message.mode === "rag" 
                                        ? "bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm" 
                                        : "bg-blue-100 text-blue-700 border border-blue-200 shadow-sm"
                                )}>
                                    {message.mode === "rag" ? (
                                        <>
                                            <Search className="h-3 w-3" />
                                            <span>Enhanced AI</span>
                                        </>
                                    ) : (
                                        <>
                                            <Bot className="h-3 w-3" />
                                            <span>Basic AI</span>
                                        </>
                                    )}
                                </div>
                                {message.mode === "rag" && (
                                    <span className="text-xs text-emerald-600 opacity-75 status-gradient-text">with document search</span>
                                )}
                            </div>
                        )}
                        
                        <div className="text-sm markdown-content">
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    // Custom components for better styling
                                    p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                                    h1: ({children}) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                                    h2: ({children}) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                                    h3: ({children}) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
                                    ul: ({children}) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                    ol: ({children}) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                    li: ({children}) => <li className="text-sm">{children}</li>,
                                    strong: ({children}) => <strong className="font-semibold">{children}</strong>,
                                    em: ({children}) => <em className="italic">{children}</em>,
                                    code: ({children}) => <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                                    pre: ({children}) => <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mb-2">{children}</pre>,
                                    blockquote: ({children}) => <blockquote className="border-l-4 border-gray-300 pl-4 italic mb-2">{children}</blockquote>,
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        </div>
                    </>
                ) : (
                    <p className="text-sm">{message.content}</p>
                )}
                
                {/* Sources section for assistant messages */}                {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Sources:</p>
                        <div className="space-y-2">                            {message.sources.map((source, index) => (
                                <div key={index} className="text-xs source-box rounded-md p-2 border border-blue-200">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <a 
                                                href={source.source_url} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="font-medium text-blue-700 hover:text-blue-900 hover:underline block"
                                            >
                                                {source.title}
                                            </a>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded text-xs">
                                                    {source.regulation_type}
                                                </span>
                                                {(source as any).similarity_score && (
                                                    <span className="text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded text-xs">
                                                        {((source as any).similarity_score * 100).toFixed(0)}% match
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {(source as any).document_id && (
                                            <button
                                                onClick={() => {
                                                    // Scroll to document in the document list
                                                    const element = document.getElementById(`document-${(source as any).document_id}`);
                                                    if (element) {
                                                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                        element.classList.add('highlight-document');
                                                        setTimeout(() => element.classList.remove('highlight-document'), 3000);
                                                    }
                                                }}
                                                className="text-xs text-emerald-600 hover:text-emerald-800 hover:underline font-medium flex items-center gap-1"
                                                title="View this document in the document list"
                                            >
                                                <span>📄</span>
                                                View Document
                                            </button>
                                        )}
                                    </div>
                                    {(source as any).chunk_text && (
                                        <div className="mt-1 text-xs text-slate-600 italic">
                                            "{(source as any).chunk_text}"
                                        </div>
                                    )}
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
                
                {message.role === 'assistant' && (
                    <div className="flex items-center justify-end gap-2 mt-2">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onCopyToClipboard(message.content, message.id)}>
                            {copiedMessageId === message.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onFeedback({ messageId: message.id, rating: 'helpful', timestamp: new Date() })}>
                            <ThumbsUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onFeedback({ messageId: message.id, rating: 'not_helpful', timestamp: new Date() })}>
                            <ThumbsDown className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function ChatAssistant({ isExpanded, onToggleExpand, selectedDocuments, suggestedPrompts = [] }: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ragStatus, setRagStatus] = useState<'unknown' | 'enabled' | 'disabled'>('unknown');
  const [useRAG, setUseRAG] = useState(true); // Toggle state for RAG mode
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  // Check RAG service status on component mount
  useEffect(() => {
    const checkRagStatus = async () => {
      try {
        const response = await fetch('http://localhost:8000/health');
        setRagStatus(response.ok ? 'enabled' : 'disabled');
      } catch (error) {
        // Don't disable Enhanced mode if health check fails - allow fallback
        console.warn('RAG service health check failed, Enhanced mode will use fallback');
        setRagStatus('enabled'); // Allow Enhanced mode to work with fallback
      }
    };
    checkRagStatus();
  }, []);

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
          selected_documents: selectedDocuments.map(doc => doc.title),
          use_rag: useRAG  // Use the toggle state
        }),
      });

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer || "I apologize, but I couldn't generate a response. Please try again.",
        timestamp: new Date(),
        mode: useRAG && data.rag_enabled ? "rag" : "basic", // Track the mode used
        sources: data.sources || [],
        confidence: data.confidence || "medium"
      };

      // Update RAG status based on response
      if (data.rag_enabled !== undefined) {
        setRagStatus(data.rag_enabled ? 'enabled' : 'disabled');
      }

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

  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };

  const handleFeedback = (feedback: AIFeedback) => {
    console.log('Feedback received:', feedback);
    // Here you would typically send the feedback to your analytics service
  };

  const clearChat = () => {
    setShowClearConfirm(true);
  };

  const confirmClear = () => {
    setMessages([]);
    setShowClearConfirm(false);
  };

  const downloadChat = () => {
    const chatHistory = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp.toISOString(),
      mode: msg.mode || 'unknown',
      sources: msg.sources || [],
      confidence: msg.confidence
    }));

    const dataStr = JSON.stringify(chatHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadStatus('Chat history downloaded successfully!');
    setTimeout(() => setDownloadStatus(null), 3000);
  };

  if (!isExpanded) {
    return (
      <div className="bg-card rounded-lg border hover:border-blue-200 transition-all duration-200 hover:shadow-sm">
        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-50/50 transition-colors duration-200" onClick={onToggleExpand}>
          <h2 className="text-lg font-semibold text-blue-600">Policy Assistant</h2>
          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 hover:translate-x-0.5" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-card rounded-lg border">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onToggleExpand}>
          <h2 className="text-lg font-semibold text-blue-600">Policy Assistant</h2>
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={downloadChat}
            disabled={messages.length === 0}
            className="text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 hover:scale-105"
            title="Download chat history"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearChat}
            disabled={messages.length === 0}
            className="text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all duration-200 hover:scale-105"
            title="Clear chat history"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>      {/* AI Mode Toggle and Status - Enhanced Design */}
      <div className="px-4 pb-3 border-b ai-toggle-container">
        {/* Main Toggle Section */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Status Indicator with Pulse Animation */}
            <div className="relative">
              <div className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                useRAG && ragStatus === 'enabled' ? "bg-emerald-500 ai-mode-indicator" :
                !useRAG ? "bg-blue-500 shadow-blue-200" :
                ragStatus === 'disabled' ? "bg-amber-500 shadow-amber-200" :
                "bg-gray-400 shadow-gray-200"
              )}>
                {/* Pulse effect for active states */}
                {(useRAG && ragStatus === 'enabled') || !useRAG ? (
                  <div className={cn(
                    "absolute inset-0 rounded-full animate-ping opacity-20",
                    useRAG && ragStatus === 'enabled' ? "bg-emerald-500" : "bg-blue-500"
                  )}></div>
                ) : null}
              </div>
            </div>
            
            {/* Status Text with Better Typography */}
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">
                {useRAG && ragStatus === 'enabled' ? 'Enhanced AI Mode' :
                 !useRAG ? 'Basic AI Mode' :
                 useRAG && ragStatus === 'disabled' ? 'Enhanced AI (Offline)' :
                 'AI Status Loading...'}
              </span>
              <span className="text-xs text-slate-500">
                {useRAG && ragStatus === 'enabled' ? 'Document search active' :
                 !useRAG ? 'General knowledge only' :
                 useRAG && ragStatus === 'disabled' ? 'Service unavailable' :
                 'Checking connection...'}
              </span>
            </div>
          </div>
          
          {/* Enhanced Toggle Switch */}
          <div className="relative bg-white rounded-lg p-1 shadow-sm border border-slate-200">
            <div className="flex items-center gap-1">
              {/* RAG Mode Button */}              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUseRAG(true)}
                className={cn(
                  "relative h-8 px-3 text-xs font-medium ai-mode-button focus-enhanced",
                  useRAG && ragStatus === 'enabled' 
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-200 hover:bg-emerald-600 ai-mode-active" 
                    : useRAG && ragStatus === 'disabled'
                    ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                )}
                title={ragStatus === 'disabled' ? 'Enhanced AI (RAG service unavailable, using fallback)' : 'Enhanced AI with document search and citations'}
              >
                <Search className="h-3 w-3 mr-1.5" />
                Enhanced
                {useRAG && ragStatus === 'enabled' && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                )}
              </Button>
              
              {/* Basic Mode Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUseRAG(false)}
                className={cn(
                  "relative h-8 px-3 text-xs font-medium ai-mode-button focus-enhanced",
                  !useRAG 
                    ? "bg-blue-500 text-white shadow-md shadow-blue-200 hover:bg-blue-600 ai-mode-active"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                )}
                title="Basic AI mode with general knowledge"
              >
                <Bot className="h-3 w-3 mr-1.5" />
                Basic
                {!useRAG && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                )}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Enhanced Mode Description with Icons */}
        <div className={cn(
          "flex items-start gap-2 p-2.5 rounded-lg border transition-all duration-300",
          useRAG && ragStatus === 'enabled' 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
          !useRAG 
            ? "bg-blue-50 border-blue-200 text-blue-800" :
          useRAG && ragStatus === 'disabled'
            ? "bg-amber-50 border-amber-200 text-amber-800"
            : "bg-gray-50 border-gray-200 text-gray-600"
        )}>
          <div className="flex-shrink-0 mt-0.5">
            {useRAG && ragStatus === 'enabled' ? (
              <div className="w-4 h-4 text-emerald-600">🔍</div>
            ) : !useRAG ? (
              <div className="w-4 h-4 text-blue-600">🤖</div>
            ) : useRAG && ragStatus === 'disabled' ? (
              <div className="w-4 h-4 text-amber-600">⚠️</div>
            ) : (
              <div className="w-4 h-4 text-gray-500">⏳</div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs font-medium leading-relaxed">
              {useRAG && ragStatus === 'enabled' 
                ? "Searching through banking documents for precise answers with authoritative citations and regulatory context."
                : !useRAG 
                ? "Using general AI knowledge for broad questions. Switch to Enhanced mode for document-specific queries."
                : useRAG && ragStatus === 'disabled'
                ? "Document search service is currently unavailable. Responses will use general knowledge only."
                : "Initializing AI service and checking document search availability..."
              }
            </p>
          </div>
        </div>
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
      
      <ScrollArea className="h-96 p-4 chat-scroll-area" ref={scrollAreaRef}>
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
                    ))}                      {/* Enhanced Loading indicator when AI is generating */}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg px-4 py-3 max-w-[85%] bg-gradient-to-r from-slate-50 to-blue-50/30 border border-blue-200/50 shadow-sm">
                                {/* Mode indicator for loading state */}
                                <div className={cn(
                                    "flex items-center gap-2 mb-2 pb-2 border-b border-border/20"
                                )}>
                                    <div className={cn(
                                        "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
                                        useRAG && ragStatus === 'enabled'
                                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                                            : "bg-blue-100 text-blue-700 border border-blue-200"
                                    )}>
                                        {useRAG && ragStatus === 'enabled' ? (
                                            <>
                                                <Search className="h-3 w-3 animate-pulse" />
                                                <span>Enhanced AI</span>
                                            </>
                                        ) : (
                                            <>
                                                <Bot className="h-3 w-3 animate-pulse" />
                                                <span>Basic AI</span>
                                            </>
                                        )}
                                    </div>
                                    {useRAG && ragStatus === 'enabled' && (
                                        <span className="text-xs text-emerald-600 opacity-75">searching documents</span>
                                    )}
                                </div>
                                  {/* Loading animation */}
                                <div className="flex items-center space-x-3">
                                    <div className="flex space-x-1">
                                        <div className={cn(
                                            "w-2 h-2 rounded-full loading-dots",
                                            useRAG && ragStatus === 'enabled' ? "bg-emerald-500" : "bg-blue-500"
                                        )}></div>
                                        <div className={cn(
                                            "w-2 h-2 rounded-full loading-dots",
                                            useRAG && ragStatus === 'enabled' ? "bg-emerald-500" : "bg-blue-500"
                                        )}></div>
                                        <div className={cn(
                                            "w-2 h-2 rounded-full loading-dots",
                                            useRAG && ragStatus === 'enabled' ? "bg-emerald-500" : "bg-blue-500"
                                        )}></div>
                                    </div>
                                    <span className={cn(
                                        "text-sm font-medium",
                                        useRAG && ragStatus === 'enabled' ? "text-emerald-600" : "text-blue-600"
                                    )}>
                                        {useRAG && ragStatus === 'enabled' ? 'Analyzing documents...' : 'Thinking...'}
                                    </span>
                                </div>
                                
                                {/* Enhanced status description */}
                                <div className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                                    {useRAG && ragStatus === 'enabled' ? (                                        <>
                                            <span>🔍</span>
                                            <span>
                                                Searching through banking documents
                                                {selectedDocuments.length > 0 && ` (${selectedDocuments.length} selected)`}
                                                ...
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span>🤖</span>
                                            <span>Processing your question with general AI knowledge...</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-8">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">Welcome to Policy Assistant</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        {selectedDocuments.length > 0 
                            ? `Ready to help with ${selectedDocuments.length} selected document(s)`
                            : 'Ask questions about banking policies and regulations'
                        }
                    </p>
                    {suggestedPrompts.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium">Suggested questions:</p>
                            {suggestedPrompts.slice(0, 3).map((prompt, index) => (
                                <button
                                    key={index}
                                    onClick={() => setInputValue(prompt)}
                                    className="block w-full text-left text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-md transition-colors duration-200"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t bg-muted/30">
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              selectedDocuments.length > 0 
                ? `Ask about ${selectedDocuments.length} selected document(s)...`
                : "Ask about banking policies..."
            }
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={!inputValue.trim() || isLoading} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>      <ConfirmDialog 
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={confirmClear}
        title="Clear Chat History"
        message="Are you sure you want to clear all messages? This action cannot be undone."
        confirmText="Clear"
        cancelText="Cancel"
      />
    </div>
  );
}
