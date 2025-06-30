import { NextApiRequest, NextApiResponse } from 'next';
import * as XLSX from 'xlsx';
import { ExcelWorkbook, ExcelWorksheet, ExcelCell, ColumnDataType, FormulaCell } from '../../../types/excel';

// Generate dummy Excel data for testing
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { dataType = 'sales' } = req.body;
    
    let workbook: ExcelWorkbook;
    
    switch (dataType) {
      case 'sales':
        workbook = createSalesWorkbook();
        break;
      case 'inventory':
        workbook = createInventoryWorkbook();
        break;
      case 'financial':
        workbook = createFinancialWorkbook();
        break;
      default:
        workbook = createSalesWorkbook();
    }
    
    res.status(200).json(workbook);
  } catch (error) {
    console.error('Error creating dummy data:', error);
    res.status(500).json({ error: 'Failed to create dummy data' });
  }
}

function createSalesWorkbook(): ExcelWorkbook {
  const salesData = [
    ['Date', 'Product', 'Category', 'Sales Rep', 'Quantity', 'Unit Price', 'Total', 'Region'],
    ['2024-01-15', 'Laptop Pro', 'Electronics', 'John Smith', 2, 1299.99, '=E2*F2', 'North'],
    ['2024-01-16', 'Wireless Mouse', 'Electronics', 'Sarah Johnson', 5, 29.99, '=E3*F3', 'North'],
    ['2024-01-17', 'Office Chair', 'Furniture', 'Mike Davis', 3, 249.99, '=E4*F4', 'South'],
    ['2024-01-18', 'Standing Desk', 'Furniture', 'Lisa Chen', 1, 599.99, '=E5*F5', 'West'],
    ['2024-01-19', 'Monitor 24"', 'Electronics', 'John Smith', 4, 199.99, '=E6*F6', 'North'],
    ['2024-01-20', 'Keyboard', 'Electronics', 'Sarah Johnson', 8, 79.99, '=E7*F7', 'East'],
    ['2024-01-21', 'Bookshelf', 'Furniture', 'Mike Davis', 2, 149.99, '=E8*F8', 'South'],
    ['2024-01-22', 'Tablet', 'Electronics', 'Lisa Chen', 3, 399.99, '=E9*F9', 'West'],
    ['2024-01-23', 'Printer', 'Electronics', 'John Smith', 1, 249.99, '=E10*F10', 'North'],
    ['2024-01-24', 'Desk Lamp', 'Furniture', 'Sarah Johnson', 6, 39.99, '=E11*F11', 'East'],
  ];

  const summaryData = [
    ['Summary', '', '', '', '', '', '', ''],
    ['Total Sales', '=SUM(G2:G11)', '', '', '', '', '', ''],
    ['Average Sale', '=AVERAGE(G2:G11)', '', '', '', '', '', ''],
    ['Top Product', '=INDEX(B2:B11,MATCH(MAX(G2:G11),G2:G11,0))', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['Sales by Category', '', '', '', '', '', '', ''],
    ['Electronics', '=SUMIF(C2:C11,"Electronics",G2:G11)', '', '', '', '', '', ''],
    ['Furniture', '=SUMIF(C2:C11,"Furniture",G2:G11)', '', '', '', '', '', ''],
  ];

  const sheets: ExcelWorksheet[] = [
    createWorksheet('Sales Data', salesData, 'sheet_1'),
    createWorksheet('Summary', summaryData, 'sheet_2'),
  ];

  return {
    id: `workbook_${Date.now()}`,
    name: 'Sales Report Q1 2024.xlsx',
    sheets,
    uploadDate: new Date(),
    fileSize: 15360, // Mock file size
    lastModified: new Date(),
  };
}

function createInventoryWorkbook(): ExcelWorkbook {
  const inventoryData = [
    ['Product ID', 'Product Name', 'Category', 'Current Stock', 'Reorder Level', 'Unit Cost', 'Status'],
    ['P001', 'Laptop Pro 15"', 'Electronics', 25, 10, 899.99, '=IF(D2<=E2,"Reorder","OK")'],
    ['P002', 'Wireless Mouse', 'Electronics', 150, 50, 19.99, '=IF(D3<=E3,"Reorder","OK")'],
    ['P003', 'Office Chair', 'Furniture', 8, 15, 149.99, '=IF(D4<=E4,"Reorder","OK")'],
    ['P004', 'Standing Desk', 'Furniture', 12, 5, 399.99, '=IF(D5<=E5,"Reorder","OK")'],
    ['P005', '24" Monitor', 'Electronics', 35, 20, 149.99, '=IF(D6<=E6,"Reorder","OK")'],
    ['P006', 'Mechanical Keyboard', 'Electronics', 45, 25, 89.99, '=IF(D7<=E7,"Reorder","OK")'],
    ['P007', 'Bookshelf 5-Tier', 'Furniture', 6, 10, 99.99, '=IF(D8<=E8,"Reorder","OK")'],
    ['P008', 'Tablet 10"', 'Electronics', 20, 15, 299.99, '=IF(D9<=E9,"Reorder","OK")'],
  ];

  const analysisData = [
    ['Inventory Analysis', '', '', '', '', '', ''],
    ['Total Items', '=COUNTA(A2:A9)', '', '', '', '', ''],
    ['Items to Reorder', '=COUNTIF(G2:G9,"Reorder")', '', '', '', '', ''],
    ['Total Value', '=SUMPRODUCT(D2:D9,F2:F9)', '', '', '', '', ''],
    ['Low Stock Items', '', '', '', '', '', ''],
    ['=FILTER(A2:B9,G2:G9="Reorder")', '', '', '', '', '', ''],
  ];

  const sheets: ExcelWorksheet[] = [
    createWorksheet('Inventory', inventoryData, 'sheet_1'),
    createWorksheet('Analysis', analysisData, 'sheet_2'),
  ];

  return {
    id: `workbook_${Date.now()}`,
    name: 'Inventory Management.xlsx',
    sheets,
    uploadDate: new Date(),
    fileSize: 12800,
    lastModified: new Date(),
  };
}

function createFinancialWorkbook(): ExcelWorkbook {
  const financialData = [
    ['Month', 'Revenue', 'Expenses', 'Net Income', 'Growth %'],
    ['Jan 2024', 125000, 85000, '=B2-C2', ''],
    ['Feb 2024', 132000, 88000, '=B3-C3', '=IF(ROW()=2,"",(D3-D2)/D2*100)'],
    ['Mar 2024', 145000, 92000, '=B4-C4', '=(D4-D3)/D3*100'],
    ['Apr 2024', 138000, 89000, '=B5-C5', '=(D5-D4)/D4*100'],
    ['May 2024', 156000, 95000, '=B6-C6', '=(D6-D5)/D5*100'],
    ['Jun 2024', 162000, 98000, '=B7-C7', '=(D7-D6)/D6*100'],
    ['', '', '', '', ''],
    ['Totals', '=SUM(B2:B7)', '=SUM(C2:C7)', '=SUM(D2:D7)', ''],
    ['Averages', '=AVERAGE(B2:B7)', '=AVERAGE(C2:C7)', '=AVERAGE(D2:D7)', '=AVERAGE(E3:E7)'],
  ];

  const kpiData = [
    ['Key Performance Indicators', '', '', '', ''],
    ['Metric', 'Value', 'Target', 'Status', ''],
    ['Revenue Growth', '=((B7-B2)/B2)*100', 15, '=IF(B3>C3,"✓","✗")', ''],
    ['Profit Margin', '=(D9/B9)*100', 25, '=IF(B4>C4,"✓","✗")', ''],
    ['Expense Ratio', '=(C9/B9)*100', 65, '=IF(B5<C5,"✓","✗")', ''],
  ];

  const sheets: ExcelWorksheet[] = [
    createWorksheet('Financial Data', financialData, 'sheet_1'),
    createWorksheet('KPIs', kpiData, 'sheet_2'),
  ];

  return {
    id: `workbook_${Date.now()}`,
    name: 'Financial Report 2024.xlsx',
    sheets,
    uploadDate: new Date(),
    fileSize: 18432,
    lastModified: new Date(),
  };
}

function createWorksheet(name: string, data: any[][], id: string): ExcelWorksheet {
  const rowCount = data.length;
  const columnCount = Math.max(...data.map(row => row.length));
  const headers = data[0] || [];
  
  // Convert to ExcelCell format
  const cellData: ExcelCell[][] = data.map((row, rowIndex) => {
    const cellRow: ExcelCell[] = [];
    for (let colIndex = 0; colIndex < columnCount; colIndex++) {
      const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: colIndex });
      const value = row[colIndex] || null;
      
      let cellType: ExcelCell['type'] = 'empty';
      let formula: string | undefined;
      
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'string' && value.startsWith('=')) {
          cellType = 'formula';
          formula = value;
          // Mock calculate the result for formulas
          if (value.includes('SUM') || value.includes('*')) {
            cellType = 'formula';
          }
        } else if (typeof value === 'number') {
          cellType = 'number';
        } else if (typeof value === 'string') {
          // Check if it's a date
          if (value.includes('-') && value.length === 10) {
            cellType = 'date';
          } else {
            cellType = 'string';
          }
        }
      }
      
      cellRow.push({
        value,
        type: cellType,
        address: cellAddress,
        formula,
      });
    }
    return cellRow;
  });
  
  // Analyze data types for columns
  const dataTypes: ColumnDataType[] = headers.map((header, colIndex) => {
    const columnData = data.slice(1).map(row => row[colIndex]).filter(v => v !== null && v !== undefined && v !== '');
    const uniqueValues = Array.from(new Set(columnData));
    
    let dataType: ColumnDataType['dataType'] = 'text';
    if (columnData.length > 0) {
      const numberCount = columnData.filter(v => typeof v === 'number' || (!isNaN(Number(v)) && v !== '')).length;
      const dateCount = columnData.filter(v => typeof v === 'string' && v.includes('-') && v.length === 10).length;
      
      if (numberCount / columnData.length > 0.6) dataType = 'number';
      else if (dateCount / columnData.length > 0.6) dataType = 'date';
    }
    
    return {
      columnIndex: colIndex,
      columnLetter: XLSX.utils.encode_col(colIndex),
      header: header || `Column ${colIndex + 1}`,
      dataType,
      sampleValues: uniqueValues.slice(0, 5),
      uniqueCount: uniqueValues.length,
      nullCount: data.slice(1).length - columnData.length,
    };
  });
  
  // Extract formula cells
  const formulaCells: FormulaCell[] = [];
  cellData.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell.formula) {
        formulaCells.push({
          address: cell.address,
          formula: cell.formula,
          dependencies: extractFormulaDependencies(cell.formula),
          result: cell.value,
        });
      }
    });
  });
  
  return {
    id,
    name,
    data: cellData,
    headers,
    rowCount,
    columnCount,
    dataTypes,
    hasFormulas: formulaCells.length > 0,
    formulaCells,
  };
}

function extractFormulaDependencies(formula: string): string[] {
  const cellRefRegex = /\$?[A-Z]+\$?\d+/g;
  const matches = formula.match(cellRefRegex) || [];
  return Array.from(new Set(matches));
}
