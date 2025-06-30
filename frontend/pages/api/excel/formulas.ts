import { NextApiRequest, NextApiResponse } from 'next';
import { ExcelFormula, GeneratedFormula } from '../../../types/excel';

// Predefined formula templates
const formulaTemplates: ExcelFormula[] = [
  {
    id: 'xlookup',
    name: 'XLOOKUP',
    description: 'Advanced lookup function to find values in a table',
    category: 'lookup',
    formula: '=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])',
    parameters: [
      { name: 'lookup_value', type: 'cell', description: 'The value to search for', required: true, example: 'A2' },
      { name: 'lookup_array', type: 'range', description: 'The array to search in', required: true, example: 'Products[ID]' },
      { name: 'return_array', type: 'range', description: 'The array to return values from', required: true, example: 'Products[Price]' },
      { name: 'if_not_found', type: 'text', description: 'Value to return if not found', required: false, example: '"Not Found"' },
    ],
    example: '=XLOOKUP(A2,Products[ID],Products[Price],"Not Found")',
    complexity: 'intermediate',
  },
  {
    id: 'sumifs',
    name: 'SUMIFS',
    description: 'Sum values based on multiple criteria',
    category: 'math',
    formula: '=SUMIFS(sum_range, criteria_range1, criteria1, [criteria_range2, criteria2], ...)',
    parameters: [
      { name: 'sum_range', type: 'range', description: 'The cells to sum', required: true, example: 'Sales[Amount]' },
      { name: 'criteria_range1', type: 'range', description: 'First criteria range', required: true, example: 'Sales[Date]' },
      { name: 'criteria1', type: 'criteria', description: 'First criteria', required: true, example: '">="&B1' },
      { name: 'criteria_range2', type: 'range', description: 'Second criteria range', required: false, example: 'Sales[Product]' },
      { name: 'criteria2', type: 'criteria', description: 'Second criteria', required: false, example: '"Laptop"' },
    ],
    example: '=SUMIFS(Sales[Amount],Sales[Date],">="&B1,Sales[Product],"Laptop")',
    complexity: 'intermediate',
  },
  {
    id: 'filter',
    name: 'FILTER',
    description: 'Filter array based on criteria (dynamic array)',
    category: 'lookup',
    formula: '=FILTER(array, include, [if_empty])',
    parameters: [
      { name: 'array', type: 'range', description: 'The array to filter', required: true, example: 'Products[Name]' },
      { name: 'include', type: 'criteria', description: 'Boolean array for filtering', required: true, example: 'Products[Price]>100' },
      { name: 'if_empty', type: 'text', description: 'Value if no results', required: false, example: '"No results"' },
    ],
    example: '=FILTER(Products[Name],Products[Price]>100,"No results")',
    complexity: 'advanced',
  },
  {
    id: 'countifs',
    name: 'COUNTIFS',
    description: 'Count cells that meet multiple criteria',
    category: 'math',
    formula: '=COUNTIFS(criteria_range1, criteria1, [criteria_range2, criteria2], ...)',
    parameters: [
      { name: 'criteria_range1', type: 'range', description: 'First criteria range', required: true, example: 'Sales[Status]' },
      { name: 'criteria1', type: 'criteria', description: 'First criteria', required: true, example: '"Completed"' },
      { name: 'criteria_range2', type: 'range', description: 'Second criteria range', required: false, example: 'Sales[Amount]' },
      { name: 'criteria2', type: 'criteria', description: 'Second criteria', required: false, example: '>1000' },
    ],
    example: '=COUNTIFS(Sales[Status],"Completed",Sales[Amount],">1000")',
    complexity: 'basic',
  },
  {
    id: 'index_match',
    name: 'INDEX/MATCH',
    description: 'Flexible lookup using INDEX and MATCH functions',
    category: 'lookup',
    formula: '=INDEX(return_array, MATCH(lookup_value, lookup_array, 0))',
    parameters: [
      { name: 'return_array', type: 'range', description: 'Array to return values from', required: true, example: 'Products[Price]' },
      { name: 'lookup_value', type: 'cell', description: 'Value to search for', required: true, example: 'A2' },
      { name: 'lookup_array', type: 'range', description: 'Array to search in', required: true, example: 'Products[ID]' },
    ],
    example: '=INDEX(Products[Price],MATCH(A2,Products[ID],0))',
    complexity: 'intermediate',
  },
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return available formula templates
    const { category } = req.query;
    
    let templates = formulaTemplates;
    if (category) {
      templates = formulaTemplates.filter(f => f.category === category);
    }
    
    return res.status(200).json({ formulas: templates });
  }
  
  if (req.method === 'POST') {
    try {
      const { formulaId, parameters, context } = req.body;
      
      if (!formulaId) {
        return res.status(400).json({ error: 'Formula ID is required' });
      }
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const template = formulaTemplates.find(f => f.id === formulaId);
      if (!template) {
        return res.status(404).json({ error: 'Formula template not found' });
      }
      
      // Generate the formula based on parameters
      let generatedFormula = generateFormula(template, parameters);
      
      // If context is provided, suggest cell-specific formulas
      if (context?.selectedCells?.length > 0) {
        const cellAddress = context.selectedCells[0];
        generatedFormula = generatedFormula.replace(/\$CELL\$/g, cellAddress);
      }
      
      const result: GeneratedFormula = {
        formula: generatedFormula,
        description: template.description,
        cellAddress: context?.selectedCells?.[0] || 'A1',
        category: template.category,
        complexity: template.complexity,
        dependencies: extractDependencies(generatedFormula),
        explanation: generateExplanation(template, parameters),
      };
      
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error generating formula:', error);
      return res.status(500).json({ error: 'Failed to generate formula' });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

function generateFormula(template: ExcelFormula, parameters: any): string {
  let formula = template.formula;
  
  // Replace parameter placeholders with actual values
  template.parameters.forEach(param => {
    const value = parameters[param.name];
    if (value) {
      // Handle different parameter types
      let formattedValue = value;
      if (param.type === 'text' && !value.startsWith('"')) {
        formattedValue = `"${value}"`;
      }
      
      formula = formula.replace(new RegExp(param.name, 'g'), formattedValue);
    } else if (param.required) {
      // Use example value for required parameters
      formula = formula.replace(new RegExp(param.name, 'g'), param.example);
    }
  });
  
  // Clean up formula - remove optional parameters that weren't provided
  formula = formula.replace(/,\s*\[[^\]]*\]/g, ''); // Remove optional parameters
  formula = formula.replace(/\s+/g, ' ').trim(); // Clean up whitespace
  
  return formula;
}

function extractDependencies(formula: string): string[] {
  // Extract cell references and named ranges
  const cellRefRegex = /\$?[A-Z]+\$?\d+|[A-Za-z_][A-Za-z0-9_]*\[[A-Za-z0-9_\s]+\]/g;
  const matches = formula.match(cellRefRegex) || [];
  return Array.from(new Set(matches));
}

function generateExplanation(template: ExcelFormula, parameters: any): string {
  let explanation = `This ${template.name} formula ${template.description.toLowerCase()}.`;
  
  // Add parameter-specific explanations
  const usedParams = Object.keys(parameters);
  if (usedParams.length > 0) {
    explanation += ` It uses the following parameters: ${usedParams.join(', ')}.`;
  }
  
  // Add complexity note
  explanation += ` This is a ${template.complexity}-level formula.`;
  
  return explanation;
}
