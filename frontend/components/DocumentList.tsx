"use client"

import React, { useState } from "react"
import type { Document, FilterState } from "@/types"
import { Search } from "lucide-react";
import { Input } from "./ui/input";

interface DocumentListProps {
  documents: Document[];
  selectedDocuments: Document[];
  onSelectDocument: (doc: Document) => void;
  filters: FilterState;
}

export default function DocumentList({
  documents,
  selectedDocuments,
  onSelectDocument,
  filters,
}: DocumentListProps) {  const [searchTerm, setSearchTerm] = useState("");

  // Helper function to check if a date matches the publication date filter
  const matchesPublicationDateFilter = (docDate: string, filter: string | null): boolean => {
    if (!filter || filter === "All") return true;
    
    const docDateObj = new Date(docDate);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case "Last 7 days":
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return docDateObj >= sevenDaysAgo;
      
      case "Last month":
        const lastMonth = new Date(today);
        lastMonth.setMonth(today.getMonth() - 1);
        return docDateObj >= lastMonth;
      
      case "This month":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return docDateObj >= startOfMonth;
      
      case "Year to date":
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        return docDateObj >= startOfYear;
      
      case "Last 12 months":
        const twelveMonthsAgo = new Date(today);
        twelveMonthsAgo.setFullYear(today.getFullYear() - 1);
        return docDateObj >= twelveMonthsAgo;
      
      default:
        return true;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    // Search filter
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Publication date filter
    const matchesPublicationDate = matchesPublicationDateFilter(doc.publicationDate, filters.publicationDate);
    
    // Document type filter
    const matchesDocumentType = filters.documentType.length === 0 || 
      filters.documentType.includes(doc.category);
    
    // Level filter
    const matchesLevel = filters.level.length === 0 || 
      filters.level.includes(doc.level);
    
    // Owning business group filter
    const matchesOwningBusiness = filters.owningBusinessGroup.length === 0 || 
      filters.owningBusinessGroup.includes(doc.owningBusinessGroup);
    
    return matchesSearch && matchesPublicationDate && matchesDocumentType && 
           matchesLevel && matchesOwningBusiness;
  });

  return (
    <div>      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-blue-600">
          All documents ({filteredDocuments.length} of {documents.length})
        </h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {selectedDocuments.length} document(s) selected
          </span>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Document table */}
      <div className="border rounded-lg">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="w-12 p-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedDocuments.length === documents.length && documents.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      documents.forEach(doc => {
                        if (!selectedDocuments.some(selected => selected.id === doc.id)) {
                          onSelectDocument(doc);
                        }
                      });
                    } else {
                      selectedDocuments.forEach(doc => onSelectDocument(doc));
                    }
                  }}
                  className="rounded"
                />
              </th>              <th className="p-4 text-left font-medium">ID</th>
              <th className="p-4 text-left font-medium">TITLE</th>
              <th className="p-4 text-left font-medium">DOCUMENT TYPE</th>
              <th className="p-4 text-left font-medium">LEVEL</th>
              <th className="p-4 text-left font-medium">OWNING BUSINESS</th>
              <th className="p-4 text-left font-medium">PUBLICATION DATE</th>
            </tr>
          </thead>
          <tbody>
            {filteredDocuments.map((doc, index) => (
              <tr key={doc.id} className="border-b hover:bg-muted/30">
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.some((d) => d.id === doc.id)}
                    onChange={() => onSelectDocument(doc)}
                    className="rounded"
                  />
                </td>                <td className="p-4 text-sm text-muted-foreground">{index + 10}</td>
                <td className="p-4 text-sm font-medium">{doc.title}</td>
                <td className="p-4 text-sm text-muted-foreground">{doc.category}</td>
                <td className="p-4 text-sm text-muted-foreground">{doc.level}</td>
                <td className="p-4 text-sm text-muted-foreground">{doc.owningBusinessGroup}</td>
                <td className="p-4 text-sm text-muted-foreground">
                  {new Date(doc.publicationDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

