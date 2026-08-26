// ============================================================
// Admin_auth.jsx (Pure Spring Boot / MySQL / JWT Backend)
// ============================================================

import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useLocation,
} from "react-router-dom";

import { getToken } from "firebase/messaging";
import { messaging } from "../services/firebase";

import {
  API,
  postData,
  saveAuth,
  checkAdminEmailStatus,
  startAdminSignup,
  verifyAdminSignupOtp,
  resendAdminSignupOtp,
  verifyAdminSignupSecret,
  completeAdminSignup,
} from "../services/api";

import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  RefreshCw,
  Stethoscope,
} from "lucide-react";


// ============================================================
// COMPONENT
// ============================================================

export default function Admin_auth() {

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/admin/dashboard";

  const otpRef = useRef(null);


  // ==========================================================
  // THEME
  // ==========================================================

  const [theme, setTheme] = useState(() => {
    const savedTheme =
      localStorage.getItem("wellborn-theme");

    return savedTheme === "dark"
      ? "dark"
      : "light";
  });


  // ==========================================================
  // KEEP THEME SYNCHRONIZED
  // ==========================================================

  useEffect(() => {
    const readTheme = () => {
      const savedTheme =
        localStorage.getItem("wellborn-theme");

      setTheme(
        savedTheme === "dark"
          ? "dark"
          : "light"
      );
    };

    readTheme();

    const handleStorage = () => {
      readTheme();
    };

    window.addEventListener(
      "storage",
      handleStorage
    );

    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
    };
  }, []);


  const isDark =
    theme === "dark";


  // ==========================================================
  // MODE
  // ==========================================================

  const [mode, setMode] =
    useState("login");


  // ==========================================================
  // LOGIN
  // ==========================================================

  const [loginEmail, setLoginEmail] =
    useState("");

  const [loginPassword, setLoginPassword] =
    useState("");

  const [showLoginPassword, setShowLoginPassword] =
    useState(false);


  // ==========================================================
  // REMEMBER ME
  // ==========================================================

  const [rememberMe, setRememberMe] =
    useState(false);


  // ==========================================================
  // SIGNUP BASIC
  // ==========================================================

  const [adminName, setAdminName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [signupEmail, setSignupEmail] =
    useState("");


  // ==========================================================
  // MEDICAL CODE
  // ==========================================================

  const [medicalCode, setMedicalCode] =
    useState("");

  const [showMedicalCode, setShowMedicalCode] =
    useState(false);


  // ==========================================================
  // PASSWORD
  // ==========================================================

  const [signupPassword, setSignupPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showSignupPassword, setShowSignupPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);


  // ==========================================================
  // EMAIL STATUS
  // ==========================================================

  const [emailChecking, setEmailChecking] =
    useState(false);

  const [emailAvailable, setEmailAvailable] =
    useState(false);

  const [emailChecked, setEmailChecked] =
    useState(false);

  const [emailMessage, setEmailMessage] =
    useState("");


  // ==========================================================
  // OTP
  // ==========================================================

  const [showOtp, setShowOtp] =
    useState(false);

  const [otp, setOtp] =
    useState("");

  const [otpSending, setOtpSending] =
    useState(false);

  const [otpVerifying, setOtpVerifying] =
    useState(false);

  const [otpVerified, setOtpVerified] =
    useState(false);

  const [otpMessage, setOtpMessage] =
    useState("");

  const [resendLoading, setResendLoading] =
    useState(false);

  const [resendTimer, setResendTimer] =
    useState(0);


  // ==========================================================
  // MEDICAL VERIFICATION
  // ==========================================================

  const [medicalVerified, setMedicalVerified] =
    useState(false);

  const [medicalLoading, setMedicalLoading] =
    useState(false);

  const [medicalMessage, setMedicalMessage] =
    useState("");


  // ==========================================================
  // SIGNUP TOKEN
  // ==========================================================

  const [signupToken, setSignupToken] =
    useState("");


  // ==========================================================
  // GLOBAL
  // ==========================================================

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ==========================================================
  // RESEND TIMER
  // ==========================================================

  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendTimer((previous) =>
        previous > 0
          ? previous - 1
          : 0
      );
    }, 1000);

    return () =>
      clearInterval(timer);
  }, [resendTimer]);


  // ==========================================================
  // HELPERS
  // ==========================================================

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };


  const getErrorMessage = (
    err,
    fallback
  ) => {
    return (
      err?.data?.message ||
      err?.data?.error ||
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      fallback
    );
  };


  const validateEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      String(value || "").trim()
    );
  };


  const validatePhone = (value) => {
    const clean =
      String(value || "")
        .replace(/\D/g, "");

    return /^[6-9][0-9]{9}$/.test(clean);
  };


  // ==========================================================
  // EXTRACT SIGNUP TOKEN
  // ==========================================================

  const extractSignupToken = (
    response,
    fallback = ""
  ) => {
    return (
      response?.signupToken ||
      response?.verificationToken ||
      response?.token ||
      fallback ||
      ""
    );
  };


  // ==========================================================
  // RESET SIGNUP
  // ==========================================================

  const resetSignup = () => {
    setAdminName("");
    setPhone("");
    setSignupEmail("");
    setMedicalCode("");
    setSignupPassword("");
    setConfirmPassword("");
    setEmailChecking(false);
    setEmailAvailable(false);
    setEmailChecked(false);
    setEmailMessage("");
    setShowOtp(false);
    setOtp("");
    setOtpVerified(false);
    setOtpMessage("");
    setMedicalVerified(false);
    setMedicalMessage("");
    setSignupToken("");
    setResendTimer(0);
    setShowSignupPassword(false);
    setShowConfirmPassword(false);
    setShowMedicalCode(false);
  };


  // ==========================================================
  // SWITCH MODE
  // ==========================================================

  const switchMode = (newMode) => {
    clearMessages();
    setMode(newMode);

    if (newMode === "signup") {
      resetSignup();
    }
  };


  // ==========================================================
  // FCM PUSH NOTIFICATION REGISTRATION
  // ==========================================================

  const VAPID_KEY = "BAF0St3VesDY2GO8975tJrG0PkzbdzPXz1Ugm5h0NSrD5rvhr-oMy8jHTdDQgocyZEssV8MxPrQc502MKe_x7QU";

  const registerPushNotification = async () => {
    try {
      if (!("Notification" in window)) {
        return;
      }

      if (!("serviceWorker" in navigator)) {
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        return;
      }

      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

      const fcmToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (!fcmToken) {
        return;
      }

      await fetch('http://localhost:8080/api/notifications/subscribe', {
        method: 'POST',
        body: JSON.stringify({ token: fcmToken }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('FCM notification setup error:', error);
    }
  };


  // ==========================================================
  // EMAIL STATUS
  // ==========================================================

  useEffect(() => {
    if (mode !== "signup") {
      return;
    }

    const email =
      signupEmail
        .trim()
        .toLowerCase();

    setEmailChecked(false);
    setEmailAvailable(false);
    setEmailMessage("");
    setShowOtp(false);
    setOtp("");
    setOtpVerified(false);
    setOtpMessage("");
    setMedicalVerified(false);
    setMedicalMessage("");
    setMedicalCode("");
    setSignupPassword("");
    setConfirmPassword("");
    setSignupToken("");

    if (!email) {
      return;
    }

    if (!validateEmail(email)) {
      return;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      try {
        setEmailChecking(true);

        const response =
          await checkAdminEmailStatus(
            email
          );

        if (cancelled) {
          return;
        }

        setEmailChecked(true);

        const available =
          response?.available === true ||
          response?.isAvailable === true ||
          response?.exists === false ||
          response?.registered === false;

        if (!available) {
          setEmailAvailable(false);
          setEmailMessage(
            response?.message ||
            "Email already exists."
          );
          return;
        }

        setEmailAvailable(true);
        setEmailMessage(
          response?.message ||
          "Email is available."
        );
      } catch (err) {
        if (cancelled) {
          return;
        }

        setEmailChecked(true);
        setEmailAvailable(false);

        const backendMessage =
          getErrorMessage(
            err,
            ""
          );

        const lowerMessage =
          String(
            backendMessage
          ).toLowerCase();

        if (
          lowerMessage.includes("already") ||
          lowerMessage.includes("exist") ||
          lowerMessage.includes("registered")
        ) {
          setEmailMessage(
            "Email already exists."
          );
        } else {
          setEmailMessage(
            backendMessage ||
            "Unable to verify email."
          );
        }
      } finally {
        if (!cancelled) {
          setEmailChecking(false);
        }
      }
    }, 600);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [signupEmail, mode]);


  // ==========================================================
  // SEND OTP
  // ==========================================================

  const handleSendOtp = async () => {
    clearMessages();
    setOtpMessage("");

    const cleanName =
      adminName.trim();

    const cleanPhone =
      phone
        .replace(/\D/g, "")
        .trim();

    const cleanEmail =
      signupEmail
        .trim()
        .toLowerCase();

    if (!cleanName) {
      setError(
        "Please enter your full name."
      );
      return;
    }

    if (cleanName.length < 3) {
      setError(
        "Full name must contain at least 3 characters."
      );
      return;
    }

    if (!validatePhone(cleanPhone)) {
      setError(
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (!emailAvailable) {
      setError(
        "Please use an available email address."
      );
      return;
    }

    try {
      setOtpSending(true);

      const response =
        await startAdminSignup({
          adminName: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
        });

      const token =
        extractSignupToken(
          response,
          ""
        );

      if (token) {
        setSignupToken(token);
      }

      setShowOtp(true);
      setOtp("");
      setOtpVerified(false);
      setMedicalVerified(false);
      setMedicalMessage("");
      setMedicalCode("");
      setSignupPassword("");
      setConfirmPassword("");

      setOtpMessage(
        response?.message ||
        "OTP has been sent to your email."
      );

      setResendTimer(60);

      setTimeout(() => {
        otpRef.current?.focus();
      }, 100);
    } catch (err) {
      const message =
        getErrorMessage(
          err,
          "Unable to send OTP."
        );

      const lower =
        String(
          message
        ).toLowerCase();

      if (
        lower.includes("already") ||
        lower.includes("exist") ||
        lower.includes("registered")
      ) {
        setEmailAvailable(false);
        setShowOtp(false);
        setEmailMessage(
          "Email already exists."
        );
        setError(
          "Email already exists. Please use another email address."
        );
      } else {
        setError(message);
      }
    } finally {
      setOtpSending(false);
    }
  };


  // ==========================================================
  // VERIFY OTP
  // ==========================================================

  const handleVerifyOtp = async () => {
    clearMessages();

    const cleanEmail =
      signupEmail
        .trim()
        .toLowerCase();

    const cleanOtp =
      otp.trim();

    if (!validateEmail(cleanEmail)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (!cleanOtp) {
      setError(
        "Please enter the OTP."
      );
      return;
    }

    if (!/^[0-9]{4,8}$/.test(cleanOtp)) {
      setError(
        "Please enter a valid OTP."
      );
      return;
    }

    try {
      setOtpVerifying(true);

      const response =
        await verifyAdminSignupOtp({
          email: cleanEmail,
          otp: cleanOtp,
        });

      const token =
        extractSignupToken(
          response,
          signupToken
        );

      if (!token) {
        throw new Error(
          "Signup verification token was not received from the server."
        );
      }

      setSignupToken(token);
      setOtpVerified(true);

      setOtpMessage(
        response?.message ||
        "Email verified successfully."
      );

      setSuccess(
        "Email verification completed."
      );
    } catch (err) {
      setOtpVerified(false);
      setError(
        getErrorMessage(
          err,
          "Invalid or expired OTP."
        )
      );
    } finally {
      setOtpVerifying(false);
    }
  };


  // ==========================================================
  // RESEND OTP
  // ==========================================================

  const handleResendOtp = async () => {
    if (resendTimer > 0) {
      return;
    }

    clearMessages();

    const cleanEmail =
      signupEmail
        .trim()
        .toLowerCase();

    if (!validateEmail(cleanEmail)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setResendLoading(true);

      const response =
        await resendAdminSignupOtp(
          cleanEmail
        );

      const token =
        extractSignupToken(
          response,
          signupToken
        );

      if (token) {
        setSignupToken(token);
      }

      setOtp("");
      setOtpVerified(false);
      setMedicalVerified(false);
      setMedicalMessage("");
      setMedicalCode("");
      setSignupPassword("");
      setConfirmPassword("");

      setOtpMessage(
        response?.message ||
        "A new OTP has been sent."
      );

      setResendTimer(60);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to resend OTP."
        )
      );
    } finally {
      setResendLoading(false);
    }
  };


  // ==========================================================
  // VERIFY MEDICAL ACCESS CODE
  // ==========================================================

  const handleMedicalVerification = async () => {
    clearMessages();
    setMedicalMessage("");

    if (!otpVerified) {
      setError(
        "Please verify your email OTP first."
      );
      return;
    }

    if (!signupToken) {
      setError(
        "Signup verification expired. Please verify OTP again."
      );
      return;
    }

    const cleanCode =
      medicalCode.trim();

    if (!cleanCode) {
      setError(
        "Please enter the medical access code."
      );
      return;
    }

    try {
      setMedicalLoading(true);

      const response =
        await verifyAdminSignupSecret({
          signupToken,
          secretCode: cleanCode,
        });

      const token =
        extractSignupToken(
          response,
          signupToken
        );

      if (!token) {
        throw new Error(
          "Signup verification token was not received from the server."
        );
      }

      setSignupToken(token);
      setMedicalVerified(true);

      setMedicalMessage(
        response?.message ||
        "Medical access verified."
      );

      setSuccess(
        "Medical access verified successfully."
      );
    } catch (err) {
      setMedicalVerified(false);
      setError(
        getErrorMessage(
          err,
          "Invalid medical access code."
        )
      );
    } finally {
      setMedicalLoading(false);
    }
  };


  // ==========================================================
  // COMPLETE ADMIN SIGNUP (Spring Boot Backend Only)
  // ==========================================================

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    clearMessages();

    const cleanName =
      adminName.trim();

    const cleanPhone =
      phone
        .replace(/\D/g, "")
        .trim();

    const cleanEmail =
      signupEmail
        .trim()
        .toLowerCase();

    if (!cleanName) {
      setError("Full name is required.");
      return;
    }

    if (!validatePhone(cleanPhone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!emailAvailable || !otpVerified || !medicalVerified) {
      setError("Please complete all verification steps.");
      return;
    }

    if (signupPassword.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (signupPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response =
        await completeAdminSignup({
          signupToken,
          password: signupPassword,
          confirmPassword,
        });

      setSuccess(response?.message || "Admin account created successfully.");

      resetSignup();

      setTimeout(() => {
        setMode("login");
        setLoginEmail(cleanEmail);
      }, 1200);

    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Unable to create admin account."
        )
      );
    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // LOGIN (Spring Boot Backend Only)
  // ==========================================================

  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessages();

    const cleanEmail =
      loginEmail
        .trim()
        .toLowerCase();

    if (!cleanEmail || !validateEmail(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!loginPassword) {
      setError("Password is required.");
      return;
    }

    try {
      setLoading(true);

      const response =
        await postData(
          API.ADMIN_LOGIN,
          {
            email: cleanEmail,
            password: loginPassword,
          }
        );

      if (!response) {
        throw new Error("Invalid server response.");
      }

      const token =
        response?.token ||
        response?.accessToken ||
        response?.jwt;

      if (!token) {
        throw new Error(
          response?.message ||
          "Authentication token was not received."
        );
      }

      const role =
        response?.role ||
        response?.user?.role ||
        response?.admin?.role ||
        "ADMIN";

      if (
        String(role).toUpperCase() !==
        "ADMIN"
      ) {
        throw new Error(
          "You are not authorized to access the admin portal."
        );
      }

      saveAuth({
        ...response,
        token,
        email: response?.email || cleanEmail,
        role,
        rememberMe,
      });

      registerPushNotification();

      setSuccess(
        "Login successful. Redirecting..."
      );

      setTimeout(() => {
        navigate(
          from,
          {
            replace: true,
          }
        );
      }, 500);

    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Invalid email or password."
        )
      );
    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // THEME CLASSES & HIGH-CONTRAST INPUT STYLING
  // ==========================================================

  const cardBackground =
    isDark
      ? "bg-[#0d1b2a]/95 border border-white/[0.1] backdrop-blur-[4px]"
      : "bg-white/95 border border-slate-200 backdrop-blur-[4px]";

  const primaryText =
    isDark
      ? "text-white"
      : "text-slate-900";

  // DARK FOOTER & SUBTITLE TEXT FOR HIGH VISIBILITY
  const secondaryText =
    isDark
      ? "text-slate-200 font-bold"
      : "text-slate-900 font-extrabold";

  const inputClass = `
    w-full
    h-[46px]
    sm:h-[48px]
    rounded-xl
    border
    px-4
    text-sm
    font-semibold
    outline-none
    transition-all
    ${
      isDark
        ? `
          border-white/20
          bg-slate-900/90
          text-white
          placeholder:text-slate-400
          focus:border-cyan-400
          focus:bg-slate-900
          focus:ring-2
          focus:ring-cyan-400/30
        `
        : `
          border-slate-300
          bg-white
          text-slate-900
          placeholder:text-slate-400
          focus:border-indigo-600
          focus:bg-white
          focus:ring-2
          focus:ring-indigo-600/20
        `
    }
    disabled:opacity-60
  `;

  const modeSwitchClass =
    isDark
      ? "bg-white/[0.08]"
      : "bg-slate-100";

  const inactiveModeClass =
    isDark
      ? "text-slate-300 hover:text-white font-medium"
      : "text-slate-600 font-medium";

  const activeModeClass =
    isDark
      ? "bg-white/[0.15] text-cyan-300 shadow-sm font-bold"
      : "bg-white text-indigo-700 shadow-sm font-bold";


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div
      className="
        h-screen
        w-screen
        fixed
        inset-0
        overflow-hidden
        flex
        items-center
        justify-center
        p-3
        sm:p-6
        transition-colors
        duration-300
      "
      style={{
        backgroundImage: `url('/images/Back1.jpg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >

      {/* OVERLAY */}
      <div
        className={`
          absolute
          inset-0
          pointer-events-none
          transition-colors
          duration-300
          ${
            isDark
              ? "bg-[#06111f]/65 backdrop-blur-[0.5px]"
              : "bg-slate-900/25 backdrop-blur-[0.5px]"
          }
        `}
      />


      {/* APP CONTAINER */}

      <div
        className="
          relative
          z-10
          w-full
          max-w-[430px]
          mx-auto
          my-auto
          flex
          flex-col
          items-center
          justify-center
        "
      >

        {/* BRAND */}

        <div
          className="
            flex
            justify-center
            mb-2.5
            sm:mb-3.5
          "
        >

          <div
            className={`
              inline-flex
              items-center
              gap-2.5
              rounded-2xl
              border
              backdrop-blur-xl
              px-3.5
              py-2
              sm:px-4
              sm:py-2.5
              ${
                isDark
                  ? "border-white/15 bg-white/[0.1] shadow-lg"
                  : "border-slate-200 bg-white/95 shadow-md"
              }
            `}
          >

            <div
              className="
                flex
                h-8
                w-8
                sm:h-9
                sm:w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-gradient-to-br
                from-cyan-400
                via-blue-500
                to-indigo-600
                text-white
                shadow-md
              "
            >
              <Stethoscope size={18} />
            </div>

            <div>

              <div
                className={`
                  text-[15px]
                  sm:text-[17px]
                  font-black
                  tracking-tight
                  ${primaryText}
                `}
              >
                Wellborn

                <span className="text-cyan-500">
                  {" "}Physio
                </span>

              </div>

              <div
                className={`
                  text-[7px]
                  sm:text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.22em]
                  ${secondaryText}
                `}
              >
                Admin Portal
              </div>

            </div>

          </div>

        </div>


        {/* CARD */}

        <div
          className={`
            w-full
            overflow-hidden
            rounded-[24px]
            ${cardBackground}
            shadow-[0_25px_70px_rgba(0,0,0,.45)]
            transition-colors
            duration-300
          `}
        >

          <div
            className="
              h-1
              bg-gradient-to-r
              from-cyan-400
              via-blue-500
              to-indigo-600
            "
          />


          {/* MODE SWITCH */}

          <div
            className="
              px-3.5
              pt-3.5
              sm:px-5
              sm:pt-4
            "
          >

            <div
              className={`
                flex
                rounded-xl
                p-1
                ${modeSwitchClass}
              `}
            >

              <button
                type="button"
                onClick={() =>
                  switchMode("login")
                }
                className={`
                  flex-1
                  rounded-lg
                  py-2
                  text-xs
                  transition-all
                  ${
                    mode === "login"
                      ? activeModeClass
                      : inactiveModeClass
                  }
                `}
              >
                Admin Login
              </button>

              <button
                type="button"
                onClick={() =>
                  switchMode("signup")
                }
                className={`
                  flex-1
                  rounded-lg
                  py-2
                  text-xs
                  transition-all
                  ${
                    mode === "signup"
                      ? activeModeClass
                      : inactiveModeClass
                  }
                `}
              >
                Create Admin
              </button>

            </div>

          </div>


          {/* CONTENT */}

          <div
            className="
              px-3.5
              pb-4
              pt-3.5
              sm:px-6
              sm:pb-5
              sm:pt-4
            "
          >

            {/* TITLE */}

            <div className="mb-3">

              <h1
                className={`
                  text-xl
                  sm:text-2xl
                  font-black
                  tracking-tight
                  ${primaryText}
                `}
              >
                {mode === "login"
                  ? "Admin Login"
                  : "Create Admin Account"}
              </h1>

              <p
                className={`
                  mt-0.5
                  text-xs
                  font-medium
                  leading-relaxed
                  ${secondaryText}
                `}
              >
                {mode === "login"
                  ? "Sign in to your Wellborn Physio dashboard."
                  : "Complete email, OTP and medical verification to create your admin account."}
              </p>

            </div>


            {/* ERROR */}

            {error && (

              <div
                className="
                  mb-3
                  flex
                  items-start
                  gap-2
                  rounded-xl
                  border
                  border-red-200
                  bg-red-50
                  px-3
                  py-2
                  text-xs
                  font-bold
                  text-red-700
                "
              >
                <AlertCircle
                  size={16}
                  className="mt-0.5 shrink-0 text-red-600"
                />

                <span>
                  {error}
                </span>

              </div>

            )}


            {/* SUCCESS */}

            {success && (

              <div
                className="
                  mb-3
                  flex
                  items-start
                  gap-2
                  rounded-xl
                  border
                  border-emerald-200
                  bg-emerald-50
                  px-3
                  py-2
                  text-xs
                  font-bold
                  text-emerald-800
                "
              >
                <CheckCircle2
                  size={16}
                  className="mt-0.5 shrink-0 text-emerald-600"
                />

                <span>
                  {success}
                </span>

              </div>

            )}


            {/* ==================================================
                LOGIN
            ================================================== */}

            {mode === "login" ? (

              <form
                onSubmit={handleLogin}
                className="space-y-3"
              >

                {/* EMAIL */}

                <div className="relative">

                  <Mail
                    size={18}
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-cyan-500
                    "
                  />

                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(
                        e.target.value
                      );
                      clearMessages();
                    }}
                    placeholder="Admin email address"
                    autoComplete="username"
                    disabled={loading}
                    className={`
                      ${inputClass}
                      pl-11
                    `}
                  />

                </div>


                {/* PASSWORD */}

                <div className="relative">

                  <Lock
                    size={18}
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-cyan-500
                    "
                  />

                  <input
                    type={
                      showLoginPassword
                        ? "text"
                        : "password"
                    }
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(
                        e.target.value
                      );
                      clearMessages();
                    }}
                    placeholder="Password"
                    autoComplete="current-password"
                    disabled={loading}
                    className={`
                      ${inputClass}
                      pl-11
                      pr-11
                    `}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowLoginPassword(
                        (previous) =>
                          !previous
                      )
                    }
                    className="
                      absolute
                      right-3
                      top-1/2
                      -translate-y-1/2
                      rounded-lg
                      p-1.5
                      text-slate-400
                      hover:text-cyan-400
                    "
                  >
                    {showLoginPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>

                </div>


                {/* REMEMBER / FORGOT */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    px-0.5
                    pt-0.5
                  "
                >

                  <label
                    className="
                      flex
                      items-center
                      gap-2
                      cursor-pointer
                      select-none
                    "
                  >
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) =>
                        setRememberMe(
                          e.target.checked
                        )
                      }
                      disabled={loading}
                      className="
                        h-4
                        w-4
                        cursor-pointer
                        rounded
                        border-slate-300
                        accent-cyan-500
                      "
                    />

                    <span
                      className={`
                        text-xs
                        font-bold
                        ${secondaryText}
                      `}
                    >
                      Remember me
                    </span>

                  </label>


                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      navigate(
                        "/admin/forgot-password"
                      )
                    }
                    className="
                      text-xs
                      font-extrabold
                      text-cyan-400
                      hover:underline
                    "
                  >
                    Forgot Password?
                  </button>

                </div>


                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    mt-1
                    flex
                    h-[48px]
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-indigo-600
                    via-blue-600
                    to-cyan-500
                    text-sm
                    font-extrabold
                    text-white
                    shadow-md
                    transition
                    hover:-translate-y-0.5
                    disabled:opacity-60
                  "
                >

                  {loading ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={18} />
                    </>
                  )}

                </button>

              </form>

            ) : (

              /* ==================================================
                  SIGNUP FORM
              ================================================== */

              <form
                onSubmit={handleCreateAdmin}
                className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1"
              >

                {/* NAME */}

                <div className="relative">

                  <User
                    size={18}
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-cyan-500
                    "
                  />

                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) =>
                      setAdminName(
                        e.target.value
                      )
                    }
                    placeholder="Full name"
                    disabled={loading}
                    className={`
                      ${inputClass}
                      pl-11
                    `}
                  />

                </div>


                {/* PHONE */}

                <div className="relative">

                  <Phone
                    size={18}
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-cyan-500
                    "
                  />

                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10)
                      )
                    }
                    placeholder="Mobile number"
                    disabled={loading}
                    className={`
                      ${inputClass}
                      pl-11
                    `}
                  />

                </div>


                {/* EMAIL */}

                <div>

                  <div className="relative">

                    <Mail
                      size={18}
                      className="
                        absolute
                        left-3.5
                        top-1/2
                        -translate-y-1/2
                        text-cyan-500
                      "
                    />

                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) =>
                        setSignupEmail(
                          e.target.value
                        )
                      }
                      placeholder="Gmail address"
                      disabled={loading}
                      className={`
                        ${inputClass}
                        pl-11
                        pr-11
                      `}
                    />


                    {emailChecking && (

                      <Loader2
                        size={17}
                        className="
                          absolute
                          right-3.5
                          top-1/2
                          -translate-y-1/2
                          animate-spin
                          text-cyan-400
                        "
                      />

                    )}


                    {!emailChecking &&
                      emailChecked &&
                      emailAvailable && (

                        <CheckCircle2
                          size={18}
                          className="
                            absolute
                            right-3.5
                            top-1/2
                            -translate-y-1/2
                            text-emerald-500
                          "
                        />

                      )}


                    {!emailChecking &&
                      emailChecked &&
                      !emailAvailable && (

                        <AlertCircle
                          size={18}
                          className="
                            absolute
                            right-3.5
                            top-1/2
                            -translate-y-1/2
                            text-red-500
                          "
                        />

                      )}

                  </div>

                  {signupEmail &&
                    validateEmail(signupEmail) &&
                    emailMessage && (

                    <div
                      className={`
                        mt-1
                        px-1
                        text-xs
                        font-bold
                        ${
                          emailAvailable
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      `}
                    >
                      {emailMessage}
                    </div>

                  )}

                </div>


                {/* ==================================================
                    OTP SECTION
                ================================================== */}

                {emailAvailable && (

                  <div
                    className={`
                      rounded-xl
                      border
                      p-3
                      ${
                        isDark
                          ? "border-cyan-500/30 bg-cyan-950/20"
                          : "border-indigo-200 bg-indigo-50/70"
                      }
                    `}
                  >

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-2
                        mb-2
                      "
                    >

                      <div>
                        <div className={`text-xs font-black ${isDark ? "text-cyan-300" : "text-indigo-800"}`}>
                          Email Verification
                        </div>
                        <div className={`text-[10px] font-semibold ${secondaryText}`}>
                          OTP sent to your email.
                        </div>
                      </div>

                      {otpVerified && (
                        <div className="flex items-center gap-1 text-xs font-bold text-emerald-500">
                          <CheckCircle2 size={15} />
                          Verified
                        </div>
                      )}

                    </div>


                    {!showOtp ? (

                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpSending}
                        className="
                          flex
                          h-10
                          w-full
                          items-center
                          justify-center
                          gap-2
                          rounded-lg
                          bg-indigo-600
                          text-xs
                          font-extrabold
                          text-white
                          disabled:opacity-60
                        "
                      >
                        {otpSending ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
                        Send OTP
                      </button>

                    ) : (

                      <>

                        <div className="relative">
                          <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400" />
                          <input
                            ref={otpRef}
                            type="text"
                            maxLength={8}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                            placeholder="Enter OTP"
                            disabled={otpVerified || otpVerifying}
                            className={`w-full h-[40px] rounded-lg border px-3 pl-11 text-sm font-black tracking-widest ${isDark ? 'bg-slate-900 text-white border-white/20' : 'bg-white text-slate-900 border-slate-300'}`}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={otpVerifying || otpVerified}
                          className="mt-2 flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-xs font-extrabold text-white disabled:opacity-60"
                        >
                          {otpVerifying ? "Verifying..." : otpVerified ? "Verified" : "Verify OTP"}
                        </button>

                        <div className="mt-2 flex items-center justify-between text-xs font-bold">
                          <span className={secondaryText}>{otpMessage}</span>
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={resendTimer > 0}
                            className="text-cyan-400 disabled:text-slate-500"
                          >
                            {resendTimer > 0 ? `Resend ${resendTimer}s` : "Resend OTP"}
                          </button>
                        </div>

                      </>

                    )}

                  </div>

                )}


                {/* MEDICAL ACCESS CODE */}

                <div className="relative">

                  <KeyRound
                    size={18}
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-cyan-500
                    "
                  />

                  <input
                    type="password"
                    value={medicalCode}
                    onChange={(e) =>
                      setMedicalCode(
                        e.target.value
                      )
                    }
                    placeholder="Medical access code"
                    disabled={
                      !otpVerified ||
                      medicalVerified
                    }
                    className={`
                      ${inputClass}
                      pl-11
                      pr-11
                      ${
                        !otpVerified
                          ? "opacity-50"
                          : ""
                      }
                    `}
                  />

                  {otpVerified &&
                    !medicalVerified && (

                    <button
                      type="button"
                      onClick={
                        handleMedicalVerification
                      }
                      disabled={medicalLoading}
                      className="
                        mt-2
                        w-full
                        h-9
                        rounded-lg
                        bg-cyan-500/20
                        text-cyan-300
                        text-xs
                        font-extrabold
                        border
                        border-cyan-500/30
                      "
                    >
                      {medicalLoading ? "Verifying Code..." : "Verify Medical Access"}
                    </button>

                  )}

                  {medicalVerified && (
                    <div className="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-500">
                      <CheckCircle2 size={14} /> Medical access verified
                    </div>
                  )}

                </div>


                {/* CREATE PASSWORD */}

                <div className="relative">

                  <Lock
                    size={18}
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-cyan-500
                    "
                  />

                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) =>
                      setSignupPassword(
                        e.target.value
                      )
                    }
                    placeholder="Create password"
                    disabled={!medicalVerified}
                    className={`
                      ${inputClass}
                      pl-11
                      ${
                        !medicalVerified
                          ? "opacity-50"
                          : ""
                      }
                    `}
                  />

                </div>


                {/* CONFIRM PASSWORD */}

                <div className="relative">

                  <Lock
                    size={18}
                    className="
                      absolute
                      left-3.5
                      top-1/2
                      -translate-y-1/2
                      text-cyan-500
                    "
                  />

                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) =>
                      setConfirmPassword(
                        e.target.value
                      )
                    }
                    placeholder="Confirm password"
                    disabled={!medicalVerified}
                    className={`
                      ${inputClass}
                      pl-11
                      ${
                        !medicalVerified
                          ? "opacity-50"
                          : ""
                      }
                    `}
                  />

                </div>


                {/* CREATE ACCOUNT BUTTON */}

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !medicalVerified
                  }
                  className="
                    mt-2
                    flex
                    h-[48px]
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-gradient-to-r
                    from-indigo-600
                    to-cyan-500
                    text-xs
                    sm:text-sm
                    font-extrabold
                    text-white
                    shadow-md
                    disabled:opacity-50
                  "
                >
                  {loading ? "Creating Account..." : "Create Admin Account"}
                </button>

              </form>

            )}

          </div>

        </div>


        {/* FOOTER */}

        <div
          className={`
            mt-2.5
            text-center
            text-[11px]
            uppercase
            tracking-[0.15em]
            ${secondaryText}
          `}
        >
        Admin Access • Wellborn Physio
        </div>

      </div>

    </div>

  );

}