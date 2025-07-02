import React, { useState } from 'react';
import { Sheet, Grid, Eye, Download, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import type { ExcelWorkbook, ExcelWorksheet, ExcelCell } from '../../types/excel';

// Utility function to convert column index to Excel column letters (A, B, C, ..., Z, AA, AB, etc.)
const getExcelColumnName = (colIndex: number): string => {
  let result = '';
  while (colIndex >= 0) {
    result = String.fromCharCode(65 + (colIndex % 26)) + result;
    colIndex = Math.floor(colIndex / 26) - 1;
  }
  return result;
};

interface ExcelPreviewProps {
  workbook: ExcelWorkbook;
  activeSheet: ExcelWorksheet | null;
  selectedCells: string[];
  onSheetSelect: (sheet: ExcelWorksheet) => void;
  onCellSelect: (cellAddress: string) => void;
}

const ExcelPreview: React.FC<ExcelPreviewProps> = ({
  workbook,
  activeSheet,
  selectedCells,
  onSheetSelect,
  onCellSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [maxRows, setMaxRows] = useState<number>(50);
  const [maxCols, setMaxCols] = useState<number>(20);
  
  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{row: number, col: number} | null>(null);
  const [dragEnd, setDragEnd] = useState<{row: number, col: number} | null>(null);
  const [dragSelection, setDragSelection] = useState<string[]>([]);

  // Helper function to check if a cell is in the drag range
  const isInDragRange = (rowIndex: number, colIndex: number, start: {row: number, col: number}, end: {row: number, col: number}) => {
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);
    
    return rowIndex >= minRow && rowIndex <= maxRow && colIndex >= minCol && colIndex <= maxCol;
  };

  // Handle mouse down on cell (start drag)
  const handleMouseDown = (rowIndex: number, colIndex: number, e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ row: rowIndex, col: colIndex });
    setDragEnd({ row: rowIndex, col: colIndex });
    
    // Clear previous drag selection
    setDragSelection([]);
  };

  // Handle mouse enter on cell (during drag)
  const handleMouseEnter = (rowIndex: number, colIndex: number) => {
    if (isDragging && dragStart) {
      setDragEnd({ row: rowIndex, col: colIndex });
    }
  };

  // Handle mouse up (end drag)
  const handleMouseUp = React.useCallback(() => {
    if (isDragging && dragStart && dragEnd) {
      // Calculate all cells in the drag range
      const newSelection: string[] = [];
      const minRow = Math.min(dragStart.row, dragEnd.row);
      const maxRow = Math.max(dragStart.row, dragEnd.row);
      const minCol = Math.min(dragStart.col, dragEnd.col);
      const maxCol = Math.max(dragStart.col, dragEnd.col);
      
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          const address = getCellAddress(row, col);
          newSelection.push(address);
        }
      }
      
      // Update drag selection
      setDragSelection(newSelection);
      
      // Notify parent component about selection
      if (newSelection.length === 1) {
        onCellSelect(newSelection[0]);
      }
    }
    
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }, [isDragging, dragStart, dragEnd, onCellSelect]);

  // Add global mouse up listener to handle mouse up outside the table
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleMouseUp();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Clear selections on Escape key
      if (e.key === 'Escape') {
        setDragSelection([]);
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDragging, handleMouseUp]);

  // Clear drag selection when switching sheets
  React.useEffect(() => {
    setDragSelection([]);
    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  }, [activeSheet?.id]);

  const getCellStyle = (cell: ExcelCell, address: string, rowIndex: number, colIndex: number) => {
    const isSelected = selectedCells.includes(address) || dragSelection.includes(address);
    const isFormula = cell.type === 'formula';
    const isDraggedOver = isDragging && dragStart && dragEnd && 
      isInDragRange(rowIndex, colIndex, dragStart, dragEnd);
    
    let className = 'border border-gray-200 p-2 text-sm min-w-[100px] max-w-[200px] truncate cursor-pointer select-none ';
    
    if (isSelected || isDraggedOver) {
      className += 'bg-blue-100 border-blue-400 ';
    } else if (isFormula) {
      className += 'bg-green-50 border-green-200 ';
    } else {
      className += 'hover:bg-gray-50 ';
    }
    
    // Apply cell styling if available
    if (cell.style) {
      if (cell.style.backgroundColor) {
        className += `bg-${cell.style.backgroundColor} `;
      }
      if (cell.style.fontWeight === 'bold') {
        className += 'font-bold ';
      }
    }
    
    return className;
  };

  const getCellAddress = (row: number, col: number) => {
    const colLetter = String.fromCharCode(65 + col);
    return `${colLetter}${row + 1}`;
  };

  const getDataTypeIcon = (type: string) => {
    switch (type) {
      case 'number': return '🔢';
      case 'date': return '📅';
      case 'formula': return '⚡';
      case 'boolean': return '✓';
      default: return '📝';
    }
  };

  const formatCellValue = (cell: ExcelCell) => {
    if (cell.type === 'formula' && cell.formula) {
      return cell.formula;
    }
    
    if (cell.value === null || cell.value === undefined) {
      return '';
    }
    
    if (cell.type === 'date') {
      return new Date(cell.value).toLocaleDateString();
    }
    
    if (cell.type === 'number' && typeof cell.value === 'number') {
      return cell.value.toLocaleString();
    }
    
    return String(cell.value);
  };

  const filteredData = activeSheet?.data.filter((row, rowIndex) => {
    if (rowIndex >= maxRows) return false;
    
    if (!searchTerm) return true;
    
    return row.some(cell => 
      String(cell.value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  }) || [];

  return (
    <div className="space-y-6">
      {/* Sheet Selector and Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Sheet className="h-5 w-5 text-gray-600" />
            <span className="font-medium">Sheet:</span>
            <Select
              value={activeSheet?.id || ''}
              onValueChange={(sheetId) => {
                const sheet = workbook.sheets.find(s => s.id === sheetId);
                if (sheet) onSheetSelect(sheet);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select sheet" />
              </SelectTrigger>
              <SelectContent>
                {workbook.sheets.map((sheet) => (
                  <SelectItem key={sheet.id} value={sheet.id}>
                    <div className="flex items-center space-x-2">
                      <span>{sheet.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {sheet.rowCount}x{sheet.columnCount}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search in data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Select value={maxRows.toString()} onValueChange={(value) => setMaxRows(Number(value))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25 rows</SelectItem>
              <SelectItem value="50">50 rows</SelectItem>
              <SelectItem value="100">100 rows</SelectItem>
              <SelectItem value="500">500 rows</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export View
          </Button>
        </div>
      </div>

      {activeSheet ? (
        <Tabs defaultValue="data" className="space-y-4">
          <TabsList>
            <TabsTrigger value="data">Data View</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="formulas">Formulas</TabsTrigger>
          </TabsList>

          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Grid className="h-5 w-5" />
                    <span>{activeSheet.name}</span>
                  </span>
                  <div className="flex space-x-2">
                    <Badge variant="outline">
                      {filteredData.length} rows shown
                    </Badge>
                    {selectedCells.length > 0 && (
                      <Badge variant="secondary">
                        {selectedCells.length} selected
                      </Badge>
                    )}
                    {dragSelection.length > 0 && (
                      <Badge variant="default">
                        {dragSelection.length} drag selected
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div 
                  className={`overflow-auto max-h-[600px] border rounded-lg ${isDragging ? 'select-none' : ''}`}
                  onMouseLeave={() => {
                    // If dragging and mouse leaves table area, continue tracking
                    if (isDragging) {
                      // Don't reset drag state, let global mouse up handle it
                    }
                  }}
                >
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="border border-gray-200 p-2 text-xs font-medium text-gray-600 min-w-[50px]">
                          #
                        </th>
                        {Array.from({ length: Math.min(maxCols, activeSheet.headers.length) }, (_, colIndex) => (
                          <th
                            key={colIndex}
                            className="border border-gray-200 p-2 text-xs font-medium text-gray-600 min-w-[100px]"
                          >
                            <div className="flex items-center space-x-1">
                              <span>{getDataTypeIcon(activeSheet.dataTypes[colIndex]?.dataType || 'text')}</span>
                              <span className="truncate font-bold">{getExcelColumnName(colIndex)}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          <td className="border border-gray-200 p-2 text-xs text-gray-500 bg-gray-50">
                            {rowIndex + 1}
                          </td>
                          {row.slice(0, maxCols).map((cell, colIndex) => {
                            const address = getCellAddress(rowIndex, colIndex);
                            return (
                              <td
                                key={colIndex}
                                className={getCellStyle(cell, address, rowIndex, colIndex)}
                                onMouseDown={(e) => handleMouseDown(rowIndex, colIndex, e)}
                                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                                onMouseUp={handleMouseUp}
                                onClick={() => onCellSelect(address)}
                                title={`${address}: ${formatCellValue(cell)}`}
                              >
                                {formatCellValue(cell)}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredData.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Grid className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No data matches your search criteria</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sheet Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Rows:</span>
                    <span className="font-medium">{activeSheet.rowCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Columns:</span>
                    <span className="font-medium">{activeSheet.columnCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Has Formulas:</span>
                    <Badge variant={activeSheet.hasFormulas ? "default" : "secondary"}>
                      {activeSheet.hasFormulas ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Formula Count:</span>
                    <span className="font-medium">{activeSheet.formulaCells?.length || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Column Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {activeSheet.dataTypes.map((col, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="flex items-center space-x-2">
                          <span>{getDataTypeIcon(col.dataType)}</span>
                          <span className="truncate font-bold">{getExcelColumnName(index)}</span>
                          <span className="text-gray-500 text-xs truncate">({col.header})</span>
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {col.dataType}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Data Quality</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activeSheet.dataTypes.map((col) => (
                      <div key={col.columnIndex} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="truncate">
                            <span className="font-bold">{getExcelColumnName(col.columnIndex)}</span>
                            <span className="text-gray-500 ml-1">({col.header})</span>
                          </span>
                          <span className="text-gray-600">
                            {col.uniqueCount} unique
                          </span>
                        </div>
                        {col.nullCount > 0 && (
                          <div className="text-xs text-red-600">
                            {col.nullCount} empty cells
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="formulas">
            <Card>
              <CardHeader>
                <CardTitle>Formula Analysis</CardTitle>
                <CardDescription>
                  All formulas found in {activeSheet.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeSheet.formulaCells && activeSheet.formulaCells.length > 0 ? (
                  <div className="space-y-3">
                    {activeSheet.formulaCells.map((formula, index) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{formula.address}</span>
                          <Badge variant="outline">Formula</Badge>
                        </div>
                        <code className="text-sm bg-gray-100 p-2 rounded block">
                          {formula.formula}
                        </code>
                        <div className="text-sm text-gray-600">
                          Result: {formula.result}
                        </div>
                        {formula.dependencies.length > 0 && (
                          <div className="text-xs text-gray-500">
                            Dependencies: {formula.dependencies.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No formulas found in this sheet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-gray-500">
            <Sheet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Select a sheet to preview its data</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExcelPreview;
