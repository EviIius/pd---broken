import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Topic } from '@/types';

interface TopicDistributionChartProps {
  topics: Topic[];
}

// Theme-compliant colors for the chart bars
const barColors = [
  '#3B82F6', // primary-blue
  '#14997A', // secondary-teal
  '#60A5FA', // lighter-blue (blue-400)
  '#2DD4BF', // lighter-teal (teal-400)
  '#A78BFA', // purple-400 (accent)
  '#F472B6', // pink-400 (accent)
  '#FBBF24', // amber-400 (accent)
];

const TopicDistributionChart: React.FC<TopicDistributionChartProps> = ({ topics }) => {
  if (!topics || topics.length === 0) {
    return <p className="text-center text-gray-500 py-8">Topic Distribution Chart (Coming Soon)</p>;
  }

  const chartData = topics.map(topic => ({
    name: topic.name,
    documents: topic.count,
  }));

  return (
    <div className="p-4 rounded-lg shadow-sm bg-white dark:bg-gray-800" style={{ width: '100%', height: 400 }}>
      <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300">Topic Distribution</h3>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 50, // Increased bottom margin
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fontSize: 12 }} /> {/* Increased height, added font size adjustment */}
          <YAxis />
          <Tooltip wrapperClassName="rounded-md shadow-lg" contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '0.375rem' }} />
          <Bar dataKey="documents">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TopicDistributionChart;
