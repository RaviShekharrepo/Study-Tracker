import { format, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isToday, isTomorrow } from 'date-fns';

// Date formatting utilities
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy-MM-dd');
};

export const formatDateTime = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy-MM-dd HH:mm:ss');
};

export const formatDisplayDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'EEEE, MMMM do, yyyy');
};

export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
};

export const parseTimeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

// Date helpers
export const getToday = (): string => formatDate(new Date());
export const getTomorrow = (): string => formatDate(addDays(new Date(), 1));
export const getYesterday = (): string => formatDate(addDays(new Date(), -1));

export const getWeekRange = (date: Date = new Date()) => ({
  start: formatDate(startOfWeek(date, { weekStartsOn: 1 })), // Monday
  end: formatDate(endOfWeek(date, { weekStartsOn: 1 })), // Sunday
});

export const getMonthRange = (date: Date = new Date()) => ({
  start: formatDate(startOfMonth(date)),
  end: formatDate(endOfMonth(date)),
});

export const getDayName = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'EEEE');
};

export const isDateToday = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return isToday(d);
};

export const isDateTomorrow = (date: Date | string): boolean => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return isTomorrow(d);
};

// ID generation
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Progress calculations
export const calculateProgress = (completed: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
};

export const calculateAverageRating = (ratings: number[]): number => {
  if (ratings.length === 0) return 0;
  return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
};

// Time calculations
export const minutesToHours = (minutes: number): number => {
  return Math.round((minutes / 60) * 100) / 100;
};

export const hoursToMinutes = (hours: number): number => {
  return Math.round(hours * 60);
};

export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
};

// Study streak calculation
export const calculateStudyStreak = (studyDates: string[]): number => {
  if (studyDates.length === 0) return 0;
  
  const sortedDates = studyDates.sort().reverse();
  const today = getToday();
  let streak = 0;
  let currentDate = new Date(today);
  
  for (const dateStr of sortedDates) {
    const studyDate = formatDate(currentDate);
    if (dateStr === studyDate) {
      streak++;
      currentDate = addDays(currentDate, -1);
    } else {
      break;
    }
  }
  
  return streak;
};

// Performance metrics
export const calculatePerformanceMetrics = (sessions: any[]) => {
  if (sessions.length === 0) {
    return {
      averageRating: 0,
      totalTime: 0,
      topicsCompleted: 0,
      averageTimePerTopic: 0,
    };
  }
  
  const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
  const completedSessions = sessions.filter(session => session.completed);
  const averageRating = calculateAverageRating(
    sessions.map(session => session.performanceRating)
  );
  
  return {
    averageRating,
    totalTime,
    topicsCompleted: completedSessions.length,
    averageTimePerTopic: completedSessions.length > 0 ? totalTime / completedSessions.length : 0,
  };
};

// Data validation
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateTimeFormat = (time: string): boolean => {
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const validateDuration = (duration: string): boolean => {
  const durationRegex = /^([0-9]{1,2}):([0-5][0-9]):([0-5][0-9])$/;
  return durationRegex.test(duration);
};

// Local storage helpers
export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadFromLocalStorage = (key: string): any => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

// Chart data helpers
export const prepareChartData = (data: any[], dateField: string, valueField: string) => {
  return data.map(item => ({
    date: formatDate(item[dateField]),
    value: item[valueField],
    ...item,
  }));
};

export const groupDataByPeriod = (data: any[], period: 'day' | 'week' | 'month') => {
  const grouped: { [key: string]: any[] } = {};
  
  data.forEach(item => {
    let key: string;
    const date = new Date(item.date);
    
    switch (period) {
      case 'day':
        key = formatDate(date);
        break;
      case 'week':
        key = formatDate(startOfWeek(date, { weekStartsOn: 1 }));
        break;
      case 'month':
        key = format(date, 'yyyy-MM');
        break;
      default:
        key = formatDate(date);
    }
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  });
  
  return grouped;
};