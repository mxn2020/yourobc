// src/components/Dashboard/ProjectChart.tsx

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, PieLabelRenderProps } from 'recharts'
import { Card, CardHeader, CardContent } from '../ui/Card'
import type { ChartDataPoint, TimeSeriesDataPoint } from '@/types'

interface ProjectChartProps {
  title: string
  type: 'bar' | 'pie' | 'line'
  data: ChartDataPoint[] | TimeSeriesDataPoint[]
  height?: number
}

const COLORS = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#F97316', '#06B6D4', '#EC4899']

export function ProjectChart({ title, type, data, height = 300 }: ProjectChartProps) {
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data as ChartDataPoint[]}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )
      
      case 'pie':
        const chartData = data as ChartDataPoint[]
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: PieLabelRenderProps) => {
                  const percent = typeof props.percent === 'number' ? props.percent : 0
                  return `${props.name} ${(percent * 100).toFixed(0)}%`
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data as TimeSeriesDataPoint[]}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#3B82F6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )
      
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  )
}