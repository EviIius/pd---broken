"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Bookmark } from "lucide-react"
import type { FilterState } from "../types"

interface FilterPanelProps {
  filters: FilterState
  onFilterChange: (filters: Partial<FilterState>) => void
  onClearFilter: (filterName: keyof FilterState) => void
  onClearAllFilters: () => void
  showBookmarksOnly: boolean
  onToggleBookmarksOnly: () => void
}

const publicationDateOptions = ["All", "Last 7 days", "Last month", "This month", "Year to date", "Last 12 months"]
const documentTypeOptions = [
  "Desktop procedures",
  "Executive summary",
  "Exhibit",
  "FAQ",
  "Glossary",
  "Guidelines",
  "Job aid",
  "Methodology",
  "Narrative",
]
const regionOptions = ["US", "EU", "UK", "APAC", "Canada", "LATAM", "Global"]
const riskTypeOptions = [
  "Capital Risk",
  "Compliance Risk", 
  "Credit Risk",
  "Cyber Risk",
  "ESG Risk",
  "Liquidity Risk",
  "Market Risk",
  "Model Risk",
  "Operational Risk",
  "Regulatory Risk",
  "Technology Risk"
]

export default function FilterPanel({ filters, onFilterChange, onClearAllFilters, showBookmarksOnly, onToggleBookmarksOnly }: FilterPanelProps) {  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean
  }>({
    bookmarks: true,
    publicationDate: true,
    documentType: true,
    region: true,
    riskType: true,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handlePublicationDateChange = (value: string) => {
    onFilterChange({ publicationDate: value === "All" ? null : value })
  }

  const handleCheckboxChange = (filterName: keyof FilterState, value: string, checked: boolean) => {
    const currentValues = (filters[filterName] as string[]) || []
    let newValues: string[]

    if (checked) {
      newValues = [...currentValues, value]
    } else {
      newValues = currentValues.filter((v) => v !== value)
    }

    onFilterChange({ [filterName]: newValues } as Partial<FilterState>)
  }
  return (
    <div>      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-blue-600">Filters</h2>
        <button 
          onClick={onClearAllFilters}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Clear all
        </button>
      </div>

      {/* Bookmarks Filter */}
      <div className="mb-4">
        <button onClick={() => toggleSection("bookmarks")} className="flex items-center w-full text-left font-semibold">
          {expandedSections.bookmarks ? (
            <ChevronDown className="h-4 w-4 mr-1" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-1" />
          )}
          <span>Bookmarks</span>
        </button>
        {expandedSections.bookmarks && (
          <div className="mt-2 pl-5">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showBookmarksOnly}
                onChange={onToggleBookmarksOnly}
                className="rounded"
              />
              <Bookmark className={`h-4 w-4 ${showBookmarksOnly ? 'text-yellow-600 fill-current' : 'text-gray-400'}`} />
              <span className="text-sm">Show bookmarked only</span>
            </label>
          </div>
        )}
      </div>

      {/* Publication Date */}
      <div className="mb-4">
        <button onClick={() => toggleSection("publicationDate")} className="flex items-center w-full text-left font-semibold">
          {expandedSections.publicationDate ? (
            <ChevronDown className="h-4 w-4 mr-1" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-1" />
          )}
          <span>Publication date</span>
        </button>
        {expandedSections.publicationDate && (
          <div className="mt-2 pl-5 space-y-2">
            {publicationDateOptions.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="radio"
                  id={`date-${option.replace(/\s+/g, "-")}`}
                  name="publicationDate"
                  value={option}
                  checked={(filters.publicationDate || "All") === option}
                  onChange={(e) => handlePublicationDateChange(e.target.value)}
                  className="mr-2"
                />
                <label htmlFor={`date-${option.replace(/\s+/g, "-")}`} className="text-sm">
                  {option}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>      {/* Document Type */}
      <div className="mb-4">
        <button onClick={() => toggleSection("documentType")} className="flex items-center w-full text-left font-semibold">
          {expandedSections.documentType ? (
            <ChevronDown className="h-4 w-4 mr-1" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-1" />
          )}
          <span>Document type</span>
        </button>
        {expandedSections.documentType && (
          <div className="mt-2 pl-5 space-y-2">
            {documentTypeOptions.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`doc-type-${option.replace(/\s+/g, "-")}`}
                  value={option}
                  checked={filters.documentType.includes(option)}
                  onChange={(e) => handleCheckboxChange("documentType", e.target.value, e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor={`doc-type-${option.replace(/\s+/g, "-")}`} className="text-sm">
                  {option}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>      {/* Region */}
      <div className="mb-4">
        <button onClick={() => toggleSection("region")} className="flex items-center w-full text-left font-semibold">
          {expandedSections.region ? (
            <ChevronDown className="h-4 w-4 mr-1" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-1" />
          )}
          <span>Region</span>
        </button>
        {expandedSections.region && (
          <div className="mt-2 pl-5 space-y-2">
            {regionOptions.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`region-${option.replace(/\s+/g, "-")}`}
                  value={option}
                  checked={filters.region.includes(option)}
                  onChange={(e) => handleCheckboxChange("region", e.target.value, e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor={`region-${option.replace(/\s+/g, "-")}`} className="text-sm">
                  {option}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Risk Type */}
      <div>
        <button onClick={() => toggleSection("riskType")} className="flex items-center w-full text-left font-semibold">
          {expandedSections.riskType ? (
            <ChevronDown className="h-4 w-4 mr-1" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-1" />
          )}
          <span>Risk type</span>
        </button>
        {expandedSections.riskType && (
          <div className="mt-2 pl-5 space-y-2">
            {riskTypeOptions.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`risk-type-${option.replace(/\s+/g, "-")}`}
                  value={option}
                  checked={filters.riskType.includes(option)}
                  onChange={(e) => handleCheckboxChange("riskType", e.target.value, e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor={`risk-type-${option.replace(/\s+/g, "-")}`} className="text-sm">
                  {option}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

