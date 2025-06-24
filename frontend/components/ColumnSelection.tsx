"use client"

import { Checkbox } from "@/ui/checkbox"
import { Label } from "@/ui/label"
import { ScrollArea } from "@/ui/scroll-area"
import React from 'react';

interface ColumnSelectionProps {
  columns: any[] // Changed to any[] for diagnostics
  selectedColumns: string[]
  onSelectionChange: (selected: string[]) => void
}

export default function ColumnSelection({ columns, selectedColumns, onSelectionChange }: ColumnSelectionProps) {
  const handleColumnToggle = (columnValue: string) => {
    if (selectedColumns.includes(columnValue)) {
      onSelectionChange(selectedColumns.filter((c) => c !== columnValue))
    } else {
      onSelectionChange([...selectedColumns, columnValue])
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        Select the columns you want to analyze. You can select multiple columns.
      </div>

      <ScrollArea className="h-[300px] rounded-md border p-4 bg-white">
        <div className="space-y-4">
          {columns.map((column, index) => {
            const isString = typeof column === 'string';
            console.log(`Column item [${index}] type:`, typeof column, `Value:`, column);

            return (
              <div key={index} className="flex items-center space-x-2">
                {isString ? (
                  <>
                    <Checkbox
                      id={`column-${index}`}
                      checked={selectedColumns.includes(column)}
                      onCheckedChange={() => handleColumnToggle(column)} // Corrected: Radix Checkbox uses onCheckedChange
                    />
                    <Label htmlFor={`column-${index}`} className="font-normal">
                      {column}
                    </Label>
                  </>
                ) : (
                  <div className="text-red-500">
                    <p>Invalid column data (not a string):</p>
                    <pre>{JSON.stringify(column, null, 2)}</pre>
                    <Checkbox
                      id={`column-${index}`}
                      disabled={true}
                    />
                     <Label htmlFor={`column-${index}`} className="font-normal text-gray-400">
                       Invalid Item
                    </Label>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="text-sm mt-4">
        <span className="font-medium">Selected columns:</span>{" "}
        {selectedColumns.length === 0 ? (
          <span className="text-muted-foreground">None selected</span>
        ) : (
          selectedColumns.join(", ")
        )}
      </div>
    </div>
  )
}
