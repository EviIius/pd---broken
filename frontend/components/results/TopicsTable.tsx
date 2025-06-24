import React from 'react';
import { Topic } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from "@/components/ui/scroll-area"; // Added import

interface TopicsTableProps {
  topics: Topic[];
}

// Define a list of distinct colors for topics, can be expanded
const topicColors = [
  'bg-purple-500',
  'bg-pink-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-teal-500',
];

const TopicsTable: React.FC<TopicsTableProps> = ({ topics }) => {
  if (!topics || topics.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Topics</CardTitle>
          <CardDescription>The main topics identified in your data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">No topics to display.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6 w-full">
      <CardHeader>
        <CardTitle>Topics</CardTitle>
        <CardDescription>The main topics identified in your data</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] w-full pr-4"> {/* Added ScrollArea */} 
          <div className="space-y-4">
            {topics.map((topic, index) => (
              <div 
                key={topic.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow bg-white dark:bg-gray-800 dark:border-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <span 
                    className={`h-3 w-3 rounded-full ${topic.color || topicColors[index % topicColors.length]}`}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{topic.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Topic {index + 1}</p> 
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="text-xs border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-300">{topic.count}</Badge>
                  <Badge variant="secondary" className="text-xs bg-teal-100 text-teal-700 dark:bg-teal-700 dark:text-teal-100">{topic.percentage}</Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default TopicsTable;
