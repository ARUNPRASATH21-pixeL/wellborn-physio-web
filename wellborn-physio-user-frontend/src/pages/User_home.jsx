import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";



import {
  HeartPulse,
  Stethoscope,
  Award,
  ShieldCheck,
  CalendarCheck,
  Clock3,
  CheckCircle2,
  Phone,
  ArrowRight,
  Star,
  Users,
  Activity,
  MapPin,
  Mail,
} from "lucide-react";

/* =====================================================
   HERO IMAGES
===================================================== */

const heroImages = [
  "/images/ortho.jpeg",
  "/images/sport-rehab.jpg",
  "/images/pediatric.jpeg",
   "/images/leg-cable.jpg",
  "/images/ortho2.jpeg",
   "/images/pediatric2.jpg",
];

/* =====================================================
   ANIMATION VARIANTS
===================================================== */

const smoothEase = [0.22, 1, 0.36, 1];

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: smoothEase,
    },
  },
};

const fadeLeft = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.85,
      ease: smoothEase,
    },
  },
};

const fadeRight = {
  hidden: {
    opacity: 0,
    scale: 0.92,
    x: 40,
  },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: {
      duration: 0.9,
      ease: smoothEase,
    },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const cardVariant = {
  hidden: {
    opacity: 0,
    y: 35,
    scale: 0.96,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.7,
      ease: smoothEase,
    },
  },
};

/* =====================================================
   STAT CARD
===================================================== */

function StatCard({ icon: Icon, value, label }) {
  return (
    <motion.div
      variants={cardVariant}
      whileHover={{
        y: -7,
        scale: 1.025,
      }}
      whileTap={{
        scale: 0.98,
      }}
      className="ios-stat-card"
    >
      <motion.div
        whileHover={{
          rotate: 8,
          scale: 1.08,
        }}
        className="ios-stat-icon"
      >
        <Icon size={25} />
      </motion.div>

      <h3>{value}</h3>

      <p>{label}</p>
    </motion.div>
  );
}

/* =====================================================
   HOME
===================================================== */

