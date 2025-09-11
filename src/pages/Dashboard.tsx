import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar,
  Clock,
  BookOpen,
  TrendingUp,
  Target,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Flame
} from 'lucide-react';
import { Card, Button, Badge } from '../components/UI';
import { useApp } from '../context/AppContext';
import { dashboardService } from '../services/dataService';
import { formatDisplayDate, getDayName, formatDuration, isDateToday, isDateTomorrow } from '../utils/helpers';

export function Dashboard() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    // Load dashboard data
    const dashboardData = dashboardService.getDashboardData();
    dispatch({ type: 'SET_DASHBOARD_DATA', payload: dashboardData });
  }, [dispatch]);

  const { dashboardData } = state;

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const todayDate = new Date();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back! Here's your study progress overview.
        </p>
      </div>

      {/* Study Streak & Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <div className="flex items-center">
            <Flame className="h-8 w-8" />
            <div className="ml-4">
              <p className="text-orange-100 text-sm font-medium">Study Streak</p>
              <p className="text-2xl font-bold">{dashboardData.studyStreak} days</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-primary-600" />
            <div className="ml-4">
              <p className="text-gray-600 text-sm font-medium">Total Study Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(dashboardData.totalStudyTime)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-gray-600 text-sm font-medium">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(dashboardData.currentWeekProgress.totalStudyTime)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <Target className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-gray-600 text-sm font-medium">Topics Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {dashboardData.currentWeekProgress.completedTopics}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Study Plans for Today and Tomorrow */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Plan */}
        <Card 
          title="Today's Study Plan"
          subtitle={formatDisplayDate(todayDate)}
          action={
            <Link to="/study-plan">
              <Button size="sm" variant="secondary">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          }
        >
          {dashboardData.todaysPlan.topics.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.todaysPlan.topics.slice(0, 3).map((topic, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {topic.completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-gray-300 rounded-full mr-3"></div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">Topic {index + 1}</p>
                      <p className="text-sm text-gray-600">
                        {formatDuration(topic.estimatedDuration)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={topic.priority === 'high' ? 'danger' : topic.priority === 'medium' ? 'warning' : 'default'}>
                    {topic.priority}
                  </Badge>
                </div>
              ))}
              {dashboardData.todaysPlan.topics.length > 3 && (
                <p className="text-sm text-gray-600 text-center">
                  +{dashboardData.todaysPlan.topics.length - 3} more topics
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No study plan for today</p>
              <Link to="/study-plan">
                <Button size="sm" className="mt-2">Create Plan</Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Tomorrow's Plan */}
        <Card 
          title="Tomorrow's Study Plan"
          subtitle={formatDisplayDate(tomorrowDate)}
          action={
            <Link to="/study-plan">
              <Button size="sm" variant="secondary">
                Edit Plan <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          }
        >
          {dashboardData.tomorrowsPlan.topics.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.tomorrowsPlan.topics.slice(0, 3).map((topic, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-5 w-5 border-2 border-blue-300 rounded-full mr-3"></div>
                    <div>
                      <p className="font-medium text-gray-900">Topic {index + 1}</p>
                      <p className="text-sm text-gray-600">
                        {formatDuration(topic.estimatedDuration)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={topic.priority === 'high' ? 'danger' : topic.priority === 'medium' ? 'warning' : 'default'}>
                    {topic.priority}
                  </Badge>
                </div>
              ))}
              {dashboardData.tomorrowsPlan.topics.length > 3 && (
                <p className="text-sm text-gray-600 text-center">
                  +{dashboardData.tomorrowsPlan.topics.length - 3} more topics
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No plan set for tomorrow</p>
              <Link to="/study-plan">
                <Button size="sm" className="mt-2">Create Plan</Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* Upcoming Exams & Recent Notifications */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Exams */}
        <Card 
          title="Upcoming Exams"
          action={
            <Link to="/exams">
              <Button size="sm" variant="secondary">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          }
        >
          {dashboardData.upcomingExams.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.upcomingExams.slice(0, 4).map((exam) => (
                <div key={exam.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <BookOpen className="h-5 w-5 text-primary-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{exam.name}</p>
                      <p className="text-sm text-gray-600">{exam.type}</p>
                    </div>
                  </div>
                  {exam.targetDate && (
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatDisplayDate(exam.targetDate)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {Math.ceil((new Date(exam.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days left
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No upcoming exams</p>
              <Link to="/exams">
                <Button size="sm" className="mt-2">Add Exam</Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Recent Notifications */}
        <Card title="Recent Notifications">
          {dashboardData.notifications.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.notifications.map((notification) => (
                <div key={notification.id} className="flex items-start p-3 bg-yellow-50 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{notification.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDisplayDate(notification.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent notifications</p>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link to="/exams">
            <Button variant="secondary" className="w-full">
              <BookOpen className="h-4 w-4 mr-2" />
              Add Exam
            </Button>
          </Link>
          <Link to="/study-plan">
            <Button variant="secondary" className="w-full">
              <Calendar className="h-4 w-4 mr-2" />
              Plan Study
            </Button>
          </Link>
          <Link to="/progress">
            <Button variant="secondary" className="w-full">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Progress
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="secondary" className="w-full">
              <Target className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}