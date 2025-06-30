import { NextApiRequest, NextApiResponse } from 'next';
import { PowerQueryStep } from '../../../types/excel';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { operation, parameters, currentSteps, template, workbook } = req.body;
    
    // Handle template-based M Code generation
    if (template) {
      const templateCode = generateTemplateCode(template, workbook);
      return res.status(200).json({
        templateCode,
        steps: [],
        previewData: generatePreviewData(template)
      });
    }
    
    if (!operation) {
      return res.status(400).json({ error: 'Operation is required' });
    }
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let newStep: PowerQueryStep;
    
    switch (operation) {
      case 'filter':
        newStep = {
          id: `step_${Date.now()}`,
          name: `Filter ${parameters.column}`,
          operation: 'filter',
          mCode: `Table.SelectRows(#"Previous Step", each [${parameters.column}] ${parameters.operator} "${parameters.value}")`,
          description: `Filter rows where ${parameters.column} ${parameters.operator} ${parameters.value}`,
          isApplied: false,
        };
        break;
        
      case 'sort':
        newStep = {
          id: `step_${Date.now()}`,
          name: `Sort by ${parameters.column}`,
          operation: 'sort',
          mCode: `Table.Sort(#"Previous Step",{{"${parameters.column}", Order.${parameters.direction || 'Ascending'}"}})`,
          description: `Sort by ${parameters.column} in ${parameters.direction || 'ascending'} order`,
          isApplied: false,
        };
        break;
        
      case 'group':
        newStep = {
          id: `step_${Date.now()}`,
          name: `Group by ${parameters.groupColumn}`,
          operation: 'group',
          mCode: `Table.Group(#"Previous Step", {"${parameters.groupColumn}"}, {{"${parameters.aggregateColumn}_Sum", each List.Sum([${parameters.aggregateColumn}]), type number}})`,
          description: `Group by ${parameters.groupColumn} and sum ${parameters.aggregateColumn}`,
          isApplied: false,
        };
        break;
        
      case 'add_column':
        newStep = {
          id: `step_${Date.now()}`,
          name: `Add ${parameters.columnName}`,
          operation: 'add_column',
          mCode: `Table.AddColumn(#"Previous Step", "${parameters.columnName}", each ${parameters.formula})`,
          description: `Add calculated column: ${parameters.columnName}`,
          isApplied: false,
        };
        break;
        
      case 'replace':
        newStep = {
          id: `step_${Date.now()}`,
          name: `Replace in ${parameters.column}`,
          operation: 'replace',
          mCode: `Table.ReplaceValue(#"Previous Step","${parameters.oldValue}","${parameters.newValue}",Replacer.ReplaceText,{"${parameters.column}"})`,
          description: `Replace "${parameters.oldValue}" with "${parameters.newValue}" in ${parameters.column}`,
          isApplied: false,
        };
        break;
        
      case 'remove':
        newStep = {
          id: `step_${Date.now()}`,
          name: `Remove ${parameters.columns?.join(', ')}`,
          operation: 'remove',
          mCode: `Table.RemoveColumns(#"Previous Step",{${parameters.columns?.map((col: string) => `"${col}"`).join(', ')}})`,
          description: `Remove columns: ${parameters.columns?.join(', ')}`,
          isApplied: false,
        };
        break;
        
      case 'dataTypes':
        const typeChanges = parameters.typeChanges?.map((change: any) => 
          `{"${change.column}", type ${change.type}}`
        ).join(', ');
        newStep = {
          id: `step_${Date.now()}`,
          name: 'Change Data Types',
          operation: 'dataTypes',
          mCode: `Table.TransformColumnTypes(#"Previous Step",{${typeChanges}})`,
          description: 'Change column data types',
          isApplied: false,
        };
        break;
        
      default:
        return res.status(400).json({ error: 'Unsupported operation' });
    }
    
    // Generate preview data (mock)
    const previewData = [
      ['Product', 'Category', 'Sales', 'Date'],
      ['Laptop', 'Electronics', 1200, '2024-01-15'],
      ['Phone', 'Electronics', 800, '2024-01-16'],
      ['Desk', 'Furniture', 350, '2024-01-17'],
      ['Chair', 'Furniture', 150, '2024-01-18'],
    ];
    
    // Generate complete M code for all steps
    const allSteps = [...(currentSteps || []), newStep];
    const mCode = generateCompleteMCode(allSteps);
    
    res.status(200).json({
      step: newStep,
      previewData,
      completeMCode: mCode,
    });
  } catch (error) {
    console.error('Error generating PowerQuery step:', error);
    res.status(500).json({ error: 'Failed to generate PowerQuery step' });
  }
}

