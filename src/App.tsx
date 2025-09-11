import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Exams } from './pages/Exams';
import { Progress } from './pages/Progress';
// import { StudyPlanPage } from './pages/StudyPlan';
// import { Settings } from './pages/Settings';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/study-plan" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Study Plan - Coming Soon</h1></div>} />
            <Route path="/settings" element={<div className="p-8 text-center"><h1 className="text-2xl font-bold">Settings - Coming Soon</h1></div>} />
            {/* Add exam detail route later */}
            {/* <Route path="/exams/:id" element={<ExamDetail />} /> */}
          </Routes>
        </Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </Router>
    </AppProvider>
  );
}

export default App;
