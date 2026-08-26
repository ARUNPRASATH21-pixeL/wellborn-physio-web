import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "./index.css";

import AdminShell from "./components/AdminShell";
import Admin_auth from "./pages/Admin_auth";

import Admin_forgot_password
  from "./pages/AdminLogin.jsx/Admin_forgot_password";

import Admin_reset_password
  from "./pages/AdminLogin.jsx/Admin_reset_password";

import ProtectedRoute from "./components/ProtectedRoute";

import * as P from "./pages";


// ============================================================
// APP
// ============================================================

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ==================================================
            PUBLIC ADMIN AUTH
        ================================================== */}

        <Route
          path="/admin/login"
          element={<Admin_auth />}
        />

        <Route
          path="/admin/signup"
          element={<Admin_auth />}
        />

        <Route
          path="/admin/forgot-password"
          element={<Admin_forgot_password />}
        />

        {/* ==================================================
            IMPORTANT:
            RESET PASSWORD MUST BE PUBLIC

            Gmail link:
            /admin/reset-password?token=xxxxx
        ================================================== */}

        <Route
          path="/admin/reset-password"
          element={<Admin_reset_password />}
        />


        {/* ==================================================
            PROTECTED ADMIN DASHBOARD
        ================================================== */}

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly>
              <AdminShell>
                <P.Admin_dashboard />
              </AdminShell>
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            PROTECTED DOCTORS
        ================================================== */}

        <Route
          path="/admin/doctors"
          element={
            <ProtectedRoute adminOnly>
              <AdminShell>
                <P.Admin_doctors />
              </AdminShell>
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            PROTECTED SERVICES
        ================================================== */}

        <Route
          path="/admin/services"
          element={
            <ProtectedRoute adminOnly>
              <AdminShell>
                <P.Admin_services />
              </AdminShell>
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            PROTECTED APPOINTMENTS
        ================================================== */}

        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute adminOnly>
              <AdminShell>
                <P.Admin_appointments />
              </AdminShell>
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            PROTECTED MESSAGES
        ================================================== */}

        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute adminOnly>
              <AdminShell>
                <P.Admin_messages />
              </AdminShell>
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            PROTECTED REVIEWS
        ================================================== */}

        <Route
          path="/admin/reviews"
          element={
            <ProtectedRoute adminOnly>
              <AdminShell>
                <P.Admin_reviews />
              </AdminShell>
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            PROTECTED SETTINGS
        ================================================== */}

        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute adminOnly>
              <AdminShell>
                <P.Admin_settings />
              </AdminShell>
            </ProtectedRoute>
          }
        />


        {/* ==================================================
            LOGOUT
        ================================================== */}

        <Route
          path="/admin/logout"
          element={<P.Admin_logout />}
        />


        {/* ==================================================
            /admin
        ================================================== */}

        <Route
          path="/admin"
          element={
            <Navigate
              to="/admin/login"
              replace
            />
          }
        />


        {/* ==================================================
            ROOT
        ================================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to="/admin/login"
              replace
            />
          }
        />


        {/* ==================================================
            UNKNOWN URL
        ================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to="/admin/login"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;