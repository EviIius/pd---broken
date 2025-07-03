import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, Zap, Brain, Download, Settings, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import Layout from '../components/Layout';
import ExcelUploadZone from '../components/excel/ExcelUploadZone';
import ExcelAnalysisPanel from '../components/excel/ExcelAnalysisPanel';
import PowerQueryBuilder from '../components/excel/PowerQueryBuilder';
import FormulaGenerator from '../components/excel/FormulaGenerator';
import ExcelPreview from '../components/excel/ExcelPreview';
import type { ExcelWorkbook, ExcelAnalysis, ExcelPageState, Recommendation } from '../types/excel';

const ExcelAnalysisPage: React.FC = () => {
  const [state, setState] = useState<ExcelPageState>({
    uploadedFiles: [],
    activeWorkbook: null,
    activeSheet: null,
    selectedCells: [],
    analysis: null,
    isAnalyzing: false,
    powerQueryBuilder: {
      steps: [],
      previewData: [],
      isGenerating: false,
    },
    formulaBuilder: {
      selectedFormula: null,
      parameters: {},
      generatedFormula: '',
      isGenerating: false,
    },
  });
  
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('analysis');const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    console.log('Files dropped:', { acceptedFiles, rejectedFiles });
    setUploadError('');
    setUploadStatus('');
    
    if (rejectedFiles.length > 0) {
      console.warn('Rejected files:', rejectedFiles);
      const rejectedNames = rejectedFiles.map(f => f.file.name).join(', ');
      setUploadError(`Some files were rejected: ${rejectedNames}. Please upload .xlsx or .xls files only.`);
      return;
    }
    
    for (const file of acceptedFiles) {
      console.log('Processing file:', file.name, file.type, file.size);
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel' ||
          file.name.endsWith('.xlsx') ||
          file.name.endsWith('.xls')) {
        setUploadStatus(`Uploading ${file.name}...`);
        await handleExcelUpload(file);
      } else {
        console.warn('Unsupported file type:', file.type, 'for file:', file.name);
        setUploadError(`Unsupported file type: ${file.name}. Please upload .xlsx or .xls files.`);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB
    onError: (error) => {
      console.error('Dropzone error:', error);
      alert('Error with file upload: ' + error.message);
    },
  });  const handleExcelUpload = async (file: File) => {
    setState(prev => ({ ...prev, isAnalyzing: true }));
    setUploadError('');
    
    try {
      console.log('Starting Excel file upload:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified)
      });
      
      // Validate file before uploading
      if (file.size === 0) {
        throw new Error('File is empty');
      }
      
      if (file.size > 50 * 1024 * 1024) {
        throw new Error('File is too large (max 50MB)');
      }
      
      // Validate file extension
      const validExtensions = ['.xlsx', '.xls'];
      const hasValidExtension = validExtensions.some(ext => 
        file.name.toLowerCase().endsWith(ext)
      );
      
      if (!hasValidExtension) {
        throw new Error('Please upload a valid Excel file (.xlsx or .xls)');
      }
      
      setUploadStatus(`Parsing ${file.name}...`);
      
      // Call API to parse Excel file
      const formData = new FormData();
      formData.append('excel', file);
      
      console.log('Sending request to /api/excel/parse...');
      const response = await fetch('/api/excel/parse', {
        method: 'POST',
        body: formData,
      });
      
      console.log('Parse response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown server error' }));
        console.error('Parse error response:', errorData);
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const workbook: ExcelWorkbook = await response.json();
      console.log('Workbook parsed successfully:', {
        name: workbook.name,
        sheets: workbook.sheets.length,
        totalFormulas: workbook.sheets.reduce((sum, s) => sum + (s.formulaCells?.length || 0), 0)
      });
      
      // Validate parsed workbook
      if (!workbook.sheets || workbook.sheets.length === 0) {
        throw new Error('No valid sheets found in the Excel file');
      }
      
      setUploadStatus(`Successfully uploaded ${file.name}`);
      
      setState(prev => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, workbook],
        activeWorkbook: workbook,
        activeSheet: workbook.sheets[0] || null,
        isAnalyzing: false,
      }));
      
      // Automatically analyze the workbook
      console.log('Starting workbook analysis...');
      setUploadStatus(`Analyzing ${file.name}...`);
      await analyzeWorkbook(workbook);
      setUploadStatus(`Analysis complete for ${file.name}`);
      
    } catch (error) {
      console.error('Error uploading Excel file:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setUploadError(`Error uploading file: ${errorMessage}`);
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };const analyzeWorkbook = async (workbook: ExcelWorkbook) => {
    setState(prev => ({ ...prev, isAnalyzing: true }));
    
    try {
      console.log('Starting analysis for workbook:', workbook.name);
      
      const response = await fetch('/api/excel/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          workbookId: workbook.id,
          workbook: workbook // Pass the actual workbook data for analysis
        }),
      });
      
      console.log('Analysis response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Analysis service unavailable' }));
        console.error('Analysis error:', errorData);
        throw new Error(errorData.error || 'Failed to analyze workbook');
      }
      
      const analysis: ExcelAnalysis = await response.json();
      console.log('Analysis completed successfully:', {
        sheets: analysis.summary?.totalSheets,
        complexity: analysis.summary?.complexityScore,
        recommendations: analysis.recommendations?.length
      });
      
      setState(prev => ({
        ...prev,
        analysis,
        isAnalyzing: false,
      }));
      
    } catch (error) {
      console.error('Error analyzing workbook:', error);
      // Don't show alert for analysis errors, just log them
      // The UI will show that no analysis is available
      setState(prev => ({ 
        ...prev, 
        isAnalyzing: false,
        analysis: null 
      }));
    }
  };

  const handleSheetSelect = (sheet: any) => {
    setState(prev => ({
      ...prev,
      activeSheet: sheet,
      selectedCells: [],
    }));
  };

  const handleCellSelect = (cellAddress: string) => {
    setState(prev => ({
      ...prev,
      selectedCells: prev.selectedCells.includes(cellAddress)
        ? prev.selectedCells.filter(addr => addr !== cellAddress)
        : [...prev.selectedCells, cellAddress],
    }));
  };

  const loadSampleData = async (dataType: 'sales' | 'inventory' | 'financial') => {
    setState(prev => ({ ...prev, isAnalyzing: true }));
    
    try {
      const response = await fetch('/api/excel/dummy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataType }),
      });
      
      if (!response.ok) throw new Error('Failed to load sample data');
      
      const workbook: ExcelWorkbook = await response.json();
      
      setState(prev => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, workbook],
        activeWorkbook: workbook,
        activeSheet: workbook.sheets[0] || null,
        isAnalyzing: false,
      }));
      
      // Automatically analyze the workbook
      await analyzeWorkbook(workbook);
      
    } catch (error) {
      console.error('Error loading sample data:', error);
      setState(prev => ({ ...prev, isAnalyzing: false }));
    }
  };

  const handleApplyRecommendation = async (recommendation: Recommendation) => {
    console.log('Applying recommendation:', recommendation);
    
    try {
      if (recommendation.type === 'powerquery') {
        // Generate PowerQuery steps based on recommendation
        const powerQuerySteps = generatePowerQueryStepsFromRecommendation(recommendation);
        
        setState(prev => ({
          ...prev,
          powerQueryBuilder: {
            ...prev.powerQueryBuilder,
            steps: powerQuerySteps,
            completeMCode: '',
            success: `Applied recommendation: ${recommendation.title}`
          }
        }));
        
        // Switch to PowerQuery tab
        setActiveTab('powerquery');
        
      } else if (recommendation.type === 'formula') {
        // Generate formula parameters based on recommendation
        const formulaConfig = generateFormulaConfigFromRecommendation(recommendation);
        
        setState(prev => ({
          ...prev,
          formulaBuilder: {
            ...prev.formulaBuilder,
            selectedFormula: formulaConfig.formula,
            parameters: formulaConfig.parameters,
            generatedFormula: formulaConfig.exampleFormula
          }
        }));
        
        // Switch to Formulas tab
        setActiveTab('formulas');
      }
      
    } catch (error) {
      console.error('Error applying recommendation:', error);
      setState(prev => ({
        ...prev,
        powerQueryBuilder: {
          ...prev.powerQueryBuilder,
          error: 'Failed to apply recommendation'
        }
      }));
    }
  };

  const generatePowerQueryStepsFromRecommendation = (recommendation: Recommendation) => {
    const baseSteps = [];
    
    if (recommendation.title.includes('Automate Data Processing')) {
      baseSteps.push({
        id: 'step-data-cleaning',
        name: 'Data Cleaning Step',
        operation: 'dataTypes' as any,
        mCode: '',
        description: 'Clean and standardize data types',
        isApplied: false
      });
      
      baseSteps.push({
        id: 'step-remove-empty',
        name: 'Remove Empty Rows',
        operation: 'filter' as any,
        mCode: '',
        description: 'Remove empty rows from the dataset',
        isApplied: false
      });
    }
    
    if (recommendation.title.includes('Consolidate Sheet References')) {
      baseSteps.push({
        id: 'step-merge-sheets',
        name: 'Merge Multiple Sheets',
        operation: 'merge' as any,
        mCode: '',
        description: 'Consolidate data from multiple sheets',
        isApplied: false
      });
    }
    
    if (recommendation.title.includes('Data Validation')) {
      baseSteps.push({
        id: 'step-data-validation',
        name: 'Add Data Validation',
        operation: 'add_column' as any,
        mCode: '',
        description: 'Add validation checks for data quality',
        isApplied: false
      });
    }
    
    return baseSteps;
  };
  const generateFormulaConfigFromRecommendation = (recommendation: Recommendation) => {
    if (recommendation.title.includes('Consolidate Sheet References')) {
      return {
        formula: {
          id: 'indirect-ref',
          name: 'INDIRECT Reference',
          description: 'Create dynamic sheet references',
          category: 'lookup' as const,
          formula: 'INDIRECT(sheet_name & "!" & cell_reference)',
          parameters: [
            {
              name: 'sheet_name',
              type: 'text' as const,
              description: 'Name of the sheet to reference',
              required: true,
              example: '"Sheet1"'
            },
            {
              name: 'cell_reference',
              type: 'cell' as const,
              description: 'Cell reference to point to',
              required: true,
              example: 'A1'
            }
          ],
          example: '=INDIRECT("Sheet1!A1")',
          complexity: 'intermediate' as const
        },
        parameters: {
          sheet_name: 'Sheet1',
          cell_reference: 'A1'
        },
        exampleFormula: '=INDIRECT("Sheet1!A1")'
      };
    }
    
    return {
      formula: {
        id: 'sumif',
        name: 'SUMIF',
        description: 'Sum based on criteria',
        category: 'math' as const,
        formula: 'SUMIF(range, criteria, sum_range)',
        parameters: [
          {
            name: 'range',
            type: 'range' as const,
            description: 'Range to evaluate criteria against',
            required: true,
            example: 'A:A'
          },
          {
            name: 'criteria',
            type: 'text' as const,
            description: 'Criteria for matching',
            required: true,
            example: '"Electronics"'
          },
          {
            name: 'sum_range',
            type: 'range' as const,
            description: 'Range to sum values from',
            required: true,
            example: 'B:B'
          }
        ],
        example: '=SUMIF(A:A,"Electronics",B:B)',
        complexity: 'basic' as const
      },
      parameters: {
        range: 'A:A',
        criteria: 'Electronics',
        sum_range: 'B:B'
      },
      exampleFormula: '=SUMIF(A:A,"Electronics",B:B)'
    };
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="h-8 w-8 text-green-600" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Excel Analysis & Automation</h1>
                    <p className="text-gray-600">Upload Excel files to generate PowerQueries and advanced formulas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {!state.activeWorkbook ? (
            /* Upload Zone */
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="h-5 w-5 text-green-600" />
                    <span>Upload Excel Files</span>
                  </CardTitle>
                  <CardDescription>
                    Upload .xlsx or .xls files to analyze data structure, generate PowerQueries, and create advanced formulas
                  </CardDescription>
                </CardHeader>                <CardContent>
                  <ExcelUploadZone
                    getRootProps={getRootProps}
                    getInputProps={getInputProps}
                    isDragActive={isDragActive}
                    isAnalyzing={state.isAnalyzing}
                    uploadStatus={uploadStatus}
                    error={uploadError}
                  />
                </CardContent>
              </Card>

              {/* Sample Data Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-green-600" />
                    <span>Try Sample Data</span>
                  </CardTitle>                  <CardDescription>
                    Load pre-built Excel workbooks to explore features and test functionality
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-start space-y-2"
                        onClick={() => loadSampleData('sales')}
                        disabled={state.isAnalyzing}
                      >
                        <div className="font-semibold">Sales Report</div>
                        <div className="text-sm text-gray-600 text-left">
                          Q1 2024 sales data with formulas and regional analysis
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-start space-y-2"
                        onClick={() => loadSampleData('inventory')}
                        disabled={state.isAnalyzing}
                      >
                        <div className="font-semibold">Inventory Management</div>
                        <div className="text-sm text-gray-600 text-left">
                          Stock levels, reorder alerts, and status tracking
                        </div>
                      </Button>
                        <Button 
                        variant="outline" 
                        className="h-auto p-4 flex flex-col items-start space-y-2"
                        onClick={() => loadSampleData('financial')}
                        disabled={state.isAnalyzing}
                      >
                        <div className="font-semibold">Financial Dashboard</div>
                        <div className="text-sm text-gray-600 text-left">
                          Monthly P&L, KPIs, and growth calculations
                        </div>
                      </Button>
                    </div>
                    
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 mb-3">
                        Or download sample Excel files to test file upload:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open('/api/excel/download?type=sales', '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Sales.xlsx
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open('/api/excel/download?type=inventory', '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Inventory.xlsx
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => window.open('/api/excel/download?type=financial', '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Financial.xlsx
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Features Overview */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <span>Smart Analysis</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      AI-powered analysis of your Excel data to identify patterns, data quality issues, and automation opportunities.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <Zap className="h-5 w-5 text-yellow-600" />
                      <span>PowerQuery Generation</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Generate M-code PowerQueries for data cleaning, transformation, and advanced data modeling tasks.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-lg">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                      <span>Advanced Formulas</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Create complex Excel formulas including XLOOKUP, dynamic arrays, and custom business logic.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* Main Analysis Interface */
            <div className="space-y-6">
              {/* Analysis Status */}
              {state.isAnalyzing && (
                <Alert>
                  <Brain className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>Analyzing Excel workbook...</span>
                    <Progress value={45} className="w-32" />
                  </AlertDescription>
                </Alert>
              )}

              {/* Workbook Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <BarChart3 className="h-5 w-5" />
                      <span>{state.activeWorkbook.name}</span>
                    </span>
                    <div className="flex space-x-2">
                      <Badge variant="secondary">
                        {state.activeWorkbook.sheets.length} sheets
                      </Badge>
                      {state.analysis && (
                        <Badge variant="outline">
                          Score: {state.analysis.summary.complexityScore}/100
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
              </Card>              {/* Main Content Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  <TabsTrigger value="preview">Data Preview</TabsTrigger>
                  <TabsTrigger value="powerquery">PowerQuery</TabsTrigger>
                  <TabsTrigger value="formulas">Formulas</TabsTrigger>
                </TabsList>                <TabsContent value="analysis" className="space-y-6">
                  <ExcelAnalysisPanel 
                    analysis={state.analysis}
                    isLoading={state.isAnalyzing}
                    onApplyRecommendation={handleApplyRecommendation}
                  />
                </TabsContent>

                <TabsContent value="preview" className="space-y-6">
                  <ExcelPreview
                    workbook={state.activeWorkbook}
                    activeSheet={state.activeSheet}
                    selectedCells={state.selectedCells}
                    onSheetSelect={handleSheetSelect}
                    onCellSelect={handleCellSelect}
                  />
                </TabsContent>

                <TabsContent value="powerquery" className="space-y-6">
                  <PowerQueryBuilder
                    workbook={state.activeWorkbook}
                    activeSheet={state.activeSheet}
                    state={state.powerQueryBuilder}
                    setState={(updates) => setState(prev => ({
                      ...prev,
                      powerQueryBuilder: { ...prev.powerQueryBuilder, ...updates }
                    }))}
                  />
                </TabsContent>

                <TabsContent value="formulas" className="space-y-6">
                  <FormulaGenerator
                    workbook={state.activeWorkbook}
                    activeSheet={state.activeSheet}
                    selectedCells={state.selectedCells}
                    analysis={state.analysis}
                    state={state.formulaBuilder}
                    setState={(updates) => setState(prev => ({
                      ...prev,
                      formulaBuilder: { ...prev.formulaBuilder, ...updates }
                    }))}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ExcelAnalysisPage;
