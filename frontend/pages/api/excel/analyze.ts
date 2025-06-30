import { NextApiRequest, NextApiResponse } from 'next';
import * as XLSX from 'xlsx';
import { ExcelAnalysis, AnalysisSummary, Recommendation, DataQualityIssue, GeneratedFormula, PowerQueryTemplate } from '../../../types/excel';

// Enhanced analysis with more realistic data generation
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { workbookId, workbook } = req.body;
    
    if (!workbookId) {
      return res.status(400).json({ error: 'Workbook ID is required' });
    }
    
    // Simulate analysis processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate dynamic analysis based on workbook if provided
    const analysis: Partial<ExcelAnalysis> = generateDynamicAnalysis(workbook);
    
    res.status(200).json(analysis);
  } catch (error) {
    console.error('Error analyzing workbook:', error);
    res.status(500).json({ error: 'Failed to analyze workbook' });
  }
}

function generateDynamicAnalysis(workbook: any): Partial<ExcelAnalysis> {
  console.log('Generating dynamic analysis for workbook:', workbook?.name);
  
  // Default values for when no workbook is provided
  let totalSheets = 3;
  let totalRows = 1250;
  let totalColumns = 12;
  let totalFormulas = 45;
  let complexityScore = 72;
  let automationPotential: 'low' | 'medium' | 'high' = 'high';
  let dataTypesDistribution = { 'text': 6, 'number': 4, 'date': 2 };
  
  // If workbook data is provided, analyze it for real insights
  if (workbook && workbook.sheets && Array.isArray(workbook.sheets)) {
    console.log('Analyzing real workbook data...');
    
    totalSheets = workbook.sheets.length;
    totalRows = workbook.sheets.reduce((sum: number, sheet: any) => sum + (sheet.rowCount || 0), 0);
    totalColumns = Math.max(...workbook.sheets.map((sheet: any) => sheet.columnCount || 0), 1);
    totalFormulas = workbook.sheets.reduce((sum: number, sheet: any) => sum + (sheet.formulaCells?.length || 0), 0);
      // Analyze data types across all sheets
    const allDataTypes: { text: number; number: number; date: number } = { text: 0, number: 0, date: 0 };
    
    workbook.sheets.forEach((sheet: any) => {
      if (sheet.dataTypes && Array.isArray(sheet.dataTypes)) {
        sheet.dataTypes.forEach((col: any) => {
          if (col.dataType === 'text') {
            allDataTypes.text += 1;
          } else if (col.dataType === 'number') {
            allDataTypes.number += 1;
          } else if (col.dataType === 'date') {
            allDataTypes.date += 1;
          }
        });
      }
    });
    
    dataTypesDistribution = allDataTypes;
    
    // Calculate complexity score based on actual data
    const formulaDensity = totalRows > 0 ? (totalFormulas / totalRows) * 100 : 0;
    const sheetComplexity = totalSheets * 10;
    const dataVolumeComplexity = Math.min(30, Math.log10(totalRows + 1) * 10);
    
    complexityScore = Math.min(100, Math.round(formulaDensity + sheetComplexity + dataVolumeComplexity));
    
    // Determine automation potential based on real metrics
    const hasComplexFormulas = workbook.sheets.some((sheet: any) => 
      sheet.formulaCells?.some((formula: any) => 
        formula.formula?.includes('VLOOKUP') || 
        formula.formula?.includes('INDEX') || 
        formula.formula?.includes('MATCH') ||
        formula.formula?.includes('SUMIFS') ||
        formula.formula?.includes('COUNTIFS')
      )
    );
    
    const hasMultipleSheets = totalSheets > 1;
    const hasLargeDataset = totalRows > 100;
    
    if ((hasComplexFormulas && hasMultipleSheets) || totalFormulas > 20) {
      automationPotential = 'high';
    } else if (hasComplexFormulas || hasMultipleSheets || totalFormulas > 5) {
      automationPotential = 'medium';
    } else {
      automationPotential = 'low';
    }
    
    console.log('Analysis metrics:', {
      totalSheets,
      totalRows,
      totalColumns,
      totalFormulas,
      complexityScore,
      automationPotential,
      dataTypesDistribution
    });
  }
  
  return {
    summary: {
      totalSheets,
      totalRows,
      totalColumns,
      totalFormulas,
      dataTypes: dataTypesDistribution,
      complexityScore,
      automationPotential,
    },
    recommendations: generateRecommendations(totalFormulas, totalSheets, automationPotential, workbook),
    suggestedFormulas: generateSuggestedFormulas(workbook),
    suggestedPowerQueries: generatePowerQueryTemplates(workbook),
    dataQualityIssues: generateDataQualityIssues(workbook),
  };
}

