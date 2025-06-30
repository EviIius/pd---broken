# PowerQuery M Code Generation - Testing Guide

## Overview
The PowerQuery tab in the Excel Analysis page now supports dynamic M Code generation with the following features:

## Features Implemented

### 1. Template-Based M Code Generation
- **Data Cleaning Template**: Removes empty rows, trims spaces, and standardizes data types
- **Pivot Transformation Template**: Transforms data from long to wide format
- **Financial Calculations Template**: Adds common financial metrics and KPIs

### 2. Step-by-Step M Code Builder
- Add transformation steps using dropdown selection
- Supported operations:
  - Filter Rows
  - Sort Data
  - Group By
  - Pivot Table
  - Unpivot Columns
  - Merge Tables
  - Append Tables
  - Split Column
  - Replace Values
  - Add Column
  - Remove Columns
  - Change Data Types
  - Custom M Code

### 3. Dynamic M Code Generation
- Generate complete M Code from selected steps
- Real-time preview of data transformations
- Copy M Code to clipboard
- Export M Code as .m file

### 4. Error Handling and User Feedback
- Error messages for failed operations
- Success messages for completed actions
- Loading states during generation
- Auto-clearing messages after 5 seconds

## API Endpoints

### `/api/excel/generate-powerquery` (NEW)
- **Method**: POST
- **Purpose**: Generate M Code for PowerQuery steps
- **Input**: 
  ```json
  {
    "workbookId": "string",
    "sheetName": "string", 
    "steps": "PowerQueryStep[]",
    "template": "string"
  }
  ```
- **Output**:
  ```json
  {
    "steps": "PowerQueryStep[]",
    "completeMCode": "string",
    "previewData": "any[][]",
    "success": true
  }
  ```

### `/api/excel/powerquery` (ENHANCED)
- **Method**: POST
- **Purpose**: Handle template-based M Code generation
- **Input**:
  ```json
  {
    "template": "string",
    "workbook": "ExcelWorkbook"
  }
  ```
- **Output**:
  ```json
  {
    "templateCode": "string",
    "previewData": "any[][]"
  }
  ```

## UI Components Enhanced

### PowerQueryBuilder Component
- **Templates Section**: Display pre-built templates with preview and apply options
- **Step Builder**: Add, remove, and manage transformation steps
- **M Code Display**: Shows generated M Code with syntax highlighting
- **Data Preview**: Shows sample data after transformations
- **Export Controls**: Copy and download generated M Code

## Testing Instructions

### 1. Upload Excel File
1. Navigate to `/excel` page
2. Upload any Excel file using the upload zone
3. Click on the "PowerQuery" tab

### 2. Test Template Functionality
1. In the PowerQuery Templates section, click on any template card
2. Click the "eye" icon to preview the template M Code
3. Click "Use Template" to apply the template and generate preview data

### 3. Test Step-by-Step Builder
1. Use the "Add Transformation Step" dropdown to select an operation
2. Click the "+" button to add the step
3. Repeat to add multiple steps
4. Click "Generate M Code" to create the complete M Code

### 4. Test Export Features
1. After generating M Code, click "Copy" to copy to clipboard
2. Click "Export" to download the M Code as a .m file

## Sample Generated M Code

### Data Cleaning Template
```m
let
    Source = Excel.CurrentWorkbook(){[Name="Sheet1"]}[Content],
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Trimmed Text" = Table.TransformColumns(#"Promoted Headers",{},Text.Trim),
    #"Cleaned Text" = Table.TransformColumns(#"Trimmed Text",{},Text.Clean),
    #"Removed Empty Rows" = Table.SelectRows(#"Cleaned Text", each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null}))),
    #"Changed Type" = Table.TransformColumnTypes(#"Removed Empty Rows",{
        {"Date", type date},
        {"Amount", type number},
        {"Category", type text}
    }),
    #"Replaced Errors" = Table.ReplaceErrorValues(#"Changed Type", {{"Amount", 0}, {"Date", #date(2024,1,1)}})
in
    #"Replaced Errors"
```

### Financial Calculations Template
```m
let
    Source = Excel.CurrentWorkbook(){[Name="FinancialData"]}[Content],
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers",{
        {"Date", type date},
        {"Revenue", type number},
        {"Expenses", type number}
    }),
    #"Added Net Income" = Table.AddColumn(#"Changed Type", "Net Income", each [Revenue] - [Expenses]),
    #"Added Margin %" = Table.AddColumn(#"Added Net Income", "Margin %", each [Net Income] / [Revenue]),
    #"Added Growth %" = Table.AddColumn(#"Added Margin %", "Growth %", each 
        if [Date] = List.Min(#"Added Margin %"[Date]) then null 
        else ([Revenue] - List.Last(List.Sort(Table.SelectRows(#"Added Margin %", each [Date] < _[Date])[Revenue]))) 
             / List.Last(List.Sort(Table.SelectRows(#"Added Margin %", each [Date] < _[Date])[Revenue]))
    ),
    #"Added YTD Revenue" = Table.AddColumn(#"Added Growth %", "YTD Revenue", each 
        List.Sum(Table.SelectRows(#"Added Growth %", each Date.Year([Date]) = Date.Year(_[Date]) and [Date] <= _[Date])[Revenue])
    ),
    #"Formatted Numbers" = Table.TransformColumnTypes(#"Added YTD Revenue",{
        {"Margin %", Percentage.Type},
        {"Growth %", Percentage.Type}
    })
in
    #"Formatted Numbers"
```

## Known Limitations

1. **Column Detection**: M Code generation uses placeholder column names and may need manual adjustment for specific datasets
2. **Data Type Inference**: Basic data type detection, may require refinement for complex data structures
3. **Error Handling**: Limited validation of step combinations

## Future Enhancements

1. **Real-time Column Detection**: Analyze uploaded Excel data to suggest appropriate column names
2. **Advanced Step Parameters**: Add UI for configuring step-specific parameters
3. **M Code Validation**: Real-time validation of generated M Code syntax
4. **Step Dependencies**: Visual indication of step dependencies and conflicts
5. **Import Existing M Code**: Allow users to import and modify existing PowerQuery scripts

## Files Modified/Created

### New Files
- `/api/excel/generate-powerquery.ts` - Main M Code generation API

### Modified Files
- `/components/excel/PowerQueryBuilder.tsx` - Enhanced with dynamic M Code generation
- `/types/excel.ts` - Updated PowerQueryBuilder state interface
- `/api/excel/powerquery.ts` - Enhanced template support

The PowerQuery functionality is now fully operational and ready for testing!
