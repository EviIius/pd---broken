"use client"

import React, { useState, useEffect, useRef } from "react"
import type { Document, FilterState } from "@/types"
import { Search, ChevronLeft, ChevronRight, Filter, X, Eye, Bookmark } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import DocumentPreviewModal from "./DocumentPreviewModal";

interface DocumentListProps {
  documents: Document[];
  selectedDocuments: Document[];
  onSelectDocument: (doc: Document) => void;
  onToggleBookmark: (doc: Document) => void;
  filters: FilterState;
  showBookmarksOnly: boolean;
}

export default function DocumentList({
  documents,
  selectedDocuments,
  onSelectDocument,
  onToggleBookmark,
  filters,
  showBookmarksOnly,
}: DocumentListProps) {const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    // Column filters state
  const [columnFilters, setColumnFilters] = useState({
    title: { value: "", type: "contains" },
    documentType: { value: "", type: "contains" },
    level: { value: "", type: "contains" },
    owningBusiness: { value: "", type: "contains" },
    publicationDate: { value: "", type: "contains" }
  });
  
  // Filter popup state
  const [activeFilterPopup, setActiveFilterPopup] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Helper function to apply column filter
  const applyColumnFilter = (text: string, filter: { value: string; type: string }): boolean => {
    if (!filter.value) return true;
    
    const searchValue = filter.value.toLowerCase();
    const textValue = text.toLowerCase();
    
    switch (filter.type) {
      case "contains":
        return textValue.includes(searchValue);
      case "startsWith":
        return textValue.startsWith(searchValue);
      case "endsWith":
        return textValue.endsWith(searchValue);
      case "exact":
        return textValue === searchValue;
      default:
        return true;
    }
  };
  
  // Helper function to check if a date matches the publication date filter
  const matchesPublicationDateFilter = (docDate: string, filter: string | null): boolean => {
    if (!filter || filter === "All") return true;
    
    const docDateObj = new Date(docDate);
    const now = new Date();
    
    // Set time to start of day for accurate comparisons
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const docDay = new Date(docDateObj.getFullYear(), docDateObj.getMonth(), docDateObj.getDate());
    
    switch (filter) {
      case "Last 7 days":
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return docDay >= sevenDaysAgo && docDay <= today;
      
      case "Last month":
        const lastMonthStart = new Date(today);
        lastMonthStart.setMonth(today.getMonth() - 1);
        lastMonthStart.setDate(1); // Start of last month
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0); // End of last month
        return docDay >= lastMonthStart && docDay <= lastMonthEnd;
      
      case "This month":
        const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return docDay >= startOfThisMonth && docDay <= today;
      
      case "Year to date":
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        return docDay >= startOfYear && docDay <= today;
      
      case "Last 12 months":
        const twelveMonthsAgo = new Date(today);
        twelveMonthsAgo.setFullYear(today.getFullYear() - 1);
        return docDay >= twelveMonthsAgo && docDay <= today;
      
      default:
        return true;
    }
  };  const filteredDocuments = documents.filter(doc => {
    // Search filter
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Column filters
    const matchesTitleFilter = applyColumnFilter(doc.title, columnFilters.title);
    const matchesDocumentTypeFilter = applyColumnFilter(doc.category, columnFilters.documentType);
    const matchesLevelFilter = applyColumnFilter(doc.level, columnFilters.level);
    const matchesOwningBusinessFilter = applyColumnFilter(doc.owningBusinessGroup, columnFilters.owningBusiness);
    const matchesPublicationDateColumnFilter = applyColumnFilter(
      new Date(doc.publicationDate).toLocaleDateString(), 
      columnFilters.publicationDate
    );
      // Publication date filter (existing filter panel logic)
    const matchesPublicationDate = matchesPublicationDateFilter(doc.publicationDate, filters.publicationDate);
    
    // Document type filter (sidebar multi-select)
    const matchesDocumentType = filters.documentType.length === 0 || 
      filters.documentType.includes(doc.category);
    
    // Region filter (sidebar only)
    const matchesRegion = filters.region.length === 0 || 
      filters.region.includes(doc.region);
      // Risk type filter (sidebar only)
    const matchesRiskType = filters.riskType.length === 0 || 
      filters.riskType.includes(doc.riskType);
    
    // Bookmarks filter
    const matchesBookmarkFilter = !showBookmarksOnly || doc.isBookmarked === true;
    
    const passesAllFilters = matchesSearch && 
                           matchesTitleFilter && 
                           matchesDocumentTypeFilter && 
                           matchesLevelFilter && 
                           matchesOwningBusinessFilter && 
                           matchesPublicationDateColumnFilter && 
                           matchesPublicationDate && 
                           matchesDocumentType && 
                           matchesRegion && 
                           matchesRiskType &&
                           matchesBookmarkFilter;
    
    // Debug logging for date filtering when a date filter is active
    if (filters.publicationDate && filters.publicationDate !== "All") {
      console.log(`Document "${doc.title}" (${doc.publicationDate}): Date filter "${filters.publicationDate}" - ${matchesPublicationDate ? 'PASS' : 'FAIL'}`);
    }
      return passesAllFilters;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredDocuments.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm, columnFilters, showBookmarksOnly]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setActiveFilterPopup(null);
      }
    };

    if (activeFilterPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [activeFilterPopup]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleColumnFilterChange = (column: string, value: string, type: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: { value, type }
    }));
  };
  const clearColumnFilter = (column: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: { value: "", type: "contains" }
    }));
  };
  const toggleFilterPopup = (column: string) => {
    setActiveFilterPopup(activeFilterPopup === column ? null : column);
  };

  const handlePreviewDocument = (document: Document) => {
    setPreviewDocument(document);
    setIsPreviewModalOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewModalOpen(false);
    setPreviewDocument(null);
  };

  // Column filter popup component
  const FilterPopup = ({ column, label }: { column: string; label: string }) => {
    const filter = columnFilters[column as keyof typeof columnFilters];
    const [tempValue, setTempValue] = useState(filter.value);
    const [tempType, setTempType] = useState(filter.type);
    
    const applyFilter = () => {
      handleColumnFilterChange(column, tempValue, tempType);
      setActiveFilterPopup(null);
    };

    const clearFilter = () => {
      setTempValue("");
      setTempType("contains");
      clearColumnFilter(column);
      setActiveFilterPopup(null);
    };

    if (activeFilterPopup !== column) return null;

    return (
      <div 
        ref={popupRef}
        className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[250px] z-50"
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-sm">Filter {label}</h4>
          <button
            onClick={() => setActiveFilterPopup(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Filter Type
            </label>
            <select
              value={tempType}
              onChange={(e) => setTempType(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="contains">Contains</option>
              <option value="startsWith">Starts with</option>
              <option value="endsWith">Ends with</option>
              <option value="exact">Exact match</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Search Value
            </label>
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              placeholder="Enter filter value..."
              className="w-full text-sm border border-gray-300 rounded px-2 py-1"
              onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
            />
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={applyFilter}
              className="flex-1"
            >
              Apply
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={clearFilter}
              className="flex-1"
            >
              Clear
            </Button>
          </div>
        </div>
      </div>
    );
  };
  // Column header with filter button
  const ColumnHeader = ({ column, label }: { column: string; label: string }) => {
    const filter = columnFilters[column as keyof typeof columnFilters];
    const hasActiveFilter = filter.value !== "";
    
    return (
      <div className="flex items-center justify-between relative group">
        <span className="font-medium">{label}</span>
        <button
          onClick={() => toggleFilterPopup(column)}
          className={`ml-2 p-1 rounded transition-colors ${
            hasActiveFilter 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50 opacity-0 group-hover:opacity-100'
          } ${activeFilterPopup === column ? 'bg-gray-100' : ''}`}
          title={hasActiveFilter ? `Filtered: ${filter.type} "${filter.value}"` : 'Add filter'}
        >
          <Filter className="h-3 w-3" />
          {hasActiveFilter && (
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
          )}
        </button>
        <FilterPopup column={column} label={label} />
      </div>
    );
  };

  return (
    <div>      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-blue-600">
            All documents ({filteredDocuments.length} of {documents.length})
          </h2>
          {filteredDocuments.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredDocuments.length)} of {filteredDocuments.length} documents
            </p>
          )}          {filters.publicationDate && filters.publicationDate !== "All" && (
            <p className="text-sm text-muted-foreground mt-1">
              📅 Filtered by: {filters.publicationDate}
            </p>
          )}
          {Object.values(columnFilters).some(filter => filter.value) && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">🔍 Column filters:</span>
              <div className="flex flex-wrap gap-1">
                {Object.entries(columnFilters)
                  .filter(([_, filter]) => filter.value)
                  .map(([column, filter]) => (
                    <span
                      key={column}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                    >
                      {column}: "{filter.value}"
                      <button
                        onClick={() => clearColumnFilter(column)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                        title="Remove filter"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>        <div className="flex items-center gap-4">
          {Object.values(columnFilters).some(filter => filter.value) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setColumnFilters({
                title: { value: "", type: "contains" },
                documentType: { value: "", type: "contains" },
                level: { value: "", type: "contains" },
                owningBusiness: { value: "", type: "contains" },
                publicationDate: { value: "", type: "contains" }
              })}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Clear All Filters
            </Button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <select 
              value={pageSize} 
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-muted-foreground">per page</span>
          </div>
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
      </div>      {/* Document table */}
      <div className="border rounded-lg">
        <table className="w-full">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="w-12 p-4 text-left">
                <input
                  type="checkbox"
                  checked={paginatedDocuments.length > 0 && paginatedDocuments.every(doc => selectedDocuments.some(selected => selected.id === doc.id))}
                  onChange={(e) => {
                    if (e.target.checked) {
                      paginatedDocuments.forEach(doc => {
                        if (!selectedDocuments.some(selected => selected.id === doc.id)) {
                          onSelectDocument(doc);
                        }
                      });
                    } else {
                      paginatedDocuments.forEach(doc => {
                        if (selectedDocuments.some(selected => selected.id === doc.id)) {
                          onSelectDocument(doc);
                        }
                      });
                    }
                  }}
                  className="rounded"
                />
              </th>              <th className="p-4 text-left font-medium">ID</th>
              <th className="p-4 text-left font-medium">
                <ColumnHeader column="title" label="TITLE" />
              </th>
              <th className="p-4 text-left font-medium">
                <ColumnHeader column="documentType" label="DOCUMENT TYPE" />
              </th>
              <th className="p-4 text-left font-medium">
                <ColumnHeader column="level" label="LEVEL" />
              </th>
              <th className="p-4 text-left font-medium">
                <ColumnHeader column="owningBusiness" label="OWNING BUSINESS" />
              </th>              <th className="p-4 text-left font-medium">
                <ColumnHeader column="publicationDate" label="PUBLICATION DATE" />
              </th>
              <th className="p-4 text-left font-medium w-32">ACTIONS</th>
            </tr>
          </thead><tbody>            {paginatedDocuments.map((doc, index) => (
              <tr 
                key={doc.id} 
                id={`document-${doc.id}`}
                className="border-b hover:bg-muted/30 transition-all duration-300"
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedDocuments.some((d) => d.id === doc.id)}
                    onChange={() => onSelectDocument(doc)}
                    className="rounded"
                  />
                </td>
                <td className="p-4 text-sm text-muted-foreground">{startIndex + index + 1}</td>
                <td className="p-4 text-sm font-medium">{doc.title}</td>
                <td className="p-4 text-sm text-muted-foreground">{doc.category}</td>
                <td className="p-4 text-sm text-muted-foreground">{doc.level}</td>
                <td className="p-4 text-sm text-muted-foreground">{doc.owningBusinessGroup}</td>                <td className="p-4 text-sm text-muted-foreground">
                  {new Date(doc.publicationDate).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreviewDocument(doc)}
                      className="h-8 w-8 p-0"
                      title="Preview document"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onToggleBookmark(doc)}
                      className={`h-8 w-8 p-0 ${
                        doc.isBookmarked 
                          ? 'text-yellow-600 hover:text-yellow-700' 
                          : 'text-gray-400 hover:text-yellow-600'
                      }`}
                      title={doc.isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
                    >
                      <Bookmark className={`h-4 w-4 ${doc.isBookmarked ? 'fill-current' : ''}`} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1"
            >
              Next              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      {/* Document Preview Modal */}
      <DocumentPreviewModal
        document={previewDocument}
        isOpen={isPreviewModalOpen}
        onClose={handleClosePreview}
        onToggleBookmark={onToggleBookmark}
      />
    </div>
  )
}