export default function Home() {
  /* =====================================================
     HERO IMAGE STATE
  ===================================================== */

  const [activeHeroImage, setActiveHeroImage] = useState(0);

  /* =====================================================
     PAGE SETUP
  ===================================================== */

  useEffect(() => {
    document.title = "Home | Wellborn Physio";

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    return () => {
      document.title = "Wellborn Physio";
    };
  }, []);

  /* =====================================================
     HERO IMAGE AUTO SLIDER
     
     4.5 seconds per image
     Smooth crossfade
  ===================================================== */

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveHeroImage(
        (prev) => (prev + 1) % heroImages.length
      );
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="ios-home-page">

      {/* =================================================
          BACKGROUND GLOW
      ================================================= */}

      <motion.div
        className="ios-bg-glow ios-bg-glow-one"
        animate={{
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.06, 1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="ios-bg-glow ios-bg-glow-two"
        animate={{
          x: [0, -25, 0],
          y: [0, 25, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* =================================================
          HERO
      ================================================= */}

      <section className="ios-hero">

        <div className="ios-hero-orb ios-hero-orb-one" />
        <div className="ios-hero-orb ios-hero-orb-two" />

        <div className="ios-container">

          <div className="ios-hero-grid">

            {/* =================================================
                LEFT CONTENT
            ================================================= */}

            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="ios-hero-content"
            >

              <motion.div
                variants={fadeLeft}
                className="ios-eyebrow"
              >
                <motion.span
                  animate={{
                    scale: [1, 1.15, 1],
                  }}
                  transition={{
                    duration: 1.8,
                    repeat: Infinity,
                  }}
                >
                  <HeartPulse size={16} />
                </motion.span>

                Professional Physiotherapy Care
              </motion.div>

              <motion.h1
                variants={fadeLeft}
                className="ios-hero-title"
              >
                Move Better.
                <span>
                  Live Better.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeLeft}
                className="ios-hero-text"
              >
                At Wellborn Physio Rehab & Centre,
                we provide personalized
                physiotherapy and rehabilitation
                treatments designed to help you
                recover faster, move confidently
                and live pain free.
              </motion.p>

              {/* =================================================
                  BADGES
              ================================================= */}

              <motion.div
                variants={fadeLeft}
                className="ios-badge-row"
              >

                <span className="ios-glass-badge">
                  <Activity size={15} />
                  Modern Treatment
                </span>

                <span className="ios-glass-badge">
                  <ShieldCheck size={15} />
                  Trusted Care
                </span>

                <span className="ios-glass-badge">
                  <Users size={15} />
                  Patient Focused
                </span>

              </motion.div>

              {/* =================================================
                  BUTTONS
              ================================================= */}

              <motion.div
                variants={fadeUp}
                className="ios-button-row"
              >

                <motion.div
                  whileHover={{
                    scale: 1.03,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  className="ios-button-wrapper"
                >
                  <Link
                    to="/user/appointment"
                    className="ios-primary-button"
                  >
                    <CalendarCheck size={18} />

                    Book Appointment

                    <ArrowRight size={17} />
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{
                    scale: 1.03,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  className="ios-button-wrapper"
                >
                  <a
                    href="#services"
                    className="ios-secondary-button"
                  >
                    Our Services
                  </a>
                </motion.div>

              </motion.div>

            </motion.div>

            {/* =================================================
                RIGHT IMAGE
            ================================================= */}

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeRight}
              className="ios-hero-visual"
            >

              <div className="ios-image-glow" />

              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="ios-image-card"
              >

                {/* =================================================
                    SMOOTH 4 IMAGE SLIDER
                ================================================= */}

                <div className="ios-hero-image-slider">

                  {heroImages.map((image, index) => (
                    <motion.img
                      key={image}
                      src={image}
                      alt="Wellborn Physio"
                      className="ios-hero-slide-image"
                      initial={false}
                      animate={{
                        opacity:
                          activeHeroImage === index
                            ? 1
                            : 0,

                        scale:
                          activeHeroImage === index
                            ? 1
                            : 1.035,

                        filter:
                          activeHeroImage === index
                            ? "blur(0px)"
                            : "blur(4px)",
                      }}
                      transition={{
                        opacity: {
                          duration: 1.5,
                          ease: [0.4, 0, 0.2, 1],
                        },

                        scale: {
                          duration: 2,
                          ease: [0.22, 1, 0.36, 1],
                        },

                        filter: {
                          duration: 1.2,
                          ease: "easeInOut",
                        },
                      }}
                    />
                  ))}

                </div>

                <div className="ios-image-overlay" />

                {/* =================================================
                    TRUSTED CARD
                ================================================= */}

                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.6,
                    duration: 0.6,
                    ease: smoothEase,
                  }}
                  className="ios-trusted-card"
                >

                  <div className="ios-trusted-icon">
                    <CheckCircle2 size={20} />
                  </div>

                  <div>
                    <strong>
                      Trusted Care
                    </strong>

                    <span>
                      Your recovery matters
                    </span>
                  </div>

                </motion.div>

              </motion.div>

              {/* =================================================
                  FLOATING PILL
              ================================================= */}

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.5,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: [0, 12, 0],
                  rotate: [0, 3, 0],
                }}
                transition={{
                  opacity: {
                    delay: 0.5,
                    duration: 0.5,
                  },

                  scale: {
                    delay: 0.5,
                    duration: 0.5,
                  },

                  y: {
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },

                  rotate: {
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                }}
                className="ios-floating-pill"
              >

                <HeartPulse size={16} />

                <span>
                  Better Recovery
                </span>

              </motion.div>

            </motion.div>

          </div>

        </div>

      </section>

      {/* =================================================
          QUICK INFO
      ================================================= */}

      <section className="ios-floating-section">

        <div className="ios-container">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.15,
            }}
            variants={stagger}
            className="ios-quick-grid"
          >

            <motion.div
              variants={cardVariant}
              className="ios-quick-card"
            >
              <div className="ios-quick-icon">
                <CalendarCheck size={23} />
              </div>

              <div>
                <strong>
                  Easy Appointment
                </strong>

                <span>
                  Book your session easily
                </span>
              </div>
            </motion.div>

            <motion.div
              variants={cardVariant}
              className="ios-quick-card"
            >
              <div className="ios-quick-icon">
                <Clock3 size={23} />
              </div>

              <div>
                <strong>
                  Flexible Timings
                </strong>

                <span>
                  Convenient treatment hours
                </span>
              </div>
            </motion.div>

            <motion.div
              variants={cardVariant}
              className="ios-quick-card"
            >
              <div className="ios-quick-icon">
                <ShieldCheck size={23} />
              </div>

              <div>
                <strong>
                  Quality Care
                </strong>

                <span>
                  Patient-focused treatment
                </span>
              </div>
            </motion.div>

          </motion.div>

        </div>

      </section>

      {/* =================================================
          OUR CLINIC
      ================================================= */}

      <section className="ios-section">

        <div className="ios-container">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.15,
            }}
            variants={stagger}
            className="ios-two-column"
          >

            {/* IMAGE */}

            <motion.div
              variants={fadeLeft}
              className="ios-about-image-wrap"
            >

              <div className="ios-about-glow" />

              <motion.img
                src="/images/home.pic-2.png"
                alt="Wellborn Physio Clinic"
                whileHover={{
                  scale: 1.025,
                }}
                transition={{
                  duration: 0.45,
                }}
                className="ios-about-image"
              />

              <div className="ios-experience-card">
                <strong>
                  5+
                </strong>

                <span>
                  Years of Care
                </span>
              </div>

            </motion.div>

            {/* CONTENT */}

            <motion.div
              variants={fadeRight}
              className="ios-about-content"
            >

              <div className="ios-section-kicker">
                <HeartPulse size={16} />
                OUR CLINIC
              </div>

              <h2 className="ios-section-title">

                Quality Care At

                <span>
                  Wellborn Physio
                </span>

              </h2>

              <p className="ios-section-text">
                Wellborn Physio Rehab & Centre
                is a patient-focused physiotherapy
                clinic dedicated to helping people
                recover from pain, injuries and
                movement-related conditions.
              </p>

              <p className="ios-section-text">
                Our clinic combines modern
                physiotherapy techniques with
                personalized rehabilitation programs
                to support every patient's recovery
                journey.
              </p>

              <div className="ios-check-list">

                <motion.div
                  whileHover={{ x: 5 }}
                  className="ios-check-item"
                >
                  <CheckCircle2 size={20} />

                  <span>
                    Modern Physiotherapy Equipment
                  </span>
                </motion.div>

                <motion.div
                  whileHover={{ x: 5 }}
                  className="ios-check-item"
                >
                  <CheckCircle2 size={20} />

                  <span>
                    Experienced Physiotherapy Care
                  </span>
                </motion.div>

                <motion.div
                  whileHover={{ x: 5 }}
                  className="ios-check-item"
                >
                  <CheckCircle2 size={20} />

                  <span>
                    Patient-Friendly Environment
                  </span>
                </motion.div>

                <motion.div
                  whileHover={{ x: 5 }}
                  className="ios-check-item"
                >
                  <CheckCircle2 size={20} />

                  <span>
                    Personalized Rehabilitation Programs
                  </span>
                </motion.div>

              </div>

              <Link
                to="/user/contact"
                className="ios-outline-button"
              >
                Visit Our Clinic

                <ArrowRight size={17} />
              </Link>

            </motion.div>

          </motion.div>

        </div>

      </section>

      {/* =================================================
          SERVICES
      ================================================= */}

      <section
        id="services"
        className="ios-section ios-services-section"
      >

        <div className="ios-container">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.15,
            }}
            variants={stagger}
            className="ios-centered-heading"
          >

            <motion.div
              variants={fadeUp}
              className="ios-section-kicker ios-center"
            >
              <Stethoscope size={16} />
              OUR SERVICES
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="ios-section-title ios-center-title"
            >
              Complete Physiotherapy Care
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="ios-centered-text"
            >
              Effective treatment and rehabilitation
              designed according to your
              individual needs.
            </motion.p>

          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.08,
            }}
            variants={stagger}
            className="ios-service-grid"
          >

            <motion.div
              variants={cardVariant}
              whileHover={{
                y: -8,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="ios-service-card"
            >
              <div className="ios-service-icon">
                <Stethoscope size={25} />
              </div>

              <h3>
                Orthopaedic
              </h3>

              <p>
                Treatment for joint pain,
                muscle injuries, back pain
                and orthopedic conditions.
              </p>

              <span className="ios-card-line" />
            </motion.div>

            <motion.div
              variants={cardVariant}
              whileHover={{
                y: -8,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="ios-service-card"
            >
              <div className="ios-service-icon">
                <Activity size={25} />
              </div>

              <h3>
                Neurological
              </h3>

              <p>
                Rehabilitation focused on
                improving movement, balance
                and functional independence.
              </p>

              <span className="ios-card-line" />
            </motion.div>

            <motion.div
              variants={cardVariant}
              whileHover={{
                y: -8,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="ios-service-card"
            >
              <div className="ios-service-icon">
                <HeartPulse size={25} />
              </div>

              <h3>
                Pediatric
              </h3>

              <p>
                Child-friendly physiotherapy
                and rehabilitation with gentle
                personalized care.
              </p>

              <span className="ios-card-line" />
            </motion.div>

            <motion.div
              variants={cardVariant}
              whileHover={{
                y: -8,
              }}
              whileTap={{
                scale: 0.98,
              }}
              className="ios-service-card"
            >
              <div className="ios-service-icon">
                <Award size={25} />
              </div>

              <h3>
                Sports Rehab
              </h3>

              <p>
                Recovery programs for sports
                injuries and performance-related
                rehabilitation.
              </p>

              <span className="ios-card-line" />
            </motion.div>

          </motion.div>

        </div>

      </section>

      {/* =================================================
          STATS
      ================================================= */}

      <section className="ios-stats-section">

        <div className="ios-container">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.15,
            }}
            variants={stagger}
            className="ios-stats-grid"
          >

            <StatCard
              icon={Award}
              value="8+"
              label="Years Experience"
            />

            <StatCard
              icon={Users}
              value="1000+"
              label="Happy Patients"
            />

            <StatCard
              icon={Activity}
              value="500+"
              label="Recoveries"
            />

            <StatCard
              icon={HeartPulse}
              value="100%"
              label="Care"
            />

          </motion.div>

        </div>

      </section>

      {/* =================================================
          PATIENT CARE
      ================================================= */}

      <section className="ios-section">

        <div className="ios-container">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.15,
            }}
            variants={stagger}
            className="ios-patient-card"
          >

            <motion.div
              variants={fadeUp}
              className="ios-section-kicker ios-center"
            >
              <Star size={16} />
              PATIENT CARE
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="ios-section-title ios-center-title"
            >
              Your Recovery Is Our Priority
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="ios-centered-text"
            >
              Every treatment plan at Wellborn
              Physio is designed around the
              patient's condition, comfort and
              recovery goals.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="ios-stars"
            >
              {[1, 2, 3, 4, 5].map((item) => (
                <Star
                  key={item}
                  size={21}
                  fill="currentColor"
                />
              ))}
            </motion.div>

          </motion.div>

        </div>

      </section>

      {/* =================================================
          CTA
      ================================================= */}

      <section className="ios-cta">

        <motion.div
          animate={{
            y: [0, -7, 0],
            rotate: [0, 2, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="ios-cta-icon"
        >
          <HeartPulse size={34} />
        </motion.div>

        <h2>
          Ready To Start Your Recovery?
        </h2>

        <p>
          Take the first step towards better
          movement, less pain and a healthier
          lifestyle.
        </p>

        <Link
          to="/user/appointment"
          className="ios-cta-button"
        >
          Book Your Appointment

          <ArrowRight size={18} />
        </Link>

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="ios-footer">

        <div className="ios-container">

          <div className="ios-footer-content">

            <div className="ios-footer-brand">

              <HeartPulse size={27} />

              <h2>
                Wellborn Physio
              </h2>

              <span>
                Rehab & Centre
              </span>

            </div>

            <div className="ios-footer-line" />

            <a
  href="https://maps.app.goo.gl/w3GFkRiq1T1zrmpeA"
  target="_blank"
  rel="noopener noreferrer"
>
  <MapPin size={16} />
  vengateshwara nagar,velacherry,chennai
</a>

            <a href="tel:+919342752147">
              <Phone size={12} />
              +91 93427 52147
            </a>

            <a href="mailto:wellbornphysio@gmail.com">
              <Mail size={20} />
              arunprasath31286@gmail.com
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

            <div className="ios-footer-copy">
              © {new Date().getFullYear()}{" "}
              Wellborn Physio.
              All Rights Reserved.
            </div>

          </div>

        </div>

      </footer>

      {/* =================================================
          PAGE CSS
      ================================================= */}

      <style>{`

        /* =================================================
            GLOBAL
        ================================================= */

        html {
          scroll-behavior: smooth;
        }

        .ios-home-page {
          position: relative;
          width: 100%;
          min-height: 100vh;
          overflow-x: clip;
          background: #f5f7fb;
          color: #0f172a;
          isolation: isolate;
        }

        .ios-home-page *,
        .ios-home-page *::before,
        .ios-home-page *::after {
          box-sizing: border-box;
        }

        .dark .ios-home-page {
          background: #020617;
          color: #f8fafc;
        }

        .ios-container {
          position: relative;
          width: 100%;
          max-width: 1240px;
          margin: 0 auto;
          padding: 0 24px;
        }

        /* =================================================
            BACKGROUND GLOW
        ================================================= */

        .ios-bg-glow {
          position: fixed;
          width: 280px;
          height: 280px;
          border-radius: 50%;
          filter: blur(90px);
          pointer-events: none;
          z-index: -1;
          will-change: transform;
        }

        .ios-bg-glow-one {
          top: 12%;
          left: -140px;
          background: rgba(59, 130, 246, .10);
        }

        .ios-bg-glow-two {
          right: -120px;
          top: 55%;
          background: rgba(34, 211, 238, .08);
        }

        /* =================================================
            HERO
        ================================================= */

        .ios-hero {
          position: relative;
          min-height: 680px;
          display: flex;
          align-items: center;
          overflow: hidden;

          background:
            linear-gradient(
              135deg,
              #0f5bd8 0%,
              #2563eb 48%,
              #06b6d4 100%
            );

          color: white;
        }

        .ios-hero-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(5px);
          pointer-events: none;
        }

        .ios-hero-orb-one {
          width: 330px;
          height: 330px;
          right: -100px;
          top: -90px;
          background: rgba(125, 211, 252, .18);
        }

        .ios-hero-orb-two {
          width: 360px;
          height: 360px;
          left: -150px;
          bottom: -170px;
          background: rgba(96, 165, 250, .14);
        }

        .ios-hero-grid {
          position: relative;
          z-index: 2;

          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, .9fr);

          gap: 70px;

          align-items: center;

          min-height: 680px;
        }

        .ios-hero-content {
          max-width: 650px;
        }

        .ios-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;

          padding: 9px 14px;

          border: 1px solid rgba(255, 255, 255, .23);

          background: rgba(255, 255, 255, .11);

          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);

          border-radius: 999px;

          font-size: 13px;
          font-weight: 600;
        }

        .ios-hero-title {
          margin: 24px 0 0;

          font-size: clamp(44px, 6vw, 76px);

          line-height: 1.02;

          letter-spacing: -.055em;

          font-weight: 900;
        }

        .ios-hero-title span {
          display: block;
          color: #dff7ff;
        }

        .ios-hero-text {
          max-width: 640px;

          margin-top: 24px;

          font-size: 17px;
          line-height: 1.85;

          color: rgba(239, 246, 255, .92);
        }

        .ios-badge-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 24px;
        }

        .ios-glass-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          padding: 9px 13px;

          border: 1px solid rgba(255, 255, 255, .19);

          background: rgba(255, 255, 255, .10);

          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);

          border-radius: 999px;

          font-size: 12px;
          font-weight: 650;
        }

        .ios-button-row {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 28px;
        }

        .ios-button-wrapper {
          display: inline-flex;
        }

        .ios-primary-button,
        .ios-secondary-button {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          gap: 9px;

          min-height: 50px;

          padding: 0 20px;

          border-radius: 16px;

          text-decoration: none;

          font-size: 14px;
          font-weight: 800;

          transition:
            transform .25s ease,
            box-shadow .25s ease,
            background .25s ease;
        }

        .ios-primary-button {
          background: rgba(255, 255, 255, .97);

          color: #1556d1;

          box-shadow:
            0 16px 40px rgba(8, 47, 73, .20);
        }

        .ios-secondary-button {
          border: 1px solid rgba(255, 255, 255, .30);

          color: white;

          background: rgba(255, 255, 255, .09);

          backdrop-filter: blur(12px);
        }

        /* =================================================
            HERO IMAGE
        ================================================= */

        .ios-hero-visual {
          position: relative;

          min-height: 520px;

          display: flex;

          align-items: center;
          justify-content: center;
        }

        .ios-image-glow {
          position: absolute;

          width: 390px;
          height: 390px;

          border-radius: 50%;

          background: rgba(125, 211, 252, .20);

          filter: blur(55px);
        }

        .ios-image-card {
          position: relative;

          width: min(100%, 490px);

          border-radius: 34px;

          padding: 8px;

          background: rgba(255, 255, 255, .18);

          border: 1px solid rgba(255, 255, 255, .26);

          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);

          box-shadow:
            0 30px 90px rgba(8, 47, 73, .24);

          will-change: transform;
        }

        /* =================================================
            NEW SMOOTH IMAGE SLIDER
        ================================================= */

        .ios-hero-image-slider {
          position: relative;

          width: 100%;
          height: 480px;

          overflow: hidden;

          border-radius: 28px;

          isolation: isolate;
        }

        .ios-hero-slide-image {
          position: absolute;

          inset: 0;

          width: 100%;
          height: 100%;

          object-fit: cover;

          object-position: center;

          border-radius: 28px;

          will-change:
            opacity,
            transform,
            filter;

          backface-visibility: hidden;

          transform: translateZ(0);

          -webkit-transform: translateZ(0);
        }

        .ios-image-overlay {
          position: absolute;

          inset: 8px;

          z-index: 5;

          border-radius: 28px;

          background:
            linear-gradient(
              to top,
              rgba(3, 7, 18, .34),
              transparent 50%
            );

          pointer-events: none;
        }

        .ios-trusted-card {
          position: absolute;

          z-index: 10;

          left: 26px;
          bottom: 26px;

          display: flex;

          align-items: center;

          gap: 11px;

          padding: 11px 14px;

          border-radius: 18px;

          background: rgba(255, 255, 255, .94);

          color: #0f172a;

          box-shadow:
            0 16px 36px rgba(15, 23, 42, .20);

          backdrop-filter: blur(16px);
        }

        .ios-trusted-icon {
          width: 38px;
          height: 38px;

          border-radius: 12px;

          display: flex;

          align-items: center;
          justify-content: center;

          background: #dcfce7;

          color: #16a34a;
        }

        .ios-trusted-card strong,
        .ios-trusted-card span {
          display: block;
        }

        .ios-trusted-card strong {
          font-size: 13px;
        }

        .ios-trusted-card span {
          margin-top: 2px;

          font-size: 10px;

          color: #64748b;
        }

        .ios-floating-pill {
          position: absolute;

          right: -12px;
          top: 28px;

          display: inline-flex;

          align-items: center;

          gap: 7px;

          padding: 10px 13px;

          border-radius: 999px;

          background: rgba(255, 255, 255, .92);

          color: #1556d1;

          font-size: 11px;
          font-weight: 800;

          box-shadow:
            0 15px 30px rgba(15, 23, 42, .15);
        }

        /* =================================================
            QUICK INFO
        ================================================= */

        .ios-floating-section {
          position: relative;

          z-index: 4;

          margin-top: -55px;
        }

        .ios-quick-grid {
          display: grid;

          grid-template-columns:
            repeat(3, 1fr);

          gap: 14px;

          padding: 16px;

          border: 1px solid rgba(255, 255, 255, .75);

          border-radius: 25px;

          background: rgba(255, 255, 255, .84);

          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);

          box-shadow:
            0 20px 60px rgba(15, 23, 42, .10);
        }

        .dark .ios-quick-grid {
          background: rgba(15, 23, 42, .82);

          border-color:
            rgba(71, 85, 105, .55);

          box-shadow:
            0 20px 60px rgba(0, 0, 0, .28);
        }

        .ios-quick-card {
          display: flex;

          align-items: center;

          gap: 13px;

          padding: 16px;

          border-radius: 19px;

          background: rgba(248, 250, 252, .84);
        }

        .dark .ios-quick-card {
          background: rgba(30, 41, 59, .70);
        }

        .ios-quick-icon {
          width: 48px;
          height: 48px;

          min-width: 48px;

          border-radius: 15px;

          display: flex;

          align-items: center;
          justify-content: center;

          background: #eff6ff;

          color: #2563eb;
        }

        .dark .ios-quick-icon {
          background: rgba(37, 99, 235, .16);

          color: #60a5fa;
        }

        .ios-quick-card strong,
        .ios-quick-card span {
          display: block;
        }

        .ios-quick-card strong {
          color: #0f172a;

          font-size: 13px;
          font-weight: 800;
        }

        .dark .ios-quick-card strong {
          color: #f8fafc;
        }

        .ios-quick-card span {
          margin-top: 3px;

          color: #64748b;

          font-size: 11px;
        }

        .dark .ios-quick-card span {
          color: #94a3b8;
        }

        /* =================================================
            SECTIONS
        ================================================= */

        .ios-section {
          position: relative;

          padding: 100px 0;

          background: transparent;
        }

        .ios-services-section {
          background:
            rgba(248, 250, 252, .70);
        }

        .dark .ios-services-section {
          background:
            rgba(15, 23, 42, .65);
        }

        .ios-two-column {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            minmax(0, 1fr);

          gap: 70px;

          align-items: center;
        }

        .ios-about-image-wrap {
          position: relative;
        }

        .ios-about-glow {
          position: absolute;

          inset: -15px;

          border-radius: 36px;

          background:
            linear-gradient(
              135deg,
              rgba(59, 130, 246, .16),
              rgba(34, 211, 238, .08)
            );

          filter: blur(25px);
        }

        .ios-about-image {
          position: relative;

          z-index: 1;

          display: block;

          width: 100%;
          height: 535px;

          object-fit: cover;

          border-radius: 32px;

          box-shadow:
            0 28px 70px rgba(15, 23, 42, .14);
        }

        .ios-experience-card {
          position: absolute;

          z-index: 3;

          left: 22px;
          bottom: 22px;

          padding: 14px 17px;

          border-radius: 19px;

          background: rgba(255, 255, 255, .94);

          backdrop-filter: blur(18px);

          box-shadow:
            0 16px 40px rgba(15, 23, 42, .18);
        }

        .ios-experience-card strong {
          display: block;

          color: #2563eb;

          font-size: 27px;

          font-weight: 900;
        }

        .ios-experience-card span {
          display: block;

          margin-top: 2px;

          color: #64748b;

          font-size: 11px;

          font-weight: 600;
        }

        .ios-section-kicker {
          display: inline-flex;

          align-items: center;

          gap: 7px;

          color: #2563eb;

          font-size: 13px;

          font-weight: 800;

          letter-spacing: .12em;
        }

        .dark .ios-section-kicker {
          color: #60a5fa;
        }

        .ios-center {
          justify-content: center;
        }

        .ios-section-title {
          margin: 13px 0 0;

          max-width: 680px;

          color: #0f172a;

          font-size:
            clamp(34px, 4vw, 52px);

          line-height: 1.08;

          letter-spacing: -.045em;

          font-weight: 900;
        }

        .dark .ios-section-title {
          color: #f8fafc;
        }

        .ios-section-title span {
          display: block;

          color: #2563eb;
        }

        .dark .ios-section-title span {
          color: #60a5fa;
        }

        .ios-section-text {
          margin-top: 20px;

          color: #64748b;

          font-size: 15px;

          line-height: 1.85;
        }

        .dark .ios-section-text {
          color: #cbd5e1;
        }

        .ios-check-list {
          display: grid;

          gap: 11px;

          margin-top: 25px;
        }

        .ios-check-item {
          display: flex;

          align-items: center;

          gap: 10px;

          color: #334155;

          font-size: 14px;

          font-weight: 650;
        }

        .dark .ios-check-item {
          color: #e2e8f0;
        }

        .ios-check-item svg {
          color: #22c55e;

          flex-shrink: 0;
        }

        .ios-outline-button {
          display: inline-flex;

          align-items: center;

          gap: 8px;

          margin-top: 28px;

          min-height: 48px;

          padding: 0 17px;

          border:
            1px solid rgba(37, 99, 235, .25);

          border-radius: 15px;

          background:
            rgba(255, 255, 255, .72);

          color: #2563eb;

          text-decoration: none;

          font-size: 13px;

          font-weight: 800;

          backdrop-filter: blur(12px);

          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }

        .ios-outline-button:hover {
          transform: translateY(-2px);

          box-shadow:
            0 12px 30px
            rgba(37, 99, 235, .12);
        }

        .dark .ios-outline-button {
          background:
            rgba(30, 41, 59, .80);

          border-color: #334155;

          color: #60a5fa;
        }

        /* =================================================
            SERVICES
        ================================================= */

        .ios-centered-heading {
          text-align: center;
        }

        .ios-center-title {
          margin-left: auto;
          margin-right: auto;
        }

        .ios-centered-text {
          max-width: 620px;

          margin:
            16px auto 0;

          color: #64748b;

          font-size: 15px;

          line-height: 1.8;
        }

        .dark .ios-centered-text {
          color: #94a3b8;
        }

        .ios-service-grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 16px;

          margin-top: 48px;
        }

        .ios-service-card {
          position: relative;

          padding: 23px;

          border-radius: 23px;

          background:
            rgba(255, 255, 255, .88);

          border:
            1px solid rgba(226, 232, 240, .85);

          box-shadow:
            0 16px 40px
            rgba(15, 23, 42, .07);

          transition:
            box-shadow .35s ease,
            transform .35s ease;
        }

        .dark .ios-service-card {
          background:
            rgba(30, 41, 59, .82);

          border-color:
            rgba(71, 85, 105, .60);

          box-shadow:
            0 18px 45px
            rgba(0, 0, 0, .24);
        }

        .ios-service-card:hover {
          box-shadow:
            0 25px 60px
            rgba(15, 23, 42, .12);
        }

        .ios-service-icon {
          width: 55px;
          height: 55px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 17px;

          background: #eff6ff;

          color: #2563eb;
        }

        .dark .ios-service-icon {
          background:
            rgba(37, 99, 235, .16);

          color: #60a5fa;
        }

        .ios-service-card h3 {
          margin: 18px 0 0;

          color: #0f172a;

          font-size: 19px;

          font-weight: 850;
        }

        .dark .ios-service-card h3 {
          color: white;
        }

        .ios-service-card p {
          margin: 12px 0 0;

          color: #64748b;

          font-size: 13px;

          line-height: 1.75;
        }

        .dark .ios-service-card p {
          color: #cbd5e1;
        }

        .ios-card-line {
          display: block;

          width: 36px;
          height: 4px;

          margin-top: 18px;

          border-radius: 999px;

          background:
            linear-gradient(
              90deg,
              #2563eb,
              #06b6d4
            );
        }

        /* =================================================
            STATS
        ================================================= */

        .ios-stats-section {
          padding: 60px 0;

          background:
            linear-gradient(
              135deg,
              #0f5bd8,
              #2563eb,
              #0891b2
            );

          color: white;
        }

        .ios-stats-grid {
          display: grid;

          grid-template-columns:
            repeat(4, 1fr);

          gap: 16px;
        }

        .ios-stat-card {
          padding: 25px 15px;

          text-align: center;

          border-radius: 23px;

          background:
            rgba(255, 255, 255, .10);

          border:
            1px solid rgba(255, 255, 255, .15);

          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);

          transition:
            box-shadow .3s ease,
            transform .3s ease;
        }

        .ios-stat-icon {
          width: 52px;
          height: 52px;

          margin: 0 auto;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 17px;

          background:
            rgba(255, 255, 255, .13);
        }

        .ios-stat-card h3 {
          margin: 16px 0 0;

          font-size: 40px;

          font-weight: 900;

          letter-spacing: -.04em;
        }

        .ios-stat-card p {
          margin-top: 5px;

          color:
            rgba(239, 246, 255, .88);

          font-size: 12px;

          font-weight: 600;
        }

        /* =================================================
            PATIENT CARD
        ================================================= */

        .ios-patient-card {
          padding: 60px 30px;

          text-align: center;

          border-radius: 30px;

          background:
            rgba(255, 255, 255, .82);

          border:
            1px solid rgba(226, 232, 240, .85);

          box-shadow:
            0 20px 60px
            rgba(15, 23, 42, .07);

          backdrop-filter: blur(20px);
        }

        .dark .ios-patient-card {
          background:
            rgba(15, 23, 42, .80);

          border-color: #334155;

          box-shadow:
            0 20px 60px
            rgba(0, 0, 0, .30);
        }

        .ios-stars {
          display: flex;

          justify-content: center;

          gap: 4px;

          margin-top: 24px;

          color: #facc15;
        }

        /* =================================================
            CTA
        ================================================= */

        .ios-cta {
          position: relative;

          padding: 80px 24px;

          text-align: center;

          overflow: hidden;

          background:
            linear-gradient(
              135deg,
              #0f5bd8,
              #2563eb,
              #06b6d4
            );

          color: white;
        }

        .ios-cta-icon {
          width: 67px;
          height: 67px;

          margin: 0 auto;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 22px;

          background:
            rgba(255, 255, 255, .12);

          border:
            1px solid rgba(255, 255, 255, .20);

          backdrop-filter: blur(12px);
        }

        .ios-cta h2 {
          margin-top: 20px;

          font-size:
            clamp(32px, 5vw, 52px);

          line-height: 1.08;

          letter-spacing: -.045em;

          font-weight: 900;
        }

        .ios-cta p {
          max-width: 620px;

          margin:
            16px auto 0;

          color:
            rgba(239, 246, 255, .92);

          font-size: 15px;

          line-height: 1.8;
        }

        .ios-cta-button {
          display: inline-flex;

          align-items: center;

          gap: 9px;

          margin-top: 25px;

          min-height: 50px;

          padding: 0 20px;

          border-radius: 16px;

          background: white;

          color: #1556d1;

          text-decoration: none;

          font-size: 13px;

          font-weight: 850;

          box-shadow:
            0 18px 40px
            rgba(8, 47, 73, .20);

          transition:
            transform .25s ease,
            box-shadow .25s ease;
        }

        .ios-cta-button:hover {
          transform: translateY(-2px);

          box-shadow:
            0 22px 45px
            rgba(8, 47, 73, .26);
        }

        /* =================================================
            FOOTER
        ================================================= */

        .ios-footer {
          padding: 50px 0;

          background: #0b1220;

          color: white;
        }

        .ios-footer-content {
          text-align: center;
        }

        .ios-footer-brand {
          display: inline-flex;

          flex-direction: column;

          align-items: center;
        }

        .ios-footer-brand svg {
          color: #67e8f9;
        }

        .ios-footer-brand h2 {
          margin: 12px 0 0;

          color: #67e8f9;

          font-size: 23px;

          font-weight: 900;
        }

        .ios-footer-brand span {
          margin-top: 4px;

          color: #94a3b8;

          font-size: 11px;

          font-weight: 650;
        }

        .ios-footer-line {
          width: 55px;
          height: 3px;

          margin: 20px auto;

          border-radius: 999px;

          background:
            linear-gradient(
              90deg,
              #2563eb,
              #06b6d4
            );
        }

        .ios-footer-content > p,
        .ios-footer-content > a {
          display: flex;

          align-items: center;

          justify-content: center;

          gap: 7px;

          color: #cbd5e1;

          font-size: 13px;

          text-decoration: none;
        }

        .ios-footer-content > a {
          margin-top: 10px;
        }

        .ios-footer-content > a:hover {
          color: #67e8f9;
        }

        .ios-footer-copy {
          margin-top: 22px;

          color: #64748b;

          font-size: 11px;
        }

        /* =================================================
            TABLET
        ================================================= */

        @media (max-width: 1023px) {

          .ios-hero {
            min-height: auto;
          }

          .ios-hero-grid {
            grid-template-columns: 1fr;

            gap: 45px;

            min-height: auto;

            padding-top: 50px;
            padding-bottom: 100px;
          }

          .ios-hero-content {
            max-width: 760px;

            margin: 0 auto;

            text-align: center;
          }

          .ios-eyebrow,
          .ios-button-row,
          .ios-badge-row {
            justify-content: center;
          }

          .ios-hero-text {
            margin-left: auto;
            margin-right: auto;
          }

          .ios-hero-visual {
            min-height: 450px;
          }

          .ios-image-card {
            max-width: 540px;
          }

          .ios-two-column {
            grid-template-columns: 1fr;

            gap: 45px;
          }

          .ios-about-image-wrap {
            max-width: 650px;

            margin: 0 auto;

            width: 100%;
          }

          .ios-about-content {
            max-width: 720px;

            margin: 0 auto;
          }

          .ios-service-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .ios-stats-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

        /* =================================================
            MOBILE
        ================================================= */

        @media (max-width: 640px) {

          html {
            scroll-behavior: smooth;
          }

          body {
            overflow-x: hidden;
          }

          .ios-home-page {
            width: 100%;

            overflow-x: clip;
          }

          .ios-container {
            padding: 0 16px;
          }

          /* HERO */

          .ios-hero {
            min-height: auto;
          }

          .ios-hero-grid {
            width: 100%;

            padding-top: 28px;
            padding-bottom: 78px;

            gap: 30px;
          }

          .ios-hero-content {
            width: 100%;
          }

          .ios-eyebrow {
            max-width: 100%;

            padding: 8px 11px;

            font-size: 11px;
          }

          .ios-hero-title {
            margin-top: 19px;

            font-size: 43px;

            line-height: 1.04;

            letter-spacing: -.055em;
          }

          .ios-hero-text {
            margin-top: 18px;

            font-size: 14px;

            line-height: 1.75;
          }

          .ios-badge-row {
            width: 100%;

            gap: 7px;

            margin-top: 19px;
          }

          .ios-glass-badge {
            padding: 8px 9px;

            font-size: 9.5px;
          }

          .ios-button-row {
            width: 100%;

            flex-direction: column;

            gap: 10px;

            margin-top: 24px;
          }

          .ios-button-wrapper {
            width: 100%;
          }

          .ios-primary-button,
          .ios-secondary-button {
            width: 100%;

            min-height: 49px;
          }

          /* HERO IMAGE */

          .ios-hero-visual {
            width: 100%;

            min-height: 370px;
          }

          .ios-image-glow {
            width: 280px;
            height: 280px;
          }

          .ios-image-card {
            width: 100%;

            max-width: 100%;

            padding: 6px;

            border-radius: 27px;
          }

          /* MOBILE SLIDER */

          .ios-hero-image-slider {
            width: 100%;

            height: 370px;

            border-radius: 21px;
          }

          .ios-hero-slide-image {
            width: 100%;
            height: 100%;

            object-fit: cover;

            object-position: center;

            border-radius: 21px;
          }

          .ios-image-overlay {
            inset: 6px;

            border-radius: 21px;
          }

          .ios-floating-pill {
            right: 0;

            top: 13px;

            padding: 9px 11px;

            font-size: 10px;
          }

          .ios-trusted-card {
            left: 15px;

            bottom: 15px;

            padding: 8px 10px;

            gap: 8px;

            border-radius: 15px;
          }

          .ios-trusted-icon {
            width: 33px;
            height: 33px;

            border-radius: 10px;
          }

          .ios-trusted-card strong {
            font-size: 11px;
          }

          .ios-trusted-card span {
            font-size: 9px;
          }

          /* QUICK INFO */

          .ios-floating-section {
            margin-top: -34px;
          }

          .ios-quick-grid {
            grid-template-columns: 1fr;

            gap: 7px;

            padding: 9px;

            border-radius: 21px;
          }

          .ios-quick-card {
            min-width: 0;

            padding: 11px;

            border-radius: 15px;
          }

          .ios-quick-icon {
            width: 43px;
            height: 43px;

            min-width: 43px;

            border-radius: 13px;
          }

          .ios-quick-card strong {
            font-size: 12px;
          }

          .ios-quick-card span {
            font-size: 10px;
          }

          /* SECTIONS */

          .ios-section {
            padding: 70px 0;
          }

          .ios-two-column {
            gap: 38px;
          }

          /* ABOUT IMAGE */

          .ios-about-image-wrap {
            width: 100%;
          }

          .ios-about-image {
            width: 100%;

            height: 360px;

            border-radius: 25px;
          }

          .ios-about-glow {
            inset: -8px;

            border-radius: 28px;
          }

          .ios-experience-card {
            left: 14px;

            bottom: 14px;

            padding: 11px 14px;

            border-radius: 15px;
          }

          .ios-experience-card strong {
            font-size: 23px;
          }

          .ios-experience-card span {
            font-size: 10px;
          }

          /* ABOUT CONTENT */

          .ios-section-kicker {
            font-size: 11px;

            letter-spacing: .1em;
          }

          .ios-section-title {
            margin-top: 10px;

            font-size: 34px;

            line-height: 1.08;
          }

          .ios-section-text {
            margin-top: 17px;

            font-size: 13.5px;

            line-height: 1.8;
          }

          .ios-check-list {
            margin-top: 22px;

            gap: 12px;
          }

          .ios-check-item {
            align-items: flex-start;

            font-size: 12.5px;

            line-height: 1.5;
          }

          .ios-check-item svg {
            margin-top: 1px;
          }

          .ios-outline-button {
            width: 100%;

            justify-content: center;

            margin-top: 25px;
          }

          /* SERVICES */

          .ios-services-section {
            padding-top: 70px;

            padding-bottom: 70px;
          }

          .ios-centered-text {
            font-size: 13px;

            line-height: 1.75;
          }

          .ios-service-grid {
            grid-template-columns: 1fr;

            gap: 12px;

            margin-top: 30px;
          }

          .ios-service-card {
            padding: 20px;

            border-radius: 20px;
          }

          .ios-service-icon {
            width: 51px;
            height: 51px;

            border-radius: 15px;
          }

          .ios-service-card h3 {
            margin-top: 15px;

            font-size: 18px;
          }

          .ios-service-card p {
            margin-top: 10px;

            font-size: 12.5px;

            line-height: 1.7;
          }

          .ios-card-line {
            margin-top: 16px;
          }

          /* STATS */

          .ios-stats-section {
            padding: 45px 0;
          }

          .ios-stats-grid {
            grid-template-columns:
              repeat(2, 1fr);

            gap: 9px;
          }

          .ios-stat-card {
            padding: 19px 8px;

            border-radius: 19px;
          }

          .ios-stat-icon {
            width: 46px;
            height: 46px;

            border-radius: 14px;
          }

          .ios-stat-card h3 {
            margin-top: 13px;

            font-size: 30px;
          }

          .ios-stat-card p {
            font-size: 9px;
          }

          /* PATIENT */

          .ios-patient-card {
            padding: 40px 17px;

            border-radius: 25px;
          }

          .ios-patient-card .ios-section-title {
            font-size: 31px;
          }

          .ios-stars {
            margin-top: 20px;
          }

          /* CTA */

          .ios-cta {
            padding: 62px 17px;
          }

          .ios-cta-icon {
            width: 60px;
            height: 60px;

            border-radius: 19px;
          }

          .ios-cta h2 {
            font-size: 33px;

            line-height: 1.1;
          }

          .ios-cta p {
            font-size: 13px;

            line-height: 1.75;
          }

          .ios-cta-button {
            width: 100%;

            justify-content: center;
          }

          /* FOOTER */

          .ios-footer {
            padding: 42px 0;
          }

          .ios-footer-content > p,
          .ios-footer-content > a {
            font-size: 11px;
          }

          .ios-footer-brand h2 {
            font-size: 21px;
          }

          .ios-footer-copy {
            font-size: 9px;
          }
        }

        /* =================================================
            SMALL MOBILE
        ================================================= */

        @media (max-width: 380px) {

          .ios-container {
            padding: 0 13px;
          }

          .ios-hero-title {
            font-size: 38px;
          }

          .ios-hero-text {
            font-size: 13px;
          }

          .ios-glass-badge {
            width: 100%;

            justify-content: center;
          }

          .ios-hero-image-slider {
            height: 320px;
          }

          .ios-hero-slide-image {
            height: 320px;
          }

          .ios-hero-visual {
            min-height: 320px;
          }

          .ios-section-title {
            font-size: 30px;
          }

          .ios-service-card {
            padding: 18px;
          }

          .ios-stat-card h3 {
            font-size: 27px;
          }

          .ios-cta h2 {
            font-size: 30px;
          }
        }

        /* =================================================
            VERY SMALL DEVICES
        ================================================= */

        @media (max-width: 330px) {

          .ios-hero-title {
            font-size: 35px;
          }

          .ios-hero-image-slider {
            height: 295px;
          }

          .ios-hero-slide-image {
            height: 295px;
          }

          .ios-hero-visual {
            min-height: 295px;
          }

          .ios-section-title {
            font-size: 28px;
          }

          .ios-stat-card h3 {
            font-size: 25px;
          }
        }

        /* =================================================
            TOUCH DEVICES
        ================================================= */

        @media (hover: none) {

          .ios-service-card:hover {
            transform: none;

            box-shadow:
              0 16px 40px
              rgba(15, 23, 42, .07);
          }

          .ios-outline-button:hover {
            transform: none;
          }

          .ios-cta-button:hover {
            transform: none;
          }
        }

        /* =================================================
            REDUCED MOTION
        ================================================= */

        @media (prefers-reduced-motion: reduce) {

          html {
            scroll-behavior: auto;
          }

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