import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { 
  Exam, 
  Chapter, 
  Topic, 
  StudySession, 
  StudyPlan, 
  DashboardData, 
  UserSettings,
  Notification,
  Performance
} from '../types';

// State interface
interface AppState {
  exams: Exam[];
  chapters: Chapter[];
  topics: Topic[];
  studySessions: StudySession[];
  studyPlans: StudyPlan[];
  notifications: Notification[];
  performances: Performance[];
  userSettings: UserSettings;
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: string | null;
}

// Action types
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_EXAM'; payload: Exam }
  | { type: 'UPDATE_EXAM'; payload: Exam }
  | { type: 'DELETE_EXAM'; payload: string }
  | { type: 'ADD_CHAPTER'; payload: Chapter }
  | { type: 'UPDATE_CHAPTER'; payload: Chapter }
  | { type: 'DELETE_CHAPTER'; payload: string }
  | { type: 'ADD_TOPIC'; payload: Topic }
  | { type: 'UPDATE_TOPIC'; payload: Topic }
  | { type: 'DELETE_TOPIC'; payload: string }
  | { type: 'ADD_STUDY_SESSION'; payload: StudySession }
  | { type: 'ADD_STUDY_PLAN'; payload: StudyPlan }
  | { type: 'UPDATE_STUDY_PLAN'; payload: StudyPlan }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'ADD_PERFORMANCE'; payload: Performance }
  | { type: 'UPDATE_USER_SETTINGS'; payload: UserSettings }
  | { type: 'SET_DASHBOARD_DATA'; payload: DashboardData }
  | { type: 'LOAD_DATA'; payload: Partial<AppState> };

// Initial state
const initialState: AppState = {
  exams: [],
  chapters: [],
  topics: [],
  studySessions: [],
  studyPlans: [],
  notifications: [],
  performances: [],
  userSettings: {
    studyReminders: true,
    reminderTime: '09:00',
    dailyStudyGoal: 240, // 4 hours
    weeklyStudyGoal: 1680, // 28 hours
    notifications: {
      email: true,
      push: true,
      sound: true,
    },
    theme: 'light',
    timeFormat: '12h',
  },
  dashboardData: null,
  isLoading: false,
  error: null,
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'ADD_EXAM':
      return { ...state, exams: [...state.exams, action.payload] };
    
    case 'UPDATE_EXAM':
      return {
        ...state,
        exams: state.exams.map(exam => 
          exam.id === action.payload.id ? action.payload : exam
        ),
      };
    
    case 'DELETE_EXAM':
      return {
        ...state,
        exams: state.exams.filter(exam => exam.id !== action.payload),
        chapters: state.chapters.filter(chapter => chapter.examId !== action.payload),
      };
    
    case 'ADD_CHAPTER':
      return { ...state, chapters: [...state.chapters, action.payload] };
    
    case 'UPDATE_CHAPTER':
      return {
        ...state,
        chapters: state.chapters.map(chapter => 
          chapter.id === action.payload.id ? action.payload : chapter
        ),
      };
    
    case 'DELETE_CHAPTER':
      return {
        ...state,
        chapters: state.chapters.filter(chapter => chapter.id !== action.payload),
        topics: state.topics.filter(topic => 
          !state.chapters.find(ch => ch.id === action.payload)?.topics.find(t => t.id === topic.id)
        ),
      };
    
    case 'ADD_TOPIC':
      return { ...state, topics: [...state.topics, action.payload] };
    
    case 'UPDATE_TOPIC':
      return {
        ...state,
        topics: state.topics.map(topic => 
          topic.id === action.payload.id ? action.payload : topic
        ),
      };
    
    case 'DELETE_TOPIC':
      return {
        ...state,
        topics: state.topics.filter(topic => topic.id !== action.payload),
      };
    
    case 'ADD_STUDY_SESSION':
      return { ...state, studySessions: [...state.studySessions, action.payload] };
    
    case 'ADD_STUDY_PLAN':
      return { ...state, studyPlans: [...state.studyPlans, action.payload] };
    
    case 'UPDATE_STUDY_PLAN':
      return {
        ...state,
        studyPlans: state.studyPlans.map(plan => 
          plan.id === action.payload.id ? action.payload : plan
        ),
      };
    
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif => 
          notif.id === action.payload ? { ...notif, read: true } : notif
        ),
      };
    
    case 'ADD_PERFORMANCE':
      return { ...state, performances: [...state.performances, action.payload] };
    
    case 'UPDATE_USER_SETTINGS':
      return { ...state, userSettings: action.payload };
    
    case 'SET_DASHBOARD_DATA':
      return { ...state, dashboardData: action.payload };
    
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | undefined>(undefined);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}