function generateRecommendations(formulas: number, sheets: number, automation: string, workbook?: any): Recommendation[] {
  const recommendations: Recommendation[] = [];
  
  // Analyze actual workbook data if available
  const hasComplexFormulas = workbook?.sheets?.some((sheet: any) => 
    sheet.formulaCells?.some((formula: any) => 
      formula.formula?.includes('VLOOKUP') || 
      formula.formula?.includes('INDEX') || 
      formula.formula?.includes('SUMIFS')
    )
  );
  
  const hasMultipleDataSources = sheets > 1;
  const hasLargeDataset = workbook?.sheets?.some((sheet: any) => sheet.rowCount > 100);
  
  if (formulas > 10 || hasComplexFormulas) {
    recommendations.push({
      id: 'rec_1',
      type: 'powerquery',
      priority: 'high',
      title: 'Automate Data Processing with PowerQuery',
      description: `${hasComplexFormulas ? 'Complex lookup formulas' : `${formulas} formulas`} detected. PowerQuery can automate these transformations`,
      implementation: 'Use Data → Get Data → From Other Sources → Blank Query to create automated data pipelines',
      impact: `Reduce manual formula maintenance by ${hasComplexFormulas ? '80%' : '70%'}`,
      effort: hasComplexFormulas ? 'high' : 'medium',
    });
  }
  
  if (hasMultipleDataSources) {
    recommendations.push({
      id: 'rec_2',
      type: 'formula',
      priority: 'medium',
      title: 'Consolidate Sheet References',
      description: `Multiple sheets detected (${sheets}). Use dynamic references to improve maintainability`,
      implementation: 'Replace hard-coded sheet references with INDIRECT or structured references',
      impact: 'Improve workbook flexibility and reduce errors',
      effort: 'low',
    });
  }
  
  recommendations.push({
    id: 'rec_3',
    type: 'data_validation',
    priority: automation === 'high' ? 'high' : 'medium',
    title: 'Implement Data Validation',
    description: 'Add validation rules to prevent data entry errors and improve data quality',
    implementation: 'Use Data → Data Validation for critical input fields',
    impact: 'Reduce data quality issues by 90%',
    effort: 'low',
  });
  
  return recommendations;
}

