import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock3,
  Send,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { API, postData } from "../services/api";
import { getUserFcmToken } from "../services/fcm";

/* =========================================================
   ANIMATION VARIANTS
========================================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 35,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeLeft = {
  hidden: {
    opacity: 0,
    x: -45,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeRight = {
  hidden: {
    opacity: 0,
    x: 45,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.75,
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

function InfoItem({
  icon: Icon,
  title,
  children,
  className = "",
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{
        x: 5,
      }}
      className={`contact-info-item ${className}`}
    >
      <div className="contact-info-icon">
        <Icon size={19} />
      </div>

      <div className="contact-info-content">
        <h3>{title}</h3>
        {children}
      </div>
    </motion.div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function User_contact() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  /* =======================================================
     PAGE SETUP
  ======================================================= */

  useEffect(() => {
    document.title = "Contact Us | Wellborn Physio";

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    return () => {
      document.title = "Wellborn Physio";
    };
  }, []);

  /* =======================================================
     BODY SCROLL LOCK
  ======================================================= */

  useEffect(() => {
    if (isSubmitted) {
      const previousOverflow = document.body.style.overflow;

      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isSubmitted]);

  /* =======================================================
     ESC KEY
  ======================================================= */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && isSubmitted) {
        setIsSubmitted(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSubmitted]);

  /* =======================================================
     HANDLE INPUT
  ======================================================= */

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    if (submitError) {
      setSubmitError("");
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* =======================================================
     PHONE INPUT
  ======================================================= */

  const handlePhoneChange = (event) => {
    const value = event.target.value
      .replace(/\D/g, "")
      .slice(0, 10);

    if (submitError) {
      setSubmitError("");
    }

    setFormData((previous) => ({
      ...previous,
      phone: value,
    }));
  };

  /* =======================================================
     FORM SUBMIT
  ======================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setSubmitError("");

    const formElement = e.currentTarget;
    const data = new FormData(formElement);

    const name = String(data.get("name") || "").trim();

    const email = String(data.get("email") || "")
      .trim()
      .toLowerCase();

    const phone = String(data.get("phone") || "").trim();

    const subject = String(data.get("subject") || "").trim();

    const message = String(data.get("message") || "").trim();

    /* =================================================
       VALIDATION
    ================================================ */

    if (name.length < 2) {
      setSubmitError("Please enter your valid name.");
      return;
    }

    if (!email) {
      setSubmitError("Please enter your email address.");
      return;
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      setSubmitError("Please enter a valid email address.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setSubmitError(
        "Please enter a valid 10-digit Indian mobile number."
      );
      return;
    }

    if (subject.length < 2) {
      setSubmitError("Please enter a subject.");
      return;
    }

    if (message.length < 5) {
      setSubmitError("Please enter your message.");
      return;
    }

    /* =====================================================
       GET FCM TOKEN (for push notification on submission)
       NOTE: fetched BEFORE building the payload so it can be
       included directly in the contact request. The backend
       reads request.getFcmToken() and uses it to send the
       "message received" push notification to the user.
       If this is null/empty, the backend just skips sending
       the user notification (admin notification still goes
       out regardless).
    ================================================     */

    let userFcmToken = null;
    try {
      userFcmToken = await getUserFcmToken();
    } catch (tokenError) {
      console.error("Could not retrieve FCM token:", tokenError);
    }

    const payload = {
      name: name,
      email: email,
      phone: phone,
      subject: subject,
      message: message,
      fcmToken: userFcmToken || null,
    };

    console.log("Contact Payload:", payload);

    setIsSubmitting(true);

    try {
      /* =====================================================
         BACKEND API SUBMISSION
         (Backend handles BOTH admin + user push notifications
         internally using the fcmToken sent above — no separate
         frontend call to /api/notifications/send is needed.)
      ================================================     */

      await postData(API.CONTACT_SAVE, payload);

      setFormData({
        name: name || "Guest",
        email: email,
        phone: "",
      });

      setSubmitError("");
      setIsSubmitted(true);
      formElement.reset();

    } catch (error) {
      console.error("Contact message failed:", error);

      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "";

      setSubmitError(
        backendMessage ||
          "We couldn't send your message right now. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =======================================================
     CLOSE MODAL
  ======================================================= */

  const handleCloseModal = () => {
    setIsSubmitted(false);
  };

  /* =======================================================
     JSX
  ======================================================= */

  return (
    <div className="contact-page">

      {/* =====================================================
          HERO
      ================================================     */}

      <section className="contact-hero">

        <div className="contact-orb orb-a" />
        <div className="contact-orb orb-b" />
        <div className="contact-orb orb-c" />

        <div className="contact-container">

          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="contact-hero-content"
          >

            <motion.div
              variants={fadeUp}
              className="contact-chip"
            >
              <Mail size={15} />
              Get In Touch
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="contact-title"
            >
              Contact
              <span>Us</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="contact-hero-text"
            >
              We'd love to hear from you. Reach out for
              appointments, consultations or any questions
              about our physiotherapy services.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="contact-pills"
            >

              <span>
                <CheckCircle2 size={14} />
                Trusted Care
              </span>

              <span>
                <Clock3 size={14} />
                Flexible Hours
              </span>

              <span>
                <Phone size={14} />
                Quick Support
              </span>

            </motion.div>

          </motion.div>

        </div>
      </section>

      {/* =====================================================
          CONTACT MAIN
      ================================================     */}

      <section className="contact-main">

        <div className="contact-container">

          <div className="contact-columns">

            {/* =================================================
                LEFT INFORMATION CARD
            ================================================     */}

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.15,
              }}
              variants={stagger}
              className="contact-info-card"
            >

              <div className="contact-card-glow" />

              <motion.div
                variants={fadeUp}
                className="contact-main-icon"
              >
                <Send size={23} />
              </motion.div>

              <motion.h2
                variants={fadeUp}
                className="contact-card-title"
              >
                Wellborn Physio
                <span>Rehab & Centre</span>
              </motion.h2>

              <motion.p
                variants={fadeUp}
                className="contact-card-text"
              >
                We're here to help you recover better,
                move better and live healthier.
              </motion.p>

              <motion.div
                variants={stagger}
                className="contact-info-list"
              >

                <InfoItem
                  icon={MapPin}
                  title="Address"
                >
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Karayanchavadi%20Poonamallee%20Chennai"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    1/13, 2nd Cross Street
                    <br />
                    Avadi Road
                    <br />
                    Karayanchavadi
                    <br />
                    Poonamallee
                    <br />
                    Chennai - 600056
                  </a>
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
                  icon={Mail}
                  title="Email"
                >
                  <a href="mailto:wellbornphysio@gmail.com">
                    wellbornphysio@gmail.com
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
                className="contact-location-btn"
                whileHover={{
                  y: -3,
                }}
                whileTap={{
                  scale: 0.98,
                }}
              >
                Open Location
                <ArrowRight size={16} />
              </motion.a>

            </motion.div>

            {/* =================================================
                CONTACT FORM
            ================================================     */}

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.15,
              }}
              variants={fadeRight}
              className="contact-form-card"
            >

              <div className="contact-form-top">

                <div>

                  <div className="contact-label">
                    <Send size={13} />
                    SEND A MESSAGE
                  </div>

                  <h2>Let's Talk</h2>

                  <p>
                    Fill in your details and our team will
                    get back to you.
                  </p>

                </div>

                <div className="contact-form-icon">
                  <Mail size={20} />
                </div>

              </div>

              {/* ERROR */}

              <AnimatePresence>
                {submitError && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -10,
                    }}
                    className="premium-modal-error"
                    role="alert"
                  >
                    {submitError}
                  </motion.div>
                )}
              </AnimatePresence>

              <form
                onSubmit={handleSubmit}
                className="contact-form"
                noValidate
              >

                <div className="contact-form-grid">

                  {/* NAME */}

                  <div className="contact-field">

                    <label htmlFor="contact-name">
                      Your Name
                    </label>

                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      autoComplete="name"
                      minLength={2}
                      maxLength={80}
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required
                    />

                  </div>

                  {/* EMAIL */}

                  <div className="contact-field">

                    <label htmlFor="contact-email">
                      Email Address
                    </label>

                    <input
                      id="contact-email"
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      maxLength={120}
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isSubmitting}
                      required
                    />

                  </div>

                  {/* PHONE */}

                  <div className="contact-field">

                    <label htmlFor="contact-phone">
                      Phone Number
                    </label>

                    <input
                      id="contact-phone"
                      type="tel"
                      name="phone"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder="Enter 10-digit phone number"
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      value={formData.phone || ""}
                      onChange={handlePhoneChange}
                      disabled={isSubmitting}
                      required
                    />

                  </div>

                  {/* SUBJECT */}

                  <div className="contact-field">

                    <label htmlFor="contact-subject">
                      Subject
                    </label>

                    <input
                      id="contact-subject"
                      type="text"
                      name="subject"
                      placeholder="Enter subject"
                      maxLength={150}
                      disabled={isSubmitting}
                      required
                    />

                  </div>

                </div>

                {/* MESSAGE */}

                <div className="contact-field contact-message">

                  <label htmlFor="contact-message">
                    Message
                  </label>

                  <textarea
                    id="contact-message"
                    name="message"
                    rows="6"
                    placeholder="Write your message..."
                    minLength={5}
                    maxLength={2000}
                    disabled={isSubmitting}
                    required
                  />

                </div>

                {/* SUBMIT */}

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="contact-submit"
                  whileHover={
                    !isSubmitting
                      ? {
                          y: -3,
                        }
                      : {}
                  }
                  whileTap={
                    !isSubmitting
                      ? {
                          scale: 0.98,
                        }
                      : {}
                  }
                >

                  <span>
                    {isSubmitting
                      ? "Sending..."
                      : "Send Message"}
                  </span>

                  <span className="contact-submit-icon">

                    {isSubmitting ? (
                      <span className="contact-spinner" />
                    ) : (
                      <Send size={17} />
                    )}

                  </span>

                </motion.button>

                <p className="contact-form-note">
                  We'll get back to you as soon as possible.
                </p>

              </form>

            </motion.div>

          </div>

          {/* =================================================
              MAP
          ================================================     */}

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.1,
            }}
            variants={fadeUp}
            className="contact-map-card"
          >

            <div className="contact-map-header">

              <div>

                <div className="contact-label">
                  <MapPin size={13} />
                  OUR LOCATION
                </div>

                <h2>Find Wellborn Physio</h2>

                <p>
                  Visit our centre at Karayanchavadi,
                  Poonamallee, Chennai.
                </p>

              </div>

              <a
                href="https://www.google.com/maps/search/?api=1&query=Karayanchavadi%20Poonamallee%20Chennai"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-map-btn"
              >
                <MapPin size={15} />
                Open Maps
              </a>

            </div>

            <div className="contact-map">

              <iframe
                title="Wellborn Physio Location"
                src="https://www.google.com/maps?q=1/13,2nd+Cross+Street,+Avadi+Road,+Karayanchavadi,+Poonamallee,+Chennai+600056&output=embed"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />

            </div>

          </motion.div>

        </div>

      </section>

      {/* =====================================================
          CTA
      ================================================     */}

      <section className="contact-cta">

        <div className="cta-orb cta-orb-one" />
        <div className="cta-orb cta-orb-two" />

        <motion.div
          animate={{
            y: [0, -8, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="contact-cta-icon"
        >
          <CalendarDays size={28} />
        </motion.div>

        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
          }}
          variants={fadeUp}
        >
          Need Physiotherapy?
        </motion.h2>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
          }}
          variants={fadeUp}
        >
          Book your appointment today and start your recovery
          with our physiotherapy team.
        </motion.p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
          }}
          variants={fadeUp}
          className="contact-cta-buttons"
        >

          <Link
            to="/user/appointment"
            className="contact-cta-primary"
          >
            Book Appointment
            <ArrowRight size={17} />
          </Link>

          <a
            href="tel:+919342752147"
            className="contact-cta-secondary"
          >
            <Phone size={16} />
            Call Now
          </a>

        </motion.div>

      </section>

      {/* =====================================================
          FOOTER
      ================================================     */}

      <footer className="contact-footer">

        <div className="contact-container">

          <div className="contact-footer-inner">

            <div className="contact-footer-brand">

              <div className="contact-footer-logo">
                <Mail size={21} />
              </div>

              <div>
                <h2>Wellborn Physio</h2>
                <span>Rehab & Centre</span>
              </div>

            </div>

            <p>
              Professional physiotherapy and rehabilitation
              care focused on helping you move better and
              live healthier.
            </p>

            <div className="contact-footer-links">

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

              <Link
                to="/user/contact"
                className="active"
              >
                Contact
              </Link>

            </div>

            <div className="contact-footer-copy">
              © {new Date().getFullYear()} Wellborn Physio
              Rehab & Centre. All Rights Reserved.
            </div>

          </div>

        </div>

      </footer>

      {/* =====================================================
          PREMIUM SUCCESS MODAL
      ================================================     */}

      <AnimatePresence>

        {isSubmitted && (

          <div
            className="premium-modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-success-title"
          >

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              className="modal-backdrop-blur"
              onClick={handleCloseModal}
            />

            <motion.div
              initial={{
                scale: 0.85,
                opacity: 0,
                y: 20,
              }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
              }}
              exit={{
                scale: 0.85,
                opacity: 0,
                y: 20,
              }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
              className="premium-success-modal"
              onClick={(e) => e.stopPropagation()}
            >

              <div className="modal-glow-effect" />

              <button
                type="button"
                className="modal-close-btn"
                onClick={handleCloseModal}
                aria-label="Close success message"
              >
                <X size={18} />
              </button>

              <div className="success-icon-wrapper">

                <motion.div
                  initial={{
                    scale: 0,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  transition={{
                    delay: 0.1,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className="success-badge-icon"
                >
                  <CheckCircle2 size={36} />
                </motion.div>

                <div className="sparkle-float-1">
                  <Sparkles size={16} />
                </div>

              </div>

              <div className="modal-content-text">

                <div className="modal-pill-tag">
                  <Sparkles size={12} />
                  Your message sent successfully!
                </div>

                <h3 id="contact-success-title">
                  Thank You, {formData.name}!
                </h3>

                <p>
                  Your message has been sent to Wellborn Physio
                  successfully! We will review your inquiry and
                  get back to you shortly.
                </p>

              </div>

              <motion.button
                type="button"
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={handleCloseModal}
                className="modal-action-btn"
              >
                <span>Back to Contact</span>
                <ArrowRight size={16} />
              </motion.button>

            </motion.div>

          </div>

        )}

      </AnimatePresence>

      {/* =====================================================
          STYLES
          YOUR EXISTING CSS IS KEPT UNCHANGED
      ================================================     */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .premium-modal-error {
          margin-bottom: 18px;
          padding: 12px 15px;
          border-radius: 14px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.18);
          color: #b91c1c;
          font-size: 13px;
          font-weight: 700;
        }

        .dark .premium-modal-error {
          background: rgba(239, 68, 68, 0.12);
          border-color: rgba(248, 113, 113, 0.2);
          color: #fca5a5;
        }

        .contact-page {
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          color: #111827;
          background: #f5f7fb;
        }

        .dark .contact-page {
          color: #f8fafc;
          background: #05070d;
        }

        .contact-container {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 22px;
        }

        .contact-hero {
          position: relative;
          overflow: hidden;
          padding: 95px 0 110px;
          color: white;

          background:
            radial-gradient(
              circle at 12% 18%,
              rgba(255,255,255,.16),
              transparent 24%
            ),
            radial-gradient(
              circle at 88% 12%,
              rgba(103,232,249,.16),
              transparent 26%
            ),
            linear-gradient(
              135deg,
              #1746d2,
              #2563eb 50%,
              #06b6d4
            );
        }

        .contact-hero-content {
          position: relative;
          z-index: 5;
          max-width: 850px;
          margin: 0 auto;
          text-align: center;
        }

        .contact-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 13px;
          border-radius: 999px;
          background: rgba(255,255,255,.11);
          border: 1px solid rgba(255,255,255,.22);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          font-size: 12px;
          font-weight: 800;
        }

        .contact-title {
          margin-top: 20px;
          font-size: clamp(3rem, 7vw, 5.5rem);
          line-height: .95;
          letter-spacing: -.065em;
          font-weight: 900;
        }

        .contact-title span {
          color: transparent;
          background: linear-gradient(90deg,#ffffff,#c7f9ff);
          background-clip: text;
          -webkit-background-clip: text;
        }

        .contact-hero-text {
          max-width: 680px;
          margin: 22px auto 0;
          color: rgba(255,255,255,.85);
          font-size: 15px;
          line-height: 1.8;
        }

        .contact-pills {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 22px;
        }

        .contact-pills span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 11px;
          border-radius: 999px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.15);
          font-size: 10px;
          font-weight: 700;
        }

        .contact-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(5px);
        }

        .orb-a {
          width: 280px;
          height: 280px;
          left: -100px;
          top: -100px;
          background: rgba(255,255,255,.10);
          animation: contactOrbA 12s ease-in-out infinite;
        }

        .orb-b {
          width: 340px;
          height: 340px;
          right: -120px;
          bottom: -140px;
          background: rgba(103,232,249,.12);
          animation: contactOrbB 15s ease-in-out infinite;
        }

        .orb-c {
          width: 120px;
          height: 120px;
          top: 22%;
          left: 48%;
          background: rgba(255,255,255,.05);
          animation: contactOrbC 9s ease-in-out infinite;
        }

        @keyframes contactOrbA {
          0%,100% {
            transform: translate(0,0) scale(1);
          }

          50% {
            transform: translate(45px,-30px) scale(1.1);
          }
        }

        @keyframes contactOrbB {
          0%,100% {
            transform: translate(0,0) scale(1);
          }

          50% {
            transform: translate(-40px,35px) scale(1.1);
          }
        }

        @keyframes contactOrbC {
          0%,100% {
            transform: translate(0,0);
          }

          50% {
            transform: translate(30px,-25px);
          }
        }

        .contact-main {
          padding: 100px 0;
          background: linear-gradient(180deg,#f7f9fc,#ffffff);
        }

        .dark .contact-main {
          background: linear-gradient(180deg,#05070d,#08111e);
        }

        .contact-columns {
          display: grid;
          grid-template-columns: minmax(0,.95fr) minmax(0,1.05fr);
          gap: 22px;
        }

        .contact-info-card {
          position: relative;
          overflow: hidden;
          padding: 30px;
          border-radius: 30px;
          color: white;
          background: linear-gradient(145deg,#1746d2,#2563eb 55%,#08a8c5);
          box-shadow: 0 30px 75px rgba(37,99,235,.20);
        }

        .contact-card-glow {
          position: absolute;
          width: 240px;
          height: 240px;
          right: -100px;
          top: -100px;
          border-radius: 50%;
          background: rgba(103,232,249,.20);
          filter: blur(45px);
          pointer-events: none;
        }

        .contact-main-icon {
          position: relative;
          z-index: 2;
          width: 55px;
          height: 55px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 17px;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.18);
          backdrop-filter: blur(15px);
          animation: contactIconMove 3s ease-in-out infinite;
        }

        @keyframes contactIconMove {
          0%,100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        .contact-card-title {
          position: relative;
          z-index: 2;
          margin-top: 19px;
          font-size: clamp(1.8rem,4vw,2.4rem);
          line-height: 1.05;
          font-weight: 900;
        }

        .contact-card-title span {
          display: block;
          margin-top: 5px;
          color: rgba(219,252,255,.78);
          font-size: 12px;
          letter-spacing: .15em;
          text-transform: uppercase;
        }

        .contact-card-text {
          position: relative;
          z-index: 2;
          margin-top: 14px;
          color: rgba(255,255,255,.82);
          font-size: 13px;
          line-height: 1.8;
        }

        .contact-info-list {
          position: relative;
          z-index: 2;
          display: grid;
          gap: 13px;
          margin-top: 25px;
        }

        .contact-info-item {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 11px;
          border-radius: 17px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(255,255,255,.08);
          transition: transform .35s ease,background .35s ease;
        }

        .contact-info-item:hover {
          background: rgba(255,255,255,.11);
        }

        .contact-info-icon {
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: rgba(255,255,255,.12);
          color: white;
        }

        .contact-info-content {
          min-width: 0;
        }

        .contact-info-content h3 {
          font-size: 12px;
          font-weight: 800;
        }

        .contact-info-content a,
        .contact-info-content p {
          display: block;
          margin-top: 4px;
          color: rgba(239,246,255,.86);
          font-size: 11px;
          line-height: 1.65;
          text-decoration: none;
          word-break: break-word;
        }

        .contact-info-content a:hover {
          color: white;
        }

        .contact-location-btn {
          position: relative;
          z-index: 2;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          margin-top: 24px;
          min-height: 45px;
          padding: 0 17px;
          border-radius: 14px;
          background: white;
          color: #1750d5;
          text-decoration: none;
          font-size: 11px;
          font-weight: 850;
          box-shadow: 0 14px 30px rgba(0,0,0,.15);
        }

        .contact-form-card {
          padding: 30px;
          border-radius: 30px;
          background: rgba(255,255,255,.84);
          border: 1px solid rgba(255,255,255,.9);
          box-shadow: 0 24px 65px rgba(15,23,42,.08);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
        }

        .dark .contact-form-card {
          background: rgba(15,23,42,.84);
          border-color: rgba(71,85,105,.55);
          box-shadow: 0 24px 65px rgba(0,0,0,.28);
        }

        .contact-form-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .contact-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #2563eb;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: .14em;
        }

        .dark .contact-label {
          color: #60a5fa;
        }

        .contact-form-top h2 {
          margin-top: 8px;
          color: #111827;
          font-size: 29px;
          font-weight: 900;
        }

        .dark .contact-form-top h2 {
          color: white;
        }

        .contact-form-top p {
          margin-top: 5px;
          color: #64748b;
          font-size: 12px;
        }

        .dark .contact-form-top p {
          color: #94a3b8;
        }

        .contact-form-icon {
          width: 45px;
          height: 45px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: #eef4ff;
          color: #2563eb;
          animation: contactMailFloat 3s ease-in-out infinite;
        }

        .dark .contact-form-icon {
          background: rgba(37,99,235,.14);
          color: #60a5fa;
        }

        @keyframes contactMailFloat {
          0%,100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-5px);
          }
        }

        .contact-form {
          margin-top: 24px;
        }

        .contact-form-grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 13px;
        }

        .contact-field {
          min-width: 0;
        }

        .contact-field label {
          display: block;
          margin-bottom: 7px;
          color: #475569;
          font-size: 11px;
          font-weight: 800;
        }

        .dark .contact-field label {
          color: #cbd5e1;
        }

        .contact-field input,
        .contact-field textarea {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 15px;
          outline: none;
          background: rgba(248,250,252,.9);
          color: #111827;
          font-size: 13px;
          transition:
            border-color .25s ease,
            box-shadow .25s ease,
            transform .25s ease,
            background .25s ease;
        }

        .contact-field input {
          min-height: 53px;
          padding: 0 14px;
        }

        .contact-field textarea {
          padding: 14px;
          min-height: 145px;
          resize: vertical;
        }

        .contact-field input::placeholder,
        .contact-field textarea::placeholder {
          color: #94a3b8;
        }

        .contact-field input:focus,
        .contact-field textarea:focus {
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 4px rgba(59,130,246,.10);
          transform: translateY(-1px);
        }

        .dark .contact-field input,
        .dark .contact-field textarea {
          background: #1e293b;
          border-color: #334155;
          color: white;
        }

        .dark .contact-field input:focus,
        .dark .contact-field textarea:focus {
          background: #1e293b;
          border-color: #60a5fa;
          box-shadow: 0 0 0 4px rgba(96,165,250,.10);
        }

        .contact-field input:disabled,
        .contact-field textarea:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .contact-message {
          margin-top: 14px;
        }

        .contact-submit {
          width: 100%;
          min-height: 54px;
          margin-top: 17px;
          padding: 6px 8px 6px 17px;
          border: none;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(135deg,#2563eb,#0891b2);
          color: white;
          cursor: pointer;
          font-size: 12px;
          font-weight: 850;
          box-shadow: 0 14px 32px rgba(37,99,235,.22);
          transition: opacity .25s ease,filter .25s ease;
        }

        .contact-submit:disabled {
          cursor: not-allowed;
          opacity: .72;
          filter: saturate(.75);
        }

        .contact-submit-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: rgba(255,255,255,.14);
        }

        .contact-spinner {
          width: 17px;
          height: 17px;
          border: 2px solid rgba(255,255,255,.35);
          border-top-color: white;
          border-radius: 50%;
          animation: contactSpinner .7s linear infinite;
        }

        @keyframes contactSpinner {
          to {
            transform: rotate(360deg);
          }
        }

        .contact-form-note {
          margin-top: 9px;
          text-align: center;
          color: #94a3b8;
          font-size: 10px;
        }

        .contact-map-card {
          margin-top: 22px;
          padding: 22px;
          border-radius: 28px;
          background: rgba(255,255,255,.84);
          border: 1px solid rgba(255,255,255,.9);
          box-shadow: 0 22px 65px rgba(15,23,42,.07);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
        }

        .dark .contact-map-card {
          background: rgba(15,23,42,.84);
          border-color: rgba(71,85,105,.55);
        }

        .contact-map-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 2px 3px 19px;
        }

        .contact-map-header h2 {
          margin-top: 6px;
          color: #111827;
          font-size: 24px;
          font-weight: 900;
        }

        .dark .contact-map-header h2 {
          color: white;
        }

        .contact-map-header p {
          margin-top: 4px;
          color: #64748b;
          font-size: 11px;
        }

        .dark .contact-map-header p {
          color: #94a3b8;
        }

        .contact-map-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          min-height: 42px;
          padding: 0 14px;
          border-radius: 13px;
          color: #2563eb;
          background: #eef4ff;
          text-decoration: none;
          font-size: 11px;
          font-weight: 850;
          flex-shrink: 0;
        }

        .dark .contact-map-btn {
          color: #60a5fa;
          background: rgba(37,99,235,.13);
        }

        .contact-map {
          height: 420px;
          overflow: hidden;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
        }

        .dark .contact-map {
          border-color: #334155;
        }

        .contact-map iframe {
          width: 100%;
          height: 100%;
          display: block;
          border: 0;
        }

        .contact-cta {
          position: relative;
          overflow: hidden;
          padding: 78px 20px;
          text-align: center;
          color: white;
          background: linear-gradient(135deg,#1746d2,#2563eb 50%,#06b6d4);
        }

        .contact-cta-icon {
          width: 58px;
          height: 58px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
          background: rgba(255,255,255,.11);
          border: 1px solid rgba(255,255,255,.18);
          backdrop-filter: blur(16px);
        }

        .contact-cta h2 {
          margin-top: 19px;
          font-size: clamp(2rem,5vw,3.5rem);
          font-weight: 900;
          line-height: 1.05;
        }

        .contact-cta > p {
          max-width: 600px;
          margin: 15px auto 0;
          color: rgba(255,255,255,.82);
          font-size: 14px;
          line-height: 1.8;
        }

        .contact-cta-buttons {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 24px;
        }

        .contact-cta-primary,
        .contact-cta-secondary {
          min-height: 49px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 18px;
          border-radius: 15px;
          text-decoration: none;
          font-size: 12px;
          font-weight: 850;
        }

        .contact-cta-primary {
          color: #2563eb;
          background: white;
          box-shadow: 0 15px 35px rgba(0,0,0,.17);
        }

        .contact-cta-secondary {
          color: white;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.20);
          backdrop-filter: blur(14px);
        }

        .cta-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(45px);
          pointer-events: none;
        }

        .cta-orb-one {
          width: 270px;
          height: 270px;
          left: -90px;
          bottom: -130px;
          background: rgba(103,232,249,.15);
        }

        .cta-orb-two {
          width: 270px;
          height: 270px;
          right: -100px;
          top: -120px;
          background: rgba(255,255,255,.10);
        }

        .contact-footer {
          padding: 46px 0 25px;
          background: linear-gradient(180deg,#05070d,#03050a);
          color: white;
        }

        .contact-footer-inner {
          text-align: center;
        }

        .contact-footer-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-align: left;
        }

        .contact-footer-logo {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          color: #67e8f9;
          background: rgba(103,232,249,.08);
        }

        .contact-footer-brand h2 {
          color: #67e8f9;
          font-size: 20px;
          font-weight: 900;
        }

        .contact-footer-brand span {
          display: block;
          margin-top: 2px;
          color: #64748b;
          font-size: 9px;
          letter-spacing: .15em;
          text-transform: uppercase;
        }

        .contact-footer-inner > p {
          max-width: 600px;
          margin: 17px auto 0;
          color: #94a3b8;
          font-size: 11px;
          line-height: 1.8;
        }

        .contact-footer-links {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 21px;
        }

        .contact-footer-links a {
          color: #64748b;
          font-size: 11px;
          text-decoration: none;
          transition: color .25s ease;
        }

        .contact-footer-links a:hover,
        .contact-footer-links a.active {
          color: #60a5fa;
        }

        .contact-footer-copy {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,.06);
          color: #475569;
          font-size: 10px;
        }

        .premium-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-backdrop-blur {
          position: absolute;
          inset: 0;
          background: rgba(5,7,13,.75);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .premium-success-modal {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 420px;
          padding: 32px;
          border-radius: 28px;
          background: linear-gradient(145deg,#0f172a,#0b1120);
          border: 1px solid rgba(103,232,249,.25);
          box-shadow:
            0 25px 60px rgba(0,0,0,.5),
            0 0 40px rgba(37,99,235,.2);
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
          background: rgba(37,99,235,.35);
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
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.12);
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all .2s ease;
        }

        .modal-close-btn:hover {
          background: rgba(255,255,255,.15);
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
          background: linear-gradient(
            135deg,
            rgba(37,99,235,.2),
            rgba(6,182,212,.2)
          );
          border: 1px solid rgba(103,232,249,.3);
        }

        .success-badge-icon {
          color: #22d3ee;
        }

        .sparkle-float-1 {
          position: absolute;
          top: -6px;
          right: -6px;
          color: #38bdf8;
          animation: bounceSparkle 2s ease-in-out infinite;
        }

        @keyframes bounceSparkle {
          0%,100% {
            transform: translateY(0) scale(1);
          }

          50% {
            transform: translateY(-4px) scale(1.15);
          }
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
          background: rgba(34,211,238,.1);
          border: 1px solid rgba(34,211,238,.25);
          color: #22d3ee;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .05em;
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
          background: linear-gradient(135deg,#2563eb,#0891b2);
          color: white;
          font-size: 12px;
          font-weight: 850;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(37,99,235,.3);
        }

        @media (max-width: 950px) {
          .contact-columns {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {

          .contact-container {
            padding-left: 15px;
            padding-right: 15px;
          }

          .contact-hero {
            padding: 75px 0 82px;
          }

          .contact-title {
            font-size: 3rem;
          }

          .contact-hero-text {
            font-size: 13px;
          }

          .contact-pills {
            flex-direction: column;
            align-items: stretch;
          }

          .contact-pills span {
            justify-content: center;
          }

          .contact-main {
            padding: 72px 0;
          }

          .contact-info-card,
          .contact-form-card {
            padding: 22px;
            border-radius: 24px;
          }

          .contact-form-grid {
            grid-template-columns: 1fr;
          }

          .contact-map-card {
            padding: 16px;
            border-radius: 23px;
          }

          .contact-map-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .contact-map-header h2 {
            font-size: 21px;
          }

          .contact-map-btn {
            width: 100%;
            justify-content: center;
          }

          .contact-map {
            height: 300px;
          }

          .contact-cta {
            padding: 68px 15px;
          }

          .contact-cta h2 {
            font-size: 2.15rem;
          }

          .contact-cta > p {
            font-size: 13px;
          }

          .contact-cta-buttons {
            flex-direction: column;
          }

          .contact-cta-primary,
          .contact-cta-secondary {
            width: 100%;
          }

          .premium-success-modal {
            max-width: calc(100vw - 28px);
            padding: 27px 20px 22px;
            border-radius: 24px;
          }

          .success-icon-wrapper {
            width: 68px;
            height: 68px;
            border-radius: 21px;
          }

          .modal-content-text h3 {
            font-size: 20px;
          }

          .modal-content-text p {
            font-size: 11px;
          }

          .modal-pill-tag {
            max-width: 100%;
            font-size: 8px;
            padding: 5px 9px;
          }
        }

        @media (max-width: 390px) {

          .contact-container {
            padding-left: 12px;
            padding-right: 12px;
          }

          .contact-title {
            font-size: 2.65rem;
          }

          .contact-info-card,
          .contact-form-card {
            padding: 19px;
          }

          .contact-map {
            height: 270px;
          }

          .contact-cta h2 {
            font-size: 1.95rem;
          }

          .premium-modal-overlay {
            padding: 12px;
          }

          .premium-success-modal {
            max-width: calc(100vw - 24px);
            padding: 24px 16px 18px;
          }

          .modal-close-btn {
            top: 13px;
            right: 13px;
          }

          .modal-content-text h3 {
            font-size: 18px;
          }

          .modal-content-text p {
            font-size: 10.5px;
          }

          .modal-action-btn {
            min-height: 45px;
          }
        }

        @media (max-width: 320px) {

          .contact-title {
            font-size: 2.35rem;
          }

          .contact-info-card,
          .contact-form-card {
            padding: 16px;
          }

          .contact-form-top h2 {
            font-size: 24px;
          }

          .contact-map {
            height: 240px;
          }

          .premium-success-modal {
            padding-left: 13px;
            padding-right: 13px;
          }
        }

        @media (prefers-reduced-motion: reduce) {

          *,
          *::before,
          *::after {
            animation-duration: .01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: .01ms !important;
          }

        }

      `}</style>

    </div>
  );
}