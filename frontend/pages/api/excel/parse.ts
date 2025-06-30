import { NextApiRequest, NextApiResponse } from 'next';
import * as XLSX from 'xlsx';
import { IncomingForm, File as FormidableFile } from 'formidable';
import fs from 'fs';
import { ExcelWorkbook, ExcelWorksheet, ExcelCell, ColumnDataType, FormulaCell } from '../../../types/excel';

// Disable default body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

function parseExcelFile(buffer: Buffer, filename: string): ExcelWorkbook {
  console.log('Parsing Excel file:', filename, 'Buffer size:', buffer.length);
  
  try {
    const workbook = XLSX.read(buffer, { 
      type: 'buffer', 
      cellFormula: true, 
      cellStyles: true,
      cellDates: true,
      cellNF: false
    });
    
    console.log('Workbook sheets found:', workbook.SheetNames);
    
    const sheets: ExcelWorksheet[] = workbook.SheetNames.map((sheetName, index) => {
      console.log('Processing sheet:', sheetName);
      const worksheet = workbook.Sheets[sheetName];
      
      if (!worksheet) {
        console.warn('Worksheet is empty:', sheetName);
        return null;
      }
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1, 
        raw: false, 
        defval: null,
        blankrows: false
      });
      
      // Get the range of the worksheet
      const range = worksheet['!ref'] ? XLSX.utils.decode_range(worksheet['!ref']) : { s: { r: 0, c: 0 }, e: { r: 0, c: 0 } };
      const rowCount = Math.max(jsonData.length, range.e.r + 1);
      const columnCount = Math.max(range.e.c + 1, Math.max(...jsonData.map((row: any[]) => row.length)));
      
      console.log(`Sheet ${sheetName}: ${rowCount} rows, ${columnCount} columns`);      
      // Extract headers (first row) - handle empty rows
      const headers = jsonData.length > 0 ? (jsonData[0] as string[] || []) : [];
      
      // Convert to our ExcelCell format with better error handling
      const data: ExcelCell[][] = [];
      for (let row = 0; row < rowCount; row++) {
        const rowData: ExcelCell[] = [];
        for (let col = 0; col < columnCount; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress];
          
          let cellValue = null;
          let cellType: ExcelCell['type'] = 'empty';
          let formula: string | undefined;
          
          if (cell) {
            try {
              if (cell.f) {
                formula = cell.f;
                cellType = 'formula';
                cellValue = cell.v !== undefined ? cell.v : cell.w || '';
              } else if (cell.v !== undefined) {
                cellValue = cell.v;
                if (typeof cell.v === 'string') cellType = 'string';
                else if (typeof cell.v === 'number') cellType = 'number';
                else if (typeof cell.v === 'boolean') cellType = 'boolean';
                else if (cell.v instanceof Date || cell.t === 'd') cellType = 'date';
                else cellType = 'string'; // fallback
              }
            } catch (cellError) {
              console.warn(`Error processing cell ${cellAddress}:`, cellError);
              cellValue = cell.w || cell.v || '';
              cellType = 'string';
            }
          }
          
          rowData.push({
            value: cellValue,
            type: cellType,
            address: cellAddress,
            formula,
          });
        }
        data.push(rowData);
      }
      
      // Analyze data types for each column with better detection
      const dataTypes: ColumnDataType[] = headers.map((header, colIndex) => {
        const columnData = data.slice(1).map(row => row[colIndex]?.value).filter(v => v !== null && v !== undefined && v !== '');
        const uniqueValues = Array.from(new Set(columnData));
        
        // Determine data type with improved logic
        let dataType: ColumnDataType['dataType'] = 'text';
        if (columnData.length > 0) {
          const numberCount = columnData.filter(v => typeof v === 'number' || (!isNaN(Number(v)) && v !== '')).length;
          const dateCount = columnData.filter(v => {
            if (v instanceof Date) return true;
            if (typeof v === 'string') {
              const dateTest = new Date(v);
              return !isNaN(dateTest.getTime()) && v.match(/\d{1,4}[-\/]\d{1,2}[-\/]\d{1,4}/);
            }
            return false;
          }).length;
          
          if (numberCount / columnData.length > 0.7) dataType = 'number';
          else if (dateCount / columnData.length > 0.7) dataType = 'date';
        }
        
        return {        columnIndex: colIndex,
        columnLetter: XLSX.utils.encode_col(colIndex),
        header: header || `Column ${colIndex + 1}`,
        dataType,
        sampleValues: uniqueValues.slice(0, 5),
        uniqueCount: uniqueValues.length,
        nullCount: data.slice(1).length - columnData.length,
      };
    });
    
    // Extract formula cells with better error handling
    const formulaCells: FormulaCell[] = [];
    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell.formula) {
          try {
            formulaCells.push({
              address: cell.address,
              formula: cell.formula,
              dependencies: extractFormulaDependencies(cell.formula),
              result: cell.value,
            });
          } catch (formulaError) {
            console.warn(`Error processing formula in cell ${cell.address}:`, formulaError);
          }
        }
      });
    });
    
    console.log(`Sheet ${sheetName} processed: ${formulaCells.length} formulas found`);
    
    return {
      id: `sheet_${index}`,
      name: sheetName,
      data,
      headers,
      rowCount,
      columnCount,
      dataTypes,
      hasFormulas: formulaCells.length > 0,
      formulaCells,
    };
  }).filter(sheet => sheet !== null); // Remove any null sheets  
  const finalWorkbook = {
    id: `workbook_${Date.now()}`,
    name: filename,
    sheets,
    uploadDate: new Date(),
    fileSize: buffer.length,
    lastModified: new Date(),
  };
  
  console.log('Final workbook created:', {
    name: finalWorkbook.name,
    sheetsCount: finalWorkbook.sheets.length,
    totalFormulas: finalWorkbook.sheets.reduce((sum, s) => sum + s.formulaCells.length, 0)
  });
  
  return finalWorkbook;
} catch (error) {
  console.error('Error parsing Excel file:', error);
  throw new Error(`Failed to parse Excel file: ${error.message}`);
}
}

function extractFormulaDependencies(formula: string): string[] {
  // Simple regex to extract cell references like A1, B2, $A$1, etc.
  const cellRefRegex = /\$?[A-Z]+\$?\d+/g;
  const matches = formula.match(cellRefRegex) || [];
  return Array.from(new Set(matches));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB
      multiples: true,
    });
    
    const { files } = await new Promise<{ files: any }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          console.error('Form parse error:', err);
          reject(err);
        } else {
          resolve({ files });
        }
      });
    });
    
    console.log('Received files:', Object.keys(files));
    
    // Handle both single file and array of files
    let excelFile = files.excel;
    if (Array.isArray(excelFile)) {
      excelFile = excelFile[0];
    }
    
    if (!excelFile) {
      console.log('No excel file found in:', files);
      return res.status(400).json({ error: 'No Excel file uploaded' });
    }
    
    console.log('Processing file:', excelFile.originalFilename, 'Size:', excelFile.size);
    
    // Read the file buffer
    const buffer = fs.readFileSync(excelFile.filepath);
    
    // Parse the Excel file
    const workbook = parseExcelFile(buffer, excelFile.originalFilename || 'unknown.xlsx');
    
    res.status(200).json(workbook);
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    res.status(500).json({ error: 'Failed to parse Excel file', details: error.message });
  }
}
