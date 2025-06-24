import React, { useState, useRef } from 'react';
import { FileSpreadsheet, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";

interface UploadFileProps { // Renamed from UploadExcelProps
  onUpload: (file: File, headers: string[]) => void;
}

export default function UploadFile({ onUpload }: UploadFileProps) { // Renamed from UploadExcel
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const processFile = async (file: File) => { // Renamed from processExcelFile
    try {
      setError('');
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['xlsx', 'xls', 'csv', 'pkl', 'parquet'];

      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        setError('Please upload an Excel (.xlsx, .xls), CSV (.csv), Pickle (.pkl), or Parquet (.parquet) file.');
        return;
      }

      if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (jsonData.length === 0) {
          setError('The Excel file is empty');
          return;
        }
        const rawHeaders = jsonData[0] as any[];
        if (!rawHeaders || rawHeaders.length === 0) {
          setError('No columns found in the Excel file');
          return;
        }
        const headers = rawHeaders
          .map(header => header !== null && header !== undefined ? String(header).trim() : '')
          .filter(header => header !== '');
        if (headers.length === 0) {
          setError('No valid column headers found in the Excel file. Please ensure the first row contains text.');
          return;
        }
        setFileName(file.name);
        onUpload(file, headers);
      } else if (fileExtension === 'csv') {
        // For CSV, we can read the first line for headers
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const firstLine = text.split(/\r?\n/)[0]; // Corrected line splitting
          const headers = firstLine.split(',').map(h => h.trim()).filter(h => h !== '');
          if (headers.length === 0) {
            setError('No valid column headers found in the CSV file. Please ensure the first row contains text.');
            return;
          }
          setFileName(file.name);
          onUpload(file, headers);
        };
        reader.onerror = () => {
          setError('Failed to read the CSV file.');
        };
        reader.readAsText(file);
      } else {
        // For pkl and parquet, header extraction might be complex or not applicable on the client-side.
        // We'll pass the file and let the backend handle it. Headers can be an empty array or a placeholder.
        setFileName(file.name);
        onUpload(file, []); // Or pass a placeholder like ['File Content']
      }
    } catch (err) {
      setError('Failed to process the file. Please try again.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file); // Use processFile
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      processFile(file); // Use processFile
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors duration-200 ${isDragging ? 'border-primary bg-primary/10' : 'border-border bg-background'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-primary/20 p-4 mb-2">
            <FileSpreadsheet className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-2">
            {/* Changed title and description */}
            <h3 className="text-lg font-semibold text-foreground">Upload Data File</h3>
            <p className="text-sm text-muted-foreground">Drag and drop your Excel, CSV, Pickle, or Parquet file here, or click to browse</p>
          </div>
          {/* Updated accept attribute */}
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv,.pkl,.parquet" className="hidden" onChange={handleFileChange} />
          <Button type="button" variant="outline" onClick={handleButtonClick}>
            <Upload className="h-5 w-5 mr-2" /> Browse Files
          </Button>
        </div>
      </div>
      {fileName && (
        <div className="flex items-center justify-between rounded-lg border border-border p-3 mt-2 bg-secondary/50">
          <div className="flex items-center space-x-3">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-foreground">{fileName}</span>
          </div>
          <Button variant="link" size="sm" onClick={() => { setFileName(''); setError(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}>Change</Button>
        </div>
      )}
      {error && <div className="rounded-lg bg-destructive/20 p-3 text-destructive mt-2">{error}</div>}
    </div>
  );
}
