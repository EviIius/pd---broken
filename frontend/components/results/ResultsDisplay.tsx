import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClusterScatterPlot } from './ClusterScatterPlot';
import TopicsTable from './TopicsTable';
import TopicDistributionChart from './TopicDistributionChart';
import { ClusteringAPIResult, Topic, ClusterPoint } from '@/types';
import { useToast } from "@/components/ui/use-toast"; // Added import

interface ResultsDisplayProps {
  results: ClusteringAPIResult;
  config: { mlType: string; [key: string]: any }; // Added to determine which results to show
  onBack: () => void;
  // onDownload: () => void; // Future: for downloading results
}

// Define some colors for the scatter plot, can be themed later
const plotColors = [
  '#8884d8', // Purple
  '#82ca9d', // Green
  '#ffc658', // Yellow
  '#ff7300', // Orange
  '#00C49F', // Teal
  '#FFBB28', // Gold
  '#FF8042', // Coral
  '#0088FE', // Blue
  '#FF0000', // Red
];

// Helper function to escape values for CSV
const escapeCSVValue = (value: any): string => {
  const stringValue = String(value === null || typeof value === 'undefined' ? '' : value);
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

// Helper function to convert an array of objects to a CSV string
const arrayToCSV = (data: any[], columns?: string[]): string => {
  if (!data || data.length === 0) return '';
  const headers = columns || Object.keys(data[0]);
  const csvRows = [
    headers.join(','), // header row
    ...data.map(row =>
      headers.map(fieldName => escapeCSVValue(row[fieldName])).join(',')
    ),
  ];
  return csvRows.join('\r\n');
};

// Helper function to trigger browser download
const triggerDownload = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default function ResultsDisplay({ results, config, onBack }: ResultsDisplayProps) {
  const { topics, clusterPoints } = results;
  const { toast } = useToast(); // Added for notifications

  const handleDownload = () => {
    if (config.mlType === 'clustering') {
      let downloadedSomething = false;
      if (results.topics && results.topics.length > 0) {
        const topicColumns = ['id', 'name', 'count', 'percentage'];
        // Ensure all columns exist on topic objects, providing defaults if not
        const topicsForCsv = results.topics.map(topic => ({
          id: topic.id,
          name: topic.name,
          count: topic.count,
          percentage: topic.percentage,
        }));
        const topicsCSV = arrayToCSV(topicsForCsv, topicColumns);
        triggerDownload(topicsCSV, 'topics.csv');
        downloadedSomething = true;
      } else {
        toast({ title: "Info", description: "No topic data to download.", variant: "default" });
      }

      if (results.clusterPoints && results.clusterPoints.length > 0) {
        const clusterPointColumns = ['x', 'y', 'topic', 'text'];
         // Ensure all columns exist on clusterPoint objects
        const clusterPointsForCsv = results.clusterPoints.map(point => ({
          x: point.x,
          y: point.y,
          topic: point.topic,
          text: point.text,
        }));
        const clusterPointsCSV = arrayToCSV(clusterPointsForCsv, clusterPointColumns);
        triggerDownload(clusterPointsCSV, 'cluster_points.csv');
        downloadedSomething = true;
      } else {
        toast({ title: "Info", description: "No cluster point data to download.", variant: "default" });
      }

      if (downloadedSomething) {
          toast({ title: "Success", description: "Result CSVs download initiated.", variant: "default" });
      }

    } else if (config.mlType === 'regression') {
      toast({
        title: "Coming Soon",
        description: "Download functionality for regression results is not yet implemented.",
        variant: "default",
      });
    } else {
      toast({
        title: "Not Supported",
        description: `Download not supported for ML type: ${config.mlType}`,
        variant: "destructive",
      });
    }
  };

  const renderClusteringResults = () => (
    <Tabs defaultValue="cluster-visualization" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-4">
        <TabsTrigger value="topics">Topics</TabsTrigger>
        <TabsTrigger value="topic-distribution">Topic Distribution</TabsTrigger>
        <TabsTrigger value="cluster-visualization">Cluster Visualization</TabsTrigger>
      </TabsList>
      <TabsContent value="topics">
        {topics ? <TopicsTable topics={topics} /> : <p>No topic data available.</p>}
      </TabsContent>
      <TabsContent value="topic-distribution">
        {topics ? <TopicDistributionChart topics={topics} /> : <p>No topic distribution data available.</p>}
      </TabsContent>
      <TabsContent value="cluster-visualization">
        {clusterPoints && topics && (
          <ClusterScatterPlot data={clusterPoints} topics={topics} colors={plotColors} />
        )}
        {(!clusterPoints || !topics) && (
          <div className="p-4 border rounded-md bg-muted/20 min-h-[400px] flex items-center justify-center">
            <p className="text-muted-foreground">Not enough data to display cluster visualization.</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );

  const renderRegressionResults = () => (
    // Placeholder for regression results
    <Tabs defaultValue="summary-stats" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4"> {/* Adjust grid as needed */}
        <TabsTrigger value="summary-stats">Summary Statistics</TabsTrigger>
        <TabsTrigger value="charts">Charts</TabsTrigger>
      </TabsList>
      <TabsContent value="summary-stats">
        <div className="p-4 border rounded-md bg-muted/20 min-h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Regression Summary Statistics (Coming Soon)</p>
        </div>
      </TabsContent>
      <TabsContent value="charts">
        <div className="p-4 border rounded-md bg-muted/20 min-h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">Regression Charts (Coming Soon)</p>
        </div>
      </TabsContent>
    </Tabs>
  );

  return (
    <div className="max-w-5xl mx-auto mt-8 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>{config.mlType === 'clustering' ? 'Clustering Results' : 'Regression Results'}</CardTitle>
          <CardDescription>
            {config.mlType === 'clustering' 
              ? 'Explore the generated clusters and topics from your dataset.'
              : 'Explore the results of your regression model.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {config.mlType === 'clustering' && renderClusteringResults()}
          {config.mlType === 'regression' && renderRegressionResults()}
          {/* Add other ML types here */}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" onClick={onBack}>Back</Button>
          <Button onClick={handleDownload}>Download Results</Button> {/* Updated Button */}
        </CardFooter>
      </Card>
    </div>
  );
}
