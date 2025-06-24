"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { FilterState } from "../types"

interface FilterPanelProps {
  filters: FilterState
  onFilterChange: (filters: Partial<FilterState>) => void
  onClearFilter: (filterName: keyof FilterState) => void
  onClearAllFilters: () => void
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
const levelOptions = ["Group", "Business Unit", "Local"]
const owningBusinessOptions = [
  "Legal & Compliance",
  "Information Technology", 
  "Risk Management",
  "Procurement",
  "Human Resources",
  "Compliance",
  "Trading",
  "Credit Risk"
]

export default function FilterPanel({ filters, onFilterChange, onClearAllFilters }: FilterPanelProps) {  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean
  }>({
    publicationDate: true,
    documentType: true,
    level: true,
    owningBusinessGroup: true,
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-blue-600">Filters</h2>
        <button 
          onClick={onClearAllFilters}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Clear all
        </button>
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
      </div>

      {/* Level */}
      <div className="mb-4">
        <button onClick={() => toggleSection("level")} className="flex items-center w-full text-left font-semibold">
          {expandedSections.level ? (
            <ChevronDown className="h-4 w-4 mr-1" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-1" />
          )}
          <span>Level</span>
        </button>
        {expandedSections.level && (
          <div className="mt-2 pl-5 space-y-2">
            {levelOptions.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`level-${option.replace(/\s+/g, "-")}`}
                  value={option}
                  checked={filters.level.includes(option)}
                  onChange={(e) => handleCheckboxChange("level", e.target.value, e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor={`level-${option.replace(/\s+/g, "-")}`} className="text-sm">
                  {option}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Owning Business Group */}
      <div>
        <button onClick={() => toggleSection("owningBusinessGroup")} className="flex items-center w-full text-left font-semibold">
          {expandedSections.owningBusinessGroup ? (
            <ChevronDown className="h-4 w-4 mr-1" />
          ) : (
            <ChevronRight className="h-4 w-4 mr-1" />
          )}
          <span>Owning business</span>
        </button>
        {expandedSections.owningBusinessGroup && (
          <div className="mt-2 pl-5 space-y-2">
            {owningBusinessOptions.map((option) => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`owning-business-${option.replace(/\s+/g, "-")}`}
                  value={option}
                  checked={filters.owningBusinessGroup.includes(option)}
                  onChange={(e) => handleCheckboxChange("owningBusinessGroup", e.target.value, e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor={`owning-business-${option.replace(/\s+/g, "-")}`} className="text-sm">
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

