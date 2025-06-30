// Excel parsing and analysis types
export interface ExcelWorkbook {
  id: string;
  name: string;
  sheets: ExcelWorksheet[];
  uploadDate: Date;
  fileSize: number;
  lastModified: Date;
}

export interface ExcelWorksheet {
  id: string;
  name: string;
  data: ExcelCell[][];
  headers: string[];
  rowCount: number;
  columnCount: number;
  dataTypes: ColumnDataType[];
  hasFormulas: boolean;
  formulaCells: FormulaCell[];
}

export interface ExcelCell {
  value: any;
  type: 'string' | 'number' | 'date' | 'boolean' | 'formula' | 'empty';
  address: string; // e.g., "A1", "B2"
  formula?: string;
  style?: CellStyle;
}

export interface FormulaCell {
  address: string;
  formula: string;
  dependencies: string[]; // Cell references this formula depends on
  result: any;
}

export interface CellStyle {
  backgroundColor?: string;
  fontColor?: string;
  fontWeight?: 'normal' | 'bold';
  fontSize?: number;
  alignment?: 'left' | 'center' | 'right';
}

export interface ColumnDataType {
  columnIndex: number;
  columnLetter: string;
  header: string;
  dataType: 'text' | 'number' | 'date' | 'currency' | 'percentage' | 'mixed';
  sampleValues: any[];
  uniqueCount: number;
  nullCount: number;
  pattern?: string; // For data validation
}

// PowerQuery generation types
export interface PowerQueryStep {
  id: string;
  name: string;
  operation: PowerQueryOperation;
  mCode: string;
  description: string;
  isApplied: boolean;
}

export type PowerQueryOperation = 
  | 'source'
  | 'headers'
  | 'dataTypes'
  | 'filter'
  | 'sort'
  | 'group'
  | 'pivot'
  | 'unpivot'
  | 'merge'
  | 'append'
  | 'split'
  | 'replace'
  | 'remove'
  | 'add_column'
  | 'custom';

export interface PowerQueryTemplate {
  id: string;
  name: string;
  description: string;
  category: 'data_cleaning' | 'transformation' | 'analysis' | 'financial' | 'reporting';
  steps: PowerQueryStep[];
  requiredColumns: string[];
  outputColumns: string[];
  mCode: string;
}

// Formula generation types
export interface ExcelFormula {
  id: string;
  name: string;
  description: string;
  category: 'lookup' | 'math' | 'text' | 'date' | 'logical' | 'financial' | 'statistical';
  formula: string;
  parameters: FormulaParameter[];
  example: string;
  complexity: 'basic' | 'intermediate' | 'advanced';
}

export interface FormulaParameter {
  name: string;
  type: 'range' | 'cell' | 'text' | 'number' | 'criteria';
  description: string;
  required: boolean;
  example: string;
}

export interface GeneratedFormula {
  formula: string;
  description: string;
  cellAddress: string;
  category: string;
  complexity: 'basic' | 'intermediate' | 'advanced';
  dependencies: string[];
  explanation: string;
}

// Analysis results
export interface ExcelAnalysis {
  workbook: ExcelWorkbook;
  summary: AnalysisSummary;
  recommendations: Recommendation[];
  suggestedFormulas: GeneratedFormula[];
  suggestedPowerQueries: PowerQueryTemplate[];
  dataQualityIssues: DataQualityIssue[];
}

export interface AnalysisSummary {
  totalSheets: number;
  totalRows: number;
  totalColumns: number;
  totalFormulas: number;
  dataTypes: { [key: string]: number };
  complexityScore: number;
  automationPotential: 'low' | 'medium' | 'high';
}

export interface Recommendation {
  id: string;
  type: 'formula' | 'powerquery' | 'data_validation' | 'formatting' | 'structure';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  implementation: string;
  impact: string;
  effort: 'low' | 'medium' | 'high';
}

export interface DataQualityIssue {
  id: string;
  type: 'missing_data' | 'inconsistent_format' | 'duplicate_data' | 'invalid_data' | 'outlier';
  severity: 'low' | 'medium' | 'high';
  sheet: string;
  column: string;
  description: string;
  affectedCells: string[];
  suggestedFix: string;
}

// UI State types
export interface ExcelPageState {
  uploadedFiles: ExcelWorkbook[];
  activeWorkbook: ExcelWorkbook | null;
  activeSheet: ExcelWorksheet | null;
  selectedCells: string[];
  analysis: ExcelAnalysis | null;
  isAnalyzing: boolean;  powerQueryBuilder: {
    steps: PowerQueryStep[];
    previewData: any[][];
    isGenerating: boolean;
    completeMCode?: string;
    error?: string;
    success?: string;
  };
  formulaBuilder: {
    selectedFormula: ExcelFormula | null;
    parameters: { [key: string]: any };
    generatedFormula: string;
    isGenerating: boolean;
  };
}
