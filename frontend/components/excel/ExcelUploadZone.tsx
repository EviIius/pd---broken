import React from 'react';
import { Upload, FileSpreadsheet, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';

interface ExcelUploadZoneProps {
  getRootProps: () => any;
  getInputProps: () => any;
  isDragActive: boolean;
  isAnalyzing: boolean;
  uploadStatus?: string;
  error?: string;
}

const ExcelUploadZone: React.FC<ExcelUploadZoneProps> = ({
  getRootProps,
  getInputProps,
  isDragActive,
  isAnalyzing,
  uploadStatus,
  error
}) => {
  return (
    <div className="space-y-4">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {uploadStatus && !error && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {uploadStatus}
          </AlertDescription>
        </Alert>
      )}
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-blue-400 bg-blue-50'
            : error 
            ? 'border-red-300 hover:border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isAnalyzing ? 'pointer-events-none opacity-50' : ''}`}
      >
        <input {...getInputProps()} />
        
        <div className="space-y-4">
          {isAnalyzing ? (
            <>
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">Processing Excel file...</p>
                <p className="text-gray-600">Parsing sheets and analyzing data structure</p>
              </div>
            </>
          ) : (
            <>
              <FileSpreadsheet className={`h-12 w-12 mx-auto ${error ? 'text-red-400' : 'text-gray-400'}`} />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop Excel files here' : 'Upload Excel files'}
                </p>
                <p className="text-gray-600">
                  Drag and drop .xlsx or .xls files, or click to browse
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Maximum file size: 50MB
                </p>
              </div>
              <Button type="button" variant="outline" disabled={isAnalyzing}>
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-500 space-y-2">
        <p className="font-medium">Supported features:</p>
        <ul className="grid grid-cols-2 gap-1 text-xs">
          <li>• Multi-sheet workbooks</li>
          <li>• Formula analysis</li>
          <li>• Data type detection</li>
          <li>• PowerQuery generation</li>
          <li>• Data quality assessment</li>
          <li>• Advanced formula suggestions</li>
        </ul>
      </div>
    </div>
  );
};

export default ExcelUploadZone;
