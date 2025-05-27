// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import InstructorRoute from './components/InstructorRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage'; // <-- Import ForgotPasswordPage
import ResetPasswordPage from './pages/ResetPasswordPage';   // <-- Import ResetPasswordPage
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import QuizAttemptPage from './pages/QuizAttemptPage';
import MyResultsPage from './pages/MyResultsPage';
import CreateCoursePage from './pages/CreateCoursePage';
import EditCoursePage from './pages/EditCoursePage';
import CreateAssessmentPage from './pages/CreateAssessmentPage';
import EditAssessmentPage from './pages/EditAssessmentPage';
import ViewAssessmentResultsPage from './pages/ViewAssessmentResultsPage';
import StudentPerformancePage from './pages/StudentPerformancePage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css'; // You can remove or modify this if not used

function App() {
  return (
    // This div wrapper helps ensure the app takes full width/height and has a consistent background
    <div style={{
      margin: 0,
      padding: 0,
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa', // A light gray background, similar to Bootstrap's bg-light
      overflowX: 'hidden' 
    }}>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} /> {/* <-- New Forgot Password Route */}
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} /> {/* <-- New Reset Password Route with token param */}
        
        {/* Protected Routes (General Login Required) */}
        <Route 
          path="/courses" 
          element={
            <ProtectedRoute>
              <CoursesPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/courses/:courseId" 
          element={
            <ProtectedRoute>
              <CourseDetailPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/assessment/:assessmentId/attempt" 
          element={
            <ProtectedRoute>
              <QuizAttemptPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-results"
          element={
            <ProtectedRoute>
              <MyResultsPage />
            </ProtectedRoute>
          } 
        />

        {/* Instructor Only Routes */}
        <Route 
          path="/courses/create"
          element={
            <InstructorRoute> 
              <CreateCoursePage />
            </InstructorRoute>
          }
        />
        <Route 
          path="/courses/edit/:courseId" 
          element={
            <InstructorRoute> 
              <EditCoursePage />
            </InstructorRoute>
          }
        />
        <Route 
          path="/courses/:courseId/assessments/create" 
          element={
            <InstructorRoute> 
              <CreateAssessmentPage />
            </InstructorRoute>
          }
        />
        <Route 
          path="/courses/:courseId/assessments/:assessmentId/edit" 
          element={
            <InstructorRoute> 
              <EditAssessmentPage />
            </InstructorRoute>
          }
        />
        <Route 
          path="/courses/:courseId/assessments/:assessmentId/results"
          element={
            <InstructorRoute>
              <ViewAssessmentResultsPage />
            </InstructorRoute>
          }
        />
        <Route 
          path="/student-performance" 
          element={
            <InstructorRoute> 
              <StudentPerformancePage />
            </InstructorRoute>
          } 
        />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