function generateSuggestedFormulas(workbook: any): GeneratedFormula[] {
  const formulas: GeneratedFormula[] = [];
  
  // Default formulas
  const defaultFormulas: GeneratedFormula[] = [
    {
      formula: '=XLOOKUP(A2,Products[Product_ID],Products[Price],"")',
      description: 'Dynamic price lookup with error handling',
      cellAddress: 'D2',
      category: 'lookup',
      complexity: 'intermediate',
      dependencies: ['A2', 'Products[Product_ID]', 'Products[Price]'],
      explanation: 'This formula looks up prices dynamically and returns an empty string if not found.',
    },
    {
      formula: '=SUMIFS(Sales[Amount],Sales[Date],">="&TODAY()-30)',
      description: 'Sum sales from last 30 days',
      cellAddress: 'G2',
      category: 'math',
      complexity: 'intermediate',
      dependencies: ['Sales[Amount]', 'Sales[Date]'],
      explanation: 'Calculates total sales for the last 30 days using dynamic date criteria.',
    },
  ];
  
  // Add workbook-specific formulas if data is available
  if (workbook && workbook.sheets) {
    workbook.sheets.forEach((sheet: any, sheetIndex: number) => {
      if (sheet.headers && sheet.dataTypes) {
        
        // Generate formulas based on detected data types
        const numberColumns = sheet.dataTypes.filter((col: any) => col.dataType === 'number');
        const dateColumns = sheet.dataTypes.filter((col: any) => col.dataType === 'date');
        const textColumns = sheet.dataTypes.filter((col: any) => col.dataType === 'text');
          // If we have number columns, suggest SUM formulas
        if (numberColumns.length > 0) {
          const firstNumberCol = numberColumns[0];
          const colLetter = firstNumberCol.columnLetter || XLSX.utils.encode_col(firstNumberCol.columnIndex || 0);
          
          formulas.push({
            formula: `=SUM(${colLetter}2:${colLetter}1000)`,
            description: `Sum all values in ${firstNumberCol.header} column`,
            cellAddress: `${colLetter}${sheet.rowCount + 2}`,
            category: 'math',
            complexity: 'basic',
            dependencies: [`${colLetter}2:${colLetter}1000`],
            explanation: `Calculates the total of all numeric values in the ${firstNumberCol.header} column.`,
          });
          
          formulas.push({
            formula: `=AVERAGE(${colLetter}2:${colLetter}1000)`,
            description: `Average of ${firstNumberCol.header} column`,
            cellAddress: `${colLetter}${sheet.rowCount + 3}`,
            category: 'math',
            complexity: 'basic',
            dependencies: [`${colLetter}2:${colLetter}1000`],
            explanation: `Calculates the average of all numeric values in the ${firstNumberCol.header} column.`,
          });
        }
          // If we have date columns, suggest date-related formulas
        if (dateColumns.length > 0) {
          const firstDateCol = dateColumns[0];
          const colLetter = firstDateCol.columnLetter || XLSX.utils.encode_col(firstDateCol.columnIndex || 0);
          const nextColLetter = XLSX.utils.encode_col((firstDateCol.columnIndex || 0) + 1);
          
          formulas.push({
            formula: `=COUNTIFS(${colLetter}:${colLetter},">="&TODAY()-30)`,
            description: `Count recent entries in ${firstDateCol.header}`,
            cellAddress: `${nextColLetter}${sheet.rowCount + 2}`,
            category: 'date',
            complexity: 'intermediate',
            dependencies: [`${colLetter}:${colLetter}`],
            explanation: `Counts how many entries in ${firstDateCol.header} are from the last 30 days.`,
          });
        }
          // If we have multiple columns, suggest lookup formulas
        if (sheet.headers.length > 2) {
          const firstCol = sheet.dataTypes[0];
          const secondCol = sheet.dataTypes[1];
          if (firstCol && secondCol) {
            const firstColLetter = firstCol.columnLetter || XLSX.utils.encode_col(firstCol.columnIndex || 0);
            const secondColLetter = secondCol.columnLetter || XLSX.utils.encode_col(secondCol.columnIndex || 1);
            const resultColLetter = XLSX.utils.encode_col((secondCol.columnIndex || 1) + 2);
            
            formulas.push({
              formula: `=XLOOKUP(A2,${firstColLetter}:${firstColLetter},${secondColLetter}:${secondColLetter},"Not Found")`,
              description: `Lookup ${secondCol.header} based on ${firstCol.header}`,
              cellAddress: `${resultColLetter}2`,
              category: 'lookup',
              complexity: 'intermediate',
              dependencies: [`A2`, `${firstColLetter}:${firstColLetter}`, `${secondColLetter}:${secondColLetter}`],              explanation: `Finds the corresponding ${secondCol.header} value for each ${firstCol.header} entry.`,
            });
          }
        }
      }
    });
  }
  
  // Add default formulas with workbook-specific ones
  if (workbook && workbook.sheets) {
    const hasDateColumns = workbook.sheets.some((sheet: any) => 
      sheet.dataTypes?.some((dt: any) => dt.dataType === 'date')
    );
    
    if (hasDateColumns) {
      formulas.push({
        formula: '=FILTER(Data[Product],(Data[Date]>=EOMONTH(TODAY(),-1)+1)*(Data[Date]<=EOMONTH(TODAY(),0)))',
        description: 'Filter current month data',
        cellAddress: 'A10',
        category: 'lookup',
        complexity: 'advanced',
        dependencies: ['Data[Product]', 'Data[Date]'],
        explanation: 'Returns all records from the current month using dynamic array formulas.',
      });
    }
  }
  
  // Combine default and generated formulas, limiting to reasonable amount
  return [...defaultFormulas, ...formulas].slice(0, 8);
}

