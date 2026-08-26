import React, { useEffect, useState } from "react";
import {
  LockKeyhole,
  Eye,
  EyeOff,
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  confirmAdminPasswordReset,
} from "../../services/api";

const css = `
/* ============================================================
   WELLBORN ADMIN RESET PASSWORD
   BACKGROUND IMAGE
   NO BLUR
   RESPONSIVE
   EXISTING UI PRESERVED
   ============================================================ */

.admin-reset-page {
  min-height: 100vh;
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;
  box-sizing: border-box;

  position: relative;
  overflow: hidden;

  /*
     BACKGROUND IMAGE
     Make sure this file exists:
     public/images/Back1.jpg
  */
  background-image:
    linear-gradient(
      rgba(255,255,255,.48),
      rgba(255,255,255,.48)
    ),
    url("/images/Back1.jpg");

  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  color: #1e293b;
}

/* ============================================================
   CARD
   ============================================================ */

.admin-reset-card {
  width: 100%;
  max-width: 410px;

  padding: 35px 30px;

  box-sizing: border-box;

  border-radius: 26px;

  /*
     Slightly transparent so Back1.jpg remains visible.
     NO backdrop-filter / NO BLUR.
  */
  background: rgba(255,255,255,.88);

  border: 1px solid rgba(255,255,255,.92);

  box-shadow:
    0 25px 70px rgba(30,64,175,.20),
    0 5px 18px rgba(15,23,42,.08);

  position: relative;
  z-index: 1;
}

/* ============================================================
   LOGO
   ============================================================ */

.admin-reset-logo {
  width: 76px;
  height: 76px;

  display: block;

  margin: 0 auto;

  object-fit: cover;

  border-radius: 50%;

  border: 3px solid white;

  box-shadow:
    0 8px 25px rgba(0,0,0,.18);
}

/* ============================================================
   TITLE
   ============================================================ */

.admin-reset-title {
  margin: 17px 0 7px;

  text-align: center;

  color: #1e3a8a;

  font-size: 27px;

  font-weight: 750;
}

/* ============================================================
   SUBTITLE
   ============================================================ */

.admin-reset-subtitle {
  margin: 0 auto 22px;

  max-width: 330px;

  text-align: center;

  color: #64748b;

  font-size: 13px;

  line-height: 1.6;
}

/* ============================================================
   EMAIL
   ============================================================ */

.admin-reset-email {
  margin-bottom: 18px;

  padding: 11px 14px;

  border-radius: 11px;

  background: #eff6ff;

  border: 1px solid #bfdbfe;

  text-align: center;

  color: #64748b;

  font-size: 12px;
}

.admin-reset-email strong {
  display: block;

  margin-top: 3px;

  color: #1e40af;

  font-size: 13px;

  word-break: break-word;
}

/* ============================================================
   MESSAGE
   ============================================================ */

.admin-reset-message {
  margin-bottom: 15px;

  padding: 11px 13px;

  border-radius: 11px;

  font-size: 13px;

  display: flex;

  align-items: flex-start;

  gap: 8px;

  line-height: 1.45;
}

.admin-reset-error {
  color: #dc2626;

  background: #fef2f2;

  border: 1px solid #fecaca;
}

.admin-reset-success {
  color: #047857;

  background: #ecfdf5;

  border: 1px solid #a7f3d0;
}

/* ============================================================
   INPUT
   ============================================================ */

.admin-reset-input {
  position: relative;

  margin-top: 15px;
}

.admin-reset-input-icon {
  position: absolute;

  left: 15px;

  top: 50%;

  transform: translateY(-50%);

  color: #2563eb;

  pointer-events: none;
}

.admin-reset-input input {
  width: 100%;

  height: 50px;

  padding: 0 45px;

  box-sizing: border-box;

  border-radius: 13px;

  border: 1px solid #bfdbfe;

  outline: none;

  background: white;

  color: #1e293b;

  font-size: 14px;

  transition: .2s ease;
}

.admin-reset-input input:focus {
  border-color: #0ea5e9;

  box-shadow:
    0 0 0 3px rgba(14,165,233,.13);
}

/* ============================================================
   EYE
   ============================================================ */

.admin-reset-eye {
  position: absolute;

  right: 11px;

  top: 50%;

  transform: translateY(-50%);

  width: 34px;
  height: 34px;

  display: flex;

  align-items: center;
  justify-content: center;

  border: 0;

  background: transparent;

  color: #64748b;

  cursor: pointer;
}

.admin-reset-eye:hover {
  color: #2563eb;
}

/* ============================================================
   PASSWORD RULES
   ============================================================ */

.admin-reset-rules {
  margin-top: 15px;

  padding: 12px 13px;

  border-radius: 11px;

  background: #f8fafc;

  border: 1px solid #e2e8f0;
}

.admin-reset-rules-title {
  margin-bottom: 7px;

  color: #334155;

  font-size: 12px;

  font-weight: 700;
}

.admin-reset-rule {
  display: flex;

  align-items: center;

  gap: 6px;

  margin-top: 5px;

  color: #94a3b8;

  font-size: 11px;
}

.admin-reset-rule.valid {
  color: #059669;
}

/* ============================================================
   RESET BUTTON
   ============================================================ */

.admin-reset-button {
  width: 100%;

  height: 50px;

  margin-top: 20px;

  border: 0;

  border-radius: 13px;

  background:
    linear-gradient(
      135deg,
      #2563eb,
      #1d4ed8
    );

  color: white;

  font-size: 15px;

  font-weight: 700;

  cursor: pointer;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 8px;

  transition: .25s ease;
}

.admin-reset-button:hover:not(:disabled) {
  transform: translateY(-2px);

  box-shadow:
    0 12px 25px rgba(37,99,235,.25);
}

.admin-reset-button:disabled {
  opacity: .65;

  cursor: not-allowed;
}

/* ============================================================
   BACK
   ============================================================ */

.admin-reset-back {
  margin-top: 21px;

  text-align: center;

  color: #475569;

  font-size: 13px;

  display: flex;

  justify-content: center;

  align-items: center;

  gap: 5px;
}

.admin-reset-back span {
  color: #2563eb;

  font-weight: 650;

  cursor: pointer;
}

.admin-reset-back span:hover {
  text-decoration: underline;
}

/* ============================================================
   TABLET
   ============================================================ */

@media (max-width: 768px) {

  .admin-reset-page {
    padding: 18px;
    background-position: center;
  }

  .admin-reset-card {
    max-width: 390px;
  }
}

/* ============================================================
   MOBILE
   ============================================================ */

@media (max-width: 480px) {

  .admin-reset-page {
    min-height: 100dvh;

    padding: 15px;

    /*
       Keep image clearly visible on mobile
    */
    background-position: center center;
  }

  .admin-reset-card {
    width: 100%;

    max-width: 350px;

    padding: 30px 21px;

    border-radius: 22px;

    background: rgba(255,255,255,.90);
  }

  .admin-reset-logo {
    width: 68px;
    height: 68px;
  }

  .admin-reset-title {
    font-size: 24px;
  }

  .admin-reset-subtitle {
    font-size: 12px;

    margin-bottom: 18px;
  }

  .admin-reset-input input {
    height: 47px;

    font-size: 13px;
  }

  .admin-reset-button {
    height: 47px;

    font-size: 14px;
  }

  .admin-reset-message {
    font-size: 12px;
  }
}

/* ============================================================
   VERY SMALL MOBILE
   ============================================================ */

@media (max-width: 360px) {

  .admin-reset-page {
    padding: 10px;
  }

  .admin-reset-card {
    max-width: 335px;

    padding: 25px 16px;

    border-radius: 19px;
  }

  .admin-reset-logo {
    width: 62px;
    height: 62px;
  }

  .admin-reset-title {
    font-size: 21px;
  }

  .admin-reset-subtitle {
    font-size: 11px;
  }

  .admin-reset-input input {
    height: 44px;

    padding-left: 42px;
    padding-right: 42px;
  }

  .admin-reset-rules {
    padding: 10px 11px;
  }

  .admin-reset-button {
    height: 44px;

    font-size: 13px;
  }

  .admin-reset-back {
    font-size: 11px;
  }
}
`;

