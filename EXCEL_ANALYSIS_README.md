# Excel Analysis & Automation Feature

This document describes the new Excel analysis and automation feature that has been added to the Policy Q&A application.

## Overview

The Excel Analysis page (`/excel`) provides a comprehensive tool for:
- **Excel File Parsing**: Upload and analyze .xlsx and .xls files
- **PowerQuery Generation**: Create M-code PowerQueries for data transformation
- **Formula Generation**: Generate advanced Excel formulas with AI assistance
- **Data Quality Analysis**: Identify and suggest fixes for data quality issues

## Features

### 1. File Upload & Analysis
- Drag-and-drop Excel file upload
- Automatic parsing of worksheets, cells, and formulas
- Data type detection and validation
- Formula dependency analysis

### 2. Smart Analysis
- Data quality assessment
- Automation potential scoring
- Recommendations for improvements
- Pattern recognition in data

### 3. PowerQuery Builder
- Visual step-by-step query builder
- Generate M-code for data transformation
- Preview data at each step
- Pre-built templates for common operations:
  - Data cleaning and standardization
  - Filtering and sorting
  - Grouping and aggregation
  - Column operations

### 4. Formula Generator
- AI-powered formula suggestions
- Support for advanced functions:
  - XLOOKUP, FILTER, SUMIFS, COUNTIFS
  - INDEX/MATCH combinations
  - Dynamic array formulas
- Parameter-driven formula building
- Explanation and dependency tracking

## Getting Started

### Prerequisites
- Node.js and npm installed
- All dependencies installed (`npm install`)

### Installation
The feature is already integrated into the main application. No additional setup required.

### Usage

1. **Access the Excel Page**
   - Navigate to `/excel` in your browser
   - Or click "Excel Analysis" in the main navigation

2. **Upload Excel Files**
   - Drag and drop Excel files (.xlsx, .xls) onto the upload zone
   - Or click to browse and select files
   - Files are automatically parsed and analyzed

3. **Explore Analysis Results**
   - Switch between tabs: Analysis, Data Preview, PowerQuery, Formulas
   - Review recommendations and data quality issues
   - Check complexity scores and automation potential

4. **Generate PowerQueries**
   - Use the PowerQuery tab to build transformation steps
   - Add operations like filter, sort, group, etc.
   - Preview results and copy generated M-code

5. **Create Formulas**
   - Select the Formulas tab
   - Choose from formula templates or build custom formulas
   - Configure parameters and get explanations
   - Copy generated formulas to use in Excel

## API Endpoints

The feature includes several API endpoints:

- `POST /api/excel/parse` - Parse uploaded Excel files
- `POST /api/excel/analyze` - Analyze workbook structure and quality
- `POST /api/excel/powerquery` - Generate PowerQuery steps
- `GET/POST /api/excel/formulas` - Get formula templates and generate formulas

## File Structure

```
frontend/
├── pages/
│   ├── excel.tsx                 # Main Excel analysis page
│   └── api/excel/
│       ├── parse.ts             # Excel file parsing
│       ├── analyze.ts           # Workbook analysis
│       ├── powerquery.ts        # PowerQuery generation
│       └── formulas.ts          # Formula generation
├── components/excel/
│   ├── ExcelUploadZone.tsx      # File upload interface
│   ├── ExcelAnalysisPanel.tsx   # Analysis results display
│   ├── PowerQueryBuilder.tsx    # PowerQuery step builder
│   ├── FormulaGenerator.tsx     # Formula generation interface
│   └── ExcelPreview.tsx         # Data preview grid
└── types/
    └── excel.ts                 # TypeScript type definitions
```

## Dependencies

The feature uses these key dependencies:
- `xlsx` - Excel file parsing
- `formidable` - File upload handling
- `react-dropzone` - Drag-and-drop interface
- `@radix-ui/*` - UI components
- `lucide-react` - Icons

## Customization

### Adding New Formula Templates
Edit `frontend/pages/api/excel/formulas.ts` and add new entries to the `formulaTemplates` array.

### Adding PowerQuery Operations
Extend the switch statement in `frontend/pages/api/excel/powerquery.ts` to support new operations.

### Customizing Analysis Logic
Modify `frontend/pages/api/excel/analyze.ts` to implement custom analysis algorithms.

## Development Notes

- The feature is completely separate from the main Policy Q&A functionality
- All Excel-related components are in the `frontend/components/excel/` directory
- The page uses a tabbed interface for different functionalities
- API endpoints provide mock data for demonstration - replace with real analysis logic as needed
- Error handling and loading states are implemented throughout

## Future Enhancements

Potential improvements:
- Real-time collaboration on Excel analysis
- Advanced chart generation
- Integration with external data sources
- Automated report generation
- Custom formula library
- Version control for Excel files

## Support

For questions or issues with the Excel analysis feature, refer to the main application documentation or contact the development team.
