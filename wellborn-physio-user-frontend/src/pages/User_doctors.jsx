import React, { useEffect, useState } from "react";
import { API, getData } from "../services/api";
import { motion } from "framer-motion";

import {
  ArrowRight,
  Award,
  HeartPulse,
  Activity,
  Brain,
  Dumbbell,
  Stethoscope,
  CheckCircle2,
  Star,
  ChevronRight,
  Clock3,
  CalendarDays,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

/* =====================================================
   API BASE URL
===================================================== */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  `http://${window.location.hostname}:8080`;

/* =====================================================
   IMAGE HELPER
===================================================== */

const DEFAULT_DOCTOR_IMAGE = "/assets/wellborn physio.jpg";

function getDoctorImage(image) {
  if (!image) {
    return DEFAULT_DOCTOR_IMAGE;
  }

  const imageValue = String(image).trim();

  if (!imageValue) {
    return DEFAULT_DOCTOR_IMAGE;
  }

  if (
    imageValue.startsWith("http://") ||
    imageValue.startsWith("https://") ||
    imageValue.startsWith("data:image/")
  ) {
    return imageValue;
  }

  if (imageValue.startsWith("/assets/")) {
    return imageValue;
  }

  if (imageValue.startsWith("/images/")) {
    return imageValue;
  }

  if (imageValue.startsWith("/")) {
    return `${API_BASE_URL}${imageValue}`;
  }

  return `${API_BASE_URL}/${imageValue.replace(/^\/+/, "")}`;
}

/* =====================================================
   EXPERIENCE HELPER
===================================================== */

const isFresherExperience = (experience) => {
  const expStr = String(experience ?? "").trim().toLowerCase();
  return (
    expStr === "" ||
    expStr === "fresher" ||
    expStr === "null" ||
    expStr === "undefined"
  );
};

/* =====================================================
   ANIMATION VARIANTS
===================================================== */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 55,
    filter: "blur(10px)",
  },

  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",

    transition: {
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeLeft = {
  hidden: {
    opacity: 0,
    x: -70,
    filter: "blur(10px)",
  },

  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",

    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeRight = {
  hidden: {
    opacity: 0,
    x: 70,
    filter: "blur(10px)",
  },

  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",

    transition: {
      duration: 0.9,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const scaleIn = {
  hidden: {
    opacity: 0,
    scale: 0.86,
    filter: "blur(8px)",
  },

  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",

    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const staggerContainer = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.13,
    },
  },
};

/* =====================================================
   FEATURES
===================================================== */

const features = [
  "Personalized treatment plans",
  "Experienced physiotherapy professionals",
  "Modern rehabilitation techniques",
  "Patient-focused recovery programs",
  "Regular progress monitoring",
  "Long-term movement and wellness guidance",
];

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({
  number,
  label,
  delay = 0,
}) {
  return (
    <motion.div
      variants={scaleIn}
      transition={{
        delay,
      }}
      whileHover={{
        y: -7,
        scale: 1.035,
      }}
      className="doctor-stat-card"
    >
      <motion.div
        animate={{
          y: [0, -5, 0],
          rotate: [0, -2, 2, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
        className="doctor-stat-icon"
      >
        <HeartPulse size={20} />
      </motion.div>

      <strong>{number}</strong>

      <span>{label}</span>
    </motion.div>
  );
}

/* =====================================================
   DOCTOR CARD (COMPACT ELITE WITH CENTERED HEAD)
===================================================== */

function DoctorCard({
  doctor,
  index,
}) {
  const imageUrl = getDoctorImage(
    doctor.image
  );

  const fresher = isFresherExperience(
    doctor.experience
  );

  return (
    <motion.article
      variants={fadeUp}
      whileHover={{
        y: -10,
        scale: 1.015,
      }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="doctor-card-compact-elite"
    >
      {/* AMBIENT GLOW BACKDROP */}
      <div className="doctor-compact-glow" />

      {/* COMPACT IMAGE WRAPPER (HEAD CENTERED FIX) */}
      <div className="doctor-compact-image-wrap">
        <motion.img
          src={imageUrl}
          alt={doctor.name || "Doctor"}
          className="doctor-compact-image"
          whileHover={{
            scale: 1.06,
          }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          onError={(event) => {
            const img = event.currentTarget;

            if (
              img.dataset.fallback ===
              "true"
            ) {
              return;
            }

            img.dataset.fallback =
              "true";

            img.src =
              DEFAULT_DOCTOR_IMAGE;
          }}
        />

        <div className="doctor-compact-gradient" />

        {/* EXPERIENCE BADGE (Hidden if fresher/empty) */}
        {!fresher && (
          <motion.div
            initial={{
              opacity: 0,
              y: -12,
              x: -12,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
              x: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: 0.2 + index * 0.08,
              duration: 0.5,
            }}
            className="doctor-compact-exp-badge"
          >
            <Sparkles size={12} className="doctor-exp-sparkle" />
            <span>{doctor.experience}</span>
          </motion.div>
        )}

        {/* VERIFIED EXPERT BADGE */}
        <div className="doctor-compact-verified-badge">
          <Star size={12} fill="currentColor" />
          <span>Verified</span>
        </div>
      </div>

      {/* COMPACT RICH DETAILS BODY */}
      <div className="doctor-compact-content">
        <div className="doctor-compact-top-row">
          <span className="doctor-compact-role-pill">
            {doctor.role || "Physiotherapist"}
          </span>
          <span className="doctor-compact-status-dot" title="Active Specialist" />
        </div>

        <h3 className="doctor-compact-name">
          {doctor.name || "Doctor"}
        </h3>

        {/* MULTI-DECORATED FROSTED DETAIL BOX */}
        <div className="doctor-compact-details-box">
          <p className="doctor-compact-desc">
            {doctor.description}
          </p>

          <div className="doctor-compact-tags">
            {(doctor.tags || []).map((tag, tagIndex) => (
              <span key={`${tag}-${tagIndex}`}>
                {tag}
              </span>
            ))}
          </div>

          <div className="doctor-compact-qual-row">
            <div className="doctor-compact-qual-icon">
              <ShieldCheck size={14} />
            </div>
            <span>
              {doctor.qualification || "Professional Qualification"}
            </span>
          </div>
        </div>

        <motion.a
          href="/user/appointment"
          whileHover={{
            scale: 1.02,
            y: -1,
          }}
          whileTap={{
            scale: 0.97,
          }}
          className="doctor-compact-button"
        >
          <span>Book Consultation</span>
          <motion.div
            animate={{
              x: [0, 4, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="doctor-btn-icon-wrap"
          >
            <ArrowRight size={15} />
          </motion.div>
        </motion.a>
      </div>
    </motion.article>
  );
}

/* =====================================================
   PAGE
===================================================== */

export default function User_doctors() {
  const [doctors, setDoctors] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  /* ===================================================
     GET DOCTORS
  =================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadDoctors() {
      try {
        setLoading(true);

        const data =
          await getData(
            API.DOCTOR_GET_ALL
          );

        console.log(
          "Doctors API Response:",
          data
        );

        if (!mounted) {
          return;
        }

        const doctorList =
          Array.isArray(data)
            ? data
            : Array.isArray(
                data?.data
              )
            ? data.data
            : Array.isArray(
                data?.doctors
              )
            ? data.doctors
            : [];

        const activeDoctors =
          doctorList.filter(
            (doctor) =>
              doctor?.status !==
              false
          );

        setDoctors(
          activeDoctors
        );
      } catch (error) {
        console.error(
          "Unable to load doctors:",
          error
        );

        if (mounted) {
          setDoctors([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadDoctors();

    return () => {
      mounted = false;
    };
  }, []);

  /* ===================================================
     CONVERT API DATA
  ================================================== */

  const doctorCards =
    doctors.map((d, index) => ({
      id:
        d.doctorId ??
        d.id ??
        index,

      name:
        d.doctorName ||
        d.name ||
        "Doctor",

      role:
        d.specialization ||
        "Physiotherapist",

      qualification:
        d.qualification ||
        "Professional Qualification",

      experience:
        d.experience ||
        "",

      image:
        d.image ||
        d.imageUrl ||
        d.photo ||
        d.profileImage ||
        '',

      description: isFresherExperience(d.experience)
        ? `${
            d.specialization ||
            "Physiotherapy"
          } with dedicated clinical expertise and patient care.`
        : `${
            d.specialization ||
            "Physiotherapy"
          } with ${
            d.experience
          } of professional clinical experience.`,
      
      tags: [
        d.specialization ||
          "Physiotherapy",
      ],
    }));

  /* =====================================================
     SPECIALTIES
  ===================================================== */

  const specialties = [
    {
      icon: Activity,
      title: "Orthopedic Care",
      text:
        "Joint, muscle and bone rehabilitation with personalized treatment plans.",
    },

    {
      icon: Dumbbell,
      title: "Sports Recovery",
      text:
        "Evidence-based rehabilitation for athletes and sports-related injuries.",
    },

    {
      icon: Brain,
      title: "Neurological Rehab",
      text:
        "Specialized movement and functional rehabilitation programs.",
    },

    {
      icon: HeartPulse,
      title: "Pain Management",
      text:
        "Individualized therapy focused on reducing pain and improving mobility.",
    },
  ];

  /* =====================================================
     STATS
  ===================================================== */

  const stats = [
    {
      number: "8+",
      label: "Years Experience",
    },

    {
      number: "1000+",
      label: "Patients Helped",
    },

    {
      number: "20+",
      label: "Treatment Programs",
    },

    {
      number: "100%",
      label: "Patient Focus",
    },
  ];

  return (
    <div className="doctor-ios-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="doctor-ios-hero">
        <div className="doctor-hero-orb doctor-hero-orb-1" />
        <div className="doctor-hero-orb doctor-hero-orb-2" />
        <div className="doctor-hero-orb doctor-hero-orb-3" />

        <div className="doctor-grid-overlay" />

        <div className="doctor-ios-container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="doctor-hero-inner"
          >

            <motion.div
              variants={fadeUp}
              className="doctor-hero-chip"
            >
              <span>
                <Stethoscope size={15} />
              </span>

              Meet Our Specialists
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="doctor-hero-title"
            >
              Experts Behind Your

              <motion.span
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                Better Movement
              </motion.span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="doctor-hero-description"
            >
              Our experienced
              physiotherapists combine
              clinical expertise,
              personalized care and
              modern rehabilitation
              techniques to help you
              move better and live
              better.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="doctor-hero-actions"
            >
              <motion.a
                href="/user/appointment"
                whileHover={{
                  scale: 1.05,
                  y: -4,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                className="doctor-primary-button"
              >
                Book Consultation

                <motion.span
                  animate={{
                    x: [0, 5, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  <ArrowRight size={17} />
                </motion.span>
              </motion.a>

              <motion.a
                href="#our-team"
                whileHover={{
                  scale: 1.03,
                  y: -2,
                }}
                className="doctor-secondary-button"
              >
                Meet Our Team

                <ChevronRight size={17} />
              </motion.a>
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* =================================================
          STATS
      ================================================= */}

      <section className="doctor-stats-wrap">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.25,
          }}
          variants={staggerContainer}
          className="doctor-stats-panel"
        >
          {stats.map(
            (stat, index) => (
              <StatCard
                key={stat.label}
                number={stat.number}
                label={stat.label}
                delay={index * 0.1}
              />
            )
          )}
        </motion.div>
      </section>

      {/* =================================================
          OUR TEAM
      ================================================= */}

      <section
        id="our-team"
        className="doctor-team-section"
      >
        <div className="doctor-ios-container">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            variants={staggerContainer}
            className="doctor-section-heading"
          >
            <motion.div
              variants={fadeUp}
              className="doctor-section-label"
            >
              Our Medical Team
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="doctor-section-title"
            >
              Meet The People{" "}
              <span>Who Care</span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="doctor-section-subtitle"
            >
              Skilled professionals
              dedicated to helping
              every patient achieve
              a stronger, healthier
              and more confident
              recovery journey.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.08,
            }}
            variants={staggerContainer}
            className="doctor-grid"
          >
            {loading ? (
              <div className="doctor-loading">
                <div className="doctor-loading-spinner" />

                <p>
                  Loading doctors...
                </p>
              </div>
            ) : doctorCards.length > 0 ? (
              doctorCards.map(
                (
                  doctor,
                  index
                ) => (
                  <DoctorCard
                    key={
                      doctor.id ||
                      doctor.name
                    }
                    doctor={doctor}
                    index={index}
                  />
                )
              )
            ) : (
              <div className="doctor-empty">
                <Stethoscope size={36} />

                <h3>
                  No doctors available
                </h3>

                <p>
                  Doctor information
                  will appear here once
                  it is added.
                </p>
              </div>
            )}
          </motion.div>

        </div>
      </section>

      {/* =================================================
          SPECIALIZATION
      ================================================= */}

      <section className="doctor-specialties-section">
        <div className="doctor-ios-container">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            variants={fadeLeft}
            className="doctor-specialty-heading"
          >
            <div className="doctor-section-label">
              Clinical Expertise
            </div>

            <h2 className="doctor-section-title">
              Specialized Care For{" "}
              <span>
                Every Recovery
              </span>
            </h2>

            <p className="doctor-specialty-intro">
              Focused rehabilitation
              programs designed
              around your condition,
              movement and long-term
              recovery goals.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.12,
            }}
            variants={staggerContainer}
            className="doctor-specialty-grid"
          >
            {specialties.map(
              (item) => {
                const Icon =
                  item.icon;

                return (
                  <motion.div
                    key={item.title}
                    variants={scaleIn}
                    whileHover={{
                      y: -10,
                      scale: 1.02,
                    }}
                    className="doctor-specialty-card"
                  >
                    <motion.div
                      whileHover={{
                        rotate: -8,
                        scale: 1.1,
                      }}
                      className="doctor-specialty-icon"
                    >
                      <Icon
                        size={26}
                      />
                    </motion.div>

                    <h3>
                      {item.title}
                    </h3>

                    <p>
                      {item.text}
                    </p>

                    <div className="doctor-learn-more">
                      Learn more

                      <motion.span
                        whileHover={{
                          x: 5,
                        }}
                      >
                        <ArrowRight
                          size={15}
                        />
                      </motion.span>
                    </div>
                  </motion.div>
                );
              }
            )}
          </motion.div>

        </div>
      </section>

      {/* =================================================
          WHY WELLBORN
      ================================================= */}

      <section className="doctor-why-section">
        <div className="doctor-ios-container">

          <div className="doctor-why-grid">

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.2,
              }}
              variants={fadeLeft}
              className="doctor-why-content"
            >

              <div className="doctor-section-label">
                Why Wellborn
              </div>

              <h2 className="doctor-section-title">
                Care That Goes Beyond
                <span>
                  The Treatment Room
                </span>
              </h2>

              <p className="doctor-why-description">
                We believe recovery is not only about
                treating symptoms. Our physiotherapists
                focus on understanding your needs and
                creating a treatment journey around your
                goals.
              </p>

              <div className="doctor-feature-list">

                {features.map(
                  (item, index) => (
                    <motion.div
                      key={item}
                      initial={{
                        opacity: 0,
                        x: -30,
                      }}
                      whileInView={{
                        opacity: 1,
                        x: 0,
                      }}
                      viewport={{
                        once: true,
                      }}
                      transition={{
                        delay:
                          index * 0.1,
                      }}
                      className="doctor-feature-item"
                    >
                      <span>
                        <CheckCircle2 size={17} />
                      </span>

                      {item}
                    </motion.div>
                  )
                )}

              </div>

            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.2,
              }}
              variants={fadeRight}
              className="doctor-recovery-card"
            >

              <motion.div
                animate={{
                  y: [0, -7, 0],
                  rotate: [0, -4, 0],
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="doctor-recovery-icon"
              >
                <HeartPulse size={28} />
              </motion.div>

              <h3>
                Your Recovery Matters
              </h3>

              <p>
                From your first consultation to your final
                recovery milestone, our team is here to
                guide and support you at every step.
              </p>

              <div className="doctor-consult-card">

                <Clock3
                  size={21}
                  className="doctor-consult-icon"
                />

                <div>
                  <strong>
                    Flexible Consultation
                  </strong>

                  <span>
                    Schedule your appointment with our team.
                  </span>
                </div>

              </div>

              <motion.a
                href="/user/appointment"
                whileHover={{
                  scale: 1.03,
                  y: -2,
                }}
                whileTap={{
                  scale: 0.97,
                }}
                className="doctor-schedule-button"
              >
                Schedule Appointment
                <ArrowRight size={17} />
              </motion.a>

            </motion.div>

          </div>

        </div>
      </section>

      {/* =================================================
          CTA
      ================================================= */}

      <section className="doctor-cta-section">

        <div className="doctor-cta-orb doctor-cta-orb-1" />
        <div className="doctor-cta-orb doctor-cta-orb-2" />

        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
          className="doctor-cta-ring"
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
            amount: 0.25,
          }}
          variants={staggerContainer}
          className="doctor-cta-content"
        >

          <motion.div
            variants={fadeUp}
            className="doctor-cta-icon"
          >
            <CalendarDays size={29} />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="doctor-cta-title"
          >
            Ready To Start Your Recovery?
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="doctor-cta-text"
          >
            Take the first step toward better movement,
            reduced pain and a healthier lifestyle.
          </motion.p>

          <motion.a
            variants={fadeUp}
            href="/user/appointment"
            whileHover={{
              scale: 1.06,
              y: -4,
            }}
            whileTap={{
              scale: 0.97,
            }}
            className="doctor-cta-button"
          >
            Book Your Appointment
            <ArrowRight size={17} />
          </motion.a>

        </motion.div>

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="doctor-footer">
        <div className="doctor-ios-container">

          <div className="doctor-footer-grid">

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
              }}
              variants={fadeLeft}
            >

              <div className="doctor-footer-brand">

                <div className="doctor-footer-logo">
                  <HeartPulse size={22} />
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

              <p className="doctor-footer-description">
                Professional physiotherapy and
                rehabilitation care focused on helping
                you move better and live healthier.
              </p>

            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
              }}
              variants={fadeUp}
            >

              <h3>
                Quick Links
              </h3>

              <div className="doctor-footer-links">
                <a href="/user/home">
                  Home
                </a>

                <a href="/user/about">
                  About
                </a>

                <a href="/user/services">
                  Services
                </a>

                <a
                  href="/user/doctors"
                  className="active"
                >
                  Doctors
                </a>

                <a href="/user/contact">
                  Contact
                </a>
              </div>

            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
              }}
              variants={fadeRight}
            >

              <h3>
                Contact Us
              </h3>

              <div className="doctor-footer-contact">

                <a
                  href="https://www.google.com/maps/search/?api=1&query=Karayanchavadi%2C%20Poonamallee%2C%20Chennai"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin size={17} />

                  <span>
                    Karayanchavadi, Poonamallee, Chennai
                  </span>
                </a>

                <a href="tel:+919342752147">
                  <Phone size={17} />

                  <span>
                    +91 93427 52147
                  </span>
                </a>

                <a href="mailto:wellbornphysio@gmail.com">
                  <Mail size={17} />

                  <span>
                    wellbornphysio@gmail.com
                  </span>
                </a>

                <a
                  href="https://www.instagram.com/arun_prasath_._._/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      width="20"
                      height="20"
                      x="2"
                      y="2"
                      rx="5"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                    />

                    <circle
                      cx="17.5"
                      cy="6.5"
                      r="1"
                      fill="currentColor"
                      stroke="none"
                    />
                  </svg>

                  arun_prasath_._._
                </a>

              </div>

            </motion.div>

          </div>

          <div className="doctor-footer-bottom">
            © {new Date().getFullYear()} Wellborn Physio Rehab &
            Centre. All Rights Reserved.
          </div>

        </div>
      </footer>

      {/* =================================================
          STYLES
      ================================================= */}

      <style>{`

        /* =================================================
            BASE
        ================================================= */

        .doctor-ios-page {
          min-height: 100vh;
          width: 100%;
          overflow-x: clip;
          color: #111827;
          background: #f5f7fb;
        }

        .dark .doctor-ios-page {
          color: #f8fafc;
          background: #05070d;
        }

        .doctor-ios-container {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding-left: 22px;
          padding-right: 22px;
        }

        /* =================================================
            HERO
        ================================================= */

        .doctor-ios-hero {
          position: relative;
          overflow: hidden;

          padding:
            105px
            0
            110px;

          color: white;

          background:
            radial-gradient(
              circle at 15% 15%,
              rgba(255,255,255,.14),
              transparent 25%
            ),
            radial-gradient(
              circle at 85% 12%,
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

        .doctor-grid-overlay {
          position: absolute;
          inset: 0;

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

          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent
            );

          pointer-events: none;
        }

        .doctor-hero-inner {
          position: relative;
          z-index: 2;

          max-width: 900px;
          margin: 0 auto;

          text-align: center;
        }

        .doctor-hero-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          padding:
            8px
            12px;

          border-radius: 999px;

          background:
            rgba(255,255,255,.11);

          border:
            1px solid
            rgba(255,255,255,.22);

          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);

          box-shadow:
            inset 0 1px 0
            rgba(255,255,255,.22),
            0 12px 30px
            rgba(0,0,0,.12);

          font-size: 12px;
          font-weight: 800;
        }

        .doctor-hero-chip span {
          width: 25px;
          height: 25px;

          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          background:
            rgba(255,255,255,.16);
        }

        .doctor-hero-title {
          margin-top: 24px;

          font-size:
            clamp(
              3rem,
              6vw,
              5.4rem
            );

          line-height: .98;
          letter-spacing: -.06em;
          font-weight: 900;
        }

        .doctor-hero-title span {
          display: block;
          margin-top: 8px;

          color: transparent;

          background:
            linear-gradient(
              90deg,
              #ffffff,
              #c7f9ff
            );

          -webkit-background-clip: text;
          background-clip: text;
        }

        .doctor-hero-description {
          max-width: 720px;
          margin:
            25px auto
            0;

          color:
            rgba(255,255,255,.84);

          font-size: 16px;
          line-height: 1.8;
        }

        .doctor-hero-actions {
          margin-top: 30px;

          display: flex;
          justify-content: center;
          flex-wrap: wrap;

          gap: 11px;
        }

        .doctor-primary-button,
        .doctor-secondary-button {
          min-height: 51px;

          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          padding:
            0
            19px;

          border-radius: 16px;

          text-decoration: none;

          font-size: 13px;
          font-weight: 850;

          transition:
            transform .35s ease,
            box-shadow .35s ease,
            background .35s ease;
        }

        .doctor-primary-button {
          color: #1750d5;
          background: white;

          box-shadow:
            0 15px 40px
            rgba(0,0,0,.18);
        }

        .doctor-primary-button:hover {
          box-shadow:
            0 23px 55px
            rgba(0,0,0,.23);
        }

        .doctor-secondary-button {
          color: white;

          background:
            rgba(255,255,255,.09);

          border:
            1px solid
            rgba(255,255,255,.20);

          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
        }

        .doctor-secondary-button:hover {
          background:
            rgba(255,255,255,.15);
        }

        /* =================================================
            HERO ORBS
        ================================================= */

        .doctor-hero-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(2px);
        }

        .doctor-hero-orb-1 {
          width: 280px;
          height: 280px;

          left: -100px;
          top: -100px;

          background:
            rgba(255,255,255,.10);

          animation:
            doctorOrb1
            13s
            ease-in-out
            infinite;
        }

        .doctor-hero-orb-2 {
          width: 360px;
          height: 360px;

          right: -130px;
          bottom: -150px;

          background:
            rgba(103,232,249,.12);

          animation:
            doctorOrb2
            16s
            ease-in-out
            infinite;
        }

        .doctor-hero-orb-3 {
          width: 140px;
          height: 140px;

          left: 48%;
          top: 20%;

          background:
            rgba(255,255,255,.05);

          animation:
            doctorOrb3
            9s
            ease-in-out
            infinite;
        }

        @keyframes doctorOrb1 {
          0%,100% {
            transform:
              translate(0,0)
              scale(1);
          }

          50% {
            transform:
              translate(50px,-35px)
              scale(1.12);
          }
        }

        @keyframes doctorOrb2 {
          0%,100% {
            transform:
              translate(0,0)
              scale(1);
          }

          50% {
            transform:
              translate(-45px,35px)
              scale(1.1);
          }
        }

        @keyframes doctorOrb3 {
          0%,100% {
            transform:
              translate(0,0)
              scale(1);
          }

          50% {
            transform:
              translate(40px,-25px)
              scale(1.13);
          }
        }

        /* =================================================
            STATS
        ================================================= */

        .doctor-stats-wrap {
          position: relative;
          z-index: 10;

          margin-top: -42px;

          padding:
            0
            22px;
        }

        .doctor-stats-panel {
          max-width: 1050px;
          margin: 0 auto;

          display: grid;

          grid-template-columns:
            repeat(4,minmax(0,1fr));

          gap: 1px;

          overflow: hidden;

          border-radius: 28px;

          background:
            rgba(255,255,255,.72);

          border:
            1px solid
            rgba(255,255,255,.90);

          box-shadow:
            0 22px 65px
            rgba(15,23,42,.10);

          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
        }

        .dark .doctor-stats-panel {
          background:
            rgba(15,23,42,.90);

          border-color:
            rgba(71,85,105,.55);

          box-shadow:
            0 22px 70px
            rgba(0,0,0,.28);
        }

        .doctor-stat-card {
          min-height: 135px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          padding: 20px 10px;

          text-align: center;

          background:
            rgba(255,255,255,.68);

          transition:
            transform .45s ease,
            background .45s ease;
        }

        .dark .doctor-stat-card {
          background:
            rgba(15,23,42,.80);
        }

        .doctor-stat-card:hover {
          background:
            rgba(255,255,255,.92);
        }

        .dark .doctor-stat-card:hover {
          background:
            rgba(30,41,59,.92);
        }

        .doctor-stat-icon {
          width: 40px;
          height: 40px;

          border-radius: 14px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #2563eb;
          background: #eef4ff;
        }

        .dark .doctor-stat-icon {
          color: #60a5fa;
          background:
            rgba(37,99,235,.14);
        }

        .doctor-stat-card strong {
          margin-top: 9px;

          font-size:
            clamp(
              1.8rem,
              3.2vw,
              2.7rem
            );

          line-height: 1;
          font-weight: 900;

          color: #111827;
        }

        .dark .doctor-stat-card strong {
          color: white;
        }

        .doctor-stat-card > span {
          margin-top: 6px;

          color: #64748b;

          font-size: 11px;
        }

        .dark .doctor-stat-card > span {
          color: #94a3b8;
        }

        /* =================================================
            TEAM
        ================================================= */

        .doctor-team-section {
          padding:
            110px
            0
            105px;

          background:
            linear-gradient(
              180deg,
              #f7f9fc,
              #ffffff
            );
        }

        .dark .doctor-team-section {
          background:
            linear-gradient(
              180deg,
              #05070d,
              #08111d
            );
        }

        .doctor-section-heading {
          max-width: 760px;
          margin: 0 auto 45px;

          text-align: center;
        }

        .doctor-section-label {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          color: #2563eb;

          font-size: 11px;
          font-weight: 850;

          letter-spacing: .16em;
          text-transform: uppercase;
        }

        .dark .doctor-section-label {
          color: #60a5fa;
        }

        .doctor-section-title {
          margin-top: 14px;

          color: #111827;

          font-size:
            clamp(
              2.25rem,
              4vw,
              3.6rem
            );

          line-height: 1.07;
          letter-spacing: -.045em;

          font-weight: 900;
        }

        .dark .doctor-section-title {
          color: white;
        }

        .doctor-section-title span {
          display: block;
          color: #2563eb;
        }

        .dark .doctor-section-title span {
          color: #60a5fa;
        }

        .doctor-section-subtitle {
          margin-top: 16px;

          max-width: 650px;
          margin-left: auto;
          margin-right: auto;

          color: #64748b;

          font-size: 14px;
          line-height: 1.8;
        }

        .dark .doctor-section-subtitle {
          color: #94a3b8;
        }

        .doctor-grid {
          display: grid;

          grid-template-columns:
            repeat(3,minmax(0,1fr));

          gap: 26px;
        }

        /* =================================================
            COMPACT ELITE DOCTOR CARD & HEAD-CENTERED IMAGE
        ================================================= */

        .doctor-card-compact-elite {
          position: relative;
          overflow: hidden;
          border-radius: 30px;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(255, 255, 255, 1);
          box-shadow: 
            0 24px 70px rgba(15, 23, 42, 0.1), 
            0 6px 18px rgba(37, 99, 235, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 1);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .dark .doctor-card-compact-elite {
          background: rgba(12, 18, 32, 0.88);
          border-color: rgba(51, 65, 85, 0.55);
          box-shadow: 
            0 28px 80px rgba(0, 0, 0, 0.45), 
            0 8px 24px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .doctor-card-compact-elite:hover {
          border-color: rgba(37, 99, 235, 0.55);
          box-shadow: 
            0 35px 100px rgba(37, 99, 235, 0.18), 
            0 12px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.25);
        }

        .doctor-compact-glow {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 75%;
          height: 110px;
          background: linear-gradient(90deg, rgba(37,99,235,0.1), rgba(6,182,212,0.1));
          filter: blur(35px);
          pointer-events: none;
        }

        .doctor-compact-image-wrap {
          position: relative;
          height: 280px;
          overflow: hidden;
          background: #e2e8f0;
        }

        .dark .doctor-compact-image-wrap {
          background: #1e293b;
        }

        .doctor-compact-image {
          width: 100%;
          height: 100%;
          display: block;
          /* object-position: center top keeps the head/face centered and visible without cutting off */
          object-fit: cover;
          object-position: center 25%;
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .doctor-compact-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(0,0,0,0.05) 0%,
            transparent 45%,
            rgba(5, 7, 13, 0.82) 100%
          );
        }

        .doctor-compact-exp-badge {
          position: absolute;
          left: 14px;
          top: 14px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.95);
          color: #0f172a;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          font-size: 10.5px;
          font-weight: 850;
          border: 1px solid rgba(255, 255, 255, 1);
          z-index: 3;
        }

        .dark .doctor-compact-exp-badge {
          background: rgba(15, 23, 42, 0.9);
          color: #f8fafc;
          border-color: rgba(255, 255, 255, 0.15);
        }

        .doctor-exp-sparkle {
          color: #2563eb;
        }

        .dark .doctor-exp-sparkle {
          color: #60a5fa;
        }

        .doctor-compact-verified-badge {
          position: absolute;
          left: 14px;
          bottom: 14px;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #ffffff;
          font-size: 10.5px;
          font-weight: 800;
          text-shadow: 0 2px 6px rgba(0,0,0,0.6);
          z-index: 3;
        }

        .doctor-compact-verified-badge svg {
          color: #fbbf24;
        }

        .doctor-compact-content {
          padding: 22px;
        }

        .doctor-compact-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .doctor-compact-role-pill {
          display: inline-flex;
          padding: 5px 11px;
          border-radius: 999px;
          color: #2563eb;
          background: #eff6ff;
          font-size: 10.5px;
          font-weight: 850;
          letter-spacing: 0.02em;
          border: 1px solid rgba(37, 99, 235, 0.12);
        }

        .dark .doctor-compact-role-pill {
          color: #60a5fa;
          background: rgba(37, 99, 235, 0.15);
          border-color: rgba(96, 165, 250, 0.2);
        }

        .doctor-compact-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 10px #22c55e;
        }

        .doctor-compact-name {
          margin-top: 10px;
          color: #0f172a;
          font-size: 22px;
          line-height: 1.15;
          font-weight: 900;
          letter-spacing: -0.02em;
        }

        .dark .doctor-compact-name {
          color: #ffffff;
        }

        /* COMPACT FROSTED DETAILS PANEL WITH SHADOW */
        .doctor-compact-details-box {
          margin-top: 12px;
          padding: 14px;
          border-radius: 18px;
          background: rgba(248, 250, 252, 0.85);
          border: 1px solid rgba(226, 232, 240, 0.85);
          box-shadow: 
            inset 0 1px 4px rgba(0, 0, 0, 0.02), 
            0 6px 16px rgba(15, 23, 42, 0.035);
          backdrop-filter: blur(12px);
        }

        .dark .doctor-compact-details-box {
          background: rgba(25, 35, 52, 0.45);
          border-color: rgba(51, 65, 85, 0.55);
          box-shadow: 
            inset 0 1px 4px rgba(0, 0, 0, 0.12), 
            0 6px 16px rgba(0, 0, 0, 0.15);
        }

        .doctor-compact-desc {
          color: #475569;
          font-size: 12.5px;
          line-height: 1.65;
          font-weight: 500;
        }

        .dark .doctor-compact-desc {
          color: #94a3b8;
        }

        .doctor-compact-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 10px;
        }

        .doctor-compact-tags span {
          padding: 4px 10px;
          border-radius: 999px;
          color: #0284c7;
          background: #f0f9ff;
          font-size: 10px;
          font-weight: 800;
          border: 1px solid rgba(2, 132, 199, 0.08);
        }

        .dark .doctor-compact-tags span {
          color: #38bdf8;
          background: rgba(2, 132, 199, 0.12);
          border-color: rgba(56, 189, 248, 0.18);
        }

        .doctor-compact-qual-row {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid rgba(226, 232, 240, 0.85);
          color: #334155;
          font-size: 11px;
          font-weight: 750;
        }

        .dark .doctor-compact-qual-row {
          border-top-color: rgba(51, 65, 85, 0.6);
          color: #cbd5e1;
        }

        .doctor-compact-qual-icon {
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 8px;
          color: #16a34a;
          background: #ecfdf5;
          box-shadow: 0 3px 10px rgba(22, 163, 74, 0.15);
        }

        .dark .doctor-compact-qual-icon {
          background: rgba(22, 163, 74, 0.15);
          color: #4ade80;
        }

        .doctor-compact-button {
          margin-top: 16px;
          width: 100%;
          min-height: 46px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 14px;
          color: white;
          background: linear-gradient(
            135deg,
            #2563eb,
            #0891b2
          );
          text-decoration: none;
          font-size: 12.5px;
          font-weight: 850;
          box-shadow: 0 12px 30px rgba(37, 99, 235, 0.3);
          transition: box-shadow 0.3s ease, transform 0.3s ease;
        }

        .doctor-compact-button:hover {
          box-shadow: 0 16px 40px rgba(37, 99, 235, 0.4);
        }

        .doctor-btn-icon-wrap {
          display: inline-flex;
          align-items: center;
        }

        /* =================================================
            SPECIALTIES
        ================================================= */

        .doctor-specialties-section {
          padding:
            100px
            0;

          background:
            linear-gradient(
              180deg,
              #f1f4f8,
              #eaf2f8
            );
        }

        .dark .doctor-specialties-section {
          background:
            linear-gradient(
              180deg,
              #0a0f18,
              #0c1522
            );
        }

        .doctor-specialty-heading {
          max-width: 720px;
          margin-bottom: 42px;
        }

        .doctor-specialty-intro {
          margin-top: 16px;

          max-width: 620px;

          color: #64748b;

          font-size: 14px;
          line-height: 1.8;
        }

        .dark .doctor-specialty-intro {
          color: #94a3b8;
        }

        .doctor-specialty-grid {
          display: grid;

          grid-template-columns:
            repeat(4,minmax(0,1fr));

          gap: 16px;
        }

        .doctor-specialty-card {
          position: relative;

          min-height: 235px;

          padding: 24px;

          border-radius: 25px;

          background:
            rgba(255,255,255,.76);

          border:
            1px solid
            rgba(255,255,255,.93);

          box-shadow:
            0 18px 48px
            rgba(15,23,42,.06);

          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);

          transition:
            transform .5s
            cubic-bezier(.16,1,.3,1),
            box-shadow .5s ease;
        }

        .dark .doctor-specialty-card {
          background:
            rgba(15,23,42,.82);

          border-color:
            rgba(71,85,105,.55);

          box-shadow:
            0 20px 55px
            rgba(0,0,0,.24);
        }

        .doctor-specialty-card:hover {
          box-shadow:
            0 28px 68px
            rgba(15,23,42,.12);
        }

        .doctor-specialty-icon {
          width: 56px;
          height: 56px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 17px;

          color: #2563eb;
          background:
            #eef4ff;
        }

        .dark .doctor-specialty-icon {
          color: #60a5fa;
          background:
            rgba(37,99,235,.14);
        }

        .doctor-specialty-card h3 {
          margin-top: 18px;

          color: #111827;

          font-size: 18px;
          font-weight: 900;
        }

        .dark .doctor-specialty-card h3 {
          color: white;
        }

        .doctor-specialty-card p {
          margin-top: 10px;

          color: #64748b;

          font-size: 12px;
          line-height: 1.8;
        }

        .dark .doctor-specialty-card p {
          color: #cbd5e1;
        }

        .doctor-learn-more {
          display: inline-flex;
          align-items: center;
          gap: 6px;

          margin-top: 18px;

          color: #2563eb;

          font-size: 11px;
          font-weight: 850;
        }

        /* =================================================
            WHY
        ================================================= */

        .doctor-why-section {
          padding:
            105px
            0;

          background:
            #f8fafc;
        }

        .dark .doctor-why-section {
          background:
            #05070d;
        }

        .doctor-why-grid {
          display: grid;

          grid-template-columns:
            minmax(0,1fr)
            minmax(0,1fr);

          gap: 70px;

          align-items: center;
        }

        .doctor-why-description {
          margin-top: 18px;

          color: #64748b;

          font-size: 14px;
          line-height: 1.85;

          max-width: 590px;
        }

        .dark .doctor-why-description {
          color: #cbd5e1;
        }

        .doctor-feature-list {
          display: grid;

          gap: 8px;

          margin-top: 24px;
        }

        .doctor-feature-item {
          display: flex;
          align-items: center;

          gap: 10px;

          padding:
            9px
            11px;

          border-radius: 14px;

          color: #475569;

          background:
            rgba(255,255,255,.80);

          border:
            1px solid
            #e7edf4;

          font-size: 12px;
          font-weight: 650;

          transition:
            transform .35s ease,
            box-shadow .35s ease;
        }

        .dark .doctor-feature-item {
          color: #cbd5e1;

          background:
            rgba(15,23,42,.72);

          border-color:
            rgba(51,65,85,.75);
        }

        .doctor-feature-item:hover {
          transform:
            translateX(7px);

          box-shadow:
            0 12px 30px
            rgba(15,23,42,.07);
        }

        .doctor-feature-item span {
          width: 31px;
          height: 31px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 10px;

          color: #16a34a;
          background: #ecfdf5;
        }

        .dark .doctor-feature-item span {
          background:
            rgba(22,163,74,.10);
        }

        .doctor-recovery-card {
          position: relative;

          overflow: hidden;

          padding: 36px;

          border-radius: 30px;

          background:
            linear-gradient(
              145deg,
              rgba(255,255,255,.92),
              rgba(240,247,255,.86)
            );

          border:
            1px solid
            rgba(255,255,255,.90);

          box-shadow:
            0 25px 70px
            rgba(15,23,42,.09);

          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
        }

        .dark .doctor-recovery-card {
          background:
            linear-gradient(
              145deg,
              rgba(15,23,42,.94),
              rgba(20,31,48,.88)
            );

          border-color:
            rgba(71,85,105,.50);

          box-shadow:
            0 25px 70px
            rgba(0,0,0,.28);
        }

        .doctor-recovery-card::before {
          content: "";

          position: absolute;

          width: 220px;
          height: 220px;

          right: -100px;
          top: -90px;

          border-radius: 50%;

          background:
            rgba(103,232,249,.18);

          filter: blur(35px);
        }

        .doctor-recovery-icon {
          position: relative;
          z-index: 2;

          width: 57px;
          height: 57px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 18px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #0891b2
            );

          box-shadow:
            0 12px 28px
            rgba(37,99,235,.23);
        }

        .doctor-recovery-card h3 {
          position: relative;
          z-index: 2;

          margin-top: 20px;

          color: #111827;

          font-size: 27px;
          font-weight: 900;
        }

        .dark .doctor-recovery-card h3 {
          color: white;
        }

        .doctor-recovery-card > p {
          position: relative;
          z-index: 2;

          margin-top: 12px;

          color: #64748b;

          font-size: 13px;
          line-height: 1.8;
        }

        .dark .doctor-recovery-card > p {
          color: #cbd5e1;
        }

        .doctor-consult-card {
          position: relative;
          z-index: 2;

          margin-top: 22px;

          display: flex;
          align-items: center;

          gap: 11px;

          padding: 13px;

          border-radius: 16px;

          background:
            rgba(255,255,255,.86);

          border:
            1px solid
            #e7edf4;
        }

        .dark .doctor-consult-card {
          background:
            rgba(30,41,59,.76);

          border-color:
            rgba(51,65,85,.75);
        }

        .doctor-consult-icon {
          color: #2563eb;
          flex-shrink: 0;
        }

        .doctor-consult-card strong {
          display: block;

          color: #111827;

          font-size: 12px;
          font-weight: 850;
        }

        .dark .doctor-consult-card strong {
          color: white;
        }

        .doctor-consult-card span {
          display: block;

          margin-top: 3px;

          color: #64748b;

          font-size: 10px;
        }

        .dark .doctor-consult-card span {
          color: #94a3b8;
        }

        .doctor-schedule-button {
          position: relative;
          z-index: 2;

          margin-top: 18px;

          width: 100%;

          min-height: 50px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

          border-radius: 15px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #0891b2
            );

          text-decoration: none;

          font-size: 12px;
          font-weight: 850;
        }

        /* =================================================
            CTA
        ================================================= */

        .doctor-cta-section {
          position: relative;
          overflow: hidden;

          padding:
            85px
            22px;

          background:
            linear-gradient(
              135deg,
              #1746d2,
              #2563eb 50%,
              #06b6d4
            );

          color: white;
        }

        .doctor-cta-content {
          position: relative;
          z-index: 5;

          max-width: 820px;
          margin: 0 auto;

          text-align: center;
        }

        .doctor-cta-icon {
          width: 60px;
          height: 60px;

          margin: 0 auto;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 18px;

          background:
            rgba(255,255,255,.11);

          border:
            1px solid
            rgba(255,255,255,.20);

          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);

          animation:
            doctorCtaIcon
            3s
            ease-in-out
            infinite;
        }

        @keyframes doctorCtaIcon {
          0%,100% {
            transform:
              translateY(0)
              rotate(0);
          }

          50% {
            transform:
              translateY(-8px)
              rotate(7deg);
          }
        }

        .doctor-cta-title {
          margin-top: 20px;

          font-size:
            clamp(
              2.2rem,
              5vw,
              3.8rem
            );

          line-height: 1.05;
          letter-spacing: -.045em;

          font-weight: 900;
        }

        .doctor-cta-text {
          max-width: 640px;

          margin:
            17px
            auto
            0;

          color:
            rgba(255,255,255,.83);

          font-size: 14px;
          line-height: 1.8;
        }

        .doctor-cta-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

          margin-top: 24px;

          min-height: 51px;

          padding:
            0
            20px;

          border-radius: 16px;

          color: #2563eb;
          background: white;

          text-decoration: none;

          font-size: 13px;
          font-weight: 850;

          box-shadow:
            0 18px 45px
            rgba(0,0,0,.18);
        }

        .doctor-cta-orb {
          position: absolute;

          border-radius: 50%;

          pointer-events: none;

          filter: blur(50px);
        }

        .doctor-cta-orb-1 {
          width: 250px;
          height: 250px;

          left: -80px;
          bottom: -130px;

          background:
            rgba(103,232,249,.18);
        }

        .doctor-cta-orb-2 {
          width: 280px;
          height: 280px;

          right: -100px;
          top: -120px;

          background:
            rgba(255,255,255,.11);
        }

        .doctor-cta-ring {
          position: absolute;

          width: 420px;
          height: 420px;

          right: -180px;
          top: -220px;

          border-radius: 50%;

          border:
            1px solid
            rgba(255,255,255,.14);

          pointer-events: none;
        }

        /* =================================================
            FOOTER
        ================================================= */

        .doctor-footer {
          padding:
            55px
            0
            25px;

          background:
            linear-gradient(
              180deg,
              #05070d,
              #03050a
            );

          color: white;
        }

        .doctor-footer-grid {
          display: grid;

          grid-template-columns:
            repeat(3,minmax(0,1fr));

          gap: 50px;
        }

        .doctor-footer-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .doctor-footer-logo {
          width: 45px;
          height: 45px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 14px;

          color: #67e8f9;

          background:
            rgba(103,232,249,.08);

          border:
            1px solid
            rgba(103,232,249,.12);
        }

        .doctor-footer-brand h2 {
          color: #67e8f9;

          font-size: 20px;
          font-weight: 900;
        }

        .doctor-footer-brand span {
          display: block;

          margin-top: 2px;

          color: #64748b;

          font-size: 9px;

          letter-spacing: .15em;
          text-transform: uppercase;
        }

        .doctor-footer-description {
          max-width: 360px;

          margin-top: 18px;

          color: #94a3b8;

          font-size: 12px;
          line-height: 1.8;
        }

        .doctor-footer h3 {
          font-size: 16px;
          font-weight: 850;
        }

        .doctor-footer-links {
          display: grid;

          grid-template-columns:
            repeat(2,minmax(0,1fr));

          gap: 10px;

          margin-top: 18px;
        }

        .doctor-footer-links a {
          color: #94a3b8;

          font-size: 12px;

          text-decoration: none;

          transition:
            color .25s ease,
            transform .25s ease;
        }

        .doctor-footer-links a:hover,
        .doctor-footer-links a.active {
          color: #60a5fa;
        }

        .doctor-footer-contact {
          display: grid;

          gap: 12px;

          margin-top: 18px;
        }

        .doctor-footer-contact a {
          display: flex;
          align-items: flex-start;

          gap: 9px;

          color: #94a3b8;

          font-size: 12px;

          text-decoration: none;

          transition:
            color .25s ease,
            transform .25s ease;
        }

        .doctor-footer-contact a:hover {
          color: white;
        }

        .doctor-footer-contact svg {
          flex-shrink: 0;
        }

        .doctor-footer-contact a:nth-child(1) svg {
          color: #fb7185;
        }

        .doctor-footer-contact a:nth-child(2) svg {
          color: #4ade80;
        }

        .doctor-footer-contact a:nth-child(3) svg {
          color: #60a5fa;
        }

        .doctor-footer-bottom {
          margin-top: 42px;

          padding-top: 20px;

          border-top:
            1px solid
            rgba(255,255,255,.06);

          color: #475569;

          text-align: center;

          font-size: 10px;
        }

        /* =================================================
            LOADING
        ================================================= */

        .doctor-loading {
          grid-column: 1 / -1;

          min-height: 280px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          gap: 15px;

          color: #64748b;

          text-align: center;
        }

        .doctor-loading-spinner {
          width: 42px;
          height: 42px;

          border-radius: 50%;

          border:
            4px solid
            #dbeafe;

          border-top-color:
            #2563eb;

          animation:
            doctorSpinner
            .8s
            linear
            infinite;
        }

        @keyframes doctorSpinner {
          to {
            transform: rotate(360deg);
          }
        }

        .doctor-loading p {
          margin: 0;

          font-size: 13px;
          font-weight: 600;
        }

        /* =================================================
            EMPTY
        ================================================= */

        .doctor-empty {
          grid-column: 1 / -1;

          min-height: 280px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          padding: 40px;

          border-radius: 25px;

          color: #64748b;

          background:
            rgba(255,255,255,.75);

          border:
            1px solid
            #e5eaf0;

          text-align: center;
        }

        .dark .doctor-empty {
          color: #94a3b8;

          background:
            rgba(15,23,42,.75);

          border-color:
            rgba(71,85,105,.55);
        }

        .doctor-empty svg {
          color: #2563eb;
        }

        .doctor-empty h3 {
          margin-top: 14px;

          color: #111827;

          font-size: 20px;
          font-weight: 850;
        }

        .dark .doctor-empty h3 {
          color: white;
        }

        .doctor-empty p {
          margin-top: 7px;

          font-size: 12px;
        }

        /* =================================================
            TABLET
        ================================================= */

        @media (max-width: 1050px) {

          .doctor-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

          .doctor-specialty-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

          .doctor-specialty-card:last-child {
            grid-column:
              1 / -1;

            max-width: 50%;
            width: 100%;
            margin: 0 auto;
          }

          .doctor-why-grid {
            gap: 45px;
          }

          .doctor-footer-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

          .doctor-footer-grid > div:last-child {
            grid-column:
              1 / -1;
          }
        }

        /* =================================================
            MOBILE
        ================================================= */

        @media (max-width: 900px) {

          .doctor-ios-hero {
            padding:
              82px
              0
              95px;
          }

          .doctor-stats-wrap {
            margin-top: -34px;
          }

          .doctor-stats-panel {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

          .doctor-grid {
            grid-template-columns: 1fr;
          }

          .doctor-specialty-grid {
            grid-template-columns: 1fr;
          }

          .doctor-specialty-card:last-child {
            grid-column: auto;
            max-width: none;
          }

          .doctor-why-grid {
            grid-template-columns: 1fr;
            gap: 48px;
          }

          .doctor-footer-grid {
            grid-template-columns: 1fr;
            gap: 35px;
          }

          .doctor-footer-grid > div:last-child {
            grid-column: auto;
          }
        }

        /* =================================================
            SMALL MOBILE
        ================================================= */

        @media (max-width: 640px) {

          .doctor-ios-container {
            padding-left: 15px;
            padding-right: 15px;
          }

          .doctor-ios-hero {
            padding:
              75px
              0
              80px;
          }

          .doctor-hero-chip {
            font-size: 10px;
          }

          .doctor-hero-title {
            font-size: 3rem;
          }

          .doctor-hero-description {
            font-size: 13px;
            line-height: 1.75;
          }

          .doctor-hero-actions {
            flex-direction: column;
          }

          .doctor-primary-button,
          .doctor-secondary-button {
            width: 100%;
          }

          .doctor-stats-wrap {
            padding: 0 12px;
          }

          .doctor-stats-panel {
            border-radius: 22px;
          }

          .doctor-stat-card {
            min-height: 110px;
            padding: 15px 6px;
          }

          .doctor-stat-card strong {
            font-size: 1.8rem;
          }

          .doctor-stat-card > span {
            font-size: 9px;
          }

          .doctor-team-section,
          .doctor-specialties-section,
          .doctor-why-section {
            padding:
              75px
              0;
          }

          .doctor-section-title {
            font-size: 2.2rem;
          }

          .doctor-compact-image-wrap {
            height: 250px;
          }

          .doctor-compact-content {
            padding: 18px;
          }

          .doctor-compact-name {
            font-size: 20px;
          }

          .doctor-recovery-card {
            padding: 25px;
            border-radius: 24px;
          }

          .doctor-recovery-card h3 {
            font-size: 23px;
          }

          .doctor-cta-section {
            padding:
              70px
              15px;
          }

          .doctor-cta-title {
            font-size: 2.15rem;
          }

          .doctor-cta-text {
            font-size: 13px;
          }

          .doctor-footer {
            padding:
              42px
              0
              22px;
          }
        }

        /* =================================================
            SMALL IPHONE
        ================================================= */

        @media (max-width: 390px) {

          .doctor-ios-container {
            padding-left: 12px;
            padding-right: 12px;
          }

          .doctor-hero-title {
            font-size: 2.65rem;
          }

          .doctor-hero-description {
            font-size: 12px;
          }

          .doctor-compact-image-wrap {
            height: 230px;
          }

          .doctor-section-title {
            font-size: 2rem;
          }

          .doctor-specialty-card {
            padding: 21px;
          }

          .doctor-stat-card strong {
            font-size: 1.65rem;
          }

          .doctor-cta-title {
            font-size: 1.95rem;
          }
        }

        /* =================================================
            REDUCED MOTION
        ================================================= */

        @media (prefers-reduced-motion: reduce) {

          *,
          *::before,
          *::after {
            animation-duration:
              .01ms !important;

            animation-iteration-count:
              1 !important;

            transition-duration:
              .01ms !important;
          }
        }

      `}</style>

    </div>
  );
}