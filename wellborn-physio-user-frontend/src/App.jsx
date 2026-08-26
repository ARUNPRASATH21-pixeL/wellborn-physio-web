import React from "react";
import { createRoot } from "react-dom/client";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "@fortawesome/fontawesome-free/css/all.min.css";
import "./index.css";

import UserShell from "./components/UserShell";
import UserEffects from "./components/UserEffects";
import HomeIntro from "./components/HomeIntro";

import * as P from "./pages";

/* =========================================================
   HOME PAGE
========================================================= */

function HomePage() {
  return (
    <HomeIntro>
      <UserEffects />
      <P.User_home />
    </HomeIntro>
  );
}

/* =========================================================
   NORMAL USER PAGE
========================================================= */

function NormalPage({ children }) {
  return (
    <>
      <UserEffects />
      {children}
    </>
  );
}

/* =========================================================
   APP
========================================================= */

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            USER SHELL
        ================================================= */}

        <Route element={<UserShell />}>

          {/* ================= HOME ================= */}

          <Route
            path="/user/home"
            element={<HomePage />}
          />

          {/* ================= ABOUT ================= */}

          <Route
            path="/user/about"
            element={
              <NormalPage>
                <P.User_about />
              </NormalPage>
            }
          />

          {/* ================= SERVICES ================= */}

          <Route
            path="/user/services"
            element={
              <NormalPage>
                <P.User_services />
              </NormalPage>
            }
          />

          {/* ================= DOCTORS ================= */}

          <Route
            path="/user/doctors"
            element={
              <NormalPage>
                <P.User_doctors />
              </NormalPage>
            }
          />

          {/* ================= APPOINTMENT ================= */}

          <Route
            path="/user/appointment"
            element={
              <NormalPage>
                <P.User_appointment />
              </NormalPage>
            }
          />

          {/* ================= REVIEWS ================= */}

          <Route
            path="/user/reviews"
            element={
              <NormalPage>
                <P.User_reviews />
              </NormalPage>
            }
          />

          {/* ================= CONTACT ================= */}

          <Route
            path="/user/contact"
            element={
              <NormalPage>
                <P.User_contact />
              </NormalPage>
            }
          />

        </Route>

        {/* =================================================
            DEFAULT ROUTE
        ================================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/user/home"
              replace
            />
          }
        />

        {/* =================================================
            INVALID ROUTES
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/user/home"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

/* =========================================================
   ROOT
========================================================= */

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error(
    "Root element #root was not found."
  );
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);