function generateCompleteMCode(steps: PowerQueryStep[]): string {
  let mCode = `let
    Source = Excel.CurrentWorkbook(){[Name="Table1"]}[Content],`;
    
  steps.forEach((step, index) => {
    const stepName = step.name.replace(/\s+/g, ' ');
    const previousStep = index === 0 ? 'Source' : `#"${steps[index - 1].name.replace(/\s+/g, ' ')}"`;
    
    // Replace "Previous Step" with actual step reference
    const stepCode = step.mCode.replace('#"Previous Step"', previousStep);
    
    mCode += `
    #"${stepName}" = ${stepCode},`;
  });
  
  // Remove trailing comma and add the final step reference
  mCode = mCode.slice(0, -1);
  
  const lastStepName = steps.length > 0 ? steps[steps.length - 1].name.replace(/\s+/g, ' ') : 'Source';
  mCode += `
in
    #"${lastStepName}"`;
    
  return mCode;
}

function generateTemplateCode(template: string, workbook?: any): string {
  switch (template) {
    case 'data_cleaning':
      return `let
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
    #"Replaced Errors"`;

    case 'transformation':
      return `let
    Source = Excel.CurrentWorkbook(){[Name="DataTable"]}[Content],
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Unpivoted Columns" = Table.UnpivotOtherColumns(#"Promoted Headers", {"ID", "Name"}, "Month", "Value"),
    #"Changed Type" = Table.TransformColumnTypes(#"Unpivoted Columns",{
        {"ID", Int64.Type},
        {"Value", type number},
        {"Month", type text}
    }),
    #"Added Year" = Table.AddColumn(#"Changed Type", "Year", each Date.Year(Date.From([Month]))),
    #"Grouped Rows" = Table.Group(#"Added Year", {"ID", "Name", "Year"}, {
        {"Total", each List.Sum([Value]), type number},
        {"Average", each List.Average([Value]), type number}
    })
in
    #"Grouped Rows"`;

    case 'financial':
      return `let
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
    #"Formatted Numbers"`;

    default:
      return `let
    Source = Excel.CurrentWorkbook(){[Name="Table1"]}[Content],
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Changed Type" = Table.TransformColumnTypes(#"Promoted Headers",{
        {"Column1", type text},
        {"Column2", type number},
        {"Column3", type date}
    })
in
    #"Changed Type"`;
  }
}

function generatePreviewData(template: string): any[][] {
  switch (template) {
    case 'data_cleaning':
      return [
        ['Date', 'Product', 'Category', 'Amount'],
        ['2024-01-15', 'Laptop Pro', 'Electronics', 1299.99],
        ['2024-01-16', 'Wireless Mouse', 'Electronics', 29.99],
        ['2024-01-17', 'Office Chair', 'Furniture', 249.99],
        ['2024-01-18', 'Standing Desk', 'Furniture', 599.99]
      ];
    
    case 'transformation':
      return [
        ['ID', 'Name', 'Year', 'Total', 'Average'],
        [1, 'Product A', 2024, 15000, 1250],
        [2, 'Product B', 2024, 23000, 1917],
        [3, 'Product C', 2024, 18500, 1542]
      ];
    
    case 'financial':
      return [
        ['Date', 'Revenue', 'Expenses', 'Net Income', 'Margin %', 'Growth %', 'YTD Revenue'],
        ['2024-01-01', 125000, 85000, 40000, '32.0%', null, 125000],
        ['2024-02-01', 132000, 88000, 44000, '33.3%', '5.6%', 257000],
        ['2024-03-01', 145000, 92000, 53000, '36.6%', '9.8%', 402000]
      ];
    
    default:
      return [
        ['Column1', 'Column2', 'Column3'],
        ['Sample', 100, '2024-01-01'],
        ['Data', 200, '2024-01-02'],
        ['Here', 300, '2024-01-03']
      ];
  }
}
