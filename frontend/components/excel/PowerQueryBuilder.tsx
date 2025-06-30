import React, { useState } from 'react';
import { Code, Play, Plus, Trash2, Copy, Download, Zap, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import type { ExcelWorkbook, ExcelWorksheet, PowerQueryStep, PowerQueryTemplate } from '../../types/excel';

interface PowerQueryBuilderProps {
  workbook: ExcelWorkbook;
  activeSheet: ExcelWorksheet | null;
  state: {
    steps: PowerQueryStep[];
    previewData: any[][];
    isGenerating: boolean;
    completeMCode?: string;
    error?: string;
    success?: string;
  };
  setState: (updates: any) => void;
}

const PowerQueryBuilder: React.FC<PowerQueryBuilderProps> = ({
  workbook,
  activeSheet,
  state,
  setState
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customStep, setCustomStep] = useState({ operation: '', mCode: '', description: '' });
  const [showStepParams, setShowStepParams] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<string>('');

  // Clear messages after a delay
  React.useEffect(() => {
    if (state.success || state.error) {
      const timer = setTimeout(() => {
        setState({ success: undefined, error: undefined });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.success, state.error, setState]);

  // Sample PowerQuery templates
  const templates: PowerQueryTemplate[] = [
    {
      id: 'clean-data',
      name: 'Data Cleaning',
      description: 'Remove empty rows, trim spaces, and standardize text',
      category: 'data_cleaning',
      steps: [],
      requiredColumns: [],
      outputColumns: [],
      mCode: `let
    Source = Excel.CurrentWorkbook(){[Name="Data"]}[Content],
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Trimmed Text" = Table.TransformColumns(#"Promoted Headers",{}, Text.Trim),
    #"Removed Empty Rows" = Table.SelectRows(#"Trimmed Text", each not List.IsEmpty(List.RemoveMatchingItems(Record.FieldValues(_), {"", null})))
in
    #"Removed Empty Rows"`
    },
    {
      id: 'pivot-data',
      name: 'Pivot Transformation',
      description: 'Transform data from long to wide format',
      category: 'transformation',
      steps: [],
      requiredColumns: [],
      outputColumns: [],
      mCode: `let
    Source = Excel.CurrentWorkbook(){[Name="Data"]}[Content],
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Pivoted Column" = Table.Pivot(#"Promoted Headers", List.Distinct(#"Promoted Headers"[Category]), "Category", "Value")
in
    #"Pivoted Column"`
    },
    {
      id: 'financial-calcs',
      name: 'Financial Calculations',
      description: 'Add common financial metrics and KPIs',
      category: 'financial',
      steps: [],
      requiredColumns: [],
      outputColumns: [],
      mCode: `let
    Source = Excel.CurrentWorkbook(){[Name="Data"]}[Content],
    #"Promoted Headers" = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    #"Added Growth Rate" = Table.AddColumn(#"Promoted Headers", "Growth Rate", each ([Current] - [Previous]) / [Previous], type number),
    #"Added Running Total" = Table.AddColumn(#"Added Growth Rate", "Running Total", each List.Sum(List.FirstN(#"Added Growth Rate"[Amount], [Index] + 1)), type number)
in
    #"Added Running Total"`
    }
  ];

  const operationTypes = [
    { value: 'filter', label: 'Filter Rows' },
    { value: 'sort', label: 'Sort Data' },
    { value: 'group', label: 'Group By' },
    { value: 'pivot', label: 'Pivot Table' },
    { value: 'unpivot', label: 'Unpivot Columns' },
    { value: 'merge', label: 'Merge Tables' },
    { value: 'append', label: 'Append Tables' },
    { value: 'split', label: 'Split Column' },
    { value: 'replace', label: 'Replace Values' },
    { value: 'add_column', label: 'Add Column' },
    { value: 'remove', label: 'Remove Columns' },
    { value: 'dataTypes', label: 'Change Data Types' },
    { value: 'custom', label: 'Custom M Code' }
  ];
  const addStep = (operation: string) => {
    if (!operation) return;
    
    const newStep: PowerQueryStep = {
      id: `step-${Date.now()}`,
      name: `${operationTypes.find(op => op.value === operation)?.label || operation} Step`,
      operation: operation as any,
      mCode: '',
      description: '',
      isApplied: false
    };

    setState({ 
      steps: [...state.steps, newStep],
      error: undefined,
      success: undefined
    });
    
    setSelectedOperation('');
  };

  const updateStep = (stepId: string, updates: Partial<PowerQueryStep>) => {
    const updatedSteps = state.steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    );
    setState({ steps: updatedSteps });
  };

  const removeStep = (stepId: string) => {
    setState({ steps: state.steps.filter(step => step.id !== stepId) });
  };
  const generateMCode = async () => {
    setState({ isGenerating: true });
    
    try {
      const response = await fetch('/api/excel/generate-powerquery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workbookId: workbook.id,
          sheetName: activeSheet?.name,
          steps: state.steps,
          template: selectedTemplate
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate PowerQuery');
      }

      const result = await response.json();
      
      // Update the steps with generated M code and preview data
      setState({ 
        steps: result.steps || state.steps,
        previewData: result.previewData || [],
        completeMCode: result.completeMCode || '',
        isGenerating: false 
      });

    } catch (error) {
      console.error('Error generating PowerQuery:', error);
      setState({ 
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Failed to generate M Code'
      });
    }
  };
  const applyTemplate = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setState({ isGenerating: true });
      
      try {
        const response = await fetch('/api/excel/powerquery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            template: template.category,
            workbook: workbook
          })
        });

        if (!response.ok) throw new Error('Failed to apply template');

        const result = await response.json();
        
        setState({ 
          steps: [],
          previewData: result.previewData || [],
          completeMCode: result.templateCode || template.mCode,
          isGenerating: false 
        });

      } catch (error) {
        console.error('Error applying template:', error);
        setState({ 
          isGenerating: false,
          error: 'Failed to apply template'
        });
      }
    }
  };
  const exportMCode = () => {
    const mCodeToExport = state.completeMCode || state.steps
      .filter(step => step.mCode)
      .map(step => step.mCode)
      .join('\n\n');
    
    if (!mCodeToExport) {
      setState({ error: 'No M Code to export. Generate M Code first.' });
      return;
    }
    
    const blob = new Blob([mCodeToExport], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workbook.name || 'powerquery'}-code.m`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyMCode = async () => {
    const mCodeToCopy = state.completeMCode || state.steps
      .filter(step => step.mCode)
      .map(step => step.mCode)
      .join('\n\n');
    
    if (!mCodeToCopy) {
      setState({ error: 'No M Code to copy. Generate M Code first.' });
      return;
    }

    try {
      await navigator.clipboard.writeText(mCodeToCopy);
      setState({ success: 'M Code copied to clipboard!' });
    } catch (error) {
      console.error('Failed to copy M Code:', error);
      setState({ error: 'Failed to copy M Code to clipboard' });
    }
  };
  return (
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {state.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}
      
      {state.success && (
        <Alert>
          <AlertDescription className="text-green-700">{state.success}</AlertDescription>
        </Alert>
      )}

      {/* Templates Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <span>PowerQuery Templates</span>
          </CardTitle>
          <CardDescription>
            Start with pre-built templates for common data transformations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">{template.name}</h4>
                    <p className="text-sm text-gray-600">{template.description}</p>
                    <Badge variant="secondary">{template.category}</Badge>                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => applyTemplate(template.id)}
                      >
                        Use Template
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setState({ 
                            completeMCode: template.mCode,
                            previewData: [],
                            success: `Preview loaded for ${template.name}`
                          });
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Steps Panel */}
        <Card>
          <CardHeader>            <CardTitle className="flex items-center justify-between">
              <span>Transformation Steps</span>
              <Button
                size="sm"
                onClick={generateMCode}
                disabled={state.isGenerating || state.steps.length === 0}
              >
                <Play className="h-4 w-4 mr-2" />
                {state.isGenerating ? 'Generating...' : 'Generate M Code'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Add Step */}
              <div className="space-y-2">
                <Label>Add Transformation Step</Label>                <div className="flex space-x-2">
                  <Select value={selectedOperation} onValueChange={setSelectedOperation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose operation" />
                    </SelectTrigger>
                    <SelectContent>
                      {operationTypes.map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => addStep(selectedOperation)}
                    disabled={!selectedOperation}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />              {/* Steps List */}
              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {state.steps.map((step, index) => (
                  <div
                    key={step.id}
                    className="border rounded-lg p-3 space-y-2"
                  >                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="font-medium">
                          {index + 1}. {step.name}
                        </span>
                        {step.description && (
                          <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                        )}
                      </div>
                      <div className="flex space-x-1">
                        <Badge variant={step.isApplied ? "default" : "secondary"} className="text-xs">
                          {step.isApplied ? "Applied" : "Pending"}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeStep(step.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {step.mCode && (
                      <div className="bg-gray-50 p-2 rounded text-xs font-mono">
                        {step.mCode.slice(0, 100)}...
                      </div>
                    )}
                  </div>
                ))}
                
                {state.steps.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Code className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No transformation steps added yet</p>
                    <p className="text-sm">Add steps above to build your PowerQuery</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generated Code Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated M Code</span>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"                  onClick={exportMCode}
                  disabled={!state.completeMCode && state.steps.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyMCode}
                  disabled={!state.completeMCode && state.steps.length === 0}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {state.isGenerating ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3">Generating M Code...</span>
                </div>              ) : (state.completeMCode || state.steps.some(step => step.mCode)) ? (                <Textarea
                  value={state.completeMCode || state.steps.map(step => step.mCode).join('\n\n')}
                  readOnly
                  className="h-96 font-mono text-sm resize-none overflow-y-auto"
                  placeholder="M Code will appear here after generation..."
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Code className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Add transformation steps to generate M code</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Data */}
      {state.previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Data Preview</span>
            </CardTitle>
          </CardHeader>          <CardContent>
            <div className="overflow-x-auto max-h-80 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b">
                    {state.previewData[0]?.map((header, index) => (
                      <th key={index} className="text-left p-2 font-medium bg-gray-50">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.previewData.slice(1, 6).map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="p-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {state.previewData.length > 6 && (
                <p className="text-xs text-gray-500 mt-2 sticky bottom-0 bg-white p-2">
                  Showing first 5 rows of {state.previewData.length - 1} total rows
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PowerQueryBuilder;
