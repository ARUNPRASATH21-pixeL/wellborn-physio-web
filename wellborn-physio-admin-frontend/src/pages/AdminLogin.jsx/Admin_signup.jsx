import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Moon,
  Sun,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  checkAdminEmailStatus,
  startAdminSignup,
  verifyAdminSignupOtp,
  resendAdminSignupOtp,
  verifyAdminSignupSecret,
  completeAdminSignup,
} from "../services/api";


// ============================================================
// PAGE CSS
// ============================================================

const pageCss = `

.admin-auth-page {
  width: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  transition: background 0.5s ease;
}

.admin-auth-page.light {
  background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 35%, #e0f2fe 70%, #cffafe 100%);
}

.admin-auth-page.dark {
  background: linear-gradient(135deg, #020617 0%, #0f172a 35%, #172554 70%, #082f49 100%);
}

.admin-auth-theme {
  position: fixed;
  top: 22px;
  right: 22px;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 100;
  transition: all 0.3s ease;
}

.admin-auth-page.light .admin-auth-theme {
  background: #ffffff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  box-shadow: 0 5px 20px rgba(30, 64, 175, 0.15);
}

.admin-auth-page.dark .admin-auth-theme {
  background: #1e293b;
  color: #facc15;
  border: 1px solid #475569;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
}

.admin-auth-theme:hover {
  transform: scale(1.08);
}

.admin-auth-card {
  width: 100%;
  max-width: 430px;
  padding: 32px 30px;
  border-radius: 25px;
  box-sizing: border-box;
  animation: adminAuthFloat 4s ease-in-out infinite;
  backdrop-filter: blur(20px);
}

.admin-auth-page.light .admin-auth-card {
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 20px 50px rgba(30, 64, 175, 0.18);
}

.admin-auth-page.dark .admin-auth-card {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid #334155;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.65);
}

@keyframes adminAuthFloat {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.admin-auth-logo {
  width: 72px;
  height: 72px;
  display: block;
  margin: 0 auto;
  object-fit: cover;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.25);
}

.admin-auth-title {
  margin-top: 14px;
  text-align: center;
  font-size: 26px;
  font-weight: 700;
}

.admin-auth-page.light .admin-auth-title { color: #1e3a8a; }
.admin-auth-page.dark .admin-auth-title { color: white; }

.admin-auth-subtitle {
  margin-top: 5px;
  margin-bottom: 18px;
  text-align: center;
  font-size: 14px;
}

.admin-auth-page.light .admin-auth-subtitle { color: #475569; }
.admin-auth-page.dark .admin-auth-subtitle { color: #bae6fd; }

.admin-auth-input {
  position: relative;
  margin-top: 14px;
}

.admin-auth-input input {
  width: 100%;
  height: 46px;
  box-sizing: border-box;
  padding: 0 44px;
  border-radius: 12px;
  outline: none;
  font-size: 14px;
  transition: all 0.3s ease;
}

.admin-auth-page.light .admin-auth-input input {
  background: #fff;
  color: #1e293b;
  border: 1px solid #bfdbfe;
}

.admin-auth-page.dark .admin-auth-input input {
  background: #1e293b;
  color: white;
  border: 1px solid #475569;
}

.admin-auth-input input:focus {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.18);
}

.admin-auth-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 2;
}

.admin-auth-page.light .admin-auth-icon { color: #2563eb; }
.admin-auth-page.dark .admin-auth-icon { color: #60a5fa; }

.admin-auth-eye {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  display: flex;
}

.admin-auth-page.light .admin-auth-eye { color: #475569; }
.admin-auth-page.dark .admin-auth-eye { color: #cbd5e1; }

.admin-email-status-icon {
  position: absolute;
  right: 13px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.admin-email-status-icon.success { color: #16a34a; }
.admin-email-status-icon.error { color: #dc2626; }
.admin-email-status-icon.loading { color: #2563eb; }

.admin-otp-send-button {
  width: 100%;
  height: 44px;
  margin-top: 10px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  background: #0ea5e9;
  color: white;
  transition: all 0.25s ease;
}

.admin-otp-send-button:hover { background: #0284c7; transform: translateY(-1px); }
.admin-otp-send-button:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

.admin-otp-box {
  margin-top: 12px;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid #bae6fd;
}

.admin-auth-page.light .admin-otp-box { background: rgba(240, 249, 255, 0.8); }
.admin-auth-page.dark .admin-otp-box { background: rgba(15, 23, 42, 0.7); border-color: #334155; }

.admin-otp-title {
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 10px;
  text-align: center;
}

.admin-auth-page.light .admin-otp-title { color: #0f172a; }
.admin-auth-page.dark .admin-otp-title { color: #e0f2fe; }

.admin-otp-input {
  width: 100%;
  height: 48px;
  box-sizing: border-box;
  border-radius: 10px;
  text-align: center;
  letter-spacing: 8px;
  font-size: 18px;
  font-weight: 700;
  outline: none;
  padding-left: 8px;
  border: 1px solid #bae6fd;
}

.admin-auth-page.light .admin-otp-input { background: white; color: #0f172a; }
.admin-auth-page.dark .admin-otp-input { background: #1e293b; color: white; border-color: #475569; }

.admin-otp-timer {
  margin-top: 10px;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-weight: 600;
}

.admin-auth-page.light .admin-otp-timer { color: #475569; }
.admin-auth-page.dark .admin-otp-timer { color: #bae6fd; }

.admin-otp-verify-button {
  width: 100%;
  height: 43px;
  margin-top: 10px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  background: #16a34a;
  color: white;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.admin-otp-verify-button:disabled { opacity: 0.65; cursor: not-allowed; }

.admin-otp-success {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #dcfce7;
  color: #166534;
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.admin-auth-page.dark .admin-otp-success {
  background: rgba(20, 83, 45, 0.45);
  color: #86efac;
}

.admin-auth-button {
  width: 100%;
  height: 47px;
  margin-top: 20px;
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.admin-auth-page.light .admin-auth-button {
  background: #2563eb;
  color: white;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
}

.admin-auth-page.dark .admin-auth-button {
  background: white;
  color: #1d4ed8;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.admin-auth-button:hover { transform: translateY(-2px); }
.admin-auth-button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.admin-auth-bottom {
  text-align: center;
  margin-top: 18px;
  font-size: 13px;
}

.admin-auth-page.light .admin-auth-bottom { color: #475569; }
.admin-auth-page.dark .admin-auth-bottom { color: #cbd5e1; }

.admin-auth-link {
  color: #2563eb;
  cursor: pointer;
  font-weight: 600;
}

.admin-auth-page.dark .admin-auth-link { color: #67e8f9; }
.admin-auth-link:hover { text-decoration: underline; }

.admin-auth-back {
  position: fixed;
  left: 22px;
  top: 22px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13px;
  z-index: 100;
}

.admin-auth-page.light .admin-auth-back { color: #1e3a8a; }
.admin-auth-page.dark .admin-auth-back { color: #bae6fd; }

@media (max-width: 480px) {
  .admin-auth-page {
    padding: 15px;
    align-items: flex-start;
    padding-top: 75px;
    padding-bottom: 25px;
  }
  .admin-auth-card { padding: 29px 22px; }
  .admin-auth-theme { width: 42px; height: 42px; top: 15px; right: 15px; }
  .admin-auth-back { left: 15px; top: 15px; }
  .admin-auth-title { font-size: 23px; }
  .admin-auth-logo { width: 65px; height: 65px; }
}

`;


