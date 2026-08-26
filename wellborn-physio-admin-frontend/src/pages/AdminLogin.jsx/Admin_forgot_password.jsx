import React, { useEffect, useState } from "react";
import {
  Mail,
  ShieldCheck,
  ArrowLeft,
  Send,
  CheckCircle2,
  CircleAlert,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API, postData } from "../../services/api";

const css = `
/* ============================================================
   WELLBORN ADMIN FORGOT PASSWORD
   ============================================================ */

.admin-forgot-page {
  min-height: 100vh;
  width: 100%;
  padding: 16px;
  box-sizing: border-box;

  display: flex;
  align-items: center;
  justify-content: center;

  /* BACKGROUND IMAGE */
  background-image:
    linear-gradient(
      rgba(255,255,255,.18),
      rgba(255,255,255,.18)
    ),
    url("/images/Back1.jpg");

  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  color: #1e293b;

  position: relative;
}

/* ============================================================
   CARD
   ============================================================ */

.admin-forgot-card {
  width: 100%;
  max-width: 350px;

  padding: 24px 22px;

  box-sizing: border-box;

  border-radius: 20px;

  
  background: rgba(255,255,255,.94);

  border: 1px solid rgba(255,255,255,.95);

  box-shadow:
    0 18px 45px rgba(15,23,42,.13),
    0 3px 10px rgba(15,23,42,.05);

  position: relative;

  z-index: 2;
}

/* ============================================================
   LOGO
   ============================================================ */

.admin-forgot-logo {
  width: 58px;
  height: 58px;

  display: block;

  margin: 0 auto;

  object-fit: cover;

  border-radius: 30%;

  border: 2px solid white;

  box-shadow:
    0 7px 18px rgba(15,23,42,.18);
}

/* ============================================================
   TITLE
   ============================================================ */

.admin-forgot-title {
  margin: 11px 0 4px;

  text-align: center;

  color: #1e3a8a;

  font-size: 21px;

  line-height: 1.25;

  font-weight: 800;
}

/* ============================================================
   SUBTITLE
   ============================================================ */

.admin-forgot-subtitle {
  margin: 0 auto 14px;

  max-width: 285px;

  text-align: center;

  color: #64748b;

  font-size: 11.5px;

  line-height: 1.5;
}

/* ============================================================
   STEPS
   ============================================================ */

.admin-forgot-step {
  display: flex;

  justify-content: center;

  align-items: center;

  gap: 6px;

  margin-bottom: 15px;
}

.admin-forgot-step span {
  width: 25px;
  height: 25px;

  flex-shrink: 0;

  border-radius: 50%;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 10px;

  font-weight: 800;

  background: #dbeafe;

  color: #2563eb;

  transition: .25s ease;
}

.admin-forgot-step span.active {
  background: #2563eb;

  color: white;

  box-shadow:
    0 4px 10px rgba(37,99,235,.25);
}

.admin-forgot-step i {
  width: 28px;
  height: 1.5px;

  background: #bfdbfe;
}

/* ============================================================
   MESSAGE
   ============================================================ */

.admin-forgot-message {
  margin-bottom: 12px;

  padding: 9px 10px;

  border-radius: 9px;

  font-size: 11px;

  display: flex;

  align-items: flex-start;

  gap: 7px;

  line-height: 1.4;
}

.admin-forgot-error {
  color: #dc2626;

  background: #fef2f2;

  border: 1px solid #fecaca;
}

.admin-forgot-success {
  color: #047857;

  background: #ecfdf5;

  border: 1px solid #a7f3d0;
}

/* ============================================================
   INPUT
   ============================================================ */

.admin-forgot-input {
  position: relative;

  margin-top: 10px;
}

.admin-forgot-input input {
  width: 100%;

  height: 43px;

  padding: 0 38px;

  box-sizing: border-box;

  border-radius: 10px;

  border: 1px solid #cbd5e1;

  outline: none;

  background: #ffffff;

  color: #1e293b;

  font-size: 12px;

  transition: .2s ease;
}

.admin-forgot-input input:focus {
  border-color: #2563eb;

  box-shadow:
    0 0 0 3px rgba(37,99,235,.10);
}

.admin-forgot-input > svg {
  position: absolute;

  left: 12px;

  top: 50%;

  transform: translateY(-50%);

  color: #2563eb;
}

/* ============================================================
   BUTTON
   ============================================================ */

.admin-forgot-button {
  width: 100%;

  height: 43px;

  margin-top: 12px;

  border: 0;

  border-radius: 10px;

  background: linear-gradient(
    135deg,
    #2563eb,
    #0ea5e9
  );

  color: white;

  font-size: 12.5px;

  font-weight: 750;

  cursor: pointer;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 7px;

  transition: .25s ease;

  box-shadow:
    0 7px 16px rgba(37,99,235,.18);
}

.admin-forgot-button:hover:not(:disabled) {
  transform: translateY(-1px);

  box-shadow:
    0 10px 20px rgba(37,99,235,.25);
}

.admin-forgot-button:active:not(:disabled) {
  transform: translateY(0);
}

.admin-forgot-button:disabled {
  opacity: .65;

  cursor: not-allowed;
}

/* ============================================================
   EMAIL DISPLAY
   ============================================================ */

.admin-forgot-email {
  text-align: center;

  margin: 8px 0 10px;

  color: #334155;

  font-size: 11px;

  line-height: 1.5;

  font-weight: 600;

  word-break: break-word;
}

/* ============================================================
   OTP
   ============================================================ */

.admin-forgot-otp {
  margin-top: 8px;
}

.admin-forgot-otp input {
  width: 100%;

  height: 46px;

  box-sizing: border-box;

  text-align: center;

  font-size: 19px;

  font-weight: 800;

  letter-spacing: 9px;

  padding-left: 9px;

  color: #1e3a8a;

  border: 1px solid #cbd5e1;

  border-radius: 10px;

  outline: none;

  background: white;

  transition: .2s ease;
}

.admin-forgot-otp input:focus {
  border-color: #2563eb;

  box-shadow:
    0 0 0 3px rgba(37,99,235,.10);
}

/* ============================================================
   RESEND
   ============================================================ */

.admin-forgot-resend {
  margin-top: 11px;

  text-align: center;

  font-size: 10.5px;

  color: #64748b;
}

.admin-forgot-resend button {
  border: 0;

  background: transparent;

  padding: 0;

  color: #2563eb;

  font-size: 10.5px;

  font-weight: 800;

  cursor: pointer;
}

.admin-forgot-resend button:hover {
  text-decoration: underline;
}

.admin-forgot-resend button:disabled {
  opacity: .55;

  cursor: not-allowed;
}

/* ============================================================
   BACK
   ============================================================ */

.admin-forgot-back {
  margin-top: 14px;

  padding-top: 11px;

  border-top: 1px solid #e2e8f0;

  text-align: center;

  color: #64748b;

  font-size: 10.5px;

  display: flex;

  justify-content: center;

  align-items: center;

  gap: 4px;
}

.admin-forgot-back span {
  color: #2563eb;

  font-weight: 700;

  cursor: pointer;
}

.admin-forgot-back span:hover {
  text-decoration: underline;
}

/* ============================================================
   SPIN
   ============================================================ */

.admin-forgot-spin {
  animation: adminForgotSpin 1s linear infinite;
}

@keyframes adminForgotSpin {
  to {
    transform: rotate(360deg);
  }
}

/* ============================================================
   TABLET
   ============================================================ */

@media (min-width: 481px) and (max-width: 768px) {

  .admin-forgot-page {
    padding: 20px;
  }

  .admin-forgot-card {
    max-width: 370px;
  }
}

/* ============================================================
   MOBILE
   ============================================================ */

@media (max-width: 480px) {

  .admin-forgot-page {
    padding: 12px;

    /*
      Keeps image visible properly on mobile.
    */
    background-position: center center;
  }

  .admin-forgot-card {
    max-width: 335px;

    padding: 21px 18px;

    border-radius: 18px;
  }

  .admin-forgot-logo {
    width: 54px;
    height: 54px;
  }

  .admin-forgot-title {
    font-size: 19px;
  }

  .admin-forgot-subtitle {
    font-size: 10.5px;

    max-width: 270px;

    margin-bottom: 13px;
  }

  .admin-forgot-input input {
    height: 42px;

    font-size: 11.5px;
  }

  .admin-forgot-button {
    height: 42px;

    font-size: 12px;
  }

  .admin-forgot-otp input {
    height: 44px;

    font-size: 17px;

    letter-spacing: 7px;
  }
}

/* ============================================================
   VERY SMALL MOBILE
   ============================================================ */

@media (max-width: 340px) {

  .admin-forgot-page {
    padding: 10px;
  }

  .admin-forgot-card {
    padding: 19px 15px;
  }

  .admin-forgot-title {
    font-size: 18px;
  }

  .admin-forgot-step {
    gap: 4px;
  }

  .admin-forgot-step i {
    width: 22px;
  }
}
`;

