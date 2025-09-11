import { 
  Exam, 
  Chapter, 
  Topic, 
  StudySession, 
  StudyPlan, 
  Performance, 
  Notification,
  DashboardData,
  DailyProgress,
  WeeklyProgress,
  MonthlyProgress
} from '../types';
import { 
  saveToLocalStorage, 
  loadFromLocalStorage, 
  generateId,
  getToday,
  getTomorrow,
  getWeekRange,
  getMonthRange,
  formatDate,
  calculateProgress,
  calculatePerformanceMetrics,
  calculateStudyStreak
} from '../utils/helpers';

const STORAGE_KEYS = {
  EXAMS: 'study_tracker_exams',
  CHAPTERS: 'study_tracker_chapters',
  TOPICS: 'study_tracker_topics',
  STUDY_SESSIONS: 'study_tracker_study_sessions',
  STUDY_PLANS: 'study_tracker_study_plans',
  PERFORMANCES: 'study_tracker_performances',
  NOTIFICATIONS: 'study_tracker_notifications',
  USER_SETTINGS: 'study_tracker_user_settings',
};

// Exam services
export const examService = {
  getAll: (): Exam[] => {
    return loadFromLocalStorage(STORAGE_KEYS.EXAMS) || [];
  },

  create: (examData: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>): Exam => {
    const exam: Exam = {
      ...examData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const exams = examService.getAll();
    exams.push(exam);
    saveToLocalStorage(STORAGE_KEYS.EXAMS, exams);
    
    return exam;
  },

  update: (id: string, updates: Partial<Exam>): Exam | null => {
    const exams = examService.getAll();
    const index = exams.findIndex(exam => exam.id === id);
    
    if (index === -1) return null;
    
    exams[index] = {
      ...exams[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    saveToLocalStorage(STORAGE_KEYS.EXAMS, exams);
    return exams[index];
  },

  delete: (id: string): boolean => {
    const exams = examService.getAll();
    const filteredExams = exams.filter(exam => exam.id !== id);
    
    if (filteredExams.length === exams.length) return false;
    
    saveToLocalStorage(STORAGE_KEYS.EXAMS, filteredExams);
    
    // Also delete related chapters and topics
    chapterService.deleteByExamId(id);
    
    return true;
  },

  getById: (id: string): Exam | null => {
    const exams = examService.getAll();
    return exams.find(exam => exam.id === id) || null;
  },
};

// Chapter services
export const chapterService = {
  getAll: (): Chapter[] => {
    return loadFromLocalStorage(STORAGE_KEYS.CHAPTERS) || [];
  },

  getByExamId: (examId: string): Chapter[] => {
    return chapterService.getAll().filter(chapter => chapter.examId === examId);
  },

  create: (chapterData: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt'>): Chapter => {
    const chapter: Chapter = {
      ...chapterData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const chapters = chapterService.getAll();
    chapters.push(chapter);
    saveToLocalStorage(STORAGE_KEYS.CHAPTERS, chapters);
    
    return chapter;
  },

  update: (id: string, updates: Partial<Chapter>): Chapter | null => {
    const chapters = chapterService.getAll();
    const index = chapters.findIndex(chapter => chapter.id === id);
    
    if (index === -1) return null;
    
    chapters[index] = {
      ...chapters[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    saveToLocalStorage(STORAGE_KEYS.CHAPTERS, chapters);
    return chapters[index];
  },

  delete: (id: string): boolean => {
    const chapters = chapterService.getAll();
    const filteredChapters = chapters.filter(chapter => chapter.id !== id);
    
    if (filteredChapters.length === chapters.length) return false;
    
    saveToLocalStorage(STORAGE_KEYS.CHAPTERS, filteredChapters);
    return true;
  },

  deleteByExamId: (examId: string): void => {
    const chapters = chapterService.getAll();
    const filteredChapters = chapters.filter(chapter => chapter.examId !== examId);
    saveToLocalStorage(STORAGE_KEYS.CHAPTERS, filteredChapters);
  },

  getById: (id: string): Chapter | null => {
    const chapters = chapterService.getAll();
    return chapters.find(chapter => chapter.id === id) || null;
  },

  updateProgress: (chapterId: string): void => {
    const chapter = chapterService.getById(chapterId);
    if (!chapter) return;

    const topics = chapter.topics;
    const completedTopics = topics.filter(topic => topic.isComplete).length;
    const progress = calculateProgress(completedTopics, topics.length);

    chapterService.update(chapterId, {
      completedTopics,
      progress,
    });
  },
};

// Topic services
export const topicService = {
  getAll: (): Topic[] => {
    return loadFromLocalStorage(STORAGE_KEYS.TOPICS) || [];
  },

  create: (topicData: Omit<Topic, 'id' | 'createdAt' | 'updatedAt'>): Topic => {
    const topic: Topic = {
      ...topicData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const topics = topicService.getAll();
    topics.push(topic);
    saveToLocalStorage(STORAGE_KEYS.TOPICS, topics);
    
    return topic;
  },

  update: (id: string, updates: Partial<Topic>): Topic | null => {
    const topics = topicService.getAll();
    const index = topics.findIndex(topic => topic.id === id);
    
    if (index === -1) return null;
    
    topics[index] = {
      ...topics[index],
      ...updates,
      updatedAt: new Date(),
    };
    
    saveToLocalStorage(STORAGE_KEYS.TOPICS, topics);
    return topics[index];
  },

  delete: (id: string): boolean => {
    const topics = topicService.getAll();
    const filteredTopics = topics.filter(topic => topic.id !== id);
    
    if (filteredTopics.length === topics.length) return false;
    
    saveToLocalStorage(STORAGE_KEYS.TOPICS, filteredTopics);
    return true;
  },

  getById: (id: string): Topic | null => {
    const topics = topicService.getAll();
    return topics.find(topic => topic.id === id) || null;
  },
};

// Study session services
export const studySessionService = {
  getAll: (): StudySession[] => {
    return loadFromLocalStorage(STORAGE_KEYS.STUDY_SESSIONS) || [];
  },

  create: (sessionData: Omit<StudySession, 'id'>): StudySession => {
    const session: StudySession = {
      ...sessionData,
      id: generateId(),
    };
    
    const sessions = studySessionService.getAll();
    sessions.push(session);
    saveToLocalStorage(STORAGE_KEYS.STUDY_SESSIONS, sessions);
    
    return session;
  },

  getByDateRange: (startDate: string, endDate: string): StudySession[] => {
    const sessions = studySessionService.getAll();
    return sessions.filter(session => {
      const sessionDate = formatDate(session.date);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  },

  getByExamId: (examId: string): StudySession[] => {
    return studySessionService.getAll().filter(session => session.examId === examId);
  },
};

// Study plan services
export const studyPlanService = {
  getAll: (): StudyPlan[] => {
    return loadFromLocalStorage(STORAGE_KEYS.STUDY_PLANS) || [];
  },

  create: (planData: Omit<StudyPlan, 'id'>): StudyPlan => {
    const plan: StudyPlan = {
      ...planData,
      id: generateId(),
    };
    
    const plans = studyPlanService.getAll();
    plans.push(plan);
    saveToLocalStorage(STORAGE_KEYS.STUDY_PLANS, plans);
    
    return plan;
  },

  update: (id: string, updates: Partial<StudyPlan>): StudyPlan | null => {
    const plans = studyPlanService.getAll();
    const index = plans.findIndex(plan => plan.id === id);
    
    if (index === -1) return null;
    
    plans[index] = {
      ...plans[index],
      ...updates,
    };
    
    saveToLocalStorage(STORAGE_KEYS.STUDY_PLANS, plans);
    return plans[index];
  },

  getByDate: (date: string): StudyPlan | null => {
    const plans = studyPlanService.getAll();
    return plans.find(plan => plan.date === date) || null;
  },

  getTodaysPlan: (): StudyPlan | null => {
    return studyPlanService.getByDate(getToday());
  },

  getTomorrowsPlan: (): StudyPlan | null => {
    return studyPlanService.getByDate(getTomorrow());
  },
};

// Performance services
export const performanceService = {
  getAll: (): Performance[] => {
    return loadFromLocalStorage(STORAGE_KEYS.PERFORMANCES) || [];
  },

  create: (performanceData: Omit<Performance, 'date'>): Performance => {
    const performance: Performance = {
      ...performanceData,
      date: new Date(),
    };
    
    const performances = performanceService.getAll();
    performances.push(performance);
    saveToLocalStorage(STORAGE_KEYS.PERFORMANCES, performances);
    
    return performance;
  },

  getByExamId: (examId: string): Performance[] => {
    return performanceService.getAll().filter(perf => perf.examId === examId);
  },

  getRecentPerformance: (limit: number = 10): Performance[] => {
    const performances = performanceService.getAll();
    return performances
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  },
};

// Notification services
export const notificationService = {
  getAll: (): Notification[] => {
    return loadFromLocalStorage(STORAGE_KEYS.NOTIFICATIONS) || [];
  },

  create: (notificationData: Omit<Notification, 'id' | 'date' | 'read'>): Notification => {
    const notification: Notification = {
      ...notificationData,
      id: generateId(),
      date: new Date(),
      read: false,
    };
    
    const notifications = notificationService.getAll();
    notifications.push(notification);
    saveToLocalStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    
    return notification;
  },

  markAsRead: (id: string): boolean => {
    const notifications = notificationService.getAll();
    const index = notifications.findIndex(notif => notif.id === id);
    
    if (index === -1) return false;
    
    notifications[index].read = true;
    saveToLocalStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    
    return true;
  },

  getUnread: (): Notification[] => {
    return notificationService.getAll().filter(notif => !notif.read);
  },
};

// Dashboard data service
export const dashboardService = {
  getDashboardData: (): DashboardData => {
    const todaysPlan = studyPlanService.getTodaysPlan();
    const tomorrowsPlan = studyPlanService.getTomorrowsPlan();
    const weekRange = getWeekRange();
    const sessions = studySessionService.getByDateRange(weekRange.start, weekRange.end);
    const upcomingExams = examService.getAll()
      .filter(exam => exam.targetDate && new Date(exam.targetDate) > new Date())
      .sort((a, b) => new Date(a.targetDate!).getTime() - new Date(b.targetDate!).getTime())
      .slice(0, 5);
    
    const recentPerformance = performanceService.getRecentPerformance(7);
    const notifications = notificationService.getUnread().slice(0, 5);
    
    // Calculate study streak
    const allSessions = studySessionService.getAll();
    const studyDates = Array.from(new Set(allSessions.map(session => formatDate(session.date))));
    const studyStreak = calculateStudyStreak(studyDates);
    
    // Calculate total study time
    const totalStudyTime = allSessions.reduce((sum, session) => sum + session.duration, 0);
    
    const currentWeekProgress: WeeklyProgress = {
      weekStart: weekRange.start,
      totalStudyTime: sessions.reduce((sum, session) => sum + session.duration, 0),
      completedTopics: sessions.filter(session => session.completed).length,
      targetTopics: todaysPlan?.topics.length || 0,
      dailyProgress: [], // This would be calculated based on daily sessions
    };

    return {
      todaysPlan: todaysPlan || {
        id: '',
        examId: '',
        date: getToday(),
        topics: [],
        totalPlannedTime: 0,
        actualTime: 0,
      },
      tomorrowsPlan: tomorrowsPlan || {
        id: '',
        examId: '',
        date: getTomorrow(),
        topics: [],
        totalPlannedTime: 0,
        actualTime: 0,
      },
      currentWeekProgress,
      upcomingExams,
      recentPerformance,
      notifications,
      studyStreak,
      totalStudyTime,
    };
  },
};