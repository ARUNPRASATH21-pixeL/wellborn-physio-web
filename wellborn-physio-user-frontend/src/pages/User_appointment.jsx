import React, { useEffect, useState, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API, postData, getData } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
// NOTE: getUserFcmToken is intentionally NOT statically imported here.
// UserShell.jsx dynamically imports "../services/fcm", but this file
// used to import it statically — Vite warned that it couldn't move
// fcm.js into its own chunk because of that mismatch. Loading it
// dynamically inside handleSubmit (only when actually booking) keeps
// this consistent with UserShell.jsx and lets Vite code-split it out
// of the main bundle.

import {
  MapPin,
  Phone,
  CalendarDays,
  CheckCircle2,
  User,
  Mail,
  Stethoscope,
  MessageSquare,
  ArrowRight,
  HeartPulse,
  ShieldCheck,
  Clock3,
  X,
  Sparkles,
  ChevronDown,
} from "lucide-react";

/* =========================================================
   ANIMATIONS
========================================================= */

const fadeUp = {
  hidden: { opacity: 0, y: 35, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeRight = {
  hidden: { opacity: 0, x: 45, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/* =========================================================
   INFO ITEM
========================================================= */

function InfoItem({ icon: Icon, title, children }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ x: 5 }}
      className="appointment-info-item"
    >
      <div className="appointment-info-icon">
        <Icon size={19} />
      </div>

      <div className="appointment-info-content">
        <h3>{title}</h3>
        {children}
      </div>
    </motion.div>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function User_appointment() {
  const navigate = useNavigate();

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // Match with review/contact messaging status

  /* CUSTOM DROPDOWN STATES */
  const [ageValue, setAgeValue] = useState("");
  const [serviceValue, setServiceValue] = useState("");
  const [timeValue, setTimeValue] = useState("");
  const [dateValue, setDateValue] = useState("");

  const [ageOpen, setAgeOpen] = useState(false);
  const [treatmentOpen, setTreatmentOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);

  const ageRef = useRef(null);
  const treatmentRef = useRef(null);
  const timeRef = useRef(null);

  const ageOptions = [
    "Child (0-12 yrs)",
    "Teenager (13-19 yrs)",
    "Adult (20-50 yrs)",
    "Senior Citizen (50+ yrs)",
  ];

  /* ALL BASE 30-MIN SLOTS (9:00 AM to 8:00 PM) */
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

  /* =====================================================
     SUCCESS MODAL
  ===================================================== */

  const [successModal, setSuccessModal] = useState({
    visible: false,
    patientName: "",
    date: "",
    time: "",
  });

  /* =====================================================
     SERVICES
  ===================================================== */

  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);

  /* =====================================================
     INDIA DATE / TIME HELPER
  ===================================================== */

  const getIndiaDateTime = () => {
    try {
      const formatter = new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone: "Asia/Kolkata",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }
      );

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
    if (!dateValue) {
      setDateValue(today);
    }
  }, [today, dateValue]);

  /* =====================================================
     FETCH BOOKED TIMES FROM BACKEND WHEN DATE CHANGES
  ===================================================== */
  useEffect(() => {
    const fetchBookedTimesForDate = async () => {
      if (!dateValue) return;
      try {
        const response = await getData(`${API.APPOINTMENT_BOOKED_TIMES}?date=${dateValue}`);
        const list = Array.isArray(response) ? response : (response?.data || []);
        setBookedTimes(list);
      } catch (err) {
        console.error("Failed to fetch booked times from backend:", err);
        setBookedTimes([]);
      }
    };

    fetchBookedTimesForDate();
  }, [dateValue]);

  /* =====================================================
     HELPER TO CONVERT 12-HOUR SLOT STRING TO 24-HOUR FORMAT
  ===================================================== */
  const convertSlotTo24HourString = (slotStr) => {
    const [time, modifier] = slotStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
  };

  /* =====================================================
     FILTER AVAILABLE TIME SLOTS (BACKEND BOOKED + PAST TIME FOR TODAY)
  ===================================================== */

  const availableTimeOptions = useMemo(() => {
    const indiaNow = getIndiaDateTime();
    const currentTotalMinutes = indiaNow.hour * 60 + indiaNow.minute;

    return allTimeOptions.filter((slot) => {
      // 1. Check if already booked from backend
      const slot24h = convertSlotTo24HourString(slot);
      const isAlreadyBooked = bookedTimes.some((booked) => {
        if (!booked) return false;
        const cleanBooked = String(booked).trim();
        return (
          cleanBooked === slot24h ||
          cleanBooked === slot24h.substring(0, 5) ||
          cleanBooked.startsWith(slot24h.substring(0, 5))
        );
      });

      if (isAlreadyBooked) return false;

      // 2. If today, filter out past time slots
      if (dateValue === indiaNow.date) {
        const [time, modifier] = slot.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (modifier === "PM" && hours < 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;

        const slotTotalMinutes = hours * 60 + minutes;
        if (slotTotalMinutes <= currentTotalMinutes) return false;
      }

      return true;
    });
  }, [dateValue, bookedTimes]);

  useEffect(() => {
    if (timeValue && !availableTimeOptions.includes(timeValue)) {
      setTimeValue("");
    }
  }, [dateValue, availableTimeOptions, timeValue]);

  /* =====================================================
     CLOSE DROPDOWNS OUTSIDE
  ===================================================== */

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (ageRef.current && !ageRef.current.contains(e.target)) {
        setAgeOpen(false);
      }

      if (
        treatmentRef.current &&
        !treatmentRef.current.contains(e.target)
      ) {
        setTreatmentOpen(false);
      }

      if (
        timeRef.current &&
        !timeRef.current.contains(e.target)
      ) {
        setTimeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
  }, []);

  /* =====================================================
     PAGE LOAD
  ===================================================== */

  useEffect(() => {
    document.title = "Book Appointment | Wellborn Physio";

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    const loadAppointmentOptions = async () => {
      try {
        setLoadingServices(true);

        const serviceResponse = await getData(
          API.SERVICE_GET_ALL
        );

        const serviceList = Array.isArray(serviceResponse)
          ? serviceResponse
          : Array.isArray(serviceResponse?.data)
          ? serviceResponse.data
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
      } catch (error) {
        console.error(
          "Failed to load appointment options:",
          error
        );

        setServices([]);
      } finally {
        setLoadingServices(false);
      }
    };

    loadAppointmentOptions();

    return () => {
      document.title = "Wellborn Physio";
    };
  }, []);

  /* =========================================================
     SHOW VALIDATION ERROR
  ========================================================= */

  const showValidationError = (message) => {
    setSubmitError(message);

    setTimeout(() => {
      const errorElement =
        document.querySelector(
          ".appointment-error"
        );

      if (errorElement) {
        errorElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };
/* =========================================================
      HANDLE SUBMIT
  ========================================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    setSubmitting(true);
    setSubmitError("");
    setSuccessMessage("");

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);

      const patientName = String(
        formData.get("name") || ""
      ).trim();

      const phone = String(
        formData.get("phone") || ""
      ).trim();

      const email = String(
        formData.get("email") || ""
      ).trim();

      const appointmentDate = String(
        dateValue || ""
      ).trim();

      const appointmentTime = String(
        timeValue || ""
      ).trim();

      const ageCategory = String(
        ageValue || ""
      ).trim();

      const problem = String(
        formData.get("problem") || ""
      ).trim();

      const selectedService = String(
        serviceValue || ""
      ).trim();
      /* =====================================================
         NAME VALIDATION
      =================================================     */

      if (!patientName) {
        showValidationError("Please enter your full name.");
        return;
      }

      if (patientName.length < 3) {
        showValidationError("Full name must contain at least 3 characters.");
        return;
      }

      if (patientName.length > 100) {
        showValidationError("Full name cannot exceed 100 characters.");
        return;
      }

      if (!/^[A-Za-zÀ-ÿ\s.'-]+$/.test(patientName)) {
        showValidationError("Please enter a valid name using letters only.");
        return;
      }

      /* =====================================================
         PHONE VALIDATION
      =================================================     */

      if (!phone) {
        showValidationError("Please enter your phone number.");
        return;
      }

      const cleanPhone = phone
        .replace(/\D/g, "")
        .slice(-10);

      if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
        showValidationError("Please enter a valid 10-digit Indian phone number.");
        return;
      }

      /* =====================================================
         EMAIL VALIDATION
      =================================================     */

      if (!email) {
        showValidationError("Please enter your email address.");
        return;
      }

      const emailRegex =
        /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

      if (!emailRegex.test(email)) {
        showValidationError("Please enter a valid email address.");
        return;
      }

      if (email.length > 150) {
        showValidationError("Email address is too long.");
        return;
      }

      /* =====================================================
         DATE & TIME VALIDATION
      =================================================     */

      if (!appointmentDate) {
        showValidationError("Please select an appointment date.");
        return;
      }

      const currentIndiaDateTime = getIndiaDateTime();
      const selectedDate = new Date(`${appointmentDate}T00:00:00`);
      const currentDate = new Date(`${currentIndiaDateTime.date}T00:00:00`);

      if (Number.isNaN(selectedDate.getTime())) {
        showValidationError("Please select a valid appointment date.");
        return;
      }

      if (selectedDate < currentDate) {
        showValidationError("Please select today or a future date.");
        return;
      }

      if (!appointmentTime) {
        showValidationError("Please select an appointment time slot.");
        return;
      }

      if (appointmentDate === currentIndiaDateTime.date) {
        const sameDayCutoff = 19.5 * 60; // 7:30 PM last slot cutoff
        const nowMinutes = currentIndiaDateTime.hour * 60 + currentIndiaDateTime.minute;

        if (nowMinutes >= sameDayCutoff) {
          showValidationError("Today's appointment booking is closed as booking hours have ended.");
          return;
        }
      }

      /* =====================================================
         AGE CATEGORY VALIDATION
      =================================================     */

      if (!ageCategory) {
        showValidationError("Please select an age category.");
        return;
      }

      /* =====================================================
         TREATMENT VALIDATION & PARSING
      =================================================     */

      if (!selectedService) {
        showValidationError("Please select a treatment.");
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
          showValidationError("Please select a valid treatment.");
          return;
        }
      }

      /* =====================================================
         PROBLEM VALIDATION
      =================================================     */

      if (!problem) {
        showValidationError("Please describe your problem.");
        return;
      }

      if (problem.length < 10) {
        showValidationError("Please describe your problem in at least 10 characters.");
        return;
      }

      if (problem.length > 1000) {
        showValidationError("Problem description cannot exceed 1000 characters.");
        return;
      }

      /* =====================================================
         CONVERT TIME TO 24-HOUR FORMAT FOR BACKEND (LocalTime)
      =================================================     */

      const convertTo24Hour = (timeStr) => {
        if (!timeStr) return null;
        const [time, modifier] = timeStr.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
        if (modifier === "PM" && hours < 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
      };

      /* =====================================================
         GET FCM TOKEN (for push notification on booking)
         NOTE: fetched BEFORE building the payload so it can be
         included directly in the booking request. The backend
         (AppointmentServiceImpl) reads request.getFcmToken()
         and uses it to send the "booking confirmed" push
         notification to the user. If this is null/empty, the
         backend just skips sending the user notification
         (admin notification still goes out regardless).

         Loaded via dynamic import() here (not a static top-level
         import) to stay consistent with how UserShell.jsx loads
         "../services/fcm" and to let Vite split it into its own
         chunk instead of bundling it into every page that books
         an appointment.
      =================================================     */

      let userFcmToken = null;
      try {
        const { getUserFcmToken } = await import("../services/fcm");
        userFcmToken = await getUserFcmToken();
      } catch (tokenError) {
        console.error("Could not retrieve FCM token:", tokenError);
      }

      /* =====================================================
         PAYLOAD
      =================================================     */

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

      console.log("Appointment Payload:", payload);

      /* =====================================================
         BACKEND API BOOKING
         (Backend handles BOTH admin + user push notifications
         internally using the fcmToken sent above — no separate
         frontend call to /api/notifications/send is needed.)
      =================================================     */

      await postData(API.APPOINTMENT_BOOK, payload);

      /* =====================================================
         SET SUCCESS MESSAGE (Review/Contact Style Match)
      =================================================     */
      setSuccessMessage("Your message sent successfully!");

      /* =====================================================
         RESET FORM
      =================================================     */

      form.reset();
      setAgeValue("");
      setServiceValue("");
      setTimeValue("");
      setDateValue(today);

      /* =====================================================
         SUCCESS POPUP
      =================================================     */

      setSuccessModal({
        visible: true,
        patientName,
        date: appointmentDate,
        time: appointmentTime,
      });
    } catch (error) {
      console.error("Appointment booking failed:", error);

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "We couldn't submit your appointment right now. Please try again.";

      setSubmitError(message);

      setTimeout(() => {
        const errorElement = document.querySelector(".appointment-error");
        if (errorElement) {
          errorElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 100);
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================================================
     JSX
  ========================================================= */

  return (
    <div className="appointment-ios-page">

      {/* =================================================
          SUCCESS POPUP
      ================================================ */}

      <AnimatePresence>
        {successModal.visible && (
          <div className="appointment-modal-overlay">

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="appointment-modal-backdrop"
              onClick={() => {
                setSuccessModal((prev) => ({
                  ...prev,
                  visible: false,
                }));

                navigate("/user/home");
              }}
            />

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.85,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.85,
                y: 20,
              }}
              transition={{
                duration: 0.35,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="appointment-success-modal-card"
            >

              <div className="modal-glow-effect" />

              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  setSuccessModal((prev) => ({
                    ...prev,
                    visible: false,
                  }));

                  navigate("/user/home");
                }}
              >
                <X size={16} />
              </button>

              <div className="success-icon-wrapper">

                <div className="success-badge-icon">
                  <CheckCircle2 size={36} />
                </div>

                <div className="sparkle-float-1">
                  <Sparkles size={18} />
                </div>

              </div>

              <div className="modal-content-text">

                <div className="modal-pill-tag">
                  <Sparkles size={12} />
                  Appointment Confirmed
                </div>

                <h3>
                  Thank You,{" "}
                  {successModal.patientName}!
                </h3>

                <p>
                  Your appointment request for{" "}
                  <strong>
                    {successModal.date}
                  </strong>{" "}
                  at{" "}
                  <strong>
                    {successModal.time}
                  </strong>{" "}
                  has been successfully booked.
                  Our team will contact you shortly.
                </p>

              </div>

              <Link
                to="/user/home"
                onClick={() =>
                  setSuccessModal((prev) => ({
                    ...prev,
                    visible: false,
                  }))
                }
                className="modal-action-btn"
              >
                <span>Back to Home</span>
                <ArrowRight size={16} />
              </Link>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =================================================
          HERO
      ================================================ */}

      <section className="appointment-ios-hero">

        <div className="appointment-ios-orb orb-one" />
        <div className="appointment-ios-orb orb-two" />
        <div className="appointment-ios-orb orb-three" />
        <div className="appointment-ios-grid-pattern" />

        <div className="appointment-ios-container">

          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="appointment-ios-hero-content"
          >

            <motion.div
              variants={fadeUp}
              className="appointment-ios-chip"
            >
              <span className="appointment-ios-chip-icon">
                <CalendarDays size={15} />
              </span>

              Appointment Request
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="appointment-ios-title"
            >
              Book Your{" "}
              <span>Appointment</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="appointment-ios-description"
            >
              Schedule your physiotherapy consultation
              and begin your recovery journey with
              professional patient-focused care.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="appointment-ios-pills"
            >

              <span>
                <ShieldCheck size={14} />
                Trusted Care
              </span>

              <span>
                <HeartPulse size={14} />
                Patient First
              </span>

              <span>
                <Clock3 size={14} />
                Flexible Hours
              </span>

            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* =================================================
          MAIN
      ================================================ */}

      <section className="appointment-ios-main">

        <div className="appointment-ios-container">

          <div className="appointment-ios-columns">

            {/* =================================================
                LEFT INFORMATION
            ================================================     */}

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.15,
              }}
              variants={stagger}
              className="appointment-ios-info-card"
            >

              <div className="appointment-info-glow" />

              <motion.div
                variants={fadeUp}
                className="appointment-main-icon"
              >
                <CalendarDays size={25} />
              </motion.div>

              <motion.h2
                variants={fadeUp}
                className="appointment-info-title"
              >
                Your Recovery{" "}
                <span>Starts Here</span>
              </motion.h2>

              <motion.p
                variants={fadeUp}
                className="appointment-info-description"
              >
                Get personalized physiotherapy treatment
                from{" "}
                <strong>
                  Dr. Parameswari (PT)
                </strong>
                . We're committed to helping you move
                better and recover with confidence.
              </motion.p>

              <motion.div
                variants={stagger}
                className="appointment-info-list"
              >

                <InfoItem
                  icon={MapPin}
                  title="Address"
                >
                  <p>
                    1/13, 2nd Cross Street
                    <br />
                    Avadi Road
                    <br />
                    Karayanchavadi
                    <br />
                    Poonamallee
                    <br />
                    Chennai - 600056
                  </p>
                </InfoItem>

                <InfoItem
                  icon={Phone}
                  title="Phone"
                >
                  <a href="tel:+919342752147">
                    +91 93427 52147
                  </a>
                </InfoItem>

                <InfoItem
                  icon={Clock3}
                  title="Working Hours"
                >
                  <p>
                    Monday - Saturday
                    <br />
                    9:00 AM - 8:00 PM
                  </p>
                </InfoItem>

              </motion.div>

              <motion.a
                variants={fadeUp}
                href="https://www.google.com/maps/search/?api=1&query=Karayanchavadi%20Poonamallee%20Chennai"
                target="_blank"
                rel="noopener noreferrer"
                className="appointment-location-btn"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <MapPin size={15} />
                View Location
                <ArrowRight size={15} />
              </motion.a>

            </motion.div>

            {/* =================================================
                FORM CARD
            ================================================     */}

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.15,
              }}
              variants={fadeRight}
              className="appointment-ios-form-card"
            >

              <div className="appointment-form-header">

                <div>

                  <div className="appointment-form-label">
                    <Stethoscope size={13} />
                    PHYSIOTHERAPY CONSULTATION
                  </div>

                  <h2>
                    Appointment Form
                  </h2>

                  <p>
                    Tell us a little about yourself
                    and your treatment needs.
                  </p>

                </div>

                <motion.div
                  animate={{
                    y: [0, -5, 0],
                    rotate: [0, 4, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="appointment-form-icon"
                >
                  <HeartPulse size={20} />
                </motion.div>

              </div>

              {/* =================================================
                  SUCCESS MESSAGE (Matches Contact & Review Status style)
              ================================================     */}
              <AnimatePresence>
                {successMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="appointment-success-banner"
                    style={{
                      marginTop: "16px",
                      padding: "12px 16px",
                      borderRadius: "14px",
                      background: "rgba(16, 185, 129, 0.1)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      color: "#10b981",
                      fontSize: "12px",
                      fontWeight: "700",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                  >
                    <CheckCircle2 size={16} />
                    <span>{successMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* =================================================
                  ERROR
              ================================================     */}

              <AnimatePresence>
                {submitError && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -12,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                    }}
                    className="appointment-error"
                    role="alert"
                  >

                    <div className="appointment-error-icon">
                      <ShieldCheck size={20} />
                    </div>

                    <div>

                      <strong>
                        Unable to Submit
                      </strong>

                      <p>
                        {submitError}
                      </p>

                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

              {/* =================================================
                  FORM
              ================================================     */}

              <form
                onSubmit={handleSubmit}
                className="appointment-form"
                noValidate
              >

                {/* NAME */}

                <div className="appointment-field">

                  <label htmlFor="patient-name">
                    Full Name
                  </label>

                  <div className="appointment-input-shell">

                    <span className="appointment-field-icon">
                      <User size={17} />
                    </span>

                    <input
                      id="patient-name"
                      name="name"
                      type="text"
                      minLength={3}
                      maxLength={100}
                      required
                      autoComplete="name"
                      placeholder="Enter your full name"
                    />

                  </div>
                </div>

                {/* PHONE */}

                <div className="appointment-field">

                  <label htmlFor="patient-phone">
                    Phone Number
                  </label>

                  <div className="appointment-input-shell phone-input-shell">

                    <span className="appointment-field-icon">
                      <Phone size={17} />
                    </span>

                    <span className="phone-prefix">
                      +91
                    </span>

                    <input
                      id="patient-phone"
                      name="phone"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      minLength={10}
                      required
                      autoComplete="tel"
                      placeholder="9876543210"
                    />

                  </div>
                </div>

                {/* EMAIL */}

                <div className="appointment-field">

                  <label htmlFor="patient-email">
                    Email Address
                  </label>

                  <div className="appointment-input-shell">

                    <span className="appointment-field-icon">
                      <Mail size={17} />
                    </span>

                    <input
                      id="patient-email"
                      name="email"
                      type="email"
                      maxLength={150}
                      required
                      autoComplete="email"
                      placeholder="Enter your email address"
                    />

                  </div>
                </div>

                {/* DATE + TIME */}

                <div className="appointment-two-fields">

                  {/* DATE */}

                  <div className="appointment-field">

                    <label htmlFor="appointment-date">
                      Preferred Date
                    </label>

                    <div className="appointment-input-shell">

                      <span className="appointment-field-icon">
                        <CalendarDays size={17} />
                      </span>

                      <input
                        id="appointment-date"
                        name="date"
                        type="date"
                        min={today}
                        value={dateValue}
                        onChange={(e) => setDateValue(e.target.value)}
                        required
                      />

                    </div>
                  </div>

                  {/* TIME SLOT CUSTOM DROPDOWN */}

                  <div
                    className="appointment-field"
                    ref={timeRef}
                  >
                    <label htmlFor="appointment-time">
                      Preferred Time
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setTimeOpen(!timeOpen)}
                        className="appointment-custom-dropdown"
                      >
                        <span className="appointment-field-icon">
                          <Clock3 size={17} />
                        </span>
                        <span
                          className={`truncate text-left pl-10 pr-6 ${
                            !timeValue
                              ? "text-slate-400"
                              : "font-bold"
                          }`}
                        >
                          {timeValue || "Select time slot"}
                        </span>
                        <ChevronDown
                          size={15}
                          className={`absolute right-3.5 transition-transform duration-300 ${
                            timeOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {timeOpen && (
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
                                  setTimeValue(slot);
                                  setTimeOpen(false);
                                }}
                                className={`appointment-custom-option ${
                                  timeValue === slot ? "selected" : ""
                                }`}
                              >
                                <span>{slot}</span>
                                {timeValue === slot && (
                                  <CheckCircle2
                                    size={14}
                                    className="text-cyan-500 ml-auto"
                                  />
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      )}

                      <input
                        type="hidden"
                        name="time"
                        value={timeValue}
                        required
                      />
                    </div>
                    <p className="appointment-time-note">
                      9:00 AM - 8:00 PM 
                    </p>
                  </div>

                </div>

                {/* AGE CATEGORY */}

                <div
                  className="appointment-field"
                  ref={ageRef}
                >

                  <label htmlFor="age-category">
                    Age Category
                  </label>

                  <div className="relative">

                    <button
                      type="button"
                      onClick={() =>
                        setAgeOpen(!ageOpen)
                      }
                      className="appointment-custom-dropdown"
                    >

                      <span className="appointment-field-icon">
                        <User size={17} />
                      </span>

                      <span
                        className={`truncate text-left pl-10 pr-6 ${
                          !ageValue
                            ? "text-slate-400"
                            : "font-bold"
                        }`}
                      >
                        {ageValue ||
                          "Select age category"}
                      </span>

                      <ChevronDown
                        size={15}
                        className={`absolute right-3.5 transition-transform duration-300 ${
                          ageOpen
                            ? "rotate-180"
                            : ""
                        }`}
                      />

                    </button>

                    {ageOpen && (
                      <div className="appointment-custom-menu">

                        {ageOptions.map(
                          (opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => {
                                setAgeValue(opt);
                                setAgeOpen(false);
                              }}
                              className={`appointment-custom-option ${
                                ageValue === opt
                                  ? "selected"
                                  : ""
                              }`}
                            >

                              <span>
                                {opt}
                              </span>

                              {ageValue === opt && (
                                <CheckCircle2
                                  size={14}
                                  className="text-cyan-500 ml-auto"
                                />
                              )}

                            </button>
                          )
                        )}

                      </div>
                    )}

                    <input
                      type="hidden"
                      name="ageCategory"
                      value={ageValue}
                      required
                    />

                  </div>
                </div>

                {/* =================================================
                    TREATMENT
                ================================================     */}

                <div
                  className="appointment-field"
                  ref={treatmentRef}
                >

                  <label htmlFor="service">
                    Treatment
                  </label>

                  <div className="relative">

                    <button
                      type="button"
                      disabled={loadingServices}
                      onClick={() =>
                        !loadingServices &&
                        setTreatmentOpen(
                          !treatmentOpen
                        )
                      }
                      className="appointment-custom-dropdown"
                    >

                      <span className="appointment-field-icon">
                        <Stethoscope size={17} />
                      </span>

                      <span
                        className={`truncate text-left pl-10 pr-6 ${
                          !serviceValue
                            ? "text-slate-400"
                            : "font-bold"
                        }`}
                      >
                        {loadingServices
                          ? "Loading treatments..."
                          : serviceValue ===
                              "other"
                          ? "Other"
                          : services.find(
                              (s) =>
                                String(
                                  s.serviceId ??
                                    s.id
                                ) ===
                                String(
                                  serviceValue
                                )
                            )?.serviceName ||
                            services.find(
                              (s) =>
                                String(
                                  s.serviceId ??
                                    s.id
                                ) ===
                                String(
                                  serviceValue
                                )
                            )?.name ||
                            "Select treatment"}
                      </span>

                      <ChevronDown
                        size={15}
                        className={`absolute right-3.5 transition-transform duration-300 ${
                          treatmentOpen
                            ? "rotate-180"
                            : ""
                        }`}
                      />

                    </button>

                    {treatmentOpen && (
                      <div className="appointment-custom-menu">

                        {services.map(
                          (service) => {
                            const id = String(
                              service.serviceId ??
                                service.id
                            );

                            const name =
                              service.serviceName ??
                              service.name ??
                              "Treatment";

                            const isSelected =
                              serviceValue ===
                              id;

                            return (
                              <button
                                key={id}
                                type="button"
                                onClick={() => {
                                  setServiceValue(
                                    id
                                  );
                                  setTreatmentOpen(
                                    false
                                  );
                                }}
                                className={`appointment-custom-option ${
                                  isSelected
                                    ? "selected"
                                    : ""
                                }`}
                              >

                                <span>
                                  {name}
                                </span>

                                {isSelected && (
                                  <CheckCircle2
                                    size={14}
                                    className="text-cyan-500 ml-auto"
                                  />
                                )}

                              </button>
                            );
                          }
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setServiceValue(
                              "other"
                            );
                            setTreatmentOpen(
                              false
                            );
                          }}
                          className={`appointment-custom-option ${
                            serviceValue ===
                            "other"
                              ? "selected"
                              : ""
                          }`}
                        >

                          <span>
                            Other
                          </span>

                          {serviceValue ===
                            "other" && (
                            <CheckCircle2
                              size={14}
                              className="text-cyan-500 ml-auto"
                            />
                          )}

                        </button>

                      </div>
                    )}

                    <input
                      type="hidden"
                      name="serviceId"
                      value={serviceValue}
                      required
                    />

                  </div>
                </div>

                {/* MESSAGE */}

                <div className="appointment-field">

                  <label htmlFor="problem">
                    Describe Your Problem
                  </label>

                  <div className="appointment-textarea-shell">

                    <span className="appointment-field-icon">
                      <MessageSquare size={17} />
                    </span>

                    <textarea
                      id="problem"
                      name="problem"
                      rows={5}
                      minLength={10}
                      maxLength={1000}
                      required
                      placeholder="Tell us about your problem..."
                    />

                  </div>
                </div>

                {/* SUBMIT */}

                <motion.button
                  type="submit"
                  disabled={
                    submitting ||
                    loadingServices ||
                    services.length === 0
                  }
                  className="appointment-submit"
                  whileHover={
                    submitting
                      ? {}
                      : { y: -3 }
                  }
                  whileTap={
                    submitting
                      ? {}
                      : { scale: 0.98 }
                  }
                >

                  <span>
                    {submitting
                      ? "Submitting..."
                      : "Book Appointment"}
                  </span>

                  <span className="appointment-submit-icon">

                    {submitting ? (
                      <span className="appointment-spinner" />
                    ) : (
                      <ArrowRight size={18} />
                    )}

                  </span>

                </motion.button>

                <p className="appointment-note">
                  We'll contact you to confirm your
                  appointment.
                </p>

              </form>

            </motion.div>

          </div>
        </div>
      </section>

      {/* =================================================
          CTA
      ================================================ */}

      <section className="appointment-cta">

        <div className="appointment-cta-orb cta-left" />
        <div className="appointment-cta-orb cta-right" />

        <motion.div
          animate={{
            y: [0, -7, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="appointment-cta-icon"
        >
          <HeartPulse size={27} />
        </motion.div>

        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          Ready To Start Your Recovery?
        </motion.h2>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          Your recovery journey can begin with one
          simple appointment.
        </motion.p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="appointment-cta-actions"
        >

          <Link
            to="/user/contact"
            className="appointment-cta-primary"
          >
            Contact Us
            <ArrowRight size={16} />
          </Link>

          <a
            href="tel:+919342752147"
            className="appointment-cta-secondary"
          >
            <Phone size={15} />
            Call Now
          </a>

        </motion.div>

      </section>

      {/* =================================================
          FOOTER
      ================================================ */}

      <footer className="appointment-footer">

        <div className="appointment-ios-container">

          <div className="appointment-footer-content">

            <div className="appointment-footer-brand">

              <div className="appointment-footer-icon">
                <HeartPulse size={21} />
              </div>

              <div>

                <h2>
                  Wellborn Physio
                </h2>

                <span>
                  Rehab & Centre
                </span>

              </div>

            </div>

            <p>
              Professional physiotherapy and rehabilitation
              care focused on helping you move better and
              live healthier.
            </p>

            <div className="appointment-footer-links">

              <Link to="/user/home">
                Home
              </Link>

              <Link to="/user/about">
                About
              </Link>

              <Link to="/user/services">
                Services
              </Link>

              <Link to="/user/doctors">
                Doctors
              </Link>

              <Link to="/user/contact">
                Contact
              </Link>

              <span className="active">
                Appointment
              </span>

            </div>

            <div className="appointment-footer-copy">
              © {new Date().getFullYear()} Wellborn Physio
              Rehab & Centre. All Rights Reserved.
            </div>

          </div>
        </div>
      </footer>

      {/* =================================================
          CSS
      ================================================ */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .appointment-ios-page {
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          background: #f5f7fb;
          color: #111827;
        }

        .dark .appointment-ios-page {
          background: #05070d;
          color: #f8fafc;
        }

        .appointment-ios-container {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 22px;
        }

        /* PREMIUM CUSTOM DROPDOWNS */

        .appointment-custom-dropdown {
          width: 100%;
          min-height: 55px;
          display: flex;
          align-items: center;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: rgba(248,250,252,.92);
          color: #111827;
          font-size: 12px;
          cursor: pointer;
          position: relative;
          transition: all .25s ease;
        }

        .dark .appointment-custom-dropdown {
          background: #1e293b;
          border-color: #334155;
          color: white;
        }

        .appointment-custom-dropdown:hover {
          border-color: #3b82f6;
        }

        .appointment-custom-menu {
          position: absolute;
          left: 0;
          right: 0;
          top: calc(100% + 6px);
          z-index: 99;
          max-height: 220px;
          overflow-y: auto;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          background: white;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
          padding: 6px;
          animation: wellbornDropdown .18s ease-out;
        }

        .dark .appointment-custom-menu {
          background: #0f172a;
          border-color: #334155;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }

        .appointment-custom-option {
          display: flex;
          align-items: center;
          width: 100%;
          padding: 10px 14px;
          border-radius: 11px;
          border: none;
          background: transparent;
          font-size: 12px;
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
          background: rgba(255,255,255,0.06);
          color: white;
        }

        .appointment-custom-option.selected {
          background: #eff6ff;
          color: #2563eb;
          font-weight: 800;
        }

        .dark .appointment-custom-option.selected {
          background: rgba(37,99,235,0.15);
          color: #60a5fa;
        }

        @keyframes wellbornDropdown {
          0% {
            opacity: 0;
            transform: translateY(5px) scale(.98);
          }

          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        /* =====================================================
           HERO
        ===================================================== */

        .appointment-ios-hero {
          position: relative;
          overflow: hidden;
          padding: 88px 0 95px;
          color: white;

          background:
            radial-gradient(
              circle at 12% 18%,
              rgba(255,255,255,.16),
              transparent 23%
            ),
            radial-gradient(
              circle at 86% 15%,
              rgba(103,232,249,.18),
              transparent 25%
            ),
            linear-gradient(
              135deg,
              #1746d2,
              #2563eb 50%,
              #06b6d4
            );
        }

        .appointment-ios-hero-content {
          position: relative;
          z-index: 5;
          max-width: 820px;
          margin: 0 auto;
          text-align: center;
        }

        .appointment-ios-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 13px;
          border-radius: 999px;
          background: rgba(255,255,255,.11);
          border: 1px solid rgba(255,255,255,.21);
          backdrop-filter: blur(18px);
          font-size: 11px;
          font-weight: 800;
        }

        .appointment-ios-chip-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255,255,255,.15);
        }

        .appointment-ios-title {
          margin-top: 21px;
          font-size: clamp(3rem, 7vw, 5.4rem);
          line-height: .94;
          letter-spacing: -.065em;
          font-weight: 900;
        }

        .appointment-ios-title span {
          display: block;
          margin-top: 9px;
          color: transparent;
          background: linear-gradient(
            90deg,
            white,
            #c7f9ff
          );
          background-clip: text;
          -webkit-background-clip: text;
        }

        .appointment-ios-description {
          max-width: 650px;
          margin: 23px auto 0;
          color: rgba(255,255,255,.84);
          font-size: 15px;
          line-height: 1.8;
        }

        .appointment-ios-pills {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 22px;
        }

        .appointment-ios-pills span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 11px;
          border-radius: 999px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.14);
          font-size: 10px;
          font-weight: 700;
        }

        .appointment-ios-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(5px);
        }

        .orb-one {
          width: 270px;
          height: 270px;
          left: -100px;
          top: -100px;
          background: rgba(255,255,255,.10);
          animation:
            appointmentOrbOne 12s ease-in-out infinite;
        }

        .orb-two {
          width: 340px;
          height: 340px;
          right: -120px;
          bottom: -150px;
          background: rgba(103,232,249,.12);
          animation:
            appointmentOrbTwo 15s ease-in-out infinite;
        }

        .orb-three {
          width: 110px;
          height: 110px;
          left: 48%;
          top: 20%;
          background: rgba(255,255,255,.045);
          animation:
            appointmentOrbThree 9s ease-in-out infinite;
        }

        @keyframes appointmentOrbOne {
          0%,100% {
            transform:
              translate(0,0)
              scale(1);
          }

          50% {
            transform:
              translate(45px,-30px)
              scale(1.1);
          }
        }

        @keyframes appointmentOrbTwo {
          0%,100% {
            transform:
              translate(0,0)
              scale(1);
          }

          50% {
            transform:
              translate(-45px,30px)
              scale(1.1);
          }
        }

        @keyframes appointmentOrbThree {
          0%,100% {
            transform:
              translate(0,0);
          }

          50% {
            transform:
              translate(30px,-20px);
          }
        }

        .appointment-ios-grid-pattern {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .40;

          background-image:
            linear-gradient(
              rgba(255,255,255,.03) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,.03) 1px,
              transparent 1px
            );

          background-size: 42px 42px;
        }

        /* =====================================================
           MAIN
        ================================================     */

        .appointment-ios-main {
          padding: 95px 0;

          background:
            linear-gradient(
              180deg,
              #f7f9fc,
              white
            );
        }

        .dark .appointment-ios-main {
          background:
            linear-gradient(
              180deg,
              #05070d,
              #08111e
            );
        }

        .appointment-ios-columns {
          display: grid;
          grid-template-columns:
            minmax(0,.9fr)
            minmax(0,1.1fr);
          gap: 22px;
          align-items: stretch;
        }

        /* =====================================================
           INFO CARD
        ================================================     */

        .appointment-ios-info-card {
          position: relative;
          overflow: hidden;
          padding: 30px;
          border-radius: 30px;
          color: white;

          background:
            linear-gradient(
              145deg,
              #1746d2,
              #2563eb 52%,
              #08a8c5
            );

          box-shadow:
            0 28px 70px
            rgba(37,99,235,.20);
        }

        .appointment-info-glow {
          position: absolute;
          width: 270px;
          height: 270px;
          right: -110px;
          top: -110px;
          border-radius: 50%;
          background: rgba(103,232,249,.18);
          filter: blur(45px);
          pointer-events: none;
        }

        .appointment-main-icon {
          position: relative;
          z-index: 2;
          width: 57px;
          height: 57px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          background: rgba(255,255,255,.11);
          border: 1px solid rgba(255,255,255,.18);
          backdrop-filter: blur(16px);
          animation:
            appointmentIconFloat
            5s ease-in-out infinite;
        }

        @keyframes appointmentIconFloat {

          0%,100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }

        }

        .appointment-info-title {
          position: relative;
          z-index: 2;
          margin-top: 20px;
          font-size:
            clamp(2rem, 4vw, 2.8rem);
          line-height: 1.04;
          font-weight: 900;
        }

        .appointment-info-title span {
          display: block;
          margin-top: 4px;
          color: #c7f9ff;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: .14em;
        }

        .appointment-info-description {
          position: relative;
          z-index: 2;
          max-width: 540px;
          margin-top: 15px;
          color: rgba(255,255,255,.83);
          font-size: 13px;
          line-height: 1.8;
        }

        .appointment-info-list {
          position: relative;
          z-index: 2;
          display: grid;
          gap: 11px;
          margin-top: 25px;
        }

        .appointment-info-item {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 11px;
          border-radius: 17px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.08);
          transition:
            transform .35s ease,
            background .35s ease;
        }

        .appointment-info-item:hover {
          background: rgba(255,255,255,.11);
        }

        .appointment-info-icon {
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: rgba(255,255,255,.12);
        }

        .appointment-info-content {
          min-width: 0;
        }

        .appointment-info-content h3 {
          font-size: 12px;
          font-weight: 800;
        }

        .appointment-info-content p,
        .appointment-info-content a {
          display: block;
          margin-top: 4px;
          color: rgba(239,246,255,.88);
          text-decoration: none;
          font-size: 11px;
          line-height: 1.65;
        }

        .appointment-info-content a:hover {
          color: white;
        }

        .appointment-location-btn {
          position: relative;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-top: 22px;
          min-height: 44px;
          padding: 0 15px;
          border-radius: 13px;
          background: white;
          color: #2563eb;
          text-decoration: none;
          font-size: 11px;
          font-weight: 850;
          box-shadow:
            0 13px 28px rgba(0,0,0,.16);
        }

        /* =====================================================
           FORM CARD
        ================================================     */

        .appointment-ios-form-card {
          padding: 30px;
          border-radius: 30px;
          background: rgba(255,255,255,.86);
          border: 1px solid rgba(255,255,255,.92);
          box-shadow:
            0 24px 65px
            rgba(15,23,42,.08);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
        }

        .dark .appointment-ios-form-card {
          background: rgba(15,23,42,.84);
          border-color: rgba(71,85,105,.55);
          box-shadow:
            0 24px 65px
            rgba(0,0,0,.28);
        }

        .appointment-form-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .appointment-form-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #2563eb;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: .14em;
        }

        .dark .appointment-form-label {
          color: #60a5fa;
        }

        .appointment-form-header h2 {
          margin-top: 8px;
          color: #111827;
          font-size: 29px;
          font-weight: 900;
        }

        .dark .appointment-form-header h2 {
          color: white;
        }

        .appointment-form-header p {
          margin-top: 5px;
          color: #64748b;
          font-size: 12px;
        }

        .dark .appointment-form-header p {
          color: #94a3b8;
        }

        .appointment-form-icon {
          width: 46px;
          height: 46px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: #eef4ff;
          color: #2563eb;
        }

        .dark .appointment-form-icon {
          background: rgba(37,99,235,.14);
          color: #60a5fa;
        }

        /* =====================================================
           SUCCESS MODAL
        ================================================     */

        .appointment-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .appointment-modal-backdrop {
          position: absolute;
          inset: 0;
          background:
            rgba(5, 7, 13, 0.75);
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
          background:
            linear-gradient(
              145deg,
              #0f172a,
              #0b1120
            );
          border:
            1px solid
            rgba(103, 232, 249, 0.25);
          box-shadow:
            0 25px 60px rgba(0, 0, 0, 0.5),
            0 0 40px
            rgba(37, 99, 235, 0.2);
          text-align: center;
          color: white;
          overflow: hidden;
        }

        .modal-glow-effect {
          position: absolute;
          top: -60px;
          left: 50%;
          transform: translateX(-50%);
          width: 180px;
          height: 180px;
          border-radius: 50%;
          background:
            rgba(37, 99, 235, 0.35);
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
          background:
            rgba(255, 255, 255, 0.08);
          border:
            1px solid
            rgba(255, 255, 255, 0.12);
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-close-btn:hover {
          background:
            rgba(255, 255, 255, 0.15);
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
          background:
            linear-gradient(
              135deg,
              rgba(37, 99, 235, 0.2),
              rgba(6, 182, 212, 0.2)
            );
          border:
            1px solid
            rgba(103, 232, 249, 0.3);
        }

        .success-badge-icon {
          color: #22d3ee;
        }

        .sparkle-float-1 {
          position: absolute;
          top: -6px;
          right: -6px;
          color: #38bdf8;
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
          background:
            rgba(34, 211, 238, 0.1);
          border:
            1px solid
            rgba(34, 211, 238, 0.25);
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
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #0891b2
            );
          color: white;
          font-size: 12px;
          font-weight: 850;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow:
            0 10px 25px
            rgba(37, 99, 235, 0.3);
          transition:
            transform 0.2s ease;
          text-decoration: none;
        }

        .modal-action-btn:hover {
          transform: translateY(-2px);
        }

        /* =====================================================
           ERROR
        ================================================     */

        .appointment-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 20px;
          padding: 12px;
          border-radius: 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          animation:
            appointmentErrorPulse
            2.5s ease-in-out;
        }

        .dark .appointment-error {
          background:
            rgba(220,38,38,.10);
          border-color:
            rgba(248,113,113,.20);
        }

        .appointment-error-icon {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: #fee2e2;
          color: #dc2626;
        }

        .dark .appointment-error-icon {
          background:
            rgba(220,38,38,.12);
          color: #f87171;
        }

        .appointment-error strong {
          display: block;
          color: #b91c1c;
          font-size: 12px;
        }

        .dark .appointment-error strong {
          color: #f87171;
        }

        .appointment-error p {
          margin-top: 2px;
          font-size: 10px;
          color: #dc2626;
          line-height: 1.5;
        }

        .dark .appointment-error p {
          color: #fca5a5;
        }

        @keyframes appointmentErrorPulse {

          0% {
            opacity: 0;
            transform: translateY(-8px);
          }

          100% {
            opacity: 1;
            transform: translateY(0);
          }

        }

        /* =====================================================
           FORM
        ================================================     */

        .appointment-form {
          margin-top: 22px;
        }

        .appointment-field {
          margin-top: 13px;
        }

        .appointment-field label {
          display: block;
          margin-bottom: 7px;
          padding-left: 2px;
          color: #475569;
          font-size: 11px;
          font-weight: 800;
        }

        .dark .appointment-field label {
          color: #cbd5e1;
        }

        .appointment-input-shell {
          position: relative;
          display: flex;
          align-items: center;
        }

        .appointment-field-icon {
          position: absolute;
          left: 11px;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
          background: #eff6ff;
          color: #2563eb;
          z-index: 2;
          pointer-events: none;
          transition:
            transform .25s ease,
            background .25s ease;
        }

        .dark .appointment-field-icon {
          background:
            rgba(37,99,235,.14);
          color: #60a5fa;
        }

        .appointment-input-shell:focus-within
        .appointment-field-icon {
          transform: scale(1.05);
          background: #dbeafe;
        }

        .dark
        .appointment-input-shell:focus-within
        .appointment-field-icon {
          background:
            rgba(37,99,235,.20);
        }

        /* PHONE */

        .phone-input-shell input {
          padding-left: 88px !important;
        }

        .phone-prefix {
          position: absolute;
          left: 56px;
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
          z-index: 3;
          pointer-events: none;
        }

        .dark .phone-prefix {
          color: #94a3b8;
        }

        .appointment-input-shell input {
          width: 100%;
          min-height: 55px;
          padding:
            0 13px 0 56px;
          border:
            1px solid #e2e8f0;
          border-radius: 16px;
          outline: none;
          background:
            rgba(248,250,252,.92);
          color: #111827;
          font-size: 12px;
          transition: all .25s ease;
        }

        .appointment-input-shell input::placeholder {
          color: #94a3b8;
        }

        .appointment-input-shell input:focus {
          border-color: #3b82f6;
          background: white;
          box-shadow:
            0 0 0 4px
            rgba(59,130,246,.10);
          transform: translateY(-1px);
        }

        .dark
        .appointment-input-shell input {
          background: #1e293b;
          border-color: #334155;
          color: white;
        }

        .dark
        .appointment-input-shell input:focus {
          background: #1e293b;
          border-color: #60a5fa;
          box-shadow:
            0 0 0 4px
            rgba(96,165,250,.10);
        }

        .appointment-input-shell
        input[type="date"] {
          color-scheme: light;
        }

        .dark
        .appointment-input-shell
        input[type="date"] {
          color-scheme: dark;
        }

        /* =====================================================
           TIME FIELD
        ================================================     */

        .appointment-time-note {
          margin-top: 5px;
          padding-left: 2px;
          color: #94a3b8;
          font-size: 9px;
          line-height: 1.4;
        }

        .dark .appointment-time-note {
          color: #64748b;
        }

        .appointment-two-fields {
          display: grid;
          grid-template-columns:
            repeat(2,minmax(0,1fr));
          gap: 12px;
        }

        .appointment-textarea-shell {
          position: relative;
        }

        .appointment-textarea-shell textarea {
          width: 100%;
          min-height: 125px;
          padding:
            14px 14px 14px 56px;
          border:
            1px solid #e2e8f0;
          border-radius: 16px;
          outline: none;
          resize: vertical;
          background:
            rgba(248,250,252,.92);
          color: #111827;
          font-size: 12px;
          line-height: 1.6;
          transition: all .25s ease;
        }

        .appointment-textarea-shell textarea::placeholder {
          color: #94a3b8;
        }

        .appointment-textarea-shell textarea:focus {
          border-color: #3b82f6;
          background: white;
          box-shadow:
            0 0 0 4px
            rgba(59,130,246,.10);
        }

        .dark
        .appointment-textarea-shell textarea {
          background: #1e293b;
          border-color: #334155;
          color: white;
        }

        .dark
        .appointment-textarea-shell textarea:focus {
          background: #1e293b;
          border-color: #60a5fa;
        }

        /* =====================================================
           SUBMIT
        ================================================     */

        .appointment-submit {
          width: 100%;
          min-height: 56px;
          margin-top: 16px;
          padding:
            7px 8px 7px 17px;
          border: none;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #0891b2
            );

          color: white;
          font-size: 13px;
          font-weight: 850;
          cursor: pointer;

          box-shadow:
            0 13px 32px
            rgba(37,99,235,.22);

          transition:
            opacity .25s ease,
            transform .25s ease;
        }

        .appointment-submit:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .appointment-submit-icon {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            rgba(255,255,255,.14);
        }

        .appointment-spinner {
          width: 17px;
          height: 17px;
          border:
            2px solid
            rgba(255,255,255,.35);
          border-top-color: white;
          border-radius: 50%;
          animation:
            appointmentSpinner
            .7s linear infinite;
        }

        @keyframes appointmentSpinner {
          to {
            transform: rotate(360deg);
          }
        }

        .appointment-note {
          margin-top: 9px;
          text-align: center;
          color: #94a3b8;
          font-size: 10px;
        }

        /* =====================================================
           CTA
        ================================================     */

        .appointment-cta {
          position: relative;
          overflow: hidden;
          padding: 78px 20px;
          text-align: center;
          color: white;

          background:
            linear-gradient(
              135deg,
              #1746d2,
              #2563eb 50%,
              #06b6d4
            );
        }

        .appointment-cta-icon {
          width: 58px;
          height: 58px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          background: rgba(255,255,255,.11);
          border:
            1px solid
            rgba(255,255,255,.18);
          backdrop-filter: blur(15px);
        }

        .appointment-cta h2 {
          margin-top: 18px;
          font-size:
            clamp(2rem, 5vw, 3.5rem);
          font-weight: 900;
          line-height: 1.05;
        }

        .appointment-cta > p {
          max-width: 600px;
          margin: 15px auto 0;
          color: rgba(255,255,255,.82);
          font-size: 14px;
          line-height: 1.8;
        }

        .appointment-cta-actions {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 24px;
        }

        .appointment-cta-primary,
        .appointment-cta-secondary {
          min-height: 48px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 17px;
          border-radius: 14px;
          text-decoration: none;
          font-size: 11px;
          font-weight: 850;
        }

        .appointment-cta-primary {
          color: #2563eb;
          background: white;
          box-shadow:
            0 14px 32px
            rgba(0,0,0,.17);
        }

        .appointment-cta-secondary {
          color: white;
          background:
            rgba(255,255,255,.10);
          border:
            1px solid
            rgba(255,255,255,.20);
          backdrop-filter: blur(14px);
        }

        .appointment-cta-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(45px);
          pointer-events: none;
        }

        .cta-left {
          width: 260px;
          height: 260px;
          left: -100px;
          bottom: -130px;
          background:
            rgba(103,232,249,.15);
        }

        .cta-right {
          width: 270px;
          height: 270px;
          right: -100px;
          top: -130px;
          background:
            rgba(255,255,255,.10);
        }

        /* =====================================================
           FOOTER
        ================================================     */

        .appointment-footer {
          padding: 45px 0 25px;
          background:
            linear-gradient(
              180deg,
              #05070d,
              #03050a
            );
          color: white;
        }

        .appointment-footer-content {
          text-align: center;
        }

        .appointment-footer-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-align: left;
        }

        .appointment-footer-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          color: #67e8f9;
          background:
            rgba(103,232,249,.08);
        }

        .appointment-footer-brand h2 {
          color: #67e8f9;
          font-size: 20px;
          font-weight: 900;
        }

        .appointment-footer-brand span {
          display: block;
          margin-top: 2px;
          color: #64748b;
          font-size: 9px;
          letter-spacing: .15em;
          text-transform: uppercase;
        }

        .appointment-footer-content > p {
          max-width: 600px;
          margin: 16px auto 0;
          color: #94a3b8;
          font-size: 11px;
          line-height: 1.8;
        }

        .appointment-footer-links {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 20px;
        }

        .appointment-footer-links a,
        .appointment-footer-links span {
          color: #64748b;
          font-size: 11px;
          text-decoration: none;
          transition:
            color .25s ease;
        }

        .appointment-footer-links a:hover,
        .appointment-footer-links .active {
          color: #60a5fa;
        }

        .appointment-footer-copy {
          margin-top: 22px;
          padding-top: 16px;
          border-top:
            1px solid
            rgba(255,255,255,.06);
          color: #475569;
          font-size: 10px;
        }

        /* =====================================================
           RESPONSIVE
        ================================================     */

        @media (max-width: 950px) {

          .appointment-ios-columns {
            grid-template-columns: 1fr;
          }

        }

        @media (max-width: 640px) {

          .appointment-ios-container {
            padding-left: 15px;
            padding-right: 15px;
          }

          .appointment-ios-hero {
            padding: 75px 0 82px;
          }

          .appointment-ios-title {
            font-size: 3rem;
          }

          .appointment-ios-description {
            font-size: 13px;
          }

          .appointment-ios-pills {
            flex-direction: column;
            align-items: stretch;
          }

          .appointment-ios-pills span {
            justify-content: center;
          }

          .appointment-ios-main {
            padding: 72px 0;
          }

          .appointment-ios-info-card,
          .appointment-ios-form-card {
            padding: 22px;
            border-radius: 24px;
          }

          .appointment-two-fields {
            grid-template-columns: 1fr;
          }

          .appointment-input-shell input {
            min-height: 53px;
            border-radius: 16px;
          }

          .appointment-textarea-shell textarea {
            border-radius: 16px;
          }

          .appointment-submit {
            border-radius: 16px;
          }

          .appointment-cta {
            padding: 66px 15px;
          }

          .appointment-cta h2 {
            font-size: 2.15rem;
          }

          .appointment-cta-actions {
            flex-direction: column;
          }

          .appointment-cta-primary,
          .appointment-cta-secondary {
            width: 100%;
          }

          .appointment-success-modal-card {
            max-width: 100%;
            padding: 27px 20px;
          }

        }

        @media (max-width: 390px) {

          .appointment-ios-container {
            padding-left: 12px;
            padding-right: 12px;
          }

          .appointment-ios-title {
            font-size: 2.65rem;
          }

          .appointment-info-title {
            font-size: 2rem;
          }

          .appointment-ios-info-card,
          .appointment-ios-form-card {
            padding: 19px;
          }

          .appointment-form-header h2 {
            font-size: 25px;
          }

          .appointment-error {
            padding: 10px;
          }

        }

      `}</style>

    </div>
  );
}