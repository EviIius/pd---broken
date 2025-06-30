import React from 'react';
import { BarChart3, AlertTriangle, CheckCircle, TrendingUp, Database, Zap, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Separator } from '../ui/separator';
import type { ExcelAnalysis, Recommendation } from '../../types/excel';

interface ExcelAnalysisPanelProps {
  analysis: ExcelAnalysis | null;
  isLoading: boolean;
  onApplyRecommendation?: (recommendation: Recommendation) => void;
}

const ExcelAnalysisPanel: React.FC<ExcelAnalysisPanelProps> = ({
  analysis,
  isLoading,
  onApplyRecommendation
}) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No analysis available. Upload an Excel file to get started.</p>
        </CardContent>
      </Card>
    );
  }

  const { summary, recommendations, dataQualityIssues } = analysis;
  
  const getComplexityColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getAutomationColor = (potential: string) => {
    switch (potential) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'powerquery': return <Zap className="h-4 w-4" />;
      case 'formula': return <BarChart3 className="h-4 w-4" />;
      case 'data_validation': return <CheckCircle className="h-4 w-4" />;
      default: return <TrendingUp className="h-4 w-4" />;
    }
  };

  const canAutoApply = (recommendation: Recommendation) => {
    return ['powerquery', 'formula'].includes(recommendation.type);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Data Points</p>
                <p className="text-2xl font-bold">{(summary.totalRows * summary.totalColumns).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Database className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Sheets</p>
                <p className="text-2xl font-bold">{summary.totalSheets}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <TrendingUp className={`h-8 w-8 ${getComplexityColor(summary.complexityScore)}`} />
              <div>
                <p className="text-sm font-medium text-gray-600">Complexity</p>
                <p className={`text-2xl font-bold ${getComplexityColor(summary.complexityScore)}`}>
                  {summary.complexityScore}/100
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Zap className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Automation</p>
                <Badge className={getAutomationColor(summary.automationPotential)}>
                  {summary.automationPotential}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Types Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Data Types Distribution</CardTitle>
          <CardDescription>
            Analysis of data types across all sheets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(summary.dataTypes).map(([type, count]) => {
              const percentage = (count / summary.totalColumns) * 100;
              return (
                <div key={type} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="capitalize font-medium">{type}</span>
                    <span className="text-gray-600">{count} columns ({percentage.toFixed(1)}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Issues */}
      {dataQualityIssues && dataQualityIssues.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span>Data Quality Issues</span>
            </CardTitle>
            <CardDescription>
              Issues found in your data that may affect analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dataQualityIssues.slice(0, 5).map((issue) => (
                <Alert key={issue.id}>
                  <AlertTriangle className={`h-4 w-4 ${getSeverityColor(issue.severity)}`} />
                  <AlertDescription>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">{issue.description}</p>
                        <p className="text-sm text-gray-600">
                          Sheet: {issue.sheet} | Column: {issue.column}
                        </p>
                        <p className="text-sm text-blue-600">{issue.suggestedFix}</p>
                      </div>
                      <Badge variant="outline" className={getSeverityColor(issue.severity)}>
                        {issue.severity}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
              {dataQualityIssues.length > 5 && (
                <p className="text-sm text-gray-600 text-center">
                  ...and {dataQualityIssues.length - 5} more issues
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Recommendations</span>
            </CardTitle>
            <CardDescription>
              Suggestions to improve your Excel workbook
            </CardDescription>
          </CardHeader>
          <CardContent>            <div className="space-y-4">
              {recommendations.slice(0, 3).map((rec, index) => (
                <div key={rec.id} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        {getRecommendationIcon(rec.type)}
                        <h4 className="font-medium">{rec.title}</h4>
                      </div>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                      <p className="text-sm text-blue-600">{rec.implementation}</p>
                      
                      {canAutoApply(rec) && (
                        <div className="flex items-center space-x-2 pt-2">
                          <Button
                            size="sm"
                            onClick={() => onApplyRecommendation?.(rec)}
                            className="flex items-center space-x-1"
                          >
                            <span>Apply with {rec.type === 'powerquery' ? 'PowerQuery' : 'Formula Generator'}</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                          <span className="text-xs text-gray-500">
                            Auto-generate {rec.type === 'powerquery' ? 'M Code' : 'Excel formulas'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-2 ml-4">
                      <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                        {rec.priority}
                      </Badge>
                      <Badge variant="secondary">{rec.type}</Badge>
                    </div>
                  </div>
                  {index < recommendations.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExcelAnalysisPanel;
