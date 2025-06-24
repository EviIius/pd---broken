"use client"

import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ZAxis } from "recharts"
import { ClusterPoint, Topic } from "@/types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ClusterScatterPlotProps {
  data: ClusterPoint[] // Changed NonNullable<ClusterPoint[]> to ClusterPoint[]
  topics: Topic[]    // Changed NonNullable<Topic[]> to Topic[]
  colors: string[]
}

export function ClusterScatterPlot({ data, topics, colors }: ClusterScatterPlotProps) {
  return (
    <div className="flex w-full gap-6 h-[500px]">
      <div className="flex-1 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 25 }}>
            <XAxis 
              type="number" 
              dataKey="x" 
              name="X" 
              domain={['auto', 'auto']} 
              tickLine={true}
              axisLine={true}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Y" 
              domain={['auto', 'auto']}
              tickLine={true}
              axisLine={true}
              tick={{ fontSize: 12 }}
              width={35}
            />
            <ZAxis type="number" range={[50, 50]} />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              content={({ payload }) => {
                if (!payload?.[0]) return null
                const point = payload[0].payload as ClusterPoint
                const topic = topics.find(t => t.id === point.topic)
                if (!topic) return null
                
                return (
                  <div className="bg-white p-3 border rounded-lg shadow-lg max-w-xs">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full flex-none" 
                          style={{ backgroundColor: colors[topics.indexOf(topic)] }}
                        />
                        <p className="font-medium">{topic.name}</p>
                      </div>
                      {topic.summary && (
                        <p className="text-sm text-muted-foreground">{topic.summary}</p>
                      )}
                      <div className="text-xs text-muted-foreground pt-1">
                        <p>{topic.count.toLocaleString()} documents ({topic.percentage}%)</p>
                      </div>
                      <div className="text-xs border-t pt-1 mt-1">
                        <p className="font-medium">Document Text:</p>
                        <p className="text-muted-foreground">{point.text}</p>
                      </div>
                    </div>
                  </div>
                )
              }}
            />
            {topics.map((topic, index) => {
              const topicPoints = data.filter(point => point.topic === topic.id)
              return (
                <Scatter
                  key={topic.id}
                  name={topic.name}
                  data={topicPoints}
                  fill={colors[index % colors.length]}
                />
              )
            })}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      
      <div className="w-56 flex-none border-l pl-6">
        <h3 className="font-medium mb-3 text-sm">Topics</h3>
        <ScrollArea className="h-[calc(100%-2rem)]">
          <div className="space-y-3 pr-4">
            {topics.map((topic, index) => (
              <div 
                key={topic.id} 
                className="flex items-start gap-2 group hover:bg-muted/50 p-1.5 rounded-lg transition-colors"
              >
                <span 
                  className="w-3 h-3 rounded-full mt-1 flex-none" 
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" title={topic.name}>
                    {topic.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {topic.count.toLocaleString()} documents ({topic.percentage}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