export default function Admin_forgot_password() {

  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ============================================================
     INITIALIZE
     ============================================================ */

  useEffect(() => {

    document.title =
      "Forgot Password | Wellborn Physio";

    const style =
      document.createElement("style");

    style.setAttribute(
      "data-page",
      "admin-forgot-password"
    );

    style.textContent = css;

    document.head.appendChild(style);

    return () => {

      const oldStyle =
        document.querySelector(
          'style[data-page="admin-forgot-password"]'
        );

      if (oldStyle) {
        oldStyle.remove();
      }

    };

  }, []);

  /* ============================================================
     ERROR MESSAGE
     ============================================================ */

  const getErrorMessage = (
    err,
    fallback
  ) => {

    return (
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.data?.message ||
      err?.data?.error ||
      (
        typeof err?.response?.data === "string"
          ? err.response.data
          : null
      ) ||
      err?.message ||
      fallback
    );

  };

  /* ============================================================
     SEND OTP
     ============================================================ */

  const handleSendOtp = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {

      setError(
        "Please enter your registered admin email."
      );

      return;
    }

    if (
      !/^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$/.test(
        cleanEmail
      )
    ) {

      setError(
        "Please enter a valid email address."
      );

      return;
    }

    try {

      setLoading(true);

      const response =
        await postData(
          `${API.ADMIN_RESET_SEND_OTP}?email=${encodeURIComponent(
            cleanEmail
          )}`,
          null
        );

      console.log(
        "Send Reset OTP Response:",
        response
      );

      setEmail(cleanEmail);

      setSuccess(
        typeof response === "string"
          ? response
          : response?.message ||
            "OTP sent successfully to your registered email."
      );

      setStep(2);

    } catch (err) {

      console.error(
        "Send Reset OTP Error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to send OTP. Please try again."
        )
      );

    } finally {

      setLoading(false);

    }

  };

  /* ============================================================
     VERIFY OTP
     ============================================================ */

  const handleVerifyOtp = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanOtp =
      otp.trim();

    if (!cleanOtp) {

      setError(
        "Please enter the OTP."
      );

      return;
    }

    if (!/^\d{6}$/.test(cleanOtp)) {

      setError(
        "OTP must contain exactly 6 digits."
      );

      return;
    }

    try {

      setLoading(true);

      const response =
        await postData(
          `${API.ADMIN_RESET_VERIFY_OTP}` +
            `?email=${encodeURIComponent(
              email.trim().toLowerCase()
            )}` +
            `&otp=${encodeURIComponent(
              cleanOtp
            )}`,
          null
        );

      console.log(
        "Verify Reset OTP Response:",
        response
      );

      const resetToken =
        response?.resetToken;

      if (!resetToken) {

        setError(
          "OTP verified, but reset authorization token was not received."
        );

        return;
      }

      setSuccess(
        response?.message ||
          "OTP verified successfully."
      );

      sessionStorage.setItem(
        "resetToken",
        resetToken
      );

      sessionStorage.setItem(
        "resetEmail",
        email.trim().toLowerCase()
      );

      navigate(
        "/admin/reset-password",
        {
          replace: true,

          state: {
            email:
              email.trim().toLowerCase(),

            resetToken,
          },
        }
      );

    } catch (err) {

      console.error(
        "Verify Reset OTP Error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Invalid or expired OTP."
        )
      );

    } finally {

      setLoading(false);

    }

  };

  /* ============================================================
     RESEND OTP
     ============================================================ */

  const handleResendOtp = async () => {

    setError("");
    setSuccess("");

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {

      setError(
        "Email is missing. Please go back and enter your email."
      );

      return;
    }

    try {

      setResending(true);

      const response =
        await postData(
          `${API.ADMIN_RESET_SEND_OTP}?email=${encodeURIComponent(
            cleanEmail
          )}`,
          null
        );

      console.log(
        "Resend Reset OTP Response:",
        response
      );

      setOtp("");

      setSuccess(
        typeof response === "string"
          ? response
          : response?.message ||
            "A new OTP has been sent to your email."
      );

    } catch (err) {

      console.error(
        "Resend OTP Error:",
        err
      );

      setError(
        getErrorMessage(
          err,
          "Unable to resend OTP."
        )
      );

    } finally {

      setResending(false);

    }

  };

  /* ============================================================
     OTP CHANGE
     ============================================================ */

  const handleOtpChange = (e) => {

    const value =
      e.target.value
        .replace(/\D/g, "")
        .slice(0, 6);

    setOtp(value);

    setError("");

  };

  /* ============================================================
     BACK TO EMAIL
     ============================================================ */

  const handleBackToEmail = () => {

    setStep(1);

    setOtp("");

    setError("");

    setSuccess("");

  };

  /* ============================================================
     UI
     ============================================================ */

  return (

    <div className="admin-forgot-page">

      <div className="admin-forgot-card">

        {/* ====================================================
            LOGO
            ==================================================== */}

        <img
          src="/assets/wellborn physio.jpg"
          alt="Wellborn Physio"
          className="admin-forgot-logo"
        />

        {/* ====================================================
            TITLE
            ==================================================== */}

        <h1 className="admin-forgot-title">

          {step === 1
            ? "Forgot Password?"
            : "Verify OTP"}

        </h1>

        {/* ====================================================
            SUBTITLE
            ==================================================== */}

        <p className="admin-forgot-subtitle">

          {step === 1
            ? "Enter your registered admin email to receive a secure verification OTP."
            : "Enter the 6-digit OTP sent to your registered email address."}

        </p>

        {/* ====================================================
            STEPS
            ==================================================== */}

        <div className="admin-forgot-step">

          <span
            className={
              step >= 1
                ? "active"
                : ""
            }
          >
            1
          </span>

          <i />

          <span
            className={
              step >= 2
                ? "active"
                : ""
            }
          >
            2
          </span>

          <i />

          <span>
            3
          </span>

        </div>

        {/* ====================================================
            ERROR
            ==================================================== */}

        {error && (

          <div
            className={
              "admin-forgot-message " +
              "admin-forgot-error"
            }
          >

            <CircleAlert
              size={16}
              style={{
                flexShrink: 0,
              }}
            />

            <span>
              {error}
            </span>

          </div>

        )}

        {/* ====================================================
            SUCCESS
            ==================================================== */}

        {success && (

          <div
            className={
              "admin-forgot-message " +
              "admin-forgot-success"
            }
          >

            <CheckCircle2
              size={16}
              style={{
                flexShrink: 0,
              }}
            />

            <span>
              {success}
            </span>

          </div>

        )}

        {/* ====================================================
            EMAIL STEP
            ==================================================== */}

        {step === 1 && (

          <form
            onSubmit={handleSendOtp}
          >

            <div className="admin-forgot-input">

              <Mail size={17} />

              <input
                type="email"
                placeholder="Registered Admin Email"
                value={email}
                onChange={(e) => {

                  setEmail(
                    e.target.value
                  );

                  setError("");
                  setSuccess("");

                }}
                autoComplete="email"
                maxLength={150}
              />

            </div>

            <button
              type="submit"
              className="admin-forgot-button"
              disabled={loading}
            >

              {loading ? (

                <>

                  <Loader2
                    size={16}
                    className="admin-forgot-spin"
                  />

                  Sending OTP...

                </>

              ) : (

                <>

                  <Send size={16} />

                  Send OTP

                </>

              )}

            </button>

          </form>

        )}

        {/* ====================================================
            OTP STEP
            ==================================================== */}

        {step === 2 && (

          <form
            onSubmit={handleVerifyOtp}
          >

            <div className="admin-forgot-email">

              OTP sent to

              <br />

              <strong>
                {email}
              </strong>

            </div>

            <div className="admin-forgot-otp">

              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                autoFocus
                placeholder="••••••"
                aria-label="Enter OTP"
              />

            </div>

            <button
              type="submit"
              className="admin-forgot-button"
              disabled={
                loading ||
                otp.length !== 6
              }
            >

              {loading ? (

                <>

                  <Loader2
                    size={16}
                    className="admin-forgot-spin"
                  />

                  Verifying...

                </>

              ) : (

                <>

                  <ShieldCheck size={16} />

                  Verify OTP

                </>

              )}

            </button>

            {/* =================================================
                RESEND
                ================================================= */}

            <div className="admin-forgot-resend">

              Didn't receive the OTP?{" "}

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resending}
              >

                {resending
                  ? "Sending..."
                  : "Resend OTP"}

              </button>

            </div>

            {/* =================================================
                CHANGE EMAIL
                ================================================= */}

            <div
              style={{
                marginTop: "7px",
                textAlign: "center",
              }}
            >

              <button
                type="button"
                onClick={
                  handleBackToEmail
                }
                style={{
                  border: "0",
                  background: "transparent",
                  color: "#2563eb",
                  fontSize: "10px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >

                Change email

              </button>

            </div>

          </form>

        )}

        {/* ====================================================
            BACK TO LOGIN
            ==================================================== */}

        <div className="admin-forgot-back">

          <ArrowLeft size={13} />

          <span
            onClick={() =>
              navigate("/admin/login")
            }
          >

            Back to Login

          </span>

        </div>

      </div>

    </div>

  );
}