export default function Admin_reset_password() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // PAGE STYLE
  // ============================================================

  useEffect(() => {

    document.title =
      "Create New Password | Wellborn Physio";

    const style = document.createElement("style");

    style.setAttribute(
      "data-page",
      "admin-reset-password"
    );

    style.textContent = css;

    document.head.appendChild(style);

    return () => {

      const oldStyle =
        document.querySelector(
          'style[data-page="admin-reset-password"]'
        );

      if (oldStyle) {
        oldStyle.remove();
      }

    };

  }, []);

  // ============================================================
  // LOAD RESET SESSION
  // ============================================================

  useEffect(() => {

    const savedEmail =
      sessionStorage.getItem("resetEmail");

    const savedToken =
      sessionStorage.getItem("resetToken");

    if (savedEmail) {
      setEmail(savedEmail);
    }

    if (savedToken) {
      setResetToken(savedToken);
    }

  }, []);

  // ============================================================
  // ERROR MESSAGE
  // ============================================================

  const getErrorMessage = (err, fallback) => {

    return (
      err?.data?.message ||
      err?.data?.error ||
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      (
        typeof err?.data === "string"
          ? err.data
          : null
      ) ||
      (
        typeof err?.response?.data === "string"
          ? err.response.data
          : null
      ) ||
      err?.message ||
      fallback
    );

  };

  // ============================================================
  // PASSWORD RULES
  // ============================================================

  const hasMinLength =
    password.length >= 8;

  const hasUppercase =
    /[A-Z]/.test(password);

  const hasLowercase =
    /[a-z]/.test(password);

  const hasNumber =
    /[0-9]/.test(password);

  const passwordsMatch =
    password.length > 0 &&
    password === confirmPassword;

  const passwordValid =
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber;

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail =
      email.trim().toLowerCase();

    const cleanToken =
      resetToken.trim();

    if (!cleanEmail || !cleanToken) {

      setError(
        "Reset session is missing or expired. Please request a new OTP."
      );

      return;
    }

    if (!password) {

      setError(
        "Please enter your new password."
      );

      return;
    }

    if (!passwordValid) {

      setError(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number."
      );

      return;
    }

    if (!confirmPassword) {

      setError(
        "Please confirm your new password."
      );

      return;
    }

    if (password !== confirmPassword) {

      setError(
        "New password and confirm password must match."
      );

      return;
    }

    try {

      setLoading(true);

      const response =
        await confirmAdminPasswordReset({
          email: cleanEmail,
          resetToken: cleanToken,
          password,
          confirmPassword,
        });

      console.log(
        "Admin Password Reset Response:",
        response
      );

      setSuccess(
        response?.message ||
        "Password reset successfully. Redirecting to login..."
      );

      setPassword("");
      setConfirmPassword("");

      sessionStorage.removeItem(
        "resetToken"
      );

      sessionStorage.removeItem(
        "resetEmail"
      );

      setTimeout(() => {

        navigate("/admin/login", {
          replace: true,
        });

      }, 1800);

    } catch (err) {

      console.error(
        "Admin Password Reset Error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to reset password. Please try again."
        )
      );

    } finally {

      setLoading(false);

    }

  };

  // ============================================================
  // BACK
  // ============================================================

  const handleBack = () => {

    navigate("/admin/forgot-password");

  };

  // ============================================================
  // UI
  // ============================================================

  return (

    <div className="admin-reset-page">

      <div className="admin-reset-card">

        <img
          src="/assets/wellborn physio.jpg"
          alt="Wellborn Physio"
          className="admin-reset-logo"
        />

        <h1 className="admin-reset-title">
          Create New Password
        </h1>

        <p className="admin-reset-subtitle">
          Create a strong new password for your
          Wellborn Physio admin account.
        </p>

        {/* EMAIL */}

        {email && (

          <div className="admin-reset-email">

            Resetting password for

            <strong>
              {email}
            </strong>

          </div>

        )}

        {/* ERROR */}

        {error && (

          <div className="admin-reset-message admin-reset-error">

            <CircleAlert size={18} />

            <span>
              {error}
            </span>

          </div>

        )}

        {/* SUCCESS */}

        {success && (

          <div className="admin-reset-message admin-reset-success">

            <CheckCircle2 size={18} />

            <span>
              {success}
            </span>

          </div>

        )}

        <form onSubmit={handleSubmit}>

          {/* NEW PASSWORD */}

          <div className="admin-reset-input">

            <LockKeyhole
              size={18}
              className="admin-reset-input-icon"
            />

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="New Password"
              value={password}
              onChange={(e) => {

                setPassword(
                  e.target.value
                );

                setError("");
                setSuccess("");

              }}
              autoComplete="new-password"
              maxLength={72}
              disabled={
                loading ||
                !!success
              }
            />

            <button
              type="button"
              className="admin-reset-eye"
              onClick={() =>
                setShowPassword(
                  (previous) =>
                    !previous
                )
              }
              aria-label="Toggle password visibility"
            >

              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}

            </button>

          </div>

          {/* CONFIRM PASSWORD */}

          <div className="admin-reset-input">

            <LockKeyhole
              size={18}
              className="admin-reset-input-icon"
            />

            <input
              type={
                showConfirm
                  ? "text"
                  : "password"
              }
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => {

                setConfirmPassword(
                  e.target.value
                );

                setError("");
                setSuccess("");

              }}
              autoComplete="new-password"
              maxLength={72}
              disabled={
                loading ||
                !!success
              }
            />

            <button
              type="button"
              className="admin-reset-eye"
              onClick={() =>
                setShowConfirm(
                  (previous) =>
                    !previous
                )
              }
              aria-label="Toggle confirm password visibility"
            >

              {showConfirm ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}

            </button>

          </div>

          {/* PASSWORD RULES */}

          <div className="admin-reset-rules">

            <div className="admin-reset-rules-title">
              Password requirements
            </div>

            <div
              className={`admin-reset-rule ${
                hasMinLength
                  ? "valid"
                  : ""
              }`}
            >
              {hasMinLength ? "✓" : "•"}
              At least 8 characters
            </div>

            <div
              className={`admin-reset-rule ${
                hasUppercase
                  ? "valid"
                  : ""
              }`}
            >
              {hasUppercase ? "✓" : "•"}
              One uppercase letter
            </div>

            <div
              className={`admin-reset-rule ${
                hasLowercase
                  ? "valid"
                  : ""
              }`}
            >
              {hasLowercase ? "✓" : "•"}
              One lowercase letter
            </div>

            <div
              className={`admin-reset-rule ${
                hasNumber
                  ? "valid"
                  : ""
              }`}
            >
              {hasNumber ? "✓" : "•"}
              One number
            </div>

            <div
              className={`admin-reset-rule ${
                passwordsMatch
                  ? "valid"
                  : ""
              }`}
            >
              {passwordsMatch ? "✓" : "•"}
              Passwords must match
            </div>

          </div>

          {/* RESET BUTTON */}

          <button
            type="submit"
            className="admin-reset-button"
            disabled={
              loading ||
              !!success ||
              !resetToken
            }
          >

            {loading ? (

              <>
                <Loader2
                  size={18}
                  className="admin-reset-spin"
                />

                Resetting Password...
              </>

            ) : (

              <>
                <ShieldCheck size={18} />

                Reset Password
              </>

            )}

          </button>

        </form>

        {/* BACK */}

        <div className="admin-reset-back">

          <ArrowLeft size={14} />

          <span onClick={handleBack}>
            Back to Forgot Password
          </span>

        </div>

      </div>

    </div>

  );
}