import { NextApiRequest, NextApiResponse } from 'next';
import * as XLSX from 'xlsx';

// Generate and download actual Excel files for testing
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { type = 'sales' } = req.query;
  
  try {
    let workbook: XLSX.WorkBook;
    let filename: string;
    
    switch (type) {
      case 'sales':
        workbook = createSalesExcel();
        filename = 'Sales_Report_Q1_2024.xlsx';
        break;
      case 'inventory':
        workbook = createInventoryExcel();
        filename = 'Inventory_Management.xlsx';
        break;
      case 'financial':
        workbook = createFinancialExcel();
        filename = 'Financial_Report_2024.xlsx';
        break;
      default:
        workbook = createSalesExcel();
        filename = 'Sample_Data.xlsx';
    }
    
    // Convert workbook to buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    
    // Set headers for download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
  } catch (error) {
    console.error('Error generating Excel file:', error);
    res.status(500).json({ error: 'Failed to generate Excel file' });
  }
}

function createSalesExcel(): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  
  // Sales Data Sheet
  const salesData = [
    ['Date', 'Product', 'Category', 'Sales Rep', 'Quantity', 'Unit Price', 'Total', 'Region'],
    ['2024-01-15', 'Laptop Pro', 'Electronics', 'John Smith', 2, 1299.99, { f: 'E2*F2' }, 'North'],
    ['2024-01-16', 'Wireless Mouse', 'Electronics', 'Sarah Johnson', 5, 29.99, { f: 'E3*F3' }, 'North'],
    ['2024-01-17', 'Office Chair', 'Furniture', 'Mike Davis', 3, 249.99, { f: 'E4*F4' }, 'South'],
    ['2024-01-18', 'Standing Desk', 'Furniture', 'Lisa Chen', 1, 599.99, { f: 'E5*F5' }, 'West'],
    ['2024-01-19', 'Monitor 24"', 'Electronics', 'John Smith', 4, 199.99, { f: 'E6*F6' }, 'North'],
    ['2024-01-20', 'Keyboard', 'Electronics', 'Sarah Johnson', 8, 79.99, { f: 'E7*F7' }, 'East'],
    ['2024-01-21', 'Bookshelf', 'Furniture', 'Mike Davis', 2, 149.99, { f: 'E8*F8' }, 'South'],
    ['2024-01-22', 'Tablet', 'Electronics', 'Lisa Chen', 3, 399.99, { f: 'E9*F9' }, 'West'],
    ['2024-01-23', 'Printer', 'Electronics', 'John Smith', 1, 249.99, { f: 'E10*F10' }, 'North'],
    ['2024-01-24', 'Desk Lamp', 'Furniture', 'Sarah Johnson', 6, 39.99, { f: 'E11*F11' }, 'East'],
  ];
  
  const salesSheet = XLSX.utils.aoa_to_sheet(salesData);
  XLSX.utils.book_append_sheet(workbook, salesSheet, 'Sales Data');
  
  // Summary Sheet
  const summaryData = [
    ['Summary', '', '', '', '', '', '', ''],
    ['Total Sales', { f: 'SUM(\'Sales Data\'!G2:G11)' }, '', '', '', '', '', ''],
    ['Average Sale', { f: 'AVERAGE(\'Sales Data\'!G2:G11)' }, '', '', '', '', '', ''],
    ['Top Product', { f: 'INDEX(\'Sales Data\'!B2:B11,MATCH(MAX(\'Sales Data\'!G2:G11),\'Sales Data\'!G2:G11,0))' }, '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['Sales by Category', '', '', '', '', '', '', ''],
    ['Electronics', { f: 'SUMIF(\'Sales Data\'!C2:C11,"Electronics",\'Sales Data\'!G2:G11)' }, '', '', '', '', '', ''],
    ['Furniture', { f: 'SUMIF(\'Sales Data\'!C2:C11,"Furniture",\'Sales Data\'!G2:G11)' }, '', '', '', '', '', ''],
  ];
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  return workbook;
}

