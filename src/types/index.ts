// Exam types and categories
export type ExamType = 'UPSC' | 'CSE' | 'ESE' | 'GATE' | 'Other';

export interface Exam {
  id: string;
  name: string;
  type: ExamType;
  category: string;
  targetDate?: Date;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Chapter and Topic structures
export interface Topic {
  id: string;
  slNo: number;
  chapter: string;
  topicName: string;
  duration: string; // Format: HH:MM:SS
  isComplete: boolean;
  selfEvaluate: number; // 1-10 scale
  dpps: string; // Daily Practice Problems
  otherProblems: string;
  documentUpdates?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chapter {
  id: string;
  examId: string;
  name: string;
  description?: string;
  topics: Topic[];
  totalDuration: string;
  completedTopics: number;
  progress: number; // Percentage
  createdAt: Date;
  updatedAt: Date;
}

// Study session and progress tracking
export interface StudySession {
  id: string;
  examId: string;
  chapterId: string;
  topicId: string;
  date: Date;
  duration: number; // in minutes
  notes?: string;
  performanceRating: number; // 1-10 scale
  completed: boolean;
}

// Daily/Weekly/Monthly progress
export interface DailyProgress {
  date: string; // YYYY-MM-DD format
  totalStudyTime: number; // in minutes
  completedTopics: number;
  targetTopics: number;
  exams: {
    examId: string;
    studyTime: number;
    topicsCompleted: number;
  }[];
}

export interface WeeklyProgress {
  weekStart: string; // YYYY-MM-DD format
  totalStudyTime: number;
  completedTopics: number;
  targetTopics: number;
  dailyProgress: DailyProgress[];
}

export interface MonthlyProgress {
  month: string; // YYYY-MM format
  totalStudyTime: number;
  completedTopics: number;
  targetTopics: number;
  weeklyProgress: WeeklyProgress[];
}

// Study plan and scheduling
export interface StudyPlan {
  id: string;
  examId: string;
  date: string; // YYYY-MM-DD format
  topics: {
    topicId: string;
    chapterId: string;
    estimatedDuration: number; // in minutes
    priority: 'high' | 'medium' | 'low';
    completed: boolean;
  }[];
  totalPlannedTime: number; // in minutes
  actualTime: number; // in minutes
  notes?: string;
}

// Performance analytics
export interface Performance {
  examId: string;
  chapterId?: string;
  topicId?: string;
  timeSpent: number; // in minutes
  accuracy: number; // percentage
  speed: number; // topics per hour
  date: Date;
}

// Notification system
export interface Notification {
  id: string;
  type: 'reminder' | 'deadline' | 'achievement' | 'warning';
  title: string;
  message: string;
  date: Date;
  read: boolean;
  actionRequired: boolean;
  examId?: string;
  chapterId?: string;
  topicId?: string;
}

// User preferences and settings
export interface UserSettings {
  studyReminders: boolean;
  reminderTime: string; // HH:MM format
  dailyStudyGoal: number; // in minutes
  weeklyStudyGoal: number; // in minutes
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  timeFormat: '12h' | '24h';
}

// Dashboard data aggregation
export interface DashboardData {
  todaysPlan: StudyPlan;
  tomorrowsPlan: StudyPlan;
  currentWeekProgress: WeeklyProgress;
  upcomingExams: Exam[];
  recentPerformance: Performance[];
  notifications: Notification[];
  studyStreak: number; // consecutive days
  totalStudyTime: number; // all time in minutes
}

// Chart data types
export interface ChartData {
  date: string;
  studyTime: number;
  topicsCompleted: number;
  performanceRating?: number;
}

export interface ProgressChartData {
  name: string;
  completed: number;
  total: number;
  percentage: number;
}