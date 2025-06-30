import React, { useState } from 'react';
import { Calculator, Sparkles, Copy, TestTube, BookOpen, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import type { 
  ExcelWorkbook, 
  ExcelWorksheet, 
  ExcelAnalysis, 
  ExcelFormula, 
  GeneratedFormula 
} from '../../types/excel';

interface FormulaGeneratorProps {
  workbook: ExcelWorkbook;
  activeSheet: ExcelWorksheet | null;
  selectedCells: string[];
  analysis: ExcelAnalysis | null;
  state: {
    selectedFormula: ExcelFormula | null;
    parameters: { [key: string]: any };
    generatedFormula: string;
    isGenerating: boolean;
  };
  setState: (updates: any) => void;
}

const FormulaGenerator: React.FC<FormulaGeneratorProps> = ({
  workbook,
  activeSheet,
  selectedCells,
  analysis,
  state,
  setState
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('lookup');

  // Sample formula library
  const formulaLibrary: ExcelFormula[] = [
    {
      id: 'xlookup-basic',
      name: 'XLOOKUP - Basic',
      description: 'Modern replacement for VLOOKUP with better flexibility',
      category: 'lookup',
      formula: '=XLOOKUP({lookup_value}, {lookup_array}, {return_array}, {if_not_found})',
      parameters: [
        { name: 'lookup_value', type: 'cell', description: 'Value to search for', required: true, example: 'A2' },
        { name: 'lookup_array', type: 'range', description: 'Range to search in', required: true, example: 'B:B' },
        { name: 'return_array', type: 'range', description: 'Range to return values from', required: true, example: 'C:C' },
        { name: 'if_not_found', type: 'text', description: 'Value if not found', required: false, example: 'Not Found' }
      ],
      example: '=XLOOKUP(A2, B:B, C:C, "Not Found")',
      complexity: 'basic'
    },
    {
      id: 'index-match',
      name: 'INDEX-MATCH',
      description: 'Powerful combination for flexible lookups',
      category: 'lookup',
      formula: '=INDEX({return_array}, MATCH({lookup_value}, {lookup_array}, 0))',
      parameters: [
        { name: 'return_array', type: 'range', description: 'Range to return values from', required: true, example: 'C:C' },
        { name: 'lookup_value', type: 'cell', description: 'Value to search for', required: true, example: 'A2' },
        { name: 'lookup_array', type: 'range', description: 'Range to search in', required: true, example: 'B:B' }
      ],
      example: '=INDEX(C:C, MATCH(A2, B:B, 0))',
      complexity: 'intermediate'
    },
    {
      id: 'sumifs-multiple',
      name: 'SUMIFS - Multiple Criteria',
      description: 'Sum with multiple conditions',
      category: 'math',
      formula: '=SUMIFS({sum_range}, {criteria_range1}, {criteria1}, {criteria_range2}, {criteria2})',
      parameters: [
        { name: 'sum_range', type: 'range', description: 'Range to sum', required: true, example: 'D:D' },
        { name: 'criteria_range1', type: 'range', description: 'First criteria range', required: true, example: 'A:A' },
        { name: 'criteria1', type: 'criteria', description: 'First criteria', required: true, example: '"Product A"' },
        { name: 'criteria_range2', type: 'range', description: 'Second criteria range', required: false, example: 'B:B' },
        { name: 'criteria2', type: 'criteria', description: 'Second criteria', required: false, example: '">100"' }
      ],
      example: '=SUMIFS(D:D, A:A, "Product A", B:B, ">100")',
      complexity: 'intermediate'
    },
    {
      id: 'dynamic-array',
      name: 'Dynamic Array Formula',
      description: 'Create dynamic arrays that resize automatically',
      category: 'math',
      formula: '=FILTER({array}, {criteria})',
      parameters: [
        { name: 'array', type: 'range', description: 'Data range to filter', required: true, example: 'A:C' },
        { name: 'criteria', type: 'criteria', description: 'Filter condition', required: true, example: 'A:A>100' }
      ],
      example: '=FILTER(A:C, A:A>100)',
      complexity: 'advanced'
    },
    {
      id: 'text-join',
      name: 'TEXTJOIN - Concatenate with Delimiter',
      description: 'Join text with custom delimiters',
      category: 'text',
      formula: '=TEXTJOIN({delimiter}, {ignore_empty}, {text_array})',
      parameters: [
        { name: 'delimiter', type: 'text', description: 'Separator character', required: true, example: '", "' },
        { name: 'ignore_empty', type: 'text', description: 'Ignore empty cells', required: true, example: 'TRUE' },
        { name: 'text_array', type: 'range', description: 'Range of text to join', required: true, example: 'A1:A10' }
      ],
      example: '=TEXTJOIN(", ", TRUE, A1:A10)',
      complexity: 'basic'
    },
    {
      id: 'ifs-nested',
      name: 'IFS - Multiple Conditions',
      description: 'Replace nested IF statements',
      category: 'logical',
      formula: '=IFS({condition1}, {value1}, {condition2}, {value2}, TRUE, {default_value})',
      parameters: [
        { name: 'condition1', type: 'criteria', description: 'First condition', required: true, example: 'A2>90' },
        { name: 'value1', type: 'text', description: 'Value if condition1 true', required: true, example: '"A"' },
        { name: 'condition2', type: 'criteria', description: 'Second condition', required: false, example: 'A2>80' },
        { name: 'value2', type: 'text', description: 'Value if condition2 true', required: false, example: '"B"' },
        { name: 'default_value', type: 'text', description: 'Default value', required: false, example: '"F"' }
      ],
      example: '=IFS(A2>90, "A", A2>80, "B", TRUE, "F")',
      complexity: 'intermediate'
    }
  ];

  const categories = [
    { id: 'lookup', name: 'Lookup & Reference', icon: Target },
    { id: 'math', name: 'Math & Statistical', icon: Calculator },
    { id: 'text', name: 'Text Functions', icon: BookOpen },
    { id: 'logical', name: 'Logical Functions', icon: TestTube },
    { id: 'date', name: 'Date & Time', icon: Sparkles },
    { id: 'financial', name: 'Financial', icon: Sparkles }
  ];

  const filteredFormulas = formulaLibrary.filter(f => f.category === activeCategory);

  const generateAIFormula = async () => {
    setState({ isGenerating: true });
    
    try {
      const response = await fetch('/api/excel/generate-formula', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workbookId: workbook.id,
          sheetName: activeSheet?.name,
          selectedCells,
          formulaId: state.selectedFormula?.id,
          parameters: state.parameters,
          context: {
            headers: activeSheet?.headers,
            dataTypes: activeSheet?.dataTypes
          }
        })
      });

      if (!response.ok) throw new Error('Failed to generate formula');

      const result: GeneratedFormula = await response.json();
      
      setState({ 
        generatedFormula: result.formula,
        isGenerating: false 
      });

    } catch (error) {
      console.error('Error generating formula:', error);
      setState({ isGenerating: false });
    }
  };

  const buildFormulaFromTemplate = (formula: ExcelFormula) => {
    let builtFormula = formula.formula;
    
    // Replace parameters with actual values
    formula.parameters.forEach(param => {
      const value = state.parameters[param.name] || param.example;
      builtFormula = builtFormula.replace(`{${param.name}}`, value);
    });
    
    setState({ generatedFormula: builtFormula });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <div className="space-y-6">
      {/* AI Formula Suggestions */}
      {analysis?.suggestedFormulas && analysis.suggestedFormulas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span>AI-Suggested Formulas</span>
            </CardTitle>
            <CardDescription>
              Formulas recommended based on your data analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.suggestedFormulas.slice(0, 4).map((suggested) => (
                <Card key={suggested.cellAddress} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{suggested.category}</Badge>
                        <Badge variant="outline">{suggested.complexity}</Badge>
                      </div>
                      <h4 className="font-medium">{suggested.description}</h4>
                      <code className="text-xs bg-gray-100 p-2 rounded block">
                        {suggested.formula}
                      </code>
                      <p className="text-sm text-gray-600">{suggested.explanation}</p>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => copyToClipboard(suggested.formula)}
                      >
                        <Copy className="h-3 w-3 mr-2" />
                        Copy Formula
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Formula Builder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Formula Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left p-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
                      activeCategory === category.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{category.name}</span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Formula List */}
        <Card>
          <CardHeader>
            <CardTitle>Available Formulas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredFormulas.map((formula) => (
                <div
                  key={formula.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                    state.selectedFormula?.id === formula.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => setState({ selectedFormula: formula, parameters: {} })}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">{formula.name}</h4>
                      <Badge 
                        variant={formula.complexity === 'advanced' ? 'destructive' : 
                                formula.complexity === 'intermediate' ? 'default' : 'secondary'}
                      >
                        {formula.complexity}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600">{formula.description}</p>
                    <code className="text-xs bg-gray-100 p-1 rounded block">
                      {formula.example}
                    </code>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Formula Builder */}
        <Card>
          <CardHeader>
            <CardTitle>Formula Builder</CardTitle>
          </CardHeader>
          <CardContent>
            {state.selectedFormula ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">{state.selectedFormula.name}</h4>
                  <p className="text-sm text-gray-600">{state.selectedFormula.description}</p>
                </div>
                
                <Separator />
                
                {/* Parameters */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Parameters</Label>
                  {state.selectedFormula.parameters.map((param) => (
                    <div key={param.name} className="space-y-1">
                      <Label className="text-xs">
                        {param.name} {param.required && <span className="text-red-500">*</span>}
                      </Label>
                      <Input
                        placeholder={param.example}
                        value={state.parameters[param.name] || ''}
                        onChange={(e) => setState({
                          parameters: {
                            ...state.parameters,
                            [param.name]: e.target.value
                          }
                        })}
                      />
                      <p className="text-xs text-gray-500">{param.description}</p>
                    </div>
                  ))}
                </div>
                
                <Button
                  className="w-full"
                  onClick={() => buildFormulaFromTemplate(state.selectedFormula!)}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Build Formula
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select a formula to start building</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Generated Formula */}
      {state.generatedFormula && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Generated Formula</span>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(state.generatedFormula)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button size="sm" variant="outline">
                  <TestTube className="h-4 w-4 mr-2" />
                  Test
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <code className="text-sm font-mono">{state.generatedFormula}</code>
              </div>
              
              {selectedCells.length > 0 && (
                <div className="text-sm text-gray-600">
                  <p>Suggested placement: {selectedCells[0]}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FormulaGenerator;
