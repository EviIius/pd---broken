import { NextApiRequest, NextApiResponse } from 'next';
import { PowerQueryStep, ExcelWorkbook } from '../../../types/excel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { workbookId, sheetName, steps, template } = req.body;
    
    console.log('Generating PowerQuery for:', { workbookId, sheetName, steps: steps?.length, template });
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate M Code for each step
    const updatedSteps = steps.map((step: PowerQueryStep, index: number) => {
      let mCode = '';
      
      switch (step.operation) {
        case 'filter':
          mCode = generateFilterMCode(step, index);
          break;
        case 'sort':
          mCode = generateSortMCode(step, index);
          break;
        case 'group':
          mCode = generateGroupMCode(step, index);
          break;
        case 'pivot':
          mCode = generatePivotMCode(step, index);
          break;
        case 'unpivot':
          mCode = generateUnpivotMCode(step, index);
          break;
        case 'merge':
          mCode = generateMergeMCode(step, index);
          break;
        case 'append':
          mCode = generateAppendMCode(step, index);
          break;
        case 'split':
          mCode = generateSplitMCode(step, index);
          break;
        case 'replace':
          mCode = generateReplaceMCode(step, index);
          break;
        case 'add_column':
          mCode = generateAddColumnMCode(step, index);
          break;
        case 'remove':
          mCode = generateRemoveColumnsMCode(step, index);
          break;
        case 'dataTypes':
          mCode = generateDataTypesMCode(step, index);
          break;
        case 'custom':
          mCode = step.mCode || '// Custom M Code here';
          break;
        default:
          mCode = `// Step ${index + 1}: ${step.operation}`;
      }
      
      return {
        ...step,
        mCode,
        description: step.description || generateStepDescription(step),
        isApplied: true
      };
    });
    
    // Generate complete M Code
    const completeMCode = generateCompleteMCode(updatedSteps, sheetName);
    
    // Generate preview data based on steps
    const previewData = generatePreviewData(updatedSteps);
    
    res.status(200).json({
      steps: updatedSteps,
      completeMCode,
      previewData,
      success: true
    });
    
  } catch (error) {
    console.error('Error generating PowerQuery:', error);
    res.status(500).json({ 
      error: 'Failed to generate PowerQuery',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function generateFilterMCode(step: PowerQueryStep, index: number): string {
  const prevStep = index === 0 ? 'Source' : `#"Step ${index}"`;
  return `Table.SelectRows(${prevStep}, each [Column1] = "filter_value")`;
}

function generateSortMCode(step: PowerQueryStep, index: number): string {
  const prevStep = index === 0 ? 'Source' : `#"Step ${index}"`;
  return `Table.Sort(${prevStep},{{"Column1", Order.Ascending}})`;
}

function generateGroupMCode(step: PowerQueryStep, index: number): string {
  const prevStep = index === 0 ? 'Source' : `#"Step ${index}"`;
  return `Table.Group(${prevStep}, {"Column1"}, {{"Count", each Table.RowCount(_), Int64.Type}, {"Sum", each List.Sum([Column2]), type number}})`;
}

function generatePivotMCode(step: PowerQueryStep, index: number): string {
  const prevStep = index === 0 ? 'Source' : `#"Step ${index}"`;
  return `Table.Pivot(${prevStep}, List.Distinct(${prevStep}[Category]), "Category", "Value")`;
}

function generateUnpivotMCode(step: PowerQueryStep, index: number): string {
  const prevStep = index === 0 ? 'Source' : `#"Step ${index}"`;
  return `Table.UnpivotOtherColumns(${prevStep}, {"ID"}, "Attribute", "Value")`;
}

function generateMergeMCode(step: PowerQueryStep, index: number): string {
  const prevStep = index === 0 ? 'Source' : `#"Step ${index}"`;
  return `Table.NestedJoin(${prevStep}, {"Key"}, Table2, {"Key"}, "NewColumn", JoinKind.LeftOuter)`;
}

function generateAppendMCode(step: PowerQueryStep, index: number): string {
  const prevStep = index === 0 ? 'Source' : `#"Step ${index}"`;
  return `Table.Combine({${prevStep}, Table2})`;
}

function generateSplitMCode(step: PowerQueryStep, index: number): string {
  const prevStep = index === 0 ? 'Source' : `#"Step ${index}"`;
  return `Table.SplitColumn(${prevStep}, "Column1", Splitter.SplitTextByDelimiter(",", QuoteStyle.Csv), {"Column1.1", "Column1.2"})`;
}

function generateReplaceMCode(step: PowerQueryStep, index: number): string {
  const prevStep = index === 0 ? 'Source' : `#"Step ${index}"`;
  return `Table.ReplaceValue(${prevStep},"old_value","new_value",Replacer.ReplaceText,{"Column1"})`;
}

function generateAddColumnMCode(step: PowerQueryStep, index: number): string {
  const prevStep = index === 0 ? 'Source' : `#"Step ${index}"`;
  return `Table.AddColumn(${prevStep}, "New Column", each [Column1] + [Column2])`;
}

function generateRemoveColumnsMCode(step: PowerQueryStep, index: number): string {
  const prevStep = index === 0 ? 'Source' : `#"Step ${index}"`;
  return `Table.RemoveColumns(${prevStep},{"Column3", "Column4"})`;
}

function generateDataTypesMCode(step: PowerQueryStep, index: number): string {
  const prevStep = index === 0 ? 'Source' : `#"Step ${index}"`;
  return `Table.TransformColumnTypes(${prevStep},{{"Column1", type text}, {"Column2", type number}, {"Column3", type date}})`;
}

function generateStepDescription(step: PowerQueryStep): string {
  switch (step.operation) {
    case 'filter':
      return 'Filter rows based on specified criteria';
    case 'sort':
      return 'Sort data in ascending or descending order';
    case 'group':
      return 'Group data and perform aggregations';
    case 'pivot':
      return 'Transform data from long to wide format';
    case 'unpivot':
      return 'Transform data from wide to long format';
    case 'merge':
      return 'Join tables based on common keys';
    case 'append':
      return 'Combine tables by stacking rows';
    case 'split':
      return 'Split column values into multiple columns';
    case 'replace':
      return 'Replace values in specified columns';
    case 'add_column':
      return 'Add calculated or custom columns';
    case 'remove':
      return 'Remove unwanted columns';
    case 'dataTypes':
      return 'Change column data types';
    default:
      return `Apply ${step.operation} transformation`;
  }
}

function generateCompleteMCode(steps: PowerQueryStep[], sheetName?: string): string {
  const tableName = sheetName || 'Sheet1';
  
  if (steps.length === 0) {
    return `let
    Source = Excel.CurrentWorkbook(){[Name="${tableName}"]}[Content],
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true])
in
    #"Promoted Headers"`;
  }
  
  let mCode = `let
    Source = Excel.CurrentWorkbook(){[Name="${tableName}"]}[Content],
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),`;
    
  steps.forEach((step, index) => {
    const stepName = `Step ${index + 1}`;
    const previousStep = index === 0 ? '#"Promoted Headers"' : `#"Step ${index}"`;
    
    // Replace placeholder with actual previous step reference
    let stepCode = step.mCode;
    if (stepCode.includes('Source') && index > 0) {
      stepCode = stepCode.replace(/Source/g, previousStep);
    } else if (index === 0) {
      stepCode = stepCode.replace(/Source/g, '#"Promoted Headers"');
    }
    
    mCode += `
    #"${stepName}" = ${stepCode},`;
  });
  
  // Remove trailing comma and add the final step reference
  mCode = mCode.slice(0, -1);
  
  const lastStepName = steps.length > 0 ? `Step ${steps.length}` : 'Promoted Headers';
  mCode += `
in
    #"${lastStepName}"`;
    
  return mCode;
}

function generatePreviewData(steps: PowerQueryStep[]): any[][] {
  // Generate sample preview data based on applied steps
  let data = [
    ['Product', 'Category', 'Sales', 'Date', 'Region'],
    ['Laptop Pro', 'Electronics', 1299.99, '2024-01-15', 'North'],
    ['Wireless Mouse', 'Electronics', 29.99, '2024-01-16', 'South'],
    ['Office Chair', 'Furniture', 249.99, '2024-01-17', 'East'],
    ['Standing Desk', 'Furniture', 599.99, '2024-01-18', 'West'],
    ['Tablet', 'Electronics', 399.99, '2024-01-19', 'North'],
    ['Bookshelf', 'Furniture', 149.99, '2024-01-20', 'South']
  ];
  
  // Simulate effects of different operations
  if (steps.some(s => s.operation === 'filter')) {
    data = data.slice(0, 4); // Simulate filtering reducing rows
  }
  
  if (steps.some(s => s.operation === 'sort')) {
    // Simulate sorting by Product name
    const [header, ...rows] = data;
    const sortedRows = rows.sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    data = [header, ...sortedRows];
  }
  
  if (steps.some(s => s.operation === 'add_column')) {
    // Simulate adding a calculated column
    data = data.map((row, index) => {
      if (index === 0) {
        return [...row, 'Profit Margin'];
      }
      const sales = Number(row[2]) || 0;
      const margin = (sales * 0.25).toFixed(2);
      return [...row, margin];
    });
  }
  
  if (steps.some(s => s.operation === 'remove')) {
    // Simulate removing the Date column
    data = data.map(row => [row[0], row[1], row[2], row[4]]); // Remove index 3 (Date)
  }
  
  return data;
}
