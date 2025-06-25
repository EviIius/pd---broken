"use client"

import React from "react"
import type { Document } from "@/types"
import { X, ExternalLink, Calendar, Building, MapPin, AlertTriangle, Bookmark } from "lucide-react"
import { Button } from "./ui/button"

interface DocumentPreviewModalProps {
  document: Document | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleBookmark: (document: Document) => void;
}

export default function DocumentPreviewModal({
  document,
  isOpen,
  onClose,
  onToggleBookmark
}: DocumentPreviewModalProps) {
  if (!isOpen || !document) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleBookmarkToggle = () => {
    onToggleBookmark(document);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3 flex-1 mr-4">
            <h2 className="text-xl font-semibold text-gray-900 line-clamp-2">
              {document.title}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmarkToggle}
              className={`flex items-center gap-1 ${
                document.isBookmarked 
                  ? 'text-yellow-600 hover:text-yellow-700' 
                  : 'text-gray-400 hover:text-yellow-600'
              }`}
              title={document.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}            >
              {document.isBookmarked ? (
                <Bookmark className="h-4 w-4 fill-current" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row h-full max-h-[calc(90vh-80px)]">
          {/* Document metadata sidebar */}
          <div className="lg:w-80 p-6 bg-gray-50 border-r overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Document Details</h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-gray-500">Published:</span>
                  <p className="font-medium">
                    {new Date(document.publicationDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-gray-500">Document Type:</span>
                  <p className="font-medium">{document.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-gray-500">Level:</span>
                  <p className="font-medium">{document.level}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-gray-500" />
                <div>
                  <span className="text-gray-500">Owning Business:</span>
                  <p className="font-medium">{document.owningBusinessGroup}</p>
                </div>
              </div>

              {document.region && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-gray-500">Region:</span>
                    <p className="font-medium">{document.region}</p>
                  </div>
                </div>
              )}

              {document.riskType && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-gray-500" />
                  <div>
                    <span className="text-gray-500">Risk Type:</span>
                    <p className="font-medium">{document.riskType}</p>
                  </div>
                </div>
              )}

              {document.sourceUrl && (
                <div className="pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(document.sourceUrl, '_blank')}
                    className="w-full flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Original Document
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Document content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {document.summary && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Summary</h4>
                <p className="text-blue-800 text-sm leading-relaxed">{document.summary}</p>
              </div>
            )}

            <h4 className="font-semibold text-gray-900 mb-4">Document Content</h4>
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {document.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
