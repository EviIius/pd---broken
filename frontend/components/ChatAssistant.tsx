"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Copy, Check, MessageSquare, ChevronRight, ChevronLeft, ThumbsUp, ThumbsDown, Trash2, Download } from "lucide-react";
import type { Document, AIFeedback } from '../types';
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { ConfirmDialog } from "./ui/confirm-dialog";

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
                <p className="text-sm">{message.content}</p>
                
                {/* Sources section for assistant messages */}
                {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Sources:</p>                        <div className="space-y-1">
                            {message.sources.map((source, index) => (
                                <div key={index} className="text-xs text-muted-foreground">
                                    <a 
                                        href={source.source_url} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
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
  const [inputValue, setInputValue] = useState("");  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
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
  };  const clearChat = () => {
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
  };  if (!isExpanded) {
    return (
      <div className="bg-card rounded-lg border hover:border-blue-200 transition-all duration-200 hover:shadow-sm">
        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-50/50 transition-colors duration-200" onClick={onToggleExpand}>
          <h2 className="text-lg font-semibold text-blue-600">Policy Assistant</h2>
          <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 hover:translate-x-0.5" />
        </div>
      </div>
    );
  }return (
    <div className="flex flex-col bg-card rounded-lg border">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onToggleExpand}>
          <h2 className="text-lg font-semibold text-blue-600">Policy Assistant</h2>
          <ChevronLeft className="h-5 w-5 text-muted-foreground" />
        </div>        <div className="flex items-center gap-2">
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
        </div></div>      {/* Status Notification */}
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
      
      <ScrollArea className="h-64 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
            {messages.length > 0 ? (
                messages.map((message) => (
                    <ChatMessageBubble 
                        key={message.id} 
                        message={message} 
                        onCopyToClipboard={copyToClipboard} 
                        copiedMessageId={copiedMessageId}
                        onFeedback={handleFeedback}
                    />
                ))            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground space-y-4">
                    <MessageSquare className="h-8 w-8 mb-2" />
                    <p>Ask a question about the selected documents</p>
                    <p className="text-sm mt-1">
                        {selectedDocuments.length === 0
                            ? "No documents selected. Select documents to get more accurate answers."
                            : `${selectedDocuments.length} document(s) selected`}
                    </p>
                    
                    {/* Suggested Prompts */}
                    {suggestedPrompts.length > 0 && (
                        <div className="w-full max-w-md space-y-2 mt-4">
                            <p className="text-xs font-medium text-muted-foreground">Suggested questions:</p>
                            <div className="space-y-2">
                                {suggestedPrompts.map((prompt, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setInputValue(prompt)}
                                        className="w-full text-left p-3 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors duration-200"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      </ScrollArea>      <div className="p-4 border-t">        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask a question about the selected documents..."
            className="flex-grow"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!inputValue.trim() || isLoading} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>
      </div>

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