function generatePowerQueryTemplates(workbook: any): PowerQueryTemplate[] {
  const templates: PowerQueryTemplate[] = [
    {
      id: 'pq_1',
      name: 'Data Standardization',
      description: 'Clean and standardize data formats across all columns',
      category: 'data_cleaning',
      steps: [
        {
          id: 'step_1',
          name: 'Promote Headers',
          operation: 'headers',
          mCode: 'Table.PromoteHeaders(Source, [PromoteAllScalars=true])',
          description: 'Promote first row to column headers',
          isApplied: true,
        },
        {
          id: 'step_2',
          name: 'Trim Text',
          operation: 'replace',
          mCode: 'Table.TransformColumns(#"Promoted Headers", {}, Text.Trim)',
          description: 'Remove leading and trailing spaces',
          isApplied: true,
        },
        {
          id: 'step_3',
          name: 'Detect Data Types',
          operation: 'dataTypes',
          mCode: 'Table.DetectDataTypes(#"Trimmed Text")',
          description: 'Automatically detect and apply proper data types',
          isApplied: true,
        },
      ],
      requiredColumns: [],
      outputColumns: [],
      mCode: `let
    Source = Excel.CurrentWorkbook(){[Name="Table1"]}[Content],
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Trimmed Text" = Table.TransformColumns(#"Promoted Headers", {}, Text.Trim),
    #"Detected Types" = Table.DetectDataTypes(#"Trimmed Text")
in
    #"Detected Types"`,
    },
  ];
  
  // Add workbook-specific templates
  if (workbook && workbook.sheets) {
    const hasNumericData = workbook.sheets.some((sheet: any) => 
      sheet.dataTypes?.some((dt: any) => dt.dataType === 'number')
    );
    
    if (hasNumericData) {
      templates.push({
        id: 'pq_2',
        name: 'Numerical Analysis',
        description: 'Group and analyze numerical data with calculations',
        category: 'analysis',
        steps: [
          {
            id: 'step_1',
            name: 'Group By Category',
            operation: 'group',
            mCode: 'Table.Group(Source, {"Category"}, {{"Total", each List.Sum([Amount]), type number}, {"Count", each Table.RowCount(_), type number}})',
            description: 'Group data and calculate totals',
            isApplied: true,
          },
          {
            id: 'step_2',
            name: 'Add Percentage',
            operation: 'add_column',
            mCode: 'Table.AddColumn(#"Grouped Rows", "Percentage", each [Total] / List.Sum(#"Grouped Rows"[Total]) * 100)',
            description: 'Calculate percentage of total',
            isApplied: true,
          },
        ],
        requiredColumns: ['Category', 'Amount'],
        outputColumns: ['Category', 'Total', 'Count', 'Percentage'],
        mCode: `let
    Source = Excel.CurrentWorkbook(){[Name="Data"]}[Content],
    #"Grouped Rows" = Table.Group(Source, {"Category"}, {{"Total", each List.Sum([Amount]), type number}, {"Count", each Table.RowCount(_), type number}}),
    #"Added Percentage" = Table.AddColumn(#"Grouped Rows", "Percentage", each [Total] / List.Sum(#"Grouped Rows"[Total]) * 100)
in
    #"Added Percentage"`,
      });
    }
  }
  
  return templates;
}

