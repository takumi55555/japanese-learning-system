import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated, getStoredUser } from "../../api/auth/authService";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Get user data
  const user = getStoredUser();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user role is allowed
  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on user role
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin" replace />;
      case "group_admin":
        return <Navigate to="/group-admin/ticket-sale" replace />;
      case "student":
        return <Navigate to="/" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

// Specific protected route components for different roles
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>;

export const StudentRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <ProtectedRoute allowedRoles={["student"]}>{children}</ProtectedRoute>;

export const GroupAdminRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute allowedRoles={["group_admin"]}>{children}</ProtectedRoute>
);

// Route for authenticated users (any role)
export const AuthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <ProtectedRoute allowedRoles={["admin", "student", "group_admin"]}>
    {children}
  </ProtectedRoute>
);

// Public or Student route - accessible by guests, students, and group admins, but not admins
export const PublicOrStudentRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const user = getStoredUser();

  // If user is authenticated and is an admin, redirect to admin dashboard
  if (isAuthenticated() && user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  // Allow guests, students, and group admins (group admins use same layout as students)
  return <>{children}</>;
};
