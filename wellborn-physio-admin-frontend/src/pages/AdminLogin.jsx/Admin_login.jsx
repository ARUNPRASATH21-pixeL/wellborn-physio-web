import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  API,
  postPublicData,
  saveAuth,
} from "../services/api";

import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UserPlus,
  KeyRound,
  Moon,
  Sun,
} from "lucide-react";

export default function Admin() {
  const nav = useNavigate();
  const redirectTimer = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  /* ============================================================
     THEME INITIALIZE (Persistent from localStorage)
  ============================================================ */

  const [darkMode, setDarkMode] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("wellborn-theme");
      return savedTheme === "dark";
    } catch (e) {
      return false;
    }
  });

  /* ============================================================
     THEME TOGGLE
  ============================================================ */

  const toggleTheme = () => {
    const nextTheme = !darkMode;
    setDarkMode(nextTheme);
    try {
      localStorage.setItem(
        "wellborn-theme",
        nextTheme ? "dark" : "light"
      );
    } catch (e) {
      console.error("Theme storage error:", e);
    }
  };

  /* ============================================================
     CLEANUP
  ============================================================ */

  useEffect(() => {
    return () => {
      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  /* ============================================================
     EMAIL VALIDATION
  ============================================================ */

  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value.trim()
    );
  };

  /* ============================================================
     BACKEND ERROR HANDLER
  ============================================================ */

  const getErrorMessage = (err) => {
    const backendMessage =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.data?.message ||
      err?.data?.error;

    if (backendMessage) {
      return backendMessage;
    }

    const message = err?.message;

    if (message) {
      const lower = message.toLowerCase();

      if (
        lower.includes("failed to fetch") ||
        lower.includes("networkerror") ||
        lower.includes("network error")
      ) {
        return (
          "Unable to connect to the server. " +
          "Please check whether the Wellborn backend is running."
        );
      }

      return message;
    }

    return "Invalid email or password.";
  };

  /* ============================================================
     CLEAR MESSAGES
  ============================================================ */

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  /* ============================================================
     LOGIN (Spring Boot Backend Only)
  ============================================================ */

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    clearMessages();

    const cleanEmail =
      email.trim().toLowerCase();

    const cleanPassword =
      password;

    if (!cleanEmail) {
      setEmailTouched(true);
      setError("Email is required.");
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setEmailTouched(true);
      setError("Please enter a valid email address.");
      return;
    }

    if (!cleanPassword) {
      setPasswordTouched(true);
      setError("Password is required.");
      return;
    }

    if (cleanPassword.length < 6) {
      setPasswordTouched(true);
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await postPublicData(
        API.ADMIN_LOGIN,
        {
          email: cleanEmail,
          password: cleanPassword,
        }
      );

      if (!response) {
        throw new Error(
          "Invalid response received from server."
        );
      }

      const token =
        response?.token ||
        response?.accessToken ||
        response?.jwt;

      if (!token) {
        throw new Error(
          response?.message ||
          "Login failed. Authentication token was not received."
        );
      }

      const role =
        response?.role ||
        response?.user?.role ||
        response?.admin?.role;

      if (
        role &&
        String(role).toUpperCase() !== "ADMIN"
      ) {
        throw new Error(
          "This account does not have admin access."
        );
      }

      saveAuth({
        ...response,
        token,
        email:
          response?.email ||
          cleanEmail,
        role:
          role ||
          "ADMIN",
      });

      setError("");

      setSuccess(
        "Login successful. Opening admin dashboard..."
      );

      redirectTimer.current =
        setTimeout(() => {
          nav(
            "/admin/dashboard",
            {
              replace: true,
            }
          );
        }, 700);

    } catch (err) {
      console.error(
        "ADMIN LOGIN ERROR:",
        err
      );

      setSuccess("");

      setError(
        getErrorMessage(err)
      );

    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     FORGOT PASSWORD
  ============================================================ */

  const handleForgotPassword = () => {
    if (loading) {
      return;
    }

    nav("/admin/forgot-password");
  };

  /* ============================================================
     ADMIN SIGNUP
  ============================================================ */

  const handleSignup = () => {
    if (loading) {
      return;
    }

    nav("/admin/signup");
  };

  /* ============================================================
     UI RENDER
  ============================================================ */

  return (
    <div
      className={
        darkMode
          ? "min-h-screen relative overflow-hidden bg-slate-950 text-slate-100 flex items-center justify-center px-4 py-8 sm:px-6 transition-colors duration-300"
          : "min-h-screen relative overflow-hidden bg-slate-100 text-slate-800 flex items-center justify-center px-4 py-8 sm:px-6 transition-colors duration-300"
      }
    >

      {/* BACKGROUND GLOWS */}

      <div
        className="
          pointer-events-none
          absolute
          -top-60
          -left-40
          w-[420px]
          h-[420px]
          rounded-full
          bg-cyan-500/20
          blur-[100px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          -bottom-40
          -right-40
          w-[480px]
          h-[480px]
          rounded-full
          bg-indigo-600/25
          blur-[110px]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          top-1/2
          left-1/2
          w-[300px]
          h-[300px]
          rounded-full
          bg-blue-500/10
          blur-[100px]
          -translate-x-1/2
          -translate-y-1/2
        "
      />

      {/* THEME TOGGLE BUTTON */}

      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className={
          darkMode
            ? `
              fixed
              top-5
              right-5
              z-50
              w-11
              h-11
              rounded-full
              flex
              items-center
              justify-center
              bg-slate-800
              border
              border-slate-700
              text-yellow-300
              shadow-lg
              hover:scale-105
              transition-all
            `
            : `
              fixed
              top-5
              right-5
              z-50
              w-11
              h-11
              rounded-full
              flex
              items-center
              justify-center
              bg-white
              border
              border-slate-200
              text-indigo-600
              shadow-lg
              hover:scale-105
              transition-all
            `
        }
      >
        {darkMode ? (
          <Sun size={19} />
        ) : (
          <Moon size={19} />
        )}
      </button>

      {/* MAIN CONTAINER */}

      <div
        className="
          relative
          z-10
          w-full
          max-w-[470px]
        "
      >

        {/* BRAND HEADER */}

        <div
          className="
            flex
            flex-col
            items-center
            mb-6
          "
        >

          <div
            className={
              darkMode
                ? `
                  flex
                  items-center
                  gap-3
                  px-5
                  py-3
                  rounded-2xl
                  bg-white/[0.06]
                  border
                  border-white/10
                  backdrop-blur-xl
                  shadow-2xl
                `
                : `
                  flex
                  items-center
                  gap-3
                  px-5
                  py-3
                  rounded-2xl
                  bg-white
                  border
                  border-slate-200
                  backdrop-blur-xl
                  shadow-xl
                `
            }
          >

            <div
              className="
                w-12
                h-12
                rounded-2xl
                flex
                items-center
                justify-center
                bg-gradient-to-br
                from-cyan-400
                via-blue-500
                to-indigo-600
                text-white
                shadow-lg
                shadow-cyan-500/20
                shrink-0
              "
            >
              <ShieldCheck
                size={26}
                strokeWidth={2.2}
              />
            </div>

            <div>

              <h1
                className={
                  darkMode
                    ? "text-[21px] font-black tracking-tight text-white"
                    : "text-[21px] font-black tracking-tight text-slate-900"
                }
              >
                Wellborn
                <span className="text-cyan-500">
                  {" "}Physio
                </span>
              </h1>

              <p
                className={
                  darkMode
                    ? "mt-1 text-[10px] uppercase tracking-[0.25em] font-semibold text-slate-300"
                    : "mt-1 text-[10px] uppercase tracking-[0.25em] font-semibold text-slate-500"
                }
              >
                Admin Portal
              </p>

            </div>

          </div>

          <p
            className={
              darkMode
                ? "mt-3 text-xs text-slate-300 text-center font-medium"
                : "mt-3 text-xs text-slate-500 text-center font-medium"
            }
          >
            Secure clinic management system
          </p>

        </div>

        {/* LOGIN CARD */}

        <div
          className={
            darkMode
              ? `
                overflow-hidden
                rounded-[30px]
                bg-slate-900/95
                border
                border-slate-700
                shadow-[0_35px_100px_rgba(0,0,0,.55)]
              `
              : `
                overflow-hidden
                rounded-[30px]
                bg-white
                border
                border-white/20
                shadow-[0_35px_100px_rgba(0,0,0,.20)]
              `
          }
        >

          <div
            className="
              h-1.5
              bg-gradient-to-r
              from-cyan-400
              via-blue-500
              to-indigo-600
            "
          />

          <div
            className="
              p-6
              sm:p-8
            "
          >

            {/* CARD TITLE */}

            <div className="mb-7">

              <div
                className={
                  darkMode
                    ? `
                      w-12
                      h-12
                      rounded-2xl
                      bg-indigo-500/15
                      text-indigo-300
                      flex
                      items-center
                      justify-center
                      mb-4
                    `
                    : `
                      w-12
                      h-12
                      rounded-2xl
                      bg-indigo-50
                      text-indigo-600
                      flex
                      items-center
                      justify-center
                      mb-4
                    `
                }
              >
                <ShieldCheck size={22} />
              </div>

              <h2
                className={
                  darkMode
                    ? "text-2xl font-black tracking-tight text-white"
                    : "text-2xl font-black tracking-tight text-slate-900"
                }
              >
                Admin Login
              </h2>

              <p
                className={
                  darkMode
                    ? "mt-1.5 text-sm leading-5 text-slate-300 font-normal"
                    : "mt-1.5 text-sm leading-5 text-slate-500 font-normal"
                }
              >
                Sign in to your Wellborn Physio
                admin dashboard.
              </p>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleLogin}
              noValidate
              className="space-y-4"
            >

              {/* EMAIL FIELD */}

              <div>

                <div className="relative group">

                  <Mail
                    size={17}
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                      pointer-events-none
                    "
                  />

                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);

                      if (error) {
                        setError("");
                      }

                      if (success) {
                        setSuccess("");
                      }
                    }}
                    onBlur={() =>
                      setEmailTouched(true)
                    }
                    placeholder="Admin email address"
                    autoComplete="username"
                    disabled={loading}
                    className={
                      darkMode
                        ? `
                          w-full
                          rounded-2xl
                          border
                          border-slate-700
                          bg-slate-800
                          py-3.5
                          pl-11
                          pr-4
                          text-sm
                          font-medium
                          text-slate-100
                          placeholder:text-slate-400
                          outline-none
                          transition-all
                          focus:border-indigo-400
                          focus:ring-4
                          focus:ring-indigo-500/10
                          disabled:opacity-60
                        `
                        : `
                          w-full
                          rounded-2xl
                          border
                          border-slate-200
                          bg-slate-50/80
                          py-3.5
                          pl-11
                          pr-4
                          text-sm
                          font-medium
                          text-slate-800
                          placeholder:text-slate-400
                          outline-none
                          transition-all
                          focus:bg-white
                          focus:border-indigo-400
                          focus:ring-4
                          focus:ring-indigo-500/10
                          disabled:opacity-60
                        `
                    }
                  />

                </div>

                {emailTouched &&
                  email &&
                  !validateEmail(email) && (
                    <p
                      className="
                        mt-1.5
                        px-1
                        text-xs
                        font-medium
                        text-red-400
                      "
                    >
                      Enter a valid email address.
                    </p>
                  )}

              </div>

              {/* PASSWORD FIELD */}

              <div>

                <div className="relative group">

                  <Lock
                    size={17}
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                      pointer-events-none
                    "
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);

                      if (error) {
                        setError("");
                      }

                      if (success) {
                        setSuccess("");
                      }
                    }}
                    onBlur={() =>
                      setPasswordTouched(true)
                    }
                    placeholder="Password"
                    autoComplete="current-password"
                    disabled={loading}
                    className={
                      darkMode
                        ? `
                          w-full
                          rounded-2xl
                          border
                          border-slate-700
                          bg-slate-800
                          py-3.5
                          pl-11
                          pr-12
                          text-sm
                          font-medium
                          text-slate-100
                          placeholder:text-slate-400
                          outline-none
                          transition-all
                          focus:border-indigo-400
                          focus:ring-4
                          focus:ring-indigo-500/10
                          disabled:opacity-60
                        `
                        : `
                          w-full
                          rounded-2xl
                          border
                          border-slate-200
                          bg-slate-50/80
                          py-3.5
                          pl-11
                          pr-12
                          text-sm
                          font-medium
                          text-slate-800
                          placeholder:text-slate-400
                          outline-none
                          transition-all
                          focus:border-indigo-400
                          focus:bg-white
                          focus:ring-4
                          focus:ring-indigo-500/10
                          disabled:opacity-60
                        `
                    }
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className={
                      darkMode
                        ? `
                          absolute
                          right-3.5
                          top-1/2
                          -translate-y-1/2
                          rounded-lg
                          p-1.5
                          text-slate-400
                          hover:bg-slate-700
                          hover:text-slate-200
                          transition
                          disabled:opacity-50
                        `
                        : `
                          absolute
                          right-3.5
                          top-1/2
                          -translate-y-1/2
                          rounded-lg
                          p-1.5
                          text-slate-400
                          hover:bg-slate-100
                          hover:text-slate-700
                          transition
                          disabled:opacity-50
                        `
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>

                {passwordTouched &&
                  password &&
                  password.length < 6 && (
                    <p
                      className="
                        mt-1.5
                        px-1
                        text-xs
                        font-medium
                        text-red-400
                      "
                    >
                      Password must contain at least
                      6 characters.
                    </p>
                  )}

              </div>

              {/* FORGOT PASSWORD */}

              <div
                className="
                  flex
                  justify-end
                  -mt-1
                "
              >

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className={
                    darkMode
                      ? `
                        inline-flex
                        items-center
                        gap-1.5
                        text-xs
                        font-bold
                        text-indigo-400
                        hover:text-indigo-300
                        transition
                        disabled:opacity-50
                      `
                      : `
                        inline-flex
                        items-center
                        gap-1.5
                        text-xs
                        font-bold
                        text-indigo-600
                        hover:text-indigo-800
                        transition
                        disabled:opacity-50
                      `
                  }
                >
                  <KeyRound size={13} />
                  Forgot password?
                </button>

              </div>

              {/* ERROR MESSAGE */}

              {error && (
                <div
                  role="alert"
                  className={
                    darkMode
                      ? "flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-sm font-medium text-red-300"
                      : "flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                  }
                >
                  <AlertCircle
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    {error}
                  </span>
                </div>
              )}

              {/* SUCCESS MESSAGE */}

              {success && (
                <div
                  role="status"
                  className={
                    darkMode
                      ? "flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-3 text-sm font-medium text-emerald-300"
                      : "flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
                  }
                >
                  <CheckCircle2
                    size={18}
                    className="mt-0.5 shrink-0"
                  />

                  <span>
                    {success}
                  </span>
                </div>
              )}

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="
                  group
                  w-full
                  rounded-2xl
                  bg-gradient-to-r
                  from-indigo-600
                  via-blue-600
                  to-cyan-500
                  py-3.5
                  text-sm
                  font-extrabold
                  text-white
                  shadow-[0_12px_28px_rgba(37,99,235,.25)]
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:shadow-[0_18px_36px_rgba(37,99,235,.32)]
                  active:translate-y-0
                  disabled:opacity-60
                  disabled:cursor-not-allowed
                  disabled:hover:translate-y-0
                "
              >

                {loading ? (
                  <span
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                  >
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Signing in...
                  </span>
                ) : (
                  <span
                    className="
                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                  >
                    Sign in to dashboard

                    <ArrowRight
                      size={17}
                      className="
                        transition-transform
                        group-hover:translate-x-1
                      "
                    />
                  </span>
                )}

              </button>

            </form>

            {/* SIGNUP SECTION */}

            <div
              className={
                darkMode
                  ? `
                    mt-6
                    rounded-2xl
                    border
                    border-slate-700
                    bg-slate-800/70
                    px-4
                    py-3.5
                    flex
                    items-center
                    justify-between
                    gap-3
                  `
                  : `
                    mt-6
                    rounded-2xl
                    border
                    border-slate-100
                    bg-slate-50
                    px-4
                    py-3.5
                    flex
                    items-center
                    justify-between
                    gap-3
                  `
              }
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                  min-w-0
                "
              >

                <div
                  className={
                    darkMode
                      ? `
                        w-9
                        h-9
                        rounded-xl
                        bg-slate-700
                        border
                        border-slate-600
                        flex
                        items-center
                        justify-center
                        text-indigo-300
                        shrink-0
                      `
                      : `
                        w-9
                        h-9
                        rounded-xl
                        bg-white
                        border
                        border-slate-200
                        flex
                        items-center
                        justify-center
                        text-indigo-600
                        shrink-0
                      `
                  }
                >
                  <UserPlus size={17} />
                </div>

                <div className="min-w-0">

                  <p
                    className={
                      darkMode
                        ? "text-xs font-bold text-slate-100"
                        : "text-xs font-bold text-slate-800"
                    }
                  >
                    New administrator?
                  </p>

                  <p
                    className={
                      darkMode
                        ? "mt-0.5 text-[11px] text-slate-300 font-medium"
                        : "mt-0.5 text-[11px] text-slate-500 font-medium"
                    }
                  >
                    Create your admin account
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={handleSignup}
                disabled={loading}
                className={
                  darkMode
                    ? `
                      shrink-0
                      rounded-xl
                      bg-slate-700
                      border
                      border-slate-600
                      px-3
                      py-2
                      text-xs
                      font-bold
                      text-indigo-300
                      shadow-sm
                      hover:border-indigo-400
                      hover:bg-slate-600
                      transition
                      disabled:opacity-50
                    `
                    : `
                      shrink-0
                      rounded-xl
                      bg-white
                      border
                      border-slate-200
                      px-3
                      py-2
                      text-xs
                      font-bold
                      text-indigo-600
                      shadow-sm
                      hover:border-indigo-200
                      hover:bg-indigo-50
                      transition
                      disabled:opacity-50
                    `
                }
              >
                Sign up
              </button>

            </div>

            {/* FOOTER */}

            <div
              className="
                mt-7
                flex
                items-center
                gap-3
                text-[10px]
                uppercase
                tracking-[0.18em]
                font-semibold
              "
            >

              <div
                className={
                  darkMode
                    ? "h-px flex-1 bg-slate-700"
                    : "h-px flex-1 bg-slate-200"
                }
              />

              <span
                className={
                  darkMode
                    ? "text-slate-400"
                    : "text-slate-400"
                }
              >
                Wellborn Physio
              </span>

              <div
                className={
                  darkMode
                    ? "h-px flex-1 bg-slate-700"
                    : "h-px flex-1 bg-slate-200"
                }
              />

            </div>

          </div>

        </div>

        {/* SECURITY TEXT */}

        <div
          className={
            darkMode
              ? `
                mt-5
                flex
                items-center
                justify-center
                gap-2
                text-center
                text-[11px]
                font-medium
                text-slate-400
              `
              : `
                mt-5
                flex
                items-center
                justify-center
                gap-2
                text-center
                text-[11px]
                font-medium
                text-slate-500
              `
          }
        >
          <ShieldCheck size={13} />

          <span>
            Protected admin access • Wellborn Physio
          </span>
        </div>

      </div>

    </div>
  );
}