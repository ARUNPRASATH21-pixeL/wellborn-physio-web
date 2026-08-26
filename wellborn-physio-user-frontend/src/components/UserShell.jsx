import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { API, postData, getData } from "../services/api";

export default function UserShell() {
  const location = useLocation();

  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("wellborn-theme");
      if (saved === "dark") return true;
      if (saved === "light") return false;
      return window.matchMedia?.("(prefers-color-scheme: dark)").matches || false;
    } catch {
      return false;
    }
  });

  const [menuOpen, setMenuOpen] = useState(false);
  const [appointmentOpen, setAppointmentOpen] = useState(false);
  
  const [introVisible, setIntroVisible] = useState(() => {
    return !sessionStorage.getItem("wellborn-intro-played");
  });

  /* =====================================================
     POPUP APPOINTMENT FORM STATE WITH TIME
  ===================================================== */
  const [appointmentData, setAppointmentData] = useState({
    name: "",
    phone: "",
    email: "",
    date: "",
    time: "",
    ageGroup: "",
    serviceId: "",
    problem: "",
  });

  /* CUSTOM DROPDOWN STATES FOR NAVBAR POPUP */
  const [popupAgeOpen, setPopupAgeOpen] = useState(false);
  const [popupTreatmentOpen, setPopupTreatmentOpen] = useState(false);
  const [popupTimeOpen, setPopupTimeOpen] = useState(false);

  const popupAgeRef = useRef(null);
  const popupTreatmentRef = useRef(null);
  const popupTimeRef = useRef(null);

  const ageOptions = [
    "Child (0-12 yrs)",
    "Teenager (13-19 yrs)",
    "Adult (20-50 yrs)",
    "Senior Citizen (50+ yrs)",
  ];

  /* ALL BASE 30-MIN SLOTS (9:00 AM to 7:30 PM) */
  const allTimeOptions = [
    "09:00 AM", "09:30 AM",
    "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM",
    "12:00 PM", "12:30 PM",
    "01:00 PM", "01:30 PM",
    "02:00 PM", "02:30 PM",
    "03:00 PM", "03:30 PM",
    "04:00 PM", "04:30 PM",
    "05:00 PM", "05:30 PM",
    "06:00 PM", "06:30 PM",
    "07:00 PM", "07:30 PM"
  ];

  /* BOOKED TIMES FROM BACKEND */
  const [bookedTimes, setBookedTimes] = useState([]);

  const [appointmentSuccessModal, setAppointmentSuccessModal] = useState({
    visible: false,
    patientName: "",
    department: "",
    date: "",
    time: "",
  });

  const [appointmentLoading, setAppointmentLoading] = useState(false);
  const [appointmentError, setAppointmentError] = useState("");

  const [services, setServices] = useState([]);

  const links = [
    { name: "Home", path: "/user/home", icon: "fa-house" },
    { name: "About", path: "/user/about", icon: "fa-circle-info" },
    { name: "Services", path: "/user/services", icon: "fa-hand-holding-medical" },
    { name: "Doctors", path: "/user/doctors", icon: "fa-user-doctor" },
    { name: "Feedback", path: "/user/reviews", icon: "fa-comment-dots" },
    { name: "Contact", path: "/user/contact", icon: "fa-phone" },
  ];

  /* INDIA DATE / TIME HELPER */
  const getIndiaDateTime = () => {
    try {
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });

      const parts = formatter.formatToParts(new Date());
      const values = {};

      parts.forEach((part) => {
        if (part.type !== "literal") {
          values[part.type] = part.value;
        }
      });

      return {
        date: `${values.year}-${values.month}-${values.day}`,
        hour: Number(values.hour),
        minute: Number(values.minute),
      };
    } catch {
      const d = new Date();
      return {
        date: d.toISOString().split("T")[0],
        hour: d.getHours(),
        minute: d.getMinutes(),
      };
    }
  };

  const today = getIndiaDateTime().date;

  useEffect(() => {
    if (!appointmentData.date) {
      setAppointmentData((prev) => ({ ...prev, date: today }));
    }
  }, [today, appointmentData.date]);

  /* FETCH BOOKED TIMES FROM BACKEND WHEN DATE CHANGES */
  useEffect(() => {
    const fetchBookedTimesForDate = async () => {
      if (!appointmentData.date) return;
      try {
        const response = await getData(`${API.APPOINTMENT_BOOKED_TIMES}?date=${appointmentData.date}`);
        const list = Array.isArray(response) ? response : (response?.data || []);
        setBookedTimes(list);
      } catch (err) {
        console.error("Failed to fetch booked times from backend:", err);
        setBookedTimes([]);
      }
    };

    fetchBookedTimesForDate();
  }, [appointmentData.date]);

  /* SAFE BACKGROUND FCM & MOBILE NOTIFICATION LISTENER */
  useEffect(() => {
    try {
      if ("Notification" in window && Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }

      import("../services/fcm").then(({ getUserFcmToken, onForegroundMessage }) => {
        if (typeof getUserFcmToken === "function") {
          getUserFcmToken()
            .then((token) => {
              if (token) {
                localStorage.setItem("fcmToken", token);
              }
            })
            .catch(() => {});
        }

        if (typeof onForegroundMessage === "function") {
          onForegroundMessage((payload) => {
            if ("Notification" in window && Notification.permission === "granted") {
              const title = payload?.notification?.title || "Wellborn Physio";
              const body = payload?.notification?.body || "You have a new update.";
              new Notification(title, {
                body: body,
                icon: "/favicon.ico",
              });
            }
          });
        }
      }).catch(() => {});
    } catch (e) {
      console.warn("FCM init skipped:", e);
    }
  }, []);

  /* HELPER TO CONVERT 12-HOUR SLOT STRING TO 24-HOUR LocalTime FORMAT ("17:00:00") */
  const convertSlotTo24HourString = (slotStr) => {
    const [time, modifier] = slotStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
  };

 /* FILTER AVAILABLE TIME SLOTS (PAST TIME FOR TODAY + BACKEND BOOKED SLOTS) */
  const availableTimeOptions = React.useMemo(() => {
    const indiaNow = getIndiaDateTime();
    const currentTotalMinutes = indiaNow.hour * 60 + indiaNow.minute;

    return allTimeOptions.filter((slot) => {
      // 1. Convert slot (eg: "09:00 AM") to 24-hour comparative minutes for robust matching
      const [time, modifier] = slot.split(" ");
      let [slotHours, slotMinutes] = time.split(":").map(Number);
      if (modifier === "PM" && slotHours < 12) slotHours += 12;
      if (modifier === "AM" && slotHours === 12) slotHours = 0;
      const slotTotalMinutes = slotHours * 60 + slotMinutes;

      // 2. Check if already booked from backend (handles strings like "09:00:00", "09:00", etc.)
      const isAlreadyBooked = bookedTimes.some((booked) => {
        if (!booked) return false;
        const cleanBooked = String(booked).trim();
        const parts = cleanBooked.split(":");
        if (parts.length >= 2) {
          const bookedHours = Number(parts[0]);
          const bookedMinutes = Number(parts[1]);
          return slotHours === bookedHours && slotMinutes === bookedMinutes;
        }
        return false;
      });

      if (isAlreadyBooked) return false;

      // 3. If today, filter out past time slots
      if (appointmentData.date === indiaNow.date) {
        if (slotTotalMinutes <= currentTotalMinutes) return false;
      }

      return true;
    });
  }, [appointmentData.date, bookedTimes]);
  
  useEffect(() => {
    if (appointmentData.time && !availableTimeOptions.includes(appointmentData.time)) {
      setAppointmentData((prev) => ({ ...prev, time: "" }));
    }
  }, [availableTimeOptions, appointmentData.time]);

  /* CLOSE CUSTOM DROPDOWNS ON OUTSIDE CLICK */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (popupAgeRef.current && !popupAgeRef.current.contains(e.target)) {
        setPopupAgeOpen(false);
      }
      if (popupTreatmentRef.current && !popupTreatmentRef.current.contains(e.target)) {
        setPopupTreatmentOpen(false);
      }
      if (popupTimeRef.current && !popupTimeRef.current.contains(e.target)) {
        setPopupTimeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Services fetch
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await getData(API.SERVICE_GET_ALL || "/services");
        const serviceList = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];

        const activeServices = serviceList.filter(
          (service) =>
            service &&
            service.status !== false &&
            service.status !== "INACTIVE" &&
            String(
              service.serviceName ||
                service.name ||
                ""
            )
              .trim()
              .toLowerCase() !== "other"
        );

        setServices(activeServices);
      } catch (err) {
        console.error("Error fetching services:", err);
      }
    };

    fetchServices();
  }, []);

  /* INTRO TIMING */
  useEffect(() => {
    let timer;

    if (introVisible) {
      timer = window.setTimeout(() => {
        setIntroVisible(false);
        sessionStorage.setItem("wellborn-intro-played", "true");
      }, 12000);
    }

    return () => window.clearTimeout(timer);
  }, [introVisible]);

  /* THEME */
  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("wellborn-theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("wellborn-theme", "light");
    }
  }, [darkMode]);

  /* ROUTE CHANGE */
  useEffect(() => {
    setMenuOpen(false);
    setAppointmentOpen(false);

    const html = document.documentElement;
    const body = document.body;

    html.classList.remove("wellborn-lock");
    body.classList.remove("wellborn-lock");

    html.style.removeProperty("overflow");
    body.style.removeProperty("overflow");
    body.style.removeProperty("touch-action");

    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [location.pathname]);

  /* SCROLL LOCK */
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const locked = menuOpen || appointmentOpen || introVisible || appointmentSuccessModal.visible;

    if (locked) {
      html.classList.add("wellborn-lock");
      body.classList.add("wellborn-lock");
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      body.style.touchAction = "none";
    } else {
      html.classList.remove("wellborn-lock");
      body.classList.remove("wellborn-lock");
      html.style.removeProperty("overflow");
      body.style.removeProperty("overflow");
      body.style.removeProperty("touch-action");
    }

    return () => {
      html.classList.remove("wellborn-lock");
      body.classList.remove("wellborn-lock");
      html.style.removeProperty("overflow");
      body.style.removeProperty("overflow");
      body.style.removeProperty("touch-action");
    };
  }, [menuOpen, appointmentOpen, introVisible, appointmentSuccessModal.visible]);

  /* ESCAPE */
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setAppointmentOpen(false);
        setAppointmentSuccessModal((prev) => ({ ...prev, visible: false }));
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const isActive = (path) => location.pathname === path;

  const toggleTheme = (event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();

    const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;

    document.documentElement.style.setProperty("--theme-x", `${x}%`);
    document.documentElement.style.setProperty("--theme-y", `${y}%`);

    document.documentElement.classList.remove("theme-changing");
    void document.documentElement.offsetWidth;
    document.documentElement.classList.add("theme-changing");

    setDarkMode((previous) => !previous);

    window.setTimeout(() => {
      document.documentElement.classList.remove("theme-changing");
    }, 800);
  };

  const toggleMenu = () => setMenuOpen((previous) => !previous);
  const closeMenu = () => setMenuOpen(false);

  const openAppointment = () => {
    setMenuOpen(false);
    setAppointmentError("");
    window.setTimeout(() => setAppointmentOpen(true), 180);
  };

  const closeAppointment = () => setAppointmentOpen(false);

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setAppointmentData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Submit appointment payload matching backend requirements precisely
  const handleAppointmentSubmit = async (event) => {
    event.preventDefault();

    setAppointmentError("");
    setAppointmentLoading(true);

    try {
      const patientName = String(appointmentData.name || "").trim();
      const phone = String(appointmentData.phone || "").trim();
      const email = String(appointmentData.email || "").trim();
      const appointmentDate = String(appointmentData.date || "").trim();
      const appointmentTime = String(appointmentData.time || "").trim();
      const ageCategory = String(appointmentData.ageGroup || "").trim();
      const problem = String(appointmentData.problem || "").trim();
      const selectedService = String(appointmentData.serviceId || "").trim();

      if (!patientName || patientName.length < 3) {
        setAppointmentError("Please enter a valid full name (at least 3 characters).");
        setAppointmentLoading(false);
        return;
      }

      const cleanPhone = phone.replace(/\D/g, "").slice(-10);
      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        setAppointmentError("Please enter a valid 10-digit Indian phone number.");
        setAppointmentLoading(false);
        return;
      }

      if (!appointmentDate) {
        setAppointmentError("Please select a preferred date.");
        setAppointmentLoading(false);
        return;
      }

      if (!appointmentTime) {
        setAppointmentError("Please select a preferred time slot.");
        setAppointmentLoading(false);
        return;
      }

      if (!ageCategory) {
        setAppointmentError("Please select an age category.");
        setAppointmentLoading(false);
        return;
      }

      if (!selectedService) {
        setAppointmentError("Please select a treatment.");
        setAppointmentLoading(false);
        return;
      }

      const isOther = selectedService.toLowerCase() === "other";
      let serviceId = null;
      let serviceName = null;

      if (isOther) {
        serviceId = null;
        serviceName = "Other";
      } else {
        serviceId = Number(selectedService);
        if (!serviceId || Number.isNaN(serviceId)) {
          setAppointmentError("Please select a valid treatment.");
          setAppointmentLoading(false);
          return;
        }
        const selectedObj = services.find((s) => String(s.serviceId ?? s.id) === String(selectedService));
        serviceName = selectedObj?.serviceName ?? selectedObj?.name ?? null;
      }

      if (!problem || problem.length < 10) {
        setAppointmentError("Please describe your problem in at least 10 characters.");
        setAppointmentLoading(false);
        return;
      }

      // Convert "05:00 PM" to "17:00:00" for backend LocalTime
      const convertTo24Hour = (timeStr) => {
        if (!timeStr) return null;
        const [time, modifier] = timeStr.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (modifier === "PM" && hours < 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
      };

      // Dynamically fetch FCM token for push notification on booking
      let userFcmToken = null;
      try {
        const { getUserFcmToken } = await import("../services/fcm");
        userFcmToken = await getUserFcmToken();
      } catch (tokenError) {
        console.error("Could not retrieve FCM token:", tokenError);
      }

      const payload = {
        patientName,
        phone: cleanPhone,
        email,
        appointmentDate,
        appointmentTime: convertTo24Hour(appointmentTime),
        ageCategory,
        message: problem,
        serviceId: serviceId,
        serviceName: serviceName,
        fcmToken: userFcmToken || null,
      };

      await postData(API.APPOINTMENT_BOOK, payload);

      setAppointmentOpen(false);

      const submittedName = appointmentData.name;
      const submittedDate = appointmentData.date;
      const submittedTime = appointmentData.time;
      const submittedDept = isOther ? "Other" : (serviceName ?? "Physiotherapy Care");

      setAppointmentData({
        name: "",
        phone: "",
        email: "",
        date: today,
        time: "",
        ageGroup: "",
        serviceId: "",
        problem: "",
      });

      setAppointmentSuccessModal({
        visible: true,
        patientName: submittedName,
        department: submittedDept,
        date: submittedDate,
        time: submittedTime,
      });

    } catch (err) {
      console.error(err);
      const errorMsg = err?.response?.data?.message || err?.response?.data?.error || "Unable to connect to server. Please try again.";
      setAppointmentError(errorMsg);
    } finally {
      setAppointmentLoading(false);
    }
  };

  const ThemeSwitch = ({ mobile = false }) => (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={darkMode}
      className={`theme-switch ${
        mobile ? "theme-switch-mobile" : "theme-switch-desktop"
      } ${darkMode ? "theme-switch-dark" : "theme-switch-light"}`}
    >
      <span className="theme-side-icon theme-sun">
        <i className="fa-solid fa-sun" />
      </span>

      <span className="theme-side-icon theme-moon">
        <i className="fa-solid fa-moon" />
      </span>

      <span className="theme-knob">
        <i
          className={`fa-solid ${
            darkMode ? "fa-moon theme-knob-moon" : "fa-sun theme-knob-sun"
          }`}
        />
      </span>
    </button>
  );

  return (
    <div className="user-shell">

      {/* =================================================
          PREMIUM INTRO
      ================================================= */}

      {introVisible && (
        <div className="wellborn-intro">
          <div className="intro-background">
            <div className="intro-orb intro-orb-one" />
            <div className="intro-orb intro-orb-two" />
            <div className="intro-orb intro-orb-three" />
          </div>

          <div className="intro-grid" />

          <div className="intro-content">
            <div className="intro-logo-wrap">
              <div className="intro-logo-ring intro-ring-one" />
              <div className="intro-logo-ring intro-ring-two" />
              <div className="intro-logo-glow" />

              <div className="intro-logo">
                <img
                  src="/assets/wellborn physio.jpg"
                  alt="Wellborn Physio"
                />
              </div>
            </div>

            <div className="intro-brand">
              <h1>
                Wellborn<span> Physio</span>
              </h1>

              <div className="intro-line">
                <span />
                <p>REHAB CENTRE</p>
                <span />
              </div>
            </div>

            <p className="intro-tagline">
              Move Better. Live Better.
            </p>

            <div className="intro-loading">
              <div className="intro-loading-track">
                <span />
              </div>

              <p>Preparing your wellness experience</p>
            </div>
          </div>
        </div>
      )}

      <div className="theme-change-glow" />

      {/* =================================================
          UNIQUE PREMIUM SUCCESS MODAL FOR APPOINTMENT
      ================================================= */}

      {appointmentSuccessModal.visible && (
        <div className="appointment-modal-overlay">
          <div
            className="appointment-modal-backdrop"
            onClick={() => setAppointmentSuccessModal((prev) => ({ ...prev, visible: false }))}
          />
          <div className="appointment-success-modal-card">
            <div className="modal-glow-effect" />
            
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setAppointmentSuccessModal((prev) => ({ ...prev, visible: false }))}
            >
              <i className="fa-solid fa-xmark" />
            </button>

            <div className="success-icon-wrapper">
              <div className="success-badge-icon">
                <i className="fa-solid fa-circle-check" />
              </div>
              <div className="sparkle-float-1"><i className="fa-solid fa-wand-magic-sparkles" /></div>
            </div>

            <div className="modal-content-text">
              <div className="modal-pill-tag">
                <i className="fa-solid fa-sparkles" /> Appointment Confirmed
              </div>
              <h3>Thank You, {appointmentSuccessModal.patientName}!</h3>
              <p>
                Your appointment for <strong>{appointmentSuccessModal.department}</strong> on <strong>{appointmentSuccessModal.date}</strong> at <strong>{appointmentSuccessModal.time}</strong> has been successfully booked. Our team will contact you shortly.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setAppointmentSuccessModal((prev) => ({ ...prev, visible: false }))}
              className="modal-action-btn"
            >
              <span>Back to Wellness</span>
              <i className="fa-solid fa-arrow-right" />
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          DESKTOP NAVBAR
      ================================================= */}

      <header className="desktop-navbar">
        <div className="desktop-navbar-inner">

          <Link to="/user/home" className="desktop-brand">
            <div className="brand-logo desktop-brand-logo">
              <span className="brand-logo-glow" />
              <span className="brand-logo-border" />

              <img
                src="/assets/wellborn physio.jpg"
                alt="Wellborn Physio"
              />
            </div>

            <div className="brand-text">
              <h1>
                Wellborn<span> Physio</span>
              </h1>

              <div className="brand-sub">
                <span />
                <p>Rehab Centre</p>
              </div>
            </div>
          </Link>

          <nav className="desktop-navigation">
            <div className="desktop-navigation-pill">
              {links.map((item) => {
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`desktop-nav-link ${active ? "active" : ""}`}
                  >
                    <i className={`fa-solid ${item.icon}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="desktop-actions">
            <button
              type="button"
              onClick={openAppointment}
              className="desktop-appointment"
            >
              <i className="fa-solid fa-calendar-check" />
              <span>Appointment</span>
            </button>

            <ThemeSwitch />
          </div>
        </div>
      </header>

      {/* =================================================
          MOBILE NAVBAR
      ================================================= */}

      <header className="mobile-navbar">
        <Link to="/user/home" className="mobile-brand">
          <div className="brand-logo mobile-brand-logo">
            <span className="brand-logo-glow" />
            <span className="brand-logo-border" />

            <img
              src="/assets/wellborn physio.jpg"
              alt="Wellborn Physio"
            />
          </div>

          <div className="mobile-brand-text">
            <h1>
              Wellborn<span> Physio</span>
            </h1>

            <div className="brand-sub">
              <span />
              <p>Rehab Centre</p>
            </div>
          </div>
        </Link>

        <div className="mobile-actions">
          <ThemeSwitch mobile />

          <button
            type="button"
            onClick={toggleMenu}
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            className={`mobile-menu-button ${
              menuOpen ? "menu-button-open" : ""
            }`}
          >
            <i className={`fa-solid ${menuOpen ? "fa-xmark" : "fa-bars"}`} />
          </button>
        </div>
      </header>

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="user-main">
        <Outlet
          context={{
            isHomePage: location.pathname === "/user/home",
          }}
        />
      </main>

      {/* =================================================
          MOBILE BACKDROP
      ================================================= */}

      <div
        className={`mobile-backdrop ${menuOpen ? "show" : ""}`}
        onClick={closeMenu}
      />

      {/* =================================================
          MOBILE MENU
      ================================================= */}

      <aside className={`mobile-menu-panel ${menuOpen ? "show" : ""}`}>
        <div className="mobile-menu-handle">
          <span />
        </div>

        <div className="mobile-menu-options">
          {links.map((item, index) => {
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                style={{
                  "--menu-delay": `${0.05 + index * 0.05}s`,
                }}
                className={`mobile-menu-option ${active ? "active" : ""}`}
              >
                {active && <span className="active-line" />}

                <span className="mobile-option-icon">
                  <i className={`fa-solid ${item.icon}`} />
                </span>

                <span className="mobile-option-name">
                  {item.name}
                </span>

                <span className="mobile-option-arrow">
                  <i className="fa-solid fa-chevron-right" />
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={openAppointment}
            className="mobile-appointment-button"
          >
            <span className="mobile-appointment-icon">
              <i className="fa-solid fa-calendar-check" />
            </span>

            <span>Book Appointment</span>

            <i className="fa-solid fa-arrow-right" />
          </button>
        </div>
      </aside>

      {/* =================================================
          APPOINTMENT POPUP (WITH TIME SLOT DROPDOWN)
      ================================================= */}

      {appointmentOpen && (
        <div
          className="appointment-overlay"
          onClick={closeAppointment}
        >
          <div
            className="appointment-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="appointment-handle">
              <span />
            </div>

            <div className="appointment-header">
              <div className="appointment-header-glow glow-one" />
              <div className="appointment-header-glow glow-two" />

              <button
                type="button"
                onClick={closeAppointment}
                aria-label="Close appointment"
                className="appointment-close"
              >
                <i className="fa-solid fa-xmark" />
              </button>

              <div className="appointment-icon">
                <i className="fa-solid fa-calendar-days" />
              </div>

              <h2>Book Appointment</h2>
              <p>Schedule your physiotherapy consultation</p>
            </div>

            <form
              onSubmit={handleAppointmentSubmit}
              className="appointment-form"
            >
              {appointmentError && (
                <p
                  style={{
                    color: "#dc2626",
                    fontSize: 11,
                    fontWeight: 700,
                    marginBottom: 8,
                  }}
                >
                  {appointmentError}
                </p>
              )}

              {/* FULL NAME */}
              <div className="appointment-field">
                <label htmlFor="popup-name">Full Name</label>
                <div className="appointment-input-wrap">
                  <span className="appointment-field-icon">
                    <i className="fa-solid fa-user" />
                  </span>
                  <input
                    id="popup-name"
                    type="text"
                    name="name"
                    value={appointmentData.name}
                    onChange={handleFormChange}
                    placeholder="Enter your name"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              {/* PHONE NUMBER */}
              <div className="appointment-field">
                <label htmlFor="popup-phone">Phone Number</label>
                <div className="appointment-input-wrap phone-input-shell">
                  <span className="appointment-field-icon">
                    <i className="fa-solid fa-phone" />
                  </span>
                  <span className="phone-prefix">+91</span>
                  <input
                    id="popup-phone"
                    type="tel"
                    name="phone"
                    value={appointmentData.phone}
                    onChange={handleFormChange}
                    placeholder="9876543210"
                    inputMode="numeric"
                    maxLength={10}
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>

              {/* EMAIL ADDRESS */}
              <div className="appointment-field">
                <label htmlFor="popup-email">Email Address</label>
                <div className="appointment-input-wrap">
                  <span className="appointment-field-icon">
                    <i className="fa-solid fa-envelope" />
                  </span>
                  <input
                    id="popup-email"
                    type="email"
                    name="email"
                    value={appointmentData.email}
                    onChange={handleFormChange}
                    placeholder="Enter your email address"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* PREFERRED DATE */}
              <div className="appointment-field">
                <label htmlFor="popup-date">Preferred Date</label>
                <div className="appointment-input-wrap">
                  <span className="appointment-field-icon">
                    <i className="fa-solid fa-calendar-days" />
                  </span>
                  <input
                    id="popup-date"
                    type="date"
                    name="date"
                    value={appointmentData.date}
                    onChange={handleFormChange}
                    min={today}
                    required
                  />
                </div>
              </div>

              {/* PREFERRED TIME DROPDOWN */}
              <div className="appointment-field" ref={popupTimeRef}>
                <label>Preferred Time</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setPopupTimeOpen(!popupTimeOpen)}
                    className="appointment-custom-dropdown"
                  >
                    <span className="appointment-field-icon">
                      <i className="fa-solid fa-clock" />
                    </span>
                    <span className={`truncate text-left pl-10 pr-6 w-full block ${!appointmentData.time ? "text-slate-400 font-normal" : "font-bold"}`}>
                      {appointmentData.time || "Select time slot"}
                    </span>
                    <i className={`fa-solid fa-chevron-down absolute right-3.5 transition-transform duration-300 ${popupTimeOpen ? "rotate-180" : ""}`} />
                  </button>

                  {popupTimeOpen && (
                    <div className="appointment-custom-menu">
                      {availableTimeOptions.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400">
                          No slots available for this date. Please select another date.
                        </div>
                      ) : (
                        availableTimeOptions.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => {
                              setAppointmentData((prev) => ({ ...prev, time: slot }));
                              setPopupTimeOpen(false);
                            }}
                            className={`appointment-custom-option ${appointmentData.time === slot ? "selected" : ""}`}
                          >
                            <span>{slot}</span>
                            {appointmentData.time === slot && <i className="fa-solid fa-circle-check text-cyan-500 ml-auto" />}
                          </button>
                        ))
                      )}
                    </div>
                  )}
                  <input type="hidden" name="time" value={appointmentData.time} required />
                </div>
              </div>

              {/* PREMIUM AGE CATEGORY DROPDOWN */}
              <div className="appointment-field" ref={popupAgeRef}>
                <label>Age Category</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setPopupAgeOpen(!popupAgeOpen)}
                    className="appointment-custom-dropdown"
                  >
                    <span className="appointment-field-icon">
                      <i className="fa-solid fa-user-group" />
                    </span>
                    <span className={`truncate text-left pl-10 pr-6 w-full block ${!appointmentData.ageGroup ? "text-slate-400 font-normal" : "font-bold"}`}>
                      {appointmentData.ageGroup || "Select age category"}
                    </span>
                    <i className={`fa-solid fa-chevron-down absolute right-3.5 transition-transform duration-300 ${popupAgeOpen ? "rotate-180" : ""}`} />
                  </button>

                  {popupAgeOpen && (
                    <div className="appointment-custom-menu">
                      {ageOptions.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            setAppointmentData((prev) => ({ ...prev, ageGroup: opt }));
                            setPopupAgeOpen(false);
                          }}
                          className={`appointment-custom-option ${appointmentData.ageGroup === opt ? "selected" : ""}`}
                        >
                          <span>{opt}</span>
                          {appointmentData.ageGroup === opt && <i className="fa-solid fa-circle-check text-cyan-500 ml-auto" />}
                        </button>
                      ))}
                    </div>
                  )}
                  <input type="hidden" name="ageGroup" value={appointmentData.ageGroup} required />
                </div>
              </div>

              {/* PREMIUM TREATMENT DROPDOWN */}
              <div className="appointment-field" ref={popupTreatmentRef}>
                <label>Treatment</label>
                <div className="relative">
                  <button
                    type="button"
                    disabled={services.length === 0}
                    onClick={() => services.length > 0 && setPopupTreatmentOpen(!popupTreatmentOpen)}
                    className="appointment-custom-dropdown"
                  >
                    <span className="appointment-field-icon">
                      <i className="fa-solid fa-stethoscope" />
                    </span>
                    <span className={`truncate text-left pl-10 pr-6 w-full block ${!appointmentData.serviceId ? "text-slate-400 font-normal" : "font-bold"}`}>
                      {services.length === 0
                        ? "Loading treatments..."
                        : appointmentData.serviceId === "other"
                        ? "Other"
                        : services.find((s) => String(s.serviceId ?? s.id) === String(appointmentData.serviceId))?.serviceName ||
                          services.find((s) => String(s.serviceId ?? s.id) === String(appointmentData.serviceId))?.name ||
                          "Select treatment"}
                    </span>
                    <i className={`fa-solid fa-chevron-down absolute right-3.5 transition-transform duration-300 ${popupTreatmentOpen ? "rotate-180" : ""}`} />
                  </button>

                  {popupTreatmentOpen && (
                    <div className="appointment-custom-menu">
                      {services.map((service) => {
                        const id = String(service.serviceId ?? service.id);
                        const name = service.serviceName ?? service.name ?? "Treatment";
                        const isSelected = String(appointmentData.serviceId) === id;

                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => {
                              setAppointmentData((prev) => ({
                                ...prev,
                                serviceId: id,
                                department: name,
                              }));
                              setPopupTreatmentOpen(false);
                            }}
                            className={`appointment-custom-option ${isSelected ? "selected" : ""}`}
                          >
                            <span>{name}</span>
                            {isSelected && <i className="fa-solid fa-circle-check text-cyan-500 ml-auto" />}
                          </button>
                        );
                      })}

                      <button
                        type="button"
                        onClick={() => {
                          setAppointmentData((prev) => ({
                            ...prev,
                            serviceId: "other",
                            department: "Other",
                          }));
                          setPopupTreatmentOpen(false);
                        }}
                        className={`appointment-custom-option ${appointmentData.serviceId === "other" ? "selected" : ""}`}
                      >
                        <span>Other</span>
                        {appointmentData.serviceId === "other" && <i className="fa-solid fa-circle-check text-cyan-500 ml-auto" />}
                      </button>
                    </div>
                  )}
                  <input type="hidden" name="serviceId" value={appointmentData.serviceId} required />
                </div>
              </div>

              {/* DESCRIBE YOUR PROBLEM */}
              <div className="appointment-field">
                <label htmlFor="popup-problem">Describe Your Problem</label>
                <div className="appointment-input-wrap appointment-textarea-wrap">
                  <span className="appointment-field-icon" style={{ top: 8 }}>
                    <i className="fa-solid fa-message" />
                  </span>
                  <textarea
                    id="popup-problem"
                    name="problem"
                    value={appointmentData.problem}
                    onChange={handleFormChange}
                    placeholder="Tell us about your problem..."
                    rows={3}
                    minLength={10}
                    maxLength={1000}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="appointment-submit"
                disabled={appointmentLoading}
              >
                <span>
                  <i className="fa-solid fa-calendar-check" />
                  {appointmentLoading ? "Booking..." : "Book Appointment"}
                </span>
                <i className="fa-solid fa-arrow-right" />
              </button>

              <p className="appointment-note">
                Your appointment request will be securely submitted.
              </p>
            </form>
          </div> 
        </div>
      )}

      {/* =================================================
          GLOBAL WHATSAPP
      ================================================= */}

      <a
        href="https://wa.me/919342752147?text=Hello%20Wellborn%20Physio%2C%20I%20would%20like%20to%20book%20an%20appointment"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="wellborn-global-whatsapp"
      >
        <span className="wellborn-whatsapp-pulse" />

        <span className="wellborn-whatsapp-button">
          <svg
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg" 
            aria-hidden="true" 
          > 
            <path d="M20.52 3.48A11.8 11.8 0 0 0 12.08 0C5.57 0 .27 5.3.27 11.81c0 2.08.54 4.11 1.57 5.9L.2 24l6.43-1.68a11.8 11.8 0 0 0 5.45 1.38h.01c6.51 0 11.81-5.3 11.81-11.81 0-3.15-1.23-6.11-3.38-8.41ZM12.09 21.7h-.01a9.84 9.84 0 0 1-5.02-1.37l-.36-.21-3.82 1 1.02-3.72-.23-.38a9.84 9.84 0 0 1-1.51-5.21C2.16 6.38 6.62 1.92 12.09 1.92c2.65 0 5.14 1.03 7.01 2.9a9.84 9.84 0 0 1 2.9 7c0 5.47-4.46 9.93-9.91 9.93Zm5.44-7.44c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.28-.47-2.43-1.5-.9-.8-1.5-1.78-1.68-2.08-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.05 1.03-1.05 2.5s1.07 2.9 1.22 3.1c.15.2 2.1 3.2 5.09 4.49.71.31 1.26.49 1.69.63.71.23 1.35.2 1.86.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z" /> 
          </svg> 
        </span> 
      </a> 

      {/* ================================================= 
          CSS 
      ================================================= */} 

      <style>{` 
        *, 
        *::before, 
        *::after { 
          box-sizing: border-box; 
          -webkit-tap-highlight-color: transparent; 
        } 

        html, 
        body, 
        #root { 
          width: 100%; 
          min-height: 100%; 
          margin: 0; 
          padding: 0; 
        } 

        html { 
          overflow-x: hidden; 
          background: #f6f9fd; 
          scroll-behavior: smooth; 
        } 

        html.dark { 
          background: #0f172a; 
        } 

        body { 
          margin: 0; 
          overflow-x: hidden; 
          overflow-y: auto; 
          font-family: "Poppins", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; 
          background: #f6f9fd; 
          color: #0f172a; 
          -webkit-overflow-scrolling: touch; 
          overscroll-behavior-x: none; 
          transition: background-color .7s ease, color .7s ease; 
        } 

        .dark body { 
          background: #0f172a; 
          color: #e2e8f0; 
        } 

        #root { 
          min-height: 100dvh; 
          overflow-x: hidden; 
        } 

        html.wellborn-lock, 
        body.wellborn-lock { 
          overflow: hidden !important; 
        } 

        body.wellborn-lock { 
          touch-action: none; 
        } 

        .user-shell { 
          position: relative; 
          width: 100%; 
          min-height: 100dvh; 
          overflow-x: clip; 
          background: #f6f9fd; 
          color: #0f172a; 
          transition: background-color .7s ease, color .7s ease; 
        } 

        .dark .user-shell { 
          background: #0f172a; 
          color: #e2e8f0; 
        } 

        .user-main { 
          width: 100%; 
          min-height: 100dvh; 
          overflow: visible; 
          padding-top: 92px; 
        } 

        /* PREMIUM CUSTOM DROPDOWN STYLES FOR NAVBAR POPUP */ 
        .appointment-custom-dropdown { 
          width: 100%; 
          min-height: 38px; 
          display: flex; 
          align-items: center; 
          border: 1px solid #e2e8f0; 
          border-radius: 10px; 
          background: #f8fafc; 
          color: #0f172a; 
          font-size: 11px; 
          cursor: pointer; 
          position: relative; 
          transition: all .25s ease; 
        } 

        .dark .appointment-custom-dropdown { 
          background: #1e293b; 
          border-color: #475569; 
          color: #f8fafc; 
        } 

        .appointment-custom-dropdown:hover { 
          border-color: #3b82f6; 
        } 

        .appointment-custom-menu { 
          position: absolute; 
          left: 0; 
          right: 0; 
          top: calc(100% + 4px); 
          z-index: 99999; 
          max-height: 190px; 
          overflow-y: auto; 
          border-radius: 12px; 
          border: 1px solid #e2e8f0; 
          background: white; 
          box-shadow: 0 15px 35px rgba(0,0,0,0.15); 
          padding: 4px; 
          animation: wellbornDropdown .18s ease-out; 
        } 

        .dark .appointment-custom-menu { 
          background: #1e293b; 
          border-color: #475569; 
          box-shadow: 0 15px 35px rgba(0,0,0,0.45); 
        } 

        .appointment-custom-option { 
          display: flex; 
          align-items: center; 
          width: 100%; 
          padding: 8px 10px; 
          border-radius: 8px; 
          border: none; 
          background: transparent; 
          font-size: 11px; 
          font-weight: 600; 
          color: #334155; 
          cursor: pointer; 
          text-align: left; 
          transition: background 0.15s ease; 
        } 

        .dark .appointment-custom-option { 
          color: #cbd5e1; 
        } 

        .appointment-custom-option:hover { 
          background: #f1f5f9; 
          color: #0f172a; 
        } 

        .dark .appointment-custom-option:hover { 
          background: #334155; 
          color: white; 
        } 

        .appointment-custom-option.selected { 
          background: #eff6ff; 
          color: #2563eb; 
          font-weight: 800; 
        } 

        .dark .appointment-custom-option.selected { 
          background: rgba(37,99,235,0.25); 
          color: #60a5fa; 
        } 

        @keyframes wellbornDropdown { 
          0% { opacity: 0; transform: translateY(4px) scale(.98); } 
          100% { opacity: 1; transform: translateY(0) scale(1); } 
        } 

        .appointment-field-icon { 
          position: absolute; 
          left: 6px; 
          width: 26px; 
          height: 26px; 
          border-radius: 8px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          background: #eff6ff; 
          color: #2563eb; 
          font-size: 11px; 
          z-index: 2; 
          pointer-events: none; 
        } 

        .dark .appointment-field-icon { 
          background: rgba(37,99,235,.2); 
          color: #60a5fa; 
        } 

        /* APPOINTMENT SUCCESS MODAL POPUP STYLES */ 
        .appointment-modal-overlay { 
          position: fixed; 
          inset: 0; 
          z-index: 99999; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          padding: 20px; 
          animation: fadeInOverlay 0.3s ease; 
        } 

        @keyframes fadeInOverlay { 
          from { opacity: 0; } 
          to { opacity: 1; } 
        } 

        .appointment-modal-backdrop { 
          position: absolute; 
          inset: 0; 
          background: rgba(5, 7, 13, 0.75); 
          backdrop-filter: blur(12px); 
          -webkit-backdrop-filter: blur(12px); 
        } 

        .appointment-success-modal-card { 
          position: relative; 
          z-index: 10; 
          width: 100%; 
          max-width: 420px; 
          padding: 32px; 
          border-radius: 28px; 
          background: linear-gradient(145deg, #1e293b, #0f172a); 
          border: 1px solid rgba(103, 232, 249, 0.25); 
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(37, 99, 235, 0.2); 
          text-align: center; 
          color: white; 
          overflow: hidden; 
          animation: modalScaleIn 0.35s cubic-bezier(0.22, 1, 0.36, 1); 
        } 

        @keyframes modalScaleIn { 
          from { opacity: 0; transform: scale(0.85) translateY(20px); } 
          to { opacity: 1; transform: scale(1) translateY(0); } 
        } 

        .modal-glow-effect { 
          position: absolute; 
          top: -60px; 
          left: 50%; 
          transform: translateX(-50%); 
          width: 180px; 
          height: 180px; 
          border-radius: 50%; 
          background: rgba(37, 99, 235, 0.35); 
          filter: blur(40px); 
          pointer-events: none; 
        } 

        .modal-close-btn { 
          position: absolute; 
          top: 18px; 
          right: 18px; 
          width: 32px; 
          height: 32px; 
          border-radius: 50%; 
          background: rgba(255, 255, 255, 0.08); 
          border: 1px solid rgba(255, 255, 255, 0.12); 
          color: #94a3b8; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          cursor: pointer; 
          transition: all 0.2s ease; 
        } 

        .modal-close-btn:hover { 
          background: rgba(255, 255, 255, 0.15); 
          color: white; 
        } 

        .success-icon-wrapper { 
          position: relative; 
          width: 76px; 
          height: 76px; 
          margin: 0 auto; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          border-radius: 24px; 
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(6, 182, 212, 0.2)); 
          border: 1px solid rgba(103, 232, 249, 0.3); 
        } 

        .success-badge-icon { 
          color: #22d3ee; 
          font-size: 32px; 
        } 

        .sparkle-float-1 { 
          position: absolute; 
          top: -6px; 
          right: -6px; 
          color: #38bdf8; 
          animation: bounceSparkle 2s ease-in-out infinite; 
        } 

        @keyframes bounceSparkle { 
          0%, 100% { transform: translateY(0) scale(1); } 
          50% { transform: translateY(-4px) scale(1.15); } 
        } 

        .modal-content-text { 
          margin-top: 20px; 
        } 

        .modal-pill-tag { 
          display: inline-flex; 
          align-items: center; 
          gap: 6px; 
          padding: 5px 12px; 
          border-radius: 999px; 
          background: rgba(34, 211, 238, 0.1); 
          border: 1px solid rgba(34, 211, 238, 0.25); 
          color: #22d3ee; 
          font-size: 10px; 
          font-weight: 800; 
          letter-spacing: 0.05em; 
          text-transform: uppercase; 
        } 

        .modal-content-text h3 { 
          margin-top: 14px; 
          font-size: 22px; 
          font-weight: 900; 
          color: white; 
        } 

        .modal-content-text p { 
          margin-top: 8px; 
          color: #94a3b8; 
          font-size: 12px; 
          line-height: 1.7; 
        } 

        .modal-action-btn { 
          width: 100%; 
          min-height: 48px; 
          margin-top: 24px; 
          border: none; 
          border-radius: 14px; 
          background: linear-gradient(135deg, #2563eb, #0891b2); 
          color: white; 
          font-size: 12px; 
          font-weight: 850; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 8px; 
          cursor: pointer; 
          box-shadow: 0 10px 25px rgba(37, 99, 235, 0.3); 
          transition: transform 0.2s ease; 
        } 

        .modal-action-btn:hover { 
          transform: translateY(-2px); 
        } 

        /* PREMIUM INTRO */ 
        .wellborn-intro { 
          position: fixed; 
          inset: 0; 
          z-index: 9999999; 
          width: 100vw; 
          height: 100dvh; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          overflow: hidden; 
          background: radial-gradient(circle at 50% 45%, #e8fbff 0%, #c9f4ff 22%, #8de3ff 45%, #38bdf8 70%, #0ea5e9 100%); 
          color: #082f49; 
          animation: introAppear .8s cubic-bezier(.22,1,.36,1) both; 
        } 

        .intro-background { 
          position: absolute; 
          inset: 0; 
          overflow: hidden; 
          pointer-events: none; 
        } 

        .intro-background::before { 
          content: ""; 
          position: absolute; 
          inset: -20%; 
          pointer-events: none; 
          background-image: radial-gradient(circle, rgba(3,105,161,.48) 1px, transparent 1.6px), radial-gradient(circle, rgba(14,116,204,.38) 1px, transparent 1.6px), radial-gradient(circle, rgba(6,182,212,.34) .8px, transparent 1.5px), radial-gradient(circle, rgba(2,132,199,.32) .7px, transparent 1.4px); 
          background-size: 47px 53px, 71px 67px, 31px 37px, 89px 83px; 
          background-position: 0 0, 20px 35px, 10px 15px, 45px 20px; 
          opacity: .78; 
          animation: introMicroDots 18s linear infinite; 
        } 

        .intro-background::after { 
          content: ""; 
          position: absolute; 
          inset: -20%; 
          pointer-events: none; 
          background-image: radial-gradient(circle, rgba(2,132,199,.34) .6px, transparent 1.2px), radial-gradient(circle, rgba(14,165,233,.28) .7px, transparent 1.3px), radial-gradient(circle, rgba(6,182,212,.25) .5px, transparent 1px); 
          background-size: 43px 61px, 97px 73px, 59px 47px; 
          background-position: 12px 27px, 40px 8px, 5px 35px; 
          opacity: .70; 
          animation: introMicroDotsReverse 24s linear infinite; 
        } 

        .intro-grid { 
          position: absolute; 
          inset: 0; 
          opacity: .16; 
          pointer-events: none; 
          background-image: linear-gradient(rgba(14,116,204,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(14,116,204,.12) 1px, transparent 1px); 
          background-size: 45px 45px; 
          mask-image: radial-gradient(ellipse at center, black 0%, transparent 72%); 
          animation: introGridMove 8s linear infinite; 
        } 

        .intro-orb { 
          position: absolute; 
          border-radius: 50%; 
          filter: blur(70px); 
          opacity: .42; 
          pointer-events: none; 
        } 

        .intro-orb-one { 
          width: 360px; 
          height: 360px; 
          top: -130px; 
          left: -100px; 
          background: rgba(14,165,233,.55); 
          animation: introOrbOne 6s ease-in-out infinite; 
        } 

        .intro-orb-two { 
          width: 420px; 
          height: 420px; 
          right: -160px; 
          bottom: -150px; 
          background: rgba(37,99,235,.45); 
          animation: introOrbTwo 7s ease-in-out infinite; 
        } 

        .intro-orb-three { 
          width: 250px; 
          height: 250px; 
          left: 50%; 
          top: 42%; 
          transform: translate(-50%,-50%); 
          background: rgba(6,182,212,.32); 
          filter: blur(90px); 
          animation: introOrbThree 4s ease-in-out infinite; 
        } 

        .intro-content { 
          position: relative; 
          z-index: 5; 
          width: min(90vw, 520px); 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          text-align: center; 
          animation: introContentIn 1.1s cubic-bezier(.22,1,.36,1) .1s both; 
        } 

        .intro-logo-wrap { 
          position: relative; 
          width: 145px; 
          height: 145px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          margin-bottom: 30px; 
        } 

        .intro-logo-glow { 
          position: absolute; 
          width: 125px; 
          height: 125px; 
          border-radius: 50%; 
          background: radial-gradient(circle, rgba(14,165,233,.65), rgba(6,182,212,.30) 42%, transparent 72%); 
          filter: blur(10px); 
          animation: introLogoGlow 2s ease-in-out infinite; 
        } 

        .intro-logo-ring { 
          position: absolute; 
          border-radius: 50%; 
          border: 1px solid rgba(14,116,204,.38); 
          pointer-events: none; 
        } 

        .intro-ring-one { 
          width: 128px; 
          height: 128px; 
          animation: introRingOne 2.5s cubic-bezier(.22,1,.36,1) infinite; 
        } 

        .intro-ring-two { 
          width: 150px; 
          height: 150px; 
          border-color: rgba(6,182,212,.30); 
          animation: introRingTwo 3s cubic-bezier(.22,1,.36,1) infinite; 
        } 

        .intro-logo { 
          position: relative; 
          z-index: 4; 
          width: 92px; 
          height: 92px; 
          overflow: hidden; 
          border-radius: 27px; 
          background: white; 
          border: 2px solid rgba(255,255,255,.95); 
          box-shadow: 0 0 0 8px rgba(255,255,255,.18), 0 0 35px rgba(14,165,233,.45), 0 18px 50px rgba(3,105,161,.25); 
          animation: introLogoFloat 2.8s ease-in-out infinite; 
        } 

        .intro-logo::after { 
          content: ""; 
          position: absolute; 
          inset: 0; 
          background: linear-gradient(135deg, rgba(255,255,255,.40), transparent 42%, rgba(34,211,238,.14)); 
          pointer-events: none; 
        } 

        .intro-logo img { 
          width: 100%; 
          height: 100%; 
          display: block; 
          object-fit: cover; 
        } 

        .intro-brand { 
          opacity: 0; 
          animation: introBrandIn .8s cubic-bezier(.22,1,.36,1) .45s forwards; 
        } 

        .intro-brand h1 { 
          margin: 0; 
          font-size: clamp(32px, 8vw, 48px); 
          line-height: 1; 
          font-weight: 900; 
          letter-spacing: -.045em; 
          color: #082f49; 
          text-shadow: 0 5px 25px rgba(255,255,255,.35); 
        } 

        .intro-brand h1 span { 
          background: linear-gradient(135deg, #0369a1, #0284c7, #06b6d4); 
          -webkit-background-clip: text; 
          background-clip: text; 
          -webkit-text-fill-color: transparent; 
        } 

        .intro-line { 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 9px; 
          margin-top: 13px; 
        } 

        .intro-line span { 
          width: 30px; 
          height: 1px; 
          background: linear-gradient(90deg, transparent, #0284c7); 
        } 

        .intro-line span:last-child { 
          background: linear-gradient(90deg, #06b6d4, transparent); 
        } 

        .intro-line p { 
          margin: 0; 
          font-size: 9px; 
          font-weight: 800; 
          letter-spacing: .30em; 
          color: #075985; 
        } 

        .intro-tagline { 
          margin: 24px 0 0; 
          font-size: clamp(13px, 3.5vw, 16px); 
          font-weight: 500; 
          letter-spacing: .08em; 
          color: #164e63; 
          opacity: 0; 
          animation: introTaglineIn .8s ease .85s forwards; 
        } 

        .intro-loading { 
          width: min(270px,70vw); 
          margin-top: 32px; 
          opacity: 0; 
          animation: introLoadingIn .7s ease 1.1s forwards; 
        } 

        .intro-loading-track { 
          position: relative; 
          width: 100%; 
          height: 3px; 
          overflow: hidden; 
          border-radius: 999px; 
          background: rgba(7,89,133,.15); 
        } 

        .intro-loading-track span { 
          position: absolute; 
          left: 0; 
          top: 0; 
          width: 0%; 
          height: 100%; 
          border-radius: inherit; 
          background: linear-gradient(90deg, #0369a1, #06b6d4, #38bdf8); 
          box-shadow: 0 0 15px rgba(14,165,233,.75); 
          animation: introLoading 5s linear .35s forwards; 
        } 

        .intro-loading p { 
          margin: 11px 0 0; 
          font-size: 9px; 
          font-weight: 600; 
          letter-spacing: .12em; 
          color: #075985; 
        } 

        @keyframes introAppear { 
          0% { opacity: 0; transform: scale(1.025); } 
          100% { opacity: 1; transform: scale(1); } 
        } 

        @keyframes introMicroDots { 
          0% { transform: translate3d(0, 0, 0); } 
          25% { transform: translate3d(-18px, -25px, 0); } 
          50% { transform: translate3d(12px, -45px, 0); } 
          75% { transform: translate3d(28px, -20px, 0); } 
          100% { transform: translate3d(0, 0, 0); } 
        } 

        @keyframes introMicroDotsReverse { 
          0% { transform: translate3d(0, 0, 0); } 
          25% { transform: translate3d(25px, 18px, 0); } 
          50% { transform: translate3d(-20px, 38px, 0); } 
          75% { transform: translate3d(-35px, 12px, 0); } 
          100% { transform: translate3d(0, 0, 0); } 
        } 

        @keyframes introGridMove { 
          0% { background-position: 0 0; } 
          100% { background-position: 45px 45px; } 
        } 

        @keyframes introOrbOne { 
          0%, 100% { transform: translate(0, 0) scale(1); } 
          50% { transform: translate(55px, 35px) scale(1.12); } 
        } 

        @keyframes introOrbTwo { 
          0%, 100% { transform: translate(0, 0) scale(1); } 
          50% { transform: translate(-55px, -35px) scale(1.1); } 
        } 

        @keyframes introOrbThree { 
          0%, 100% { transform: translate(-50%, -50%) scale(1); } 
          50% { transform: translate(-50%, -50%) scale(1.18); } 
        } 

        @keyframes introContentIn { 
          0% { opacity: 0; transform: translateY(35px) scale(.96); filter: blur(8px); } 
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } 
        } 

        @keyframes introLogoGlow { 
          0%, 100% { opacity: .65; transform: scale(.92); } 
          50% { opacity: 1; transform: scale(1.12); } 
        } 

        @keyframes introRingOne { 
          0%, 100% { opacity: .35; transform: scale(.92) rotate(0deg); } 
          50% { opacity: .9; transform: scale(1.08) rotate(180deg); } 
        } 

        @keyframes introRingTwo { 
          0%, 100% { opacity: .2; transform: scale(.96) rotate(0deg); } 
          50% { opacity: .65; transform: scale(1.14) rotate(-180deg); } 
        } 

        @keyframes introLogoFloat { 
          0%, 100% { transform: translateY(0); } 
          50% { transform: translateY(-8px); } 
        } 

        @keyframes introBrandIn { 
          0% { opacity: 0; transform: translateY(16px); filter: blur(5px); } 
          100% { opacity: 1; transform: translateY(0); filter: blur(0); } 
        } 

        @keyframes introTaglineIn { 
          0% { opacity: 0; transform: translateY(12px); } 
          100% { opacity: 1; transform: translateY(0); } 
        } 

        @keyframes introLoadingIn { 
          0% { opacity: 0; transform: translateY(10px); } 
          100% { opacity: 1; transform: translateY(0); } 
        } 

        @keyframes introLoading { 
          0% { width: 0%; } 
          20% { width: 20%; } 
          40% { width: 40%; } 
          60% { width: 60%; } 
          80% { width: 80%; } 
          100% { width: 100%; } 
        } 

        /* THEME GLOW */ 
        .theme-change-glow { 
          position: fixed; 
          inset: 0; 
          z-index: 999998; 
          pointer-events: none; 
          opacity: 0; 
          background: radial-gradient(circle at var(--theme-x,50%) var(--theme-y,50%), rgba(59,130,246,.18), rgba(59,130,246,.06) 22%, transparent 48%); 
          transform: scale(.8); 
          mix-blend-mode: screen; 
        } 

        html.theme-changing .theme-change-glow { 
          opacity: 1; 
          animation: themeGlow .8s cubic-bezier(.22,1,.36,1); 
        } 

        @keyframes themeGlow { 
          0% { opacity: 0; transform: scale(.78); } 
          20% { opacity: 1; } 
          65% { opacity: .65; } 
          100% { opacity: 0; transform: scale(1.15); } 
        } 

        /* BRAND */ 
        .desktop-brand, 
        .mobile-brand { 
          text-decoration: none; 
          color: inherit; 
        } 

        .desktop-brand { 
          display: flex; 
          align-items: center; 
          gap: 12px; 
          min-width: 240px; 
          flex-shrink: 0; 
        } 

        .brand-logo { 
          position: relative; 
          overflow: hidden; 
          flex-shrink: 0; 
          background: rgba(255,255,255,.96); 
          border: 1px solid rgba(255,255,255,.90); 
          box-shadow: 0 7px 25px rgba(37,99,235,.12); 
          transition: transform .4s ease, background-color .65s ease, border-color .65s ease; 
        } 

        .brand-logo img { 
          position: relative; 
          z-index: 1; 
          width: 100%; 
          height: 100%; 
          object-fit: cover; 
          display: block; 
        } 

        .desktop-brand-logo { width: 54px; height: 54px; border-radius: 16px; } 
        .mobile-brand-logo { width: 48px; height: 48px; border-radius: 15px; } 

        .brand-logo-glow { 
          position: absolute; 
          inset: 0; 
          z-index: 2; 
          pointer-events: none; 
          background: linear-gradient(135deg, rgba(59,130,246,.12), transparent 45%, rgba(34,211,238,.10)); 
        } 

        .brand-logo-border { 
          position: absolute; 
          inset: 1px; 
          z-index: 3; 
          border-radius: inherit; 
          border: 1px solid rgba(255,255,255,.65); 
          pointer-events: none; 
        } 

        .dark .brand-logo { 
          background: #1e293b; 
          border-color: #475569; 
          box-shadow: 0 8px 25px rgba(0,0,0,.35); 
        } 

        .dark .brand-logo-border { 
          border-color: rgba(148,163,184,.20); 
        } 

        .desktop-brand:hover .brand-logo, 
        .mobile-brand:hover .brand-logo { 
          transform: translateY(-2px) scale(1.035) rotate(-1deg); 
        } 

        .brand-text, 
        .mobile-brand-text { 
          display: flex; 
          flex-direction: column; 
          justify-content: center; 
          min-width: 0; 
          line-height: 1; 
        } 

        .brand-text h1, 
        .mobile-brand-text h1 { 
          margin: 0; 
          padding: 0; 
          font-weight: 900; 
          letter-spacing: -.025em; 
          color: #0f172a; 
          white-space: nowrap; 
        } 

        .brand-text h1 { font-size: 18px; } 
        .mobile-brand-text h1 { font-size: 15px; } 

        .brand-text h1 span, 
        .mobile-brand-text h1 span { 
          color: #2563eb; 
        } 

        .dark .brand-text h1, 
        .dark .mobile-brand-text h1 { color: #f8fafc; } 
        .dark .brand-text h1 span, 
        .dark .mobile-brand-text h1 span { color: #60a5fa; } 

        .brand-sub { 
          display: flex; 
          align-items: center; 
          gap: 6px; 
          margin-top: 6px; 
        } 

        .brand-sub > span { 
          width: 22px; 
          height: 2px; 
          border-radius: 999px; 
          background: linear-gradient(90deg, #2563eb, #06b6d4); 
        } 

        .brand-sub p { 
          margin: 0; 
          padding: 0; 
          font-size: 9px; 
          font-weight: 800; 
          letter-spacing: .14em; 
          text-transform: uppercase; 
          color: #64748b; 
          white-space: nowrap; 
        } 

        .dark .brand-sub p { color: #94a3b8; } 

        /* DESKTOP NAVBAR */ 
        .desktop-navbar { 
          position: fixed; 
          top: 10px; 
          left: 14px; 
          right: 14px; 
          z-index: 10000; 
          height: 72px; 
          display: flex; 
          align-items: center; 
          border-radius: 22px; 
          background: rgba(255,255,255,.88); 
          backdrop-filter: blur(24px); 
          -webkit-backdrop-filter: blur(24px); 
          border: 1px solid rgba(255,255,255,.75); 
          box-shadow: 0 14px 50px rgba(15,23,42,.08); 
        } 

        .dark .desktop-navbar { 
          background: rgba(30,41,59,.92); 
          border-color: #475569; 
          box-shadow: 0 16px 55px rgba(0,0,0,.34); 
        } 

        .desktop-navbar-inner { 
          width: 100%; 
          max-width: 1540px; 
          height: 100%; 
          margin: 0 auto; 
          padding: 0 14px; 
          display: flex; 
          align-items: center; 
          gap: 10px; 
        } 

        .desktop-navigation { 
          flex: 1; 
          min-width: 0; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          padding: 0 10px; 
        } 

        .desktop-navigation-pill { 
          display: flex; 
          align-items: center; 
          gap: 3px; 
          padding: 4px; 
          border-radius: 17px; 
          background: rgba(248,250,252,.92); 
          border: 1px solid #e2e8f0; 
        } 

        .dark .desktop-navigation-pill { 
          background: rgba(15,23,42,.78); 
          border-color: #475569; 
        } 

        .desktop-nav-link { 
          position: relative; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 8px; 
          padding: 9px 13px; 
          border-radius: 13px; 
          font-size: 13px; 
          font-weight: 700; 
          color: #64748b; 
          text-decoration: none; 
          white-space: nowrap; 
          transition: color .35s ease, background-color .4s ease, transform .35s ease; 
        } 

        .desktop-nav-link:hover { 
          color: #2563eb; 
          background: #fff; 
          transform: translateY(-1px); 
        } 

        .dark .desktop-nav-link { color: #cbd5e1; } 
        .dark .desktop-nav-link:hover { color: #60a5fa; background: #334155; } 

        .desktop-nav-link.active { 
          color: white; 
          background: linear-gradient(135deg, #1d4ed8, #2563eb, #0891b2); 
          box-shadow: 0 6px 20px rgba(37,99,235,.25); 
        } 

        .desktop-actions { 
          min-width: 240px; 
          flex-shrink: 0; 
          display: flex; 
          align-items: center; 
          justify-content: flex-end; 
          gap: 9px; 
        } 

        .desktop-appointment { 
          display: flex; 
          align-items: center; 
          gap: 8px; 
          min-height: 39px; 
          padding: 0 14px; 
          border: none; 
          border-radius: 13px; 
          background: linear-gradient(135deg, #1d4ed8, #0891b2); 
          color: white; 
          font-size: 12px; 
          font-weight: 800; 
          cursor: pointer; 
          box-shadow: 0 7px 18px rgba(37,99,235,.20); 
          transition: transform .35s ease, box-shadow .35s ease; 
        } 

        .desktop-appointment:hover { 
          transform: translateY(-2px) scale(1.015); 
          box-shadow: 0 12px 28px rgba(37,99,235,.30); 
        } 

        /* THEME SWITCH */ 
        .theme-switch { 
          position: relative; 
          display: flex; 
          align-items: center; 
          flex-shrink: 0; 
          padding: 0; 
          border-radius: 999px; 
          overflow: hidden; 
          cursor: pointer; 
          isolation: isolate; 
          transition: transform .45s ease, background-color .55s ease, border-color .55s ease; 
        } 

        .theme-switch:hover { transform: translateY(-1px) scale(1.045); } 
        .theme-switch:active { transform: scale(.91); } 

        .theme-switch-desktop { width: 66px; height: 36px; } 
        .theme-switch-mobile { width: 58px; height: 32px; } 

        .theme-switch-light { 
          background: linear-gradient(135deg, #e0f2fe, #eff6ff); 
          border: 1px solid #bfdbfe; 
          box-shadow: 0 7px 20px rgba(37,99,235,.12); 
        } 

        .theme-switch-dark { 
          background: linear-gradient(135deg, #1e293b, #0f172a); 
          border: 1px solid #475569; 
        } 

        .theme-side-icon { 
          position: absolute; 
          top: 50%; 
          width: 16px; 
          height: 16px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          transform: translateY(-50%); 
          pointer-events: none; 
        } 

        .theme-sun { left: 7px; color: #f97316; } 
        .theme-moon { right: 7px; color: #64748b; opacity: .35; } 

        .theme-switch-dark .theme-sun { opacity: .18; } 
        .theme-switch-dark .theme-moon { opacity: 1; color: #fde047; } 

        .theme-knob { 
          position: absolute; 
          top: 50%; 
          width: 30px; 
          height: 30px; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          z-index: 3; 
          transform: translateY(-50%); 
          background: linear-gradient(145deg, #ffffff, #f8fafc); 
          box-shadow: 0 4px 10px rgba(15,23,42,.18); 
          transition: left .55s cubic-bezier(.22,1,.36,1), background .5s ease, transform .65s ease; 
        } 

        .theme-switch-desktop .theme-knob { left: 3px; } 
        .theme-switch-mobile .theme-knob { width: 26px; height: 26px; left: 3px; } 

        .theme-switch-dark .theme-knob { 
          background: linear-gradient(145deg, #334155, #1e293b); 
          transform: translateY(-50%) rotate(360deg); 
        } 

        .theme-switch-desktop.theme-switch-dark .theme-knob { left: 32px; } 
        .theme-switch-mobile.theme-switch-dark .theme-knob { left: 28px; } 

        .theme-knob-sun { color: #2563eb; } 
        .theme-knob-moon { color: #facc15; } 

        /* MOBILE NAVBAR & BACKDROP */ 
        .mobile-navbar { display: none; } 

        .mobile-backdrop { 
          position: fixed; 
          inset: 0; 
          z-index: 9990; 
          background: rgba(2,6,23,.50); 
          backdrop-filter: blur(9px); 
          -webkit-backdrop-filter: blur(9px); 
          opacity: 0; 
          visibility: hidden; 
          pointer-events: none; 
          transition: opacity .35s ease, visibility .35s ease; 
        } 

        .mobile-backdrop.show { 
          opacity: 1; 
          visibility: visible; 
          pointer-events: auto; 
        } 

        /* MOBILE MENU */ 
        .mobile-menu-panel { 
          position: fixed; 
          left: 8px; 
          right: 8px; 
          top: 40%; 
          z-index: 9999; 
          display: none; 
          max-height: calc(100dvh - 88px); 
          overflow-y: auto; 
          overflow-x: hidden; 
          scrollbar-width: none; 
          padding: 12px; 
          border-radius: 24px; 
          background: rgba(255,255,255,.96); 
          backdrop-filter: blur(26px); 
          -webkit-backdrop-filter: blur(26px); 
          border: 1px solid rgba(255,255,255,.72); 
          box-shadow: 0 24px 70px rgba(15,23,42,.24); 
          opacity: 0; 
          visibility: hidden; 
          pointer-events: none; 
          transform: translateY(-18px) scale(.98); 
          transform-origin: top center; 
          transition: opacity .35s ease, visibility .35s ease, transform .45s cubic-bezier(.16,1,.3,1); 
        } 

        .mobile-menu-panel::-webkit-scrollbar { display: none; } 

        .dark .mobile-menu-panel { 
          background: rgba(30,41,59,.96); 
          border-color: #475569; 
          box-shadow: 0 28px 90px rgba(0,0,0,.58); 
        } 

        .mobile-menu-panel.show { 
          opacity: 1; 
          visibility: visible; 
          pointer-events: auto; 
          transform: translateY(-54%) scale(1); 
        } 

        .mobile-menu-handle { 
          display: flex; 
          justify-content: center; 
          padding: 1px 0 11px; 
        } 

        .mobile-menu-handle span, 
        .appointment-handle span { 
          width: 40px; 
          height: 4px; 
          border-radius: 999px; 
          background: #cbd5e1; 
        } 

        .dark .mobile-menu-handle span, 
        .dark .appointment-handle span { background: #475569; } 

        .mobile-menu-options { 
          display: flex; 
          flex-direction: column; 
          gap: 6px; 
        } 

        .mobile-menu-option { 
          position: relative; 
          min-height: 58px; 
          padding: 8px 10px; 
          display: flex; 
          align-items: center; 
          gap: 11px; 
          border-radius: 18px; 
          background: rgba(248,250,252,.86); 
          color: #334155; 
          font-size: 15px; 
          font-weight: 700; 
          text-decoration: none; 
          opacity: 0; 
          transform: translateY(12px); 
          transition: opacity .35s ease, transform .45s ease, background-color .5s ease, color .4s ease; 
        } 

        .mobile-menu-panel.show .mobile-menu-option { 
          opacity: 1; 
          transform: translateY(0); 
          transition-delay: var(--menu-delay); 
        } 

        .dark .mobile-menu-option { 
          background: rgba(15,23,42,.85); 
          color: #e2e8f0; 
          border: 1px solid #334155; 
        } 

        .mobile-menu-option:hover { transform: translateX(3px); } 

        .mobile-menu-option.active { 
          background: linear-gradient(135deg, #2563eb, #0891b2); 
          color: white; 
          box-shadow: 0 9px 24px rgba(37,99,235,.20); 
        } 

        .active-line { 
          position: absolute; 
          left: 0; 
          top: 50%; 
          transform: translateY(-50%); 
          width: 4px; 
          height: 27px; 
          border-radius: 0 999px 999px 0; 
          background: white; 
        } 

        .mobile-option-icon { 
          width: 41px; 
          height: 41px; 
          border-radius: 13px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          flex-shrink: 0; 
          background: white; 
          color: #2563eb; 
          box-shadow: 0 3px 10px rgba(15,23,42,.06); 
        } 

        .dark .mobile-option-icon { background: #334155; color: #60a5fa; } 

        .mobile-menu-option.active .mobile-option-icon { 
          background: rgba(255,255,255,.15); 
          color: white; 
          box-shadow: none; 
        } 

        .mobile-option-name { flex: 1; } 

        .mobile-option-arrow { 
          width: 28px; 
          height: 28px; 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          flex-shrink: 0; 
          background: #e2e8f0; 
          color: #64748b; 
        } 

        .dark .mobile-option-arrow { background: #475569; color: #cbd5e1; } 

        .mobile-menu-option.active .mobile-option-arrow { 
          background: rgba(255,255,255,.16); 
          color: white; 
        } 

        .mobile-appointment-button { 
          min-height: 60px; 
          margin-top: 5px; 
          border: none; 
          border-radius: 18px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 10px; 
          background: linear-gradient(135deg, #1d4ed8, #0891b2); 
          color: white; 
          font-size: 15px; 
          font-weight: 800; 
          cursor: pointer; 
          box-shadow: 0 10px 28px rgba(37,99,235,.24); 
        } 

        .mobile-appointment-icon { 
          width: 38px; 
          height: 38px; 
          border-radius: 12px; 
          background: rgba(255,255,255,.14); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
        } 

        /* APPOINTMENT MODAL & STYLES */ 
        .appointment-overlay { 
          position: fixed; 
          inset: 0; 
          z-index: 20000; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          padding: 8px; 
          background: rgba(2,6,23,.62); 
          backdrop-filter: blur(10px); 
          -webkit-backdrop-filter: blur(10px); 
          animation: overlayIn .3s ease-out; 
        } 

        .appointment-modal { 
          width: 100%; 
          max-width: 380px; 
          max-height: calc(100dvh - 16px); 
          overflow-y: auto; 
          scrollbar-width: none; 
          border-radius: 20px; 
          background: white; 
          border: 1px solid rgba(255,255,255,.75); 
          box-shadow: 0 20px 60px rgba(0,0,0,.25); 
          animation: modalIn .4s cubic-bezier(.22,1,.36,1); 
        } 

        .appointment-modal::-webkit-scrollbar { display: none; } 

        .dark .appointment-modal { 
          background: #1e293b; 
          border-color: #475569; 
          box-shadow: 0 20px 60px rgba(0,0,0,.6); 
        } 

        .appointment-handle { 
          display: none; 
          justify-content: center; 
          padding-top: 8px; 
        } 

        .appointment-header { 
          position: relative; 
          overflow: hidden; 
          padding: 14px 14px 12px; 
          text-align: center; 
          background: linear-gradient(135deg, #1d4ed8, #2563eb, #0891b2); 
          color: white; 
        } 

        .appointment-header-glow { 
          position: absolute; 
          border-radius: 50%; 
          filter: blur(30px); 
          pointer-events: none; 
        } 

        .glow-one { width: 120px; height: 120px; right: -50px; top: -50px; background: rgba(103,232,249,.26); } 
        .glow-two { width: 130px; height: 130px; left: -60px; bottom: -60px; background: rgba(147,197,253,.18); } 

        .appointment-close { 
          position: absolute; 
          top: 8px; 
          right: 8px; 
          width: 28px; 
          height: 28px; 
          border: 1px solid rgba(255,255,255,.18); 
          border-radius: 50%; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          background: rgba(255,255,255,.12); 
          color: white; 
          cursor: pointer; 
          font-size: 12px; 
        } 

        .appointment-close:hover { transform: rotate(90deg) scale(1.05); } 

        .appointment-icon { 
          position: relative; 
          width: 36px; 
          height: 36px; 
          margin: 0 auto; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          border-radius: 10px; 
          background: rgba(255,255,255,.15); 
          border: 1px solid rgba(255,255,255,.18); 
          font-size: 15px; 
        } 

        .appointment-header h2 { 
          position: relative; 
          margin: 8px 0 0; 
          font-size: 18px; 
          font-weight: 800; 
        } 

        .appointment-header p { 
          position: relative; 
          margin: 3px 0 0; 
          font-size: 10px; 
          color: #dbeafe; 
        } 

        .appointment-form { 
          padding: 10px 14px 12px; 
        } 

        .appointment-field { 
          margin-bottom: 6px; 
        } 

        .appointment-field label { 
          display: block; 
          margin-bottom: 2px; 
          padding-left: 2px; 
          font-size: 10px; 
          font-weight: 700; 
          color: #475569; 
        } 

        .dark .appointment-field label { color: #cbd5e1; } 

        .appointment-input-wrap { 
          position: relative; 
          display: flex; 
          align-items: center; 
        } 

        .phone-input-shell input { 
          padding-left: 78px !important; 
        } 

        .phone-prefix { 
          position: absolute; 
          left: 36px; 
          color: #64748b; 
          font-size: 11px; 
          font-weight: 700; 
          z-index: 3; 
          pointer-events: none; 
        } 

        .dark .phone-prefix { color: #94a3b8; } 

        .appointment-input-wrap input { 
          width: 100%; 
          min-height: 38px; 
          padding: 6px 8px 6px 38px; 
          border: 1px solid #e2e8f0; 
          border-radius: 10px; 
          outline: none; 
          background: #f8fafc; 
          color: #0f172a; 
          font-size: 11px; 
        } 

        .appointment-textarea-wrap textarea { 
          width: 100%; 
          min-height: 70px; 
          max-height: 110px; 
          padding: 8px 8px 8px 38px; 
          border: 1px solid #e2e8f0; 
          border-radius: 10px; 
          outline: none; 
          background: #f8fafc; 
          color: #0f172a; 
          font-size: 11px; 
          font-family: inherit; 
          resize: vertical; 
          line-height: 1.4; 
        } 

        .appointment-input-wrap input::placeholder, 
        .appointment-textarea-wrap textarea::placeholder { 
          color: #94a3b8; 
        } 

        .appointment-input-wrap input:focus, 
        .appointment-textarea-wrap textarea:focus { 
          border-color: #3b82f6; 
          background: white; 
          box-shadow: 0 0 0 3px rgba(59,130,246,.10); 
        } 

        .dark .appointment-input-wrap input, 
        .dark .appointment-textarea-wrap textarea { 
          background: #0f172a; 
          border-color: #475569; 
          color: #f8fafc; 
        } 

        .appointment-submit { 
          width: 100%; 
          min-height: 38px; 
          margin-top: 4px; 
          padding: 4px 8px 4px 12px; 
          border: none; 
          border-radius: 10px; 
          display: flex; 
          align-items: center; 
          justify-content: space-between; 
          gap: 8px; 
          background: linear-gradient(135deg, #1d4ed8, #0891b2); 
          color: white; 
          font-size: 11px; 
          font-weight: 800; 
          cursor: pointer; 
          box-shadow: 0 6px 16px rgba(37,99,235,.2); 
        } 

        .appointment-submit:disabled { opacity: .7; cursor: not-allowed; } 

        .appointment-submit span { 
          display: flex; 
          align-items: center; 
          gap: 6px; 
        } 

        .appointment-submit > i { 
          width: 28px; 
          height: 28px; 
          border-radius: 8px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          background: rgba(255,255,255,.14); 
          font-size: 11px; 
        } 

        .appointment-note { 
          margin: 4px 0 0; 
          text-align: center; 
          font-size: 9px; 
          color: #94a3b8; 
        } 

        /* WHATSAPP */ 
        .wellborn-global-whatsapp { 
          position: fixed; 
          right: 16px; 
          bottom: 16px; 
          width: 52px; 
          height: 52px; 
          z-index: 999999; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          text-decoration: none; 
          isolation: isolate; 
        } 

        .wellborn-whatsapp-pulse { 
          position: absolute; 
          inset: -14px; 
          border-radius: 50%; 
          background: radial-gradient(circle, rgba(37,211,102,.55) 0%, rgba(37,211,102,.30) 35%, rgba(37,211,102,.12) 60%, transparent 75%); 
          filter: blur(3px); 
          animation: whatsappGlow 1.8s ease-in-out infinite; 
          z-index: 0; 
        } 

        .wellborn-global-whatsapp::before { 
          content: ""; 
          position: absolute; 
          width: 42px; 
          height: 42px; 
          border-radius: 50%; 
          border: 1.5px solid rgba(37,211,102,.55); 
          animation: whatsappRingOne 2.2s cubic-bezier(.22,1,.36,1) infinite; 
          z-index: -1; 
        } 

        .wellborn-global-whatsapp::after { 
          content: ""; 
          position: absolute; 
          width: 42px; 
          height: 42px; 
          border-radius: 50%; 
          border: 1px solid rgba(37,211,102,.35); 
          animation: whatsappRingTwo 2.2s cubic-bezier(.22,1,.36,1) infinite; 
          animation-delay: .75s; 
          z-index: -1; 
        } 

        .wellborn-whatsapp-button { 
          position: relative; 
          z-index: 5; 
          width: 44px; 
          height: 44px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          border-radius: 50%; 
          background: linear-gradient(145deg, #32e875 0%, #20c863 48%, #16ad53 100%); 
          border: 2px solid rgba(255,255,255,.9); 
          box-shadow: 0 8px 22px rgba(37,211,102,.35), 0 2px 5px rgba(0,0,0,.10), inset 0 1px 2px rgba(255,255,255,.45); 
          transition: transform .35s cubic-bezier(.22,1,.36,1), box-shadow .35s ease; 
        } 

        .wellborn-whatsapp-button svg { 
          width: 22px; 
          height: 22px; 
          display: block; 
          fill: white; 
          filter: drop-shadow(0 1px 2px rgba(0,0,0,.15)); 
        } 

        .wellborn-global-whatsapp:hover .wellborn-whatsapp-button { 
          transform: translateY(-4px) scale(1.08); 
          box-shadow: 0 12px 28px rgba(37,211,102,.42), 0 3px 8px rgba(0,0,0,.12), inset 0 1px 2px rgba(255,255,255,.5); 
        } 

        @keyframes whatsappGlow { 
          0% { transform: scale(.72); opacity: .35; } 
          50% { transform: scale(1.35); opacity: 1; } 
          100% { transform: scale(.72); opacity: .35; } 
        } 

        @keyframes whatsappRingOne { 
          0% { transform: scale(.75); opacity: .75; } 
          65% { transform: scale(1.65); opacity: 0; } 
          100% { transform: scale(1.65); opacity: 0; } 
        } 

        @keyframes whatsappRingTwo { 
          0% { transform: scale(.75); opacity: .55; } 
          65% { transform: scale(1.85); opacity: 0; } 
          100% { transform: scale(1.85); opacity: 0; } 
        } 

        /* TABLET / MOBILE RESPONSIVE */ 
        @media (max-width: 1023px) { 
          .desktop-navbar { display: none; } 

          .mobile-navbar { 
            position: fixed; 
            top: 0; 
            left: 0; 
            right: 0; 
            z-index: 10000; 
            height: 64px; 
            display: flex; 
            align-items: center; 
            justify-content: space-between; 
            padding: 0 8px; 
            background: rgba(255,255,255,.96); 
            backdrop-filter: blur(20px); 
            -webkit-backdrop-filter: blur(20px); 
            border: none; 
            box-shadow: 0 8px 28px rgba(15,23,42,.08); 
          } 

          .dark .mobile-navbar { 
            background: rgba(30,41,59,.96); 
            box-shadow: 0 10px 32px rgba(0,0,0,.30); 
          } 

          .user-main { padding-top: 72px; } 

          .mobile-brand { 
            display: flex; 
            align-items: center; 
            min-width: 0; 
            flex: 1; 
            gap: 8px; 
            margin-left: 3px; 
          } 

          .mobile-actions { 
            margin-left: 8px; 
            display: flex; 
            align-items: center; 
            gap: 6px; 
            flex-shrink: 0; 
          } 

          .mobile-menu-button { 
            width: 40px; 
            height: 40px; 
            border: none; 
            border-radius: 12px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            background: linear-gradient(135deg, #1d4ed8, #2563eb); 
            color: white; 
            font-size: 15px; 
            cursor: pointer; 
            box-shadow: 0 6px 18px rgba(37,99,235,.20); 
            transition: transform .4s ease, box-shadow .35s ease; 
          } 

          .mobile-menu-button:hover { transform: translateY(-1px) scale(1.04); } 
          .mobile-menu-button:active { transform: scale(.88); } 
          .mobile-menu-button.menu-button-open { transform: rotate(90deg); } 

          .mobile-menu-panel { display: block; top: 78px !important; } 
          .mobile-menu-panel.show { transform: translateY(0) scale(1) !important; } 
        } 

        @media (max-width: 640px) { 
          .mobile-navbar { 
            position: fixed; 
            top: 0 !important; 
            left: 0 !important; 
            right: 0 !important; 
            width: 100vw !important; 
            max-width: 100vw !important; 
            height: 70px; 
            margin: 0 !important; 
            padding: 0 10px; 
            border-radius: 0 !important; 
          } 

          .mobile-brand { margin-left: 3px; } 
          .mobile-brand-logo { width: 48px; height: 48px; border-radius: 15px; } 
          .mobile-brand-text h1 { font-size: 14px; } 
          .brand-sub { margin-top: 5px; } 
          .brand-sub > span { width: 18px; } 
          .brand-sub p { font-size: 8px; } 
          .mobile-menu-button { width: 39px; height: 39px; } 

          .mobile-menu-panel { left: 6px; right: 6px; max-height: 83dvh; padding: 10px; } 
          .mobile-menu-option { min-height: 56px; border-radius: 17px; font-size: 14px; } 
          .mobile-appointment-button { min-height: 58px; border-radius: 17px; } 

          .appointment-overlay { padding: 6px; } 
          .appointment-modal { max-width: 100%; max-height: 94dvh; border-radius: 18px; } 
          .appointment-handle { display: flex; } 
          .appointment-header { padding: 12px; } 
          .appointment-form { padding: 8px 12px 10px; } 

          .wellborn-global-whatsapp { right: 12px; bottom: 12px; width: 52px; height: 52px; } 
          .wellborn-whatsapp-button { width: 52px; height: 52px; } 
          .wellborn-whatsapp-button svg { width: 26px; height: 26px; } 
        } 
      `}</style> 
    </div> 
  );
}