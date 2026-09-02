import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Onboarding from './pages/Onboarding.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SyllabusTracker from './pages/SyllabusTracker.jsx';
import PracticeRoom from './pages/PracticeRoom.jsx';
import MistakeBook from './pages/MistakeBook.jsx';
import MockTestRoom from './pages/MockTestRoom.jsx';
import RevisionRoom from './pages/RevisionRoom.jsx';
import CurrentAffairsRoom from './pages/CurrentAffairsRoom.jsx';
import MentorRoom from './pages/MentorRoom.jsx';
import AnalyticsRoom from './pages/AnalyticsRoom.jsx';
import NotificationRoom from './pages/NotificationRoom.jsx';
import AdminRoom from './pages/AdminRoom.jsx';
import MainsWriter from './pages/MainsWriter.jsx';
import StudyTimer from './pages/StudyTimer.jsx';
import ResourceVault from './pages/ResourceVault.jsx';
import PlannerRoom from './pages/PlannerRoom.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Onboarding Wizard */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          {/* Protected Dashboard Route */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Syllabus Route */}
          <Route
            path="/syllabus"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <SyllabusTracker />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Practice Route */}
          <Route
            path="/practice"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PracticeRoom />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Mock Test Route */}
          <Route
            path="/mock"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MockTestRoom />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Revision Route */}
          <Route
            path="/revision"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <RevisionRoom />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Current Affairs Route */}
          <Route
            path="/current-affairs"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <CurrentAffairsRoom />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected AI Mentor Route */}
          <Route
            path="/mentor"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MentorRoom />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Analytics Route */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <AnalyticsRoom />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Notifications Route */}
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <NotificationRoom />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Route */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <MainLayout>
                  <AdminRoom />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Mistakes Route */}
          <Route
            path="/mistakes"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MistakeBook />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Mains Route */}
          <Route
            path="/mains"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <MainsWriter />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Focus Route */}
          <Route
            path="/focus"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <StudyTimer />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Resources Route */}
          <Route
            path="/resources"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <ResourceVault />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Protected Planner Route */}
          <Route
            path="/planner"
            element={
              <ProtectedRoute>
                <MainLayout>
                  <PlannerRoom />
                </MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback Catch-All */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  </ThemeProvider>
  );
}

export default App;
