import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import {
  isAuthenticated,
  isAdmin,
} from "../services/api";


// ============================================================
// PROTECTED ROUTE
// ============================================================

const ProtectedRoute = ({
  children,
  adminOnly = false,
}) => {

  const location = useLocation();

  // ----------------------------------------------------------
  // AUTH CHECK
  // ----------------------------------------------------------

  if (!isAuthenticated()) {

    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }


  // ----------------------------------------------------------
  // ADMIN CHECK
  // ----------------------------------------------------------

  if (adminOnly && !isAdmin()) {

    return (
      <Navigate
        to="/admin/login"
        replace
      />
    );
  }


  // ----------------------------------------------------------
  // ALLOWED
  // ----------------------------------------------------------

  return children;
};

export default ProtectedRoute;