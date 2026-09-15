import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import StudentLayout from '../layouts/StudentLayout';
import AdminLayout from '../layouts/AdminLayout';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';

// Auth Pages
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentGroupPage from '../pages/student/StudentGroupPage';
import StudentAssignmentsPage from '../pages/student/StudentAssignmentsPage';
import StudentAssignmentDetailsPage from '../pages/student/StudentAssignmentDetailsPage';
import StudentProgressPage from '../pages/student/StudentProgressPage';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminAssignmentsPage from '../pages/admin/AdminAssignmentsPage';
import CreateAssignmentPage from '../pages/admin/CreateAssignmentPage';
import EditAssignmentPage from '../pages/admin/EditAssignmentPage';
import AssignmentDetailsAuditPage from '../pages/admin/AssignmentDetailsAuditPage';
import AdminGroupsPage from '../pages/admin/AdminGroupsPage';
import AdminGroupDetailsPage from '../pages/admin/AdminGroupDetailsPage';
import AdminAnalyticsPage from '../pages/admin/AdminAnalyticsPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Root Redirection */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Auth Routes */}
      <Route
        element={
          <PublicRoute>
            <AuthLayout />
          </PublicRoute>
        }
      >
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Student Protected Portal */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['STUDENT']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="group" element={<StudentGroupPage />} />
        <Route path="assignments" element={<StudentAssignmentsPage />} />
        <Route path="assignments/:id" element={<StudentAssignmentDetailsPage />} />
        <Route path="progress" element={<StudentProgressPage />} />
      </Route>

      {/* Admin Protected Portal */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="assignments" element={<AdminAssignmentsPage />} />
        <Route path="assignments/new" element={<CreateAssignmentPage />} />
        <Route path="assignments/:id" element={<AssignmentDetailsAuditPage />} />
        <Route path="assignments/:id/edit" element={<EditAssignmentPage />} />
        <Route path="groups" element={<AdminGroupsPage />} />
        <Route path="groups/:id" element={<AdminGroupDetailsPage />} />
        <Route path="analytics" element={<AdminAnalyticsPage />} />
      </Route>

      {/* Catch-All Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