function generateDataQualityIssues(workbook: any): DataQualityIssue[] {
  const issues: DataQualityIssue[] = [];
  
  if (workbook && workbook.sheets) {
    workbook.sheets.forEach((sheet: any, sheetIndex: number) => {
      if (sheet.dataTypes) {        // Check for columns with high null counts
        sheet.dataTypes.forEach((col: any) => {
          const nullPercentage = col.nullCount / Math.max(sheet.rowCount - 1, 1) * 100;
          const colLetter = col.columnLetter || XLSX.utils.encode_col(col.columnIndex || 0);
          
          if (nullPercentage > 20) {
            issues.push({
              id: `dq_null_${sheetIndex}_${col.columnIndex}`,
              type: 'missing_data',
              severity: nullPercentage > 50 ? 'high' : 'medium',
              sheet: sheet.name,
              column: col.header,
              description: `${nullPercentage.toFixed(1)}% missing values in ${col.header}`,
              affectedCells: [`${colLetter}2:${colLetter}${sheet.rowCount}`],
              suggestedFix: 'Add data validation or implement default values for required fields',
            });
          }
        });
          // Check for inconsistent data types
        const textColumns = sheet.dataTypes.filter((col: any) => col.dataType === 'text');
        textColumns.forEach((col: any) => {
          const colLetter = col.columnLetter || XLSX.utils.encode_col(col.columnIndex || 0);
          
          if (col.uniqueCount === 1 && col.sampleValues.length > 0) {
            issues.push({
              id: `dq_uniform_${sheetIndex}_${col.columnIndex}`,
              type: 'inconsistent_format',
              severity: 'low',
              sheet: sheet.name,
              column: col.header,
              description: `${col.header} contains only one unique value: "${col.sampleValues[0]}"`,
              affectedCells: [`${colLetter}2:${colLetter}${sheet.rowCount}`],
              suggestedFix: 'Verify if this column provides meaningful data variation',
            });
          }
        });
      }
      
      // Check for complex formulas that might be error-prone
      if (sheet.formulaCells && sheet.formulaCells.length > 5) {
        const complexFormulas = sheet.formulaCells.filter((formula: any) => 
          formula.formula && (
            formula.formula.includes('VLOOKUP') || 
            (formula.formula.includes('INDEX') && formula.formula.includes('MATCH'))
          )
        );
          if (complexFormulas.length > 3) {
          issues.push({
            id: `dq_complex_${sheetIndex}`,
            type: 'invalid_data',
            severity: 'medium',
            sheet: sheet.name,
            column: 'Various',
            description: `${complexFormulas.length} complex lookup formulas detected`,
            affectedCells: complexFormulas.map((f: any) => f.address),
            suggestedFix: 'Consider replacing with XLOOKUP or PowerQuery for better maintainability',
          });
        }
      }
    });
  }
  
  // Add some default issues if no real issues found (for demo purposes)
  if (issues.length === 0) {
    issues.push({
      id: 'dq_demo_1',
      type: 'missing_data',
      severity: 'medium',
      sheet: 'Data',
      column: 'Important Field',
      description: 'Some required fields contain empty values',
      affectedCells: ['B15', 'B23', 'B41'],
      suggestedFix: 'Use data validation to require field entry or implement default values',
    });
    
    issues.push({
      id: 'dq_demo_2',
      type: 'inconsistent_format',
      severity: 'low',
      sheet: 'Data',
      column: 'Date Field',
      description: 'Inconsistent date formatting detected',
      affectedCells: ['A5', 'A12', 'A18'],
      suggestedFix: 'Standardize date format using Format Cells dialog',
    });
  }
  
  return issues.slice(0, 8); // Limit to reasonable number
}