// ============================================================
// COMPONENT
// ============================================================

export default function Admin_signup() {

  const navigate = useNavigate();
  const emailCheckTimer = useRef(null);

  const [darkMode, setDarkMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    medicalCode: "",
    password: "",
    confirmPassword: "",
    signupToken: "",
  });

  const [loading, setLoading] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpTimeLeft, setOtpTimeLeft] = useState(0);

  useEffect(() => {
    document.title = "Create Admin Account | Wellborn Physio";
    const style = document.createElement("style");
    style.setAttribute("data-page", "admin-signup");
    style.textContent = pageCss;
    document.head.appendChild(style);

    return () => {
      if (emailCheckTimer.current) {
        clearTimeout(emailCheckTimer.current);
      }
      const oldStyle = document.querySelector('style[data-page="admin-signup"]');
      if (oldStyle) {
        oldStyle.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!otpSent || otpVerified || otpTimeLeft <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setOtpTimeLeft(previous => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [otpSent, otpVerified, otpTimeLeft]);

  const updateField = (field, value) => {
    setForm(previous => ({
      ...previous,
      [field]: value,
    }));
  };

  const isValidEmail = email => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const checkEmailStatus = async emailValue => {
    const email = emailValue.trim().toLowerCase();
    if (!email) {
      setEmailChecked(false);
      setEmailAvailable(false);
      return;
    }
    if (!isValidEmail(email)) {
      setEmailChecked(true);
      setEmailAvailable(false);
      return;
    }

    try {
      setEmailChecking(true);
      const data = await checkAdminEmailStatus(email);
      const available = data?.available === true || data?.showSendOtp === true;
      setEmailAvailable(available);
      setEmailChecked(true);
    } catch (error) {
      console.error("Email check error:", error);
      setEmailAvailable(false);
      setEmailChecked(true);
    } finally {
      setEmailChecking(false);
    }
  };

  const handleEmailChange = value => {
    updateField("email", value);
    setEmailChecked(false);
    setEmailAvailable(false);
    setOtpSent(false);
    setOtp("");
    setOtpVerified(false);
    setOtpTimeLeft(0);
    updateField("signupToken", "");

    if (emailCheckTimer.current) {
      clearTimeout(emailCheckTimer.current);
    }

    const email = value.trim();
    if (!email) return;

    emailCheckTimer.current = setTimeout(() => {
      checkEmailStatus(email);
    }, 700);
  };

  const handleSendOtp = async () => {
    const name = form.name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim().toLowerCase();

    if (name.length < 3) {
      alert("Please enter your full name.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      alert("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!emailAvailable) {
      alert("Please enter a valid available email.");
      return;
    }

    try {
      setOtpSending(true);
      const response = await startAdminSignup({
        adminName: name,
        phone,
        email,
      });

      setOtpSent(true);
      setOtp("");
      setOtpVerified(false);
      updateField("signupToken", "");

      const expires = Number(response?.expiresInSeconds);
      setOtpTimeLeft(expires > 0 ? expires : 600);

      alert(response?.message || "OTP sent successfully to your Gmail.");
    } catch (error) {
      console.error("Send OTP error:", error);
      alert(error?.message || "Unable to send OTP.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    const email = form.email.trim().toLowerCase();

    if (otp.length !== 6) {
      alert("Please enter the 6-digit OTP.");
      return;
    }
    if (otpTimeLeft <= 0) {
      alert("OTP has expired. Please resend a new OTP.");
      return;
    }

    try {
      setOtpVerifying(true);
      const response = await verifyAdminSignupOtp({
        email,
        otp,
      });

      if (response?.success === false || response?.status === false) {
        alert(response?.message || "Invalid OTP.");
        return;
      }

      const signupToken = response?.signupToken || response?.token;
      if (!signupToken) {
        alert("OTP verified but signup token was not received.");
        return;
      }

      updateField("signupToken", signupToken);
      setOtpVerified(true);
      setOtpTimeLeft(0);
    } catch (error) {
      console.error("OTP verification error:", error);
      setOtpVerified(false);
      alert(error?.message || "Invalid OTP.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    const email = form.email.trim().toLowerCase();
    if (!email) {
      alert("Email is required.");
      return;
    }

    try {
      setOtpSending(true);
      const response = await resendAdminSignupOtp(email);

      setOtpSent(true);
      setOtp("");
      setOtpVerified(false);
      updateField("signupToken", "");

      const expires = Number(response?.expiresInSeconds);
      setOtpTimeLeft(expires > 0 ? expires : 600);
    } catch (error) {
      console.error("Resend OTP error:", error);
      alert(error?.message || "Unable to resend OTP.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleSignup = async event => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const phone = form.phone.trim();
    const medicalCode = form.medicalCode.trim();

    if (!name || name.length < 3) {
      alert("Name must contain at least 3 characters.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      alert("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!isValidEmail(email) || !emailAvailable) {
      alert("Please use an available valid email address.");
      return;
    }
    if (!otpVerified || !form.signupToken) {
      alert("Please verify your Gmail OTP first.");
      return;
    }
    if (!medicalCode) {
      alert("Please enter the Medical Secret Code.");
      return;
    }
    if (form.password.length < 8) {
      alert("Password must contain at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // STEP 1: VERIFY MEDICAL SECRET CODE
      const secretResponse = await verifyAdminSignupSecret({
        signupToken: form.signupToken,
        secretCode: medicalCode,
      });

      if (secretResponse?.success === false || secretResponse?.status === false) {
        alert(secretResponse?.message || "Invalid Medical Secret Code.");
        return;
      }

      const passwordToken =
        typeof secretResponse === 'string'
          ? secretResponse
          : (secretResponse?.signupToken || secretResponse?.token);

      if (!passwordToken) {
        alert("Medical Secret Code verified but signup token was not received.");
        return;
      }

      // STEP 2: COMPLETE ACCOUNT CREATION (Backend MySQL Database)
      const completeResponse = await completeAdminSignup({
        signupToken: passwordToken,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      if (completeResponse?.success === false || completeResponse?.status === false) {
        alert(completeResponse?.message || "Unable to create admin account.");
        return;
      }

      alert(completeResponse?.message || "Admin account created successfully.");

      setForm({
        name: "",
        phone: "",
        email: "",
        medicalCode: "",
        password: "",
        confirmPassword: "",
        signupToken: "",
      });

      setEmailChecked(false);
      setEmailAvailable(false);
      setOtpSent(false);
      setOtp("");
      setOtpVerified(false);
      setOtpTimeLeft(0);

      navigate("/admin/login", { replace: true });

    } catch (error) {
      console.error("Create admin error:", error);
      alert(error?.message || "Unable to create admin account.");
    } finally {
      setLoading(false);
    }
  };

  const formatOtpTime = () => {
    const minutes = Math.floor(otpTimeLeft / 60);
    const seconds = otpTimeLeft % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div className={darkMode ? "admin-auth-page dark" : "admin-auth-page light"}>
      <button
        type="button"
        className="admin-auth-back"
        onClick={() => navigate("/admin/login")}
      >
        <ArrowLeft size={16} />
        Back to Login
      </button>

      <button
        type="button"
        className="admin-auth-theme"
        onClick={() => setDarkMode(previous => !previous)}
      >
        {darkMode ? <Sun size={21} /> : <Moon size={21} />}
      </button>

      <div className="admin-auth-card">
        <img
          src="/assets/wellborn physio.jpg"
          alt="Wellborn Physio"
          className="admin-auth-logo"
        />

        <h1 className="admin-auth-title">Wellborn Physio</h1>
        <p className="admin-auth-subtitle">Create Admin Account</p>

        <form onSubmit={handleSignup}>
          <div className="admin-auth-input">
            <User size={18} className="admin-auth-icon" />
            <input
              type="text"
              placeholder="Enter Full Name"
              value={form.name}
              maxLength={100}
              autoComplete="name"
              onChange={e => updateField("name", e.target.value)}
              required
            />
          </div>

          <div className="admin-auth-input">
            <Phone size={18} className="admin-auth-icon" />
            <input
              type="tel"
              placeholder="Enter Phone"
              value={form.phone}
              maxLength={10}
              inputMode="numeric"
              autoComplete="tel"
              onChange={e =>
                updateField(
                  "phone",
                  e.target.value.replace(/\D/g, "").slice(0, 10)
                )
              }
              required
            />
          </div>

          <div className="admin-auth-input">
            <Mail size={18} className="admin-auth-icon" />
            <input
              type="email"
              placeholder="Enter Email"
              value={form.email}
              maxLength={150}
              autoComplete="email"
              disabled={otpVerified}
              onChange={e => handleEmailChange(e.target.value)}
              required
            />

            {emailChecking && (
              <span className="admin-email-status-icon loading">
                <Loader2 size={17} className="animate-spin" />
              </span>
            )}

            {!emailChecking && emailChecked && emailAvailable && (
              <span className="admin-email-status-icon success">
                <CheckCircle2 size={18} />
              </span>
            )}

            {!emailChecking && emailChecked && !emailAvailable && (
              <span className="admin-email-status-icon error">
                <XCircle size={18} />
              </span>
            )}
          </div>

          {emailAvailable && !otpVerified && (
            <button
              type="button"
              className="admin-otp-send-button"
              disabled={otpSending || otpSent}
              onClick={handleSendOtp}
            >
              <Send size={17} />
              {otpSending ? "Sending OTP..." : otpSent ? "OTP Sent" : "Send OTP"}
            </button>
          )}

          {otpSent && !otpVerified && (
            <div className="admin-otp-box">
              <div className="admin-otp-title">
                Enter the 6-digit OTP sent to your Gmail
              </div>

              <input
                type="text"
                className="admin-otp-input"
                value={otp}
                maxLength={6}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="000000"
                onChange={e =>
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
              />

              <div className="admin-otp-timer">
                <Clock size={15} />
                {otpTimeLeft > 0 ? `OTP expires in ${formatOtpTime()}` : "OTP expired"}
              </div>

              {otpTimeLeft > 0 ? (
                <button
                  type="button"
                  className="admin-otp-verify-button"
                  disabled={otpVerifying || otp.length !== 6}
                  onClick={handleVerifyOtp}
                >
                  <ShieldCheck size={17} />
                  {otpVerifying ? "Verifying..." : "Verify OTP"}
                </button>
              ) : (
                <button
                  type="button"
                  className="admin-otp-send-button"
                  disabled={otpSending}
                  onClick={handleResendOtp}
                >
                  <Send size={17} />
                  {otpSending ? "Sending..." : "Resend OTP"}
                </button>
              )}
            </div>
          )}

          {otpVerified && (
            <div className="admin-otp-success">
              <CheckCircle2 size={17} />
              Gmail OTP verified
            </div>
          )}

          <div className="admin-auth-input">
            <KeyRound size={18} className="admin-auth-icon" />
            <input
              type="password"
              placeholder="Enter Medical Secret Code"
              value={form.medicalCode}
              autoComplete="off"
              onChange={e => updateField("medicalCode", e.target.value)}
              required
            />
          </div>

          <div className="admin-auth-input">
            <Lock size={18} className="admin-auth-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Create Password"
              value={form.password}
              autoComplete="new-password"
              onChange={e => updateField("password", e.target.value)}
              required
            />
            <span
              className="admin-auth-eye"
              role="button"
              tabIndex={0}
              onClick={() => setShowPassword(previous => !previous)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          <div className="admin-auth-input">
            <Lock size={18} className="admin-auth-icon" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={form.confirmPassword}
              autoComplete="new-password"
              onChange={e => updateField("confirmPassword", e.target.value)}
              required
            />
            <span
              className="admin-auth-eye"
              role="button"
              tabIndex={0}
              onClick={() => setShowConfirmPassword(previous => !previous)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          <button
            type="submit"
            className="admin-auth-button"
            disabled={loading || !otpVerified}
          >
            <UserPlus size={18} />
            {loading ? "Creating Admin Account..." : "Create Admin Account"}
          </button>

          <div className="admin-auth-bottom">
            Already have an admin account?{" "}
            <span
              className="admin-auth-link"
              role="button"
              tabIndex={0}
              onClick={() => navigate("/admin/login")}
            >
              Login
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}