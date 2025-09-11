import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp,
  Clock,
  Target,
  BookOpen
} from 'lucide-react';
import { Card, Select } from '../components/UI';
import { useApp } from '../context/AppContext';
import { studySessionService, performanceService } from '../services/dataService';
import { formatDuration, groupDataByPeriod } from '../utils/helpers';
import { ExamType } from '../types';

export function Progress() {
  const { state } = useApp();
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | 'year'>('week');
  const [selectedExam, setSelectedExam] = useState<string>('');

  const [chartData, setChartData] = useState<{
    daily: any[];
    performance: any[];
    examProgress: Array<{
      name: string;
      totalTime: number;
      completedTopics: number;
      type: ExamType;
    }>;
  }>({
    daily: [],
    performance: [],
    examProgress: []
  });

  useEffect(() => {
    // Generate chart data based on study sessions and performance
    const sessions = studySessionService.getAll();
    const performances = performanceService.getAll();
    
    // Filter by selected exam if any
    const filteredSessions = selectedExam 
      ? sessions.filter(session => session.examId === selectedExam)
      : sessions;
    
    const filteredPerformances = selectedExam
      ? performances.filter(perf => perf.examId === selectedExam)
      : performances;

    // Group data by time period
    const groupedSessions = groupDataByPeriod(filteredSessions.map(session => ({
      ...session,
      date: session.date.toISOString()
    })), timePeriod === 'week' ? 'day' : timePeriod === 'month' ? 'week' : 'month');

    // Prepare daily study time data
    const dailyData = Object.entries(groupedSessions).map(([date, sessions]) => ({
      date,
      studyTime: sessions.reduce((sum: number, session: any) => sum + session.duration, 0),
      topicsCompleted: sessions.filter((session: any) => session.completed).length,
      averageRating: sessions.length > 0 
        ? sessions.reduce((sum: number, session: any) => sum + session.performanceRating, 0) / sessions.length
        : 0
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Prepare exam progress data
    const examProgress = state.exams.map(exam => {
      const examSessions = sessions.filter(session => session.examId === exam.id);
      const totalTime = examSessions.reduce((sum, session) => sum + session.duration, 0);
      const completedTopics = examSessions.filter(session => session.completed).length;
      
      return {
        name: exam.name,
        totalTime,
        completedTopics,
        type: exam.type
      };
    });

    setChartData({
      daily: dailyData as any,
      performance: filteredPerformances as any,
      examProgress
    });
  }, [timePeriod, selectedExam, state.exams]);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Progress Tracking</h1>
          <p className="mt-2 text-gray-600">
            Visualize your study progress with detailed analytics and insights.
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Time Period"
            value={timePeriod}
            onChange={(value) => setTimePeriod(value as 'week' | 'month' | 'year')}
            options={[
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'year', label: 'This Year' }
            ]}
          />
          <Select
            label="Filter by Exam"
            value={selectedExam}
            onChange={setSelectedExam}
            options={[
              { value: '', label: 'All Exams' },
              ...state.exams.map(exam => ({ value: exam.id, label: exam.name }))
            ]}
          />
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-gray-600 text-sm font-medium">Total Study Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(chartData.daily.reduce((sum: number, day: any) => sum + day.studyTime, 0))}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <Target className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-gray-600 text-sm font-medium">Topics Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {chartData.daily.reduce((sum: number, day: any) => sum + day.topicsCompleted, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-gray-600 text-sm font-medium">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {chartData.daily.length > 0 
                  ? (chartData.daily.reduce((sum: number, day: any) => sum + (day.averageRating || 0), 0) / chartData.daily.length).toFixed(1)
                  : '0.0'
                }/10
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-gray-600 text-sm font-medium">Active Exams</p>
              <p className="text-2xl font-bold text-gray-900">
                {state.exams.length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Daily Study Time Chart */}
        <Card title="Daily Study Time" subtitle="Track your daily study hours">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis tickFormatter={(value) => `${Math.floor(value / 60)}h`} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number) => [formatDuration(value), 'Study Time']}
              />
              <Bar dataKey="studyTime" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Performance Trend */}
        <Card title="Performance Trend" subtitle="Track your performance over time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis domain={[0, 10]} />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number) => [value.toFixed(1), 'Average Rating']}
              />
              <Line 
                type="monotone" 
                dataKey="averageRating" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Topics Completed Chart */}
        <Card title="Topics Completed" subtitle="Track your topic completion progress">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
                formatter={(value: number) => [value, 'Topics Completed']}
              />
              <Bar dataKey="topicsCompleted" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Exam Progress Distribution */}
        <Card title="Exam Progress Distribution" subtitle="Study time distribution across exams">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.examProgress}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="totalTime"
              >
                {chartData.examProgress.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [formatDuration(value), 'Study Time']} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <Card title="Detailed Statistics">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Study Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Topics Completed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chartData.examProgress.map((exam, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {exam.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDuration(exam.totalTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {exam.completedTopics}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {exam.type}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}