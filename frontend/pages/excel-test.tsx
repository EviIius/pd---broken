import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';

const ExcelUploadTest: React.FC = () => {
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    addLog(`Files dropped: ${acceptedFiles.length} accepted, ${rejectedFiles.length} rejected`);
    
    if (rejectedFiles.length > 0) {
      setUploadStatus(`Rejected files: ${rejectedFiles.map(f => f.file.name).join(', ')}`);
      return;
    }
    
    for (const file of acceptedFiles) {
      addLog(`Processing file: ${file.name} (${file.type}, ${file.size} bytes)`);
      await testUpload(file);
    }
  }, []);

  const testUpload = async (file: File) => {
    setIsUploading(true);
    setUploadStatus('Uploading...');
    
    try {
      const formData = new FormData();
      formData.append('excel', file);
      
      addLog('Sending request to /api/excel/parse...');
      const response = await fetch('/api/excel/parse', {
        method: 'POST',
        body: formData,
      });
      
      addLog(`Response status: ${response.status} ${response.statusText}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        addLog(`Error response: ${errorText}`);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      addLog(`Success! Parsed workbook with ${result.sheets.length} sheets`);
      setUploadStatus(`✅ Successfully parsed: ${file.name}`);
      
    } catch (error) {
      addLog(`Upload failed: ${error.message}`);
      setUploadStatus(`❌ Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024,
  });

  const testWithSampleFile = async () => {
    try {
      addLog('Downloading sample file...');
      const response = await fetch('/api/excel/download?type=sales');
      if (!response.ok) throw new Error('Failed to download sample file');
      
      const blob = await response.blob();
      const file = new File([blob], 'Sales_Sample.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      addLog(`Sample file created: ${file.size} bytes`);
      await testUpload(file);
    } catch (error) {
      addLog(`Sample test failed: ${error.message}`);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Excel Upload Test</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="h-5 w-5" />
              <span>File Upload Test</span>
            </CardTitle>
            <CardDescription>
              Test Excel file upload functionality with detailed logging
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
            >
              <input {...getInputProps()} />
              <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'Drop Excel file here' : 'Upload Excel file for testing'}
              </p>
              <p className="text-gray-600">
                Drag and drop .xlsx or .xls files, or click to browse
              </p>
            </div>
            
            <div className="mt-4 flex gap-2">
              <Button onClick={testWithSampleFile} disabled={isUploading}>
                Test with Sample File
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setLogs([]);
                  setUploadStatus('');
                }}
              >
                Clear Logs
              </Button>
            </div>
          </CardContent>
        </Card>

        {uploadStatus && (
          <Alert className={uploadStatus.includes('❌') ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadStatus}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Debug Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-80 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500">No logs yet. Try uploading a file.</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc ml-6 space-y-2 text-sm">
              <li>Make sure the development server is running</li>
              <li>Check that formidable and react-dropzone are installed</li>
              <li>Verify the API endpoint at /api/excel/parse is accessible</li>
              <li>Try with different Excel file formats (.xlsx vs .xls)</li>
              <li>Check browser console for additional error details</li>
              <li>Ensure file size is under 50MB limit</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExcelUploadTest;