function createInventoryExcel(): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  
  const inventoryData = [
    ['Product ID', 'Product Name', 'Category', 'Current Stock', 'Reorder Level', 'Unit Cost', 'Status'],
    ['P001', 'Laptop Pro 15"', 'Electronics', 25, 10, 899.99, { f: 'IF(D2<=E2,"Reorder","OK")' }],
    ['P002', 'Wireless Mouse', 'Electronics', 150, 50, 19.99, { f: 'IF(D3<=E3,"Reorder","OK")' }],
    ['P003', 'Office Chair', 'Furniture', 8, 15, 149.99, { f: 'IF(D4<=E4,"Reorder","OK")' }],
    ['P004', 'Standing Desk', 'Furniture', 12, 5, 399.99, { f: 'IF(D5<=E5,"Reorder","OK")' }],
    ['P005', '24" Monitor', 'Electronics', 35, 20, 149.99, { f: 'IF(D6<=E6,"Reorder","OK")' }],
    ['P006', 'Mechanical Keyboard', 'Electronics', 45, 25, 89.99, { f: 'IF(D7<=E7,"Reorder","OK")' }],
    ['P007', 'Bookshelf 5-Tier', 'Furniture', 6, 10, 99.99, { f: 'IF(D8<=E8,"Reorder","OK")' }],
    ['P008', 'Tablet 10"', 'Electronics', 20, 15, 299.99, { f: 'IF(D9<=E9,"Reorder","OK")' }],
  ];
  
  const inventorySheet = XLSX.utils.aoa_to_sheet(inventoryData);
  XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Inventory');
  
  const analysisData = [
    ['Inventory Analysis', '', '', '', '', '', ''],
    ['Total Items', { f: 'COUNTA(Inventory!A2:A9)' }, '', '', '', '', ''],
    ['Items to Reorder', { f: 'COUNTIF(Inventory!G2:G9,"Reorder")' }, '', '', '', '', ''],
    ['Total Value', { f: 'SUMPRODUCT(Inventory!D2:D9,Inventory!F2:F9)' }, '', '', '', '', ''],
    ['', '', '', '', '', '', ''],
    ['Low Stock Items', '', '', '', '', '', ''],
    // Note: FILTER function may not work in older Excel versions
    ['Chair Products', { f: 'COUNTIFS(Inventory!B2:B9,"*Chair*")' }, '', '', '', '', ''],
  ];
  
  const analysisSheet = XLSX.utils.aoa_to_sheet(analysisData);
  XLSX.utils.book_append_sheet(workbook, analysisSheet, 'Analysis');
  
  return workbook;
}

function createFinancialExcel(): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();
  
  const financialData = [
    ['Month', 'Revenue', 'Expenses', 'Net Income', 'Growth %'],
    ['Jan 2024', 125000, 85000, { f: 'B2-C2' }, ''],
    ['Feb 2024', 132000, 88000, { f: 'B3-C3' }, { f: 'IF(ROW()=2,"",(D3-D2)/D2*100)' }],
    ['Mar 2024', 145000, 92000, { f: 'B4-C4' }, { f: '(D4-D3)/D3*100' }],
    ['Apr 2024', 138000, 89000, { f: 'B5-C5' }, { f: '(D5-D4)/D4*100' }],
    ['May 2024', 156000, 95000, { f: 'B6-C6' }, { f: '(D6-D5)/D5*100' }],
    ['Jun 2024', 162000, 98000, { f: 'B7-C7' }, { f: '(D7-D6)/D6*100' }],
    ['', '', '', '', ''],
    ['Totals', { f: 'SUM(B2:B7)' }, { f: 'SUM(C2:C7)' }, { f: 'SUM(D2:D7)' }, ''],
    ['Averages', { f: 'AVERAGE(B2:B7)' }, { f: 'AVERAGE(C2:C7)' }, { f: 'AVERAGE(D2:D7)' }, { f: 'AVERAGE(E3:E7)' }],
  ];
  
  const financialSheet = XLSX.utils.aoa_to_sheet(financialData);
  XLSX.utils.book_append_sheet(workbook, financialSheet, 'Financial Data');
  
  const kpiData = [
    ['Key Performance Indicators', '', '', '', ''],
    ['Metric', 'Value', 'Target', 'Status', ''],
    ['Revenue Growth', { f: '((\'Financial Data\'!B7-\'Financial Data\'!B2)/\'Financial Data\'!B2)*100' }, 15, { f: 'IF(B3>C3,"✓","✗")' }, ''],
    ['Profit Margin', { f: '(\'Financial Data\'!D9/\'Financial Data\'!B9)*100' }, 25, { f: 'IF(B4>C4,"✓","✗")' }, ''],
    ['Expense Ratio', { f: '(\'Financial Data\'!C9/\'Financial Data\'!B9)*100' }, 65, { f: 'IF(B5<C5,"✓","✗")' }, ''],
  ];
  
  const kpiSheet = XLSX.utils.aoa_to_sheet(kpiData);
  XLSX.utils.book_append_sheet(workbook, kpiSheet, 'KPIs');
  
  return workbook;
}
