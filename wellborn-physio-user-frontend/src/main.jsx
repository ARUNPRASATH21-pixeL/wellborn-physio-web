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

import * as P from "./pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            USER SHELL
        ================================================= */}
        <Route element={<UserShell />}>

          {/* HOME */}
          <Route
            path="/user/home"
            element={
              <>
                <UserEffects />
                <P.User_home />
              </>
            }
          />

          {/* ABOUT */}
          <Route
            path="/user/about"
            element={
              <>
                <UserEffects />
                <P.User_about />
              </>
            }
          />

          {/* SERVICES */}
          <Route
            path="/user/services"
            element={
              <>
                <UserEffects />
                <P.User_services />
              </>
            }
          />

          {/* DOCTORS */}
          <Route
            path="/user/doctors"
            element={
              <>
                <UserEffects />
                <P.User_doctors />
              </>
            }
          />

          {/* APPOINTMENT */}
          <Route
            path="/user/appointment"
            element={
              <>
                <UserEffects />
                <P.User_appointment />
              </>
            }
          />

          {/* =================================================
              FEEDBACK / REVIEWS
          ================================================= */}
          <Route
            path="/user/reviews"
            element={
              <>
                <UserEffects />
                <P.User_reviews />
              </>
            }
          />

          {/* CONTACT */}
          <Route
            path="/user/contact"
            element={
              <>
                <UserEffects />
                <P.User_contact />
              </>
            }
          />

        </Route>


        {/* =================================================
            DEFAULT / UNKNOWN URL
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

createRoot(
  document.getElementById("root")
).render(
  <App />
);