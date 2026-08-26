import React from "react";
import { motion } from "framer-motion";

import {
  HeartPulse,
  Stethoscope,
  Activity,
  Users,
  Award,
  ShieldCheck,
  MapPin,
  Phone,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

/* =====================================================
   ANIMATION VARIANTS
===================================================== */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 45,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeLeft = {
  hidden: {
    opacity: 0,
    x: -65,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeRight = {
  hidden: {
    opacity: 0,
    x: 65,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardAnimation = {
  hidden: {
    opacity: 0,
    y: 35,
    scale: 0.95,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* =====================================================
   STAT ITEM
===================================================== */

function StatItem({ icon: Icon, number, label, delay = 0 }) {
  return (
    <motion.div
      variants={fadeUp}
      transition={{ delay }}
      whileHover={{
        y: -8,
        scale: 1.04,
      }}
      className="about-ios-stat"
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
        }}
      >
        <Icon size={31} className="mx-auto opacity-90" />
      </motion.div>

      <motion.h3
        initial={{
          opacity: 0,
          scale: 0.6,
        }}
        whileInView={{
          opacity: 1,
          scale: 1,
        }}
        viewport={{
          once: true,
        }}
        transition={{
          duration: 0.7,
          delay: delay + 0.1,
          type: "spring",
          stiffness: 100,
        }}
        className="mt-3 text-4xl sm:text-5xl font-black tracking-tight"
      >
        {number}
      </motion.h3>

      <p className="mt-2 text-xs sm:text-sm text-blue-100">
        {label}
      </p>
    </motion.div>
  );
}

/* =====================================================
   ABOUT PAGE
===================================================== */

export default function About() {
  return (
    <div className="about-ios-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="about-ios-hero">

        {/* BACKGROUND ORBS */}

        <motion.div
          animate={{
            x: [0, 45, 0],
            y: [0, -30, 0],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="about-ios-orb about-ios-orb-1"
        />

        <motion.div
          animate={{
            x: [0, -40, 0],
            y: [0, 35, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="about-ios-orb about-ios-orb-2"
        />

        <motion.div
          animate={{
            x: [0, -25, 20, 0],
            y: [0, 18, -15, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="about-ios-orb about-ios-orb-3"
        />

        <div className="about-ios-grid-overlay" />

        <div className="about-ios-container">

          <div className="about-ios-hero-grid">

            {/* LEFT */}

            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="relative z-10"
            >

              <motion.div
                variants={fadeLeft}
                className="about-ios-chip"
              >
                <span className="about-ios-chip-icon">
                  <HeartPulse size={15} />
                </span>

                <span>
                  Professional Physiotherapy Care
                </span>
              </motion.div>

              <motion.h1
                variants={fadeLeft}
                className="about-ios-hero-title"
              >
                About
                <span>Wellborn Physio</span>
              </motion.h1>

              <motion.p
                variants={fadeLeft}
                className="about-ios-hero-description"
              >
                Professional physiotherapy and rehabilitation
                care helping patients recover confidently,
                move better and live pain free.
              </motion.p>

              <motion.div
                variants={fadeLeft}
                className="about-ios-feature-row"
              >
                <span className="about-ios-feature">
                  <Activity size={14} />
                  Modern Treatment
                </span>

                <span className="about-ios-feature">
                  <ShieldCheck size={14} />
                  Trusted Care
                </span>
              </motion.div>

              <motion.div
                variants={fadeLeft}
                className="about-ios-hero-actions"
              >
                <a
                  href="/user/appointment"
                  className="about-ios-primary-btn"
                >
                  <span>Book Appointment</span>
                  <ArrowRight size={17} />
                </a>

                <a
                  href="#why-us"
                  className="about-ios-secondary-btn"
                >
                  Explore More
                </a>
              </motion.div>

            </motion.div>

            {/* RIGHT IMAGE */}

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeRight}
              className="relative z-10"
            >

              <div className="about-ios-image-glow" />

              <motion.div
                whileHover={{
                  y: -10,
                  rotateX: 2,
                  rotateY: -2,
                  scale: 1.015,
                }}
                className="about-ios-image-shell"
              >

                <div className="about-ios-window-bar">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="about-ios-image-wrap">

                  <motion.img
                    src="/images/about.pic-1.png"
                    alt="Wellborn Physio"
                    animate={{
                      y: [0, -7, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="about-ios-hero-image"
                  />

                  <div className="about-ios-image-shine" />

                  <div className="about-ios-trust">
                    <div className="about-ios-trust-icon">
                      <CheckCircle2 size={18} />
                    </div>

                    <div>
                      <strong>Trusted Care</strong>
                      <span>Patient First</span>
                    </div>
                  </div>

                </div>
              </motion.div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* =================================================
          ABOUT CONTENT
      ================================================= */}

      <section className="about-ios-section">

        <div className="about-ios-container">

          <div className="about-ios-two-column">

            {/* IMAGE */}

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.2,
              }}
              variants={fadeLeft}
              className="relative"
            >

              <div className="about-ios-secondary-glow" />

              <motion.div
                whileHover={{
                  y: -8,
                  scale: 1.01,
                }}
                className="about-ios-secondary-card"
              >
                <img
                  src="/images/Doctor image.jpg"
                  alt="Dr Parameswari"
                />

                <div className="about-ios-experience">
                  <strong>8+</strong>
                  <span>Years Experience</span>
                </div>
              </motion.div>

            </motion.div>

            {/* CONTENT */}

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.2,
              }}
              variants={stagger}
            >

              <motion.div
                variants={fadeUp}
                className="about-ios-section-tag"
              >
                <HeartPulse size={15} />
                ABOUT WELLBORN
              </motion.div>

              <motion.h2
                variants={fadeUp}
                className="about-ios-section-title"
              >
                Compassionate Care With
                <span>Professional Excellence</span>
              </motion.h2>

              <motion.p
                variants={fadeUp}
                className="about-ios-text"
              >
                Wellborn Physio Rehab & Centre provides
                personalized physiotherapy treatments for
                Orthopaedic, Neuro, Pediatric and Sports
                conditions.
              </motion.p>

              <motion.p
                variants={fadeUp}
                className="about-ios-text"
              >
                Under the guidance of{" "}
                <strong>Dr. Parameswari (PT)</strong>,
                we focus on improving mobility, reducing pain
                and restoring confidence.
              </motion.p>

              <motion.div
                variants={stagger}
                className="about-ios-check-list"
              >
                {[
                  "Personalized Treatment Plans",
                  "Experienced Physiotherapy Care",
                  "Patient-Centered Rehabilitation",
                ].map((item) => (
                  <motion.div
                    key={item}
                    variants={fadeUp}
                    whileHover={{
                      x: 7,
                    }}
                    className="about-ios-check"
                  >
                    <span className="about-ios-check-icon">
                      <CheckCircle2 size={18} />
                    </span>

                    <span>{item}</span>
                  </motion.div>
                ))}
              </motion.div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* =================================================
          STATS
      ================================================= */}

      <section className="about-ios-stats">

        <div className="about-ios-stats-orb about-ios-stats-orb-1" />
        <div className="about-ios-stats-orb about-ios-stats-orb-2" />

        <div className="about-ios-container">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.25,
            }}
            variants={stagger}
            className="about-ios-stats-grid"
          >
            <StatItem
              icon={Award}
              number="8+"
              label="Years Experience"
              delay={0}
            />

            <StatItem
              icon={Users}
              number="1000+"
              label="Happy Patients"
              delay={0.1}
            />

            <StatItem
              icon={Activity}
              number="500+"
              label="Recoveries"
              delay={0.2}
            />

            <StatItem
              icon={HeartPulse}
              number="100%"
              label="Care"
              delay={0.3}
            />
          </motion.div>

        </div>
      </section>

      {/* =================================================
          WHY CHOOSE US
      ================================================= */}

      <section
        id="why-us"
        className="about-ios-why"
      >

        <div className="about-ios-container">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.25,
            }}
            variants={stagger}
            className="about-ios-centered"
          >

            <motion.div
              variants={fadeUp}
              className="about-ios-section-tag centered"
            >
              <Stethoscope size={15} />
              OUR ADVANTAGES
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="about-ios-section-title centered"
            >
              Why Choose Us
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="about-ios-subtitle"
            >
              Quality physiotherapy care designed around
              your recovery, comfort and confidence.
            </motion.p>

          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.15,
            }}
            variants={stagger}
            className="about-ios-cards"
          >

            {/* CARD 1 */}

            <motion.div
              variants={cardAnimation}
              whileHover={{
                y: -12,
              }}
              className="about-ios-card"
            >
              <motion.div
                whileHover={{
                  scale: 1.1,
                  rotate: -7,
                }}
                className="about-ios-card-icon blue"
              >
                <Stethoscope size={26} />
              </motion.div>

              <h3>Expert Physiotherapy</h3>

              <p>
                Experienced physiotherapy care with
                personalized treatment plans for every
                patient.
              </p>

              <div className="about-ios-card-line" />
            </motion.div>

            {/* CARD 2 */}

            <motion.div
              variants={cardAnimation}
              whileHover={{
                y: -12,
              }}
              className="about-ios-card"
            >
              <motion.div
                whileHover={{
                  scale: 1.1,
                  rotate: 7,
                }}
                className="about-ios-card-icon purple"
              >
                <Activity size={26} />
              </motion.div>

              <h3>Modern Rehabilitation</h3>

              <p>
                Advanced techniques and effective
                rehabilitation methods for better recovery.
              </p>

              <div className="about-ios-card-line" />
            </motion.div>

            {/* CARD 3 */}

            <motion.div
              variants={cardAnimation}
              whileHover={{
                y: -12,
              }}
              className="about-ios-card"
            >
              <motion.div
                whileHover={{
                  scale: 1.1,
                  rotate: -7,
                }}
                className="about-ios-card-icon green"
              >
                <HeartPulse size={26} />
              </motion.div>

              <h3>Patient Friendly</h3>

              <p>
                A comfortable environment with caring
                support throughout your recovery journey.
              </p>

              <div className="about-ios-card-line" />
            </motion.div>

          </motion.div>
        </div>
      </section>

      {/* =================================================
          CTA
      ================================================= */}

      <section className="about-ios-cta">

        <motion.div
          animate={{
            scale: [1, 1.12, 1],
            rotate: [0, 90, 180],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "linear",
          }}
          className="about-ios-cta-ring"
        />

        <motion.div
          animate={{
            x: [0, 25, 0],
            y: [0, -18, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="about-ios-cta-glow"
        />

        <div className="about-ios-container">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.3,
            }}
            variants={stagger}
            className="about-ios-cta-content"
          >

            <motion.div
              variants={fadeUp}
              className="about-ios-cta-icon"
            >
              <HeartPulse size={29} />
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="about-ios-cta-title"
            >
              Ready to Start Your Recovery?
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="about-ios-cta-text"
            >
              Take the first step towards better movement,
              less pain and a healthier life.
            </motion.p>

            <motion.a
              variants={fadeUp}
              whileHover={{
                scale: 1.06,
                y: -3,
              }}
              whileTap={{
                scale: 0.97,
              }}
              href="/user/appointment"
              className="about-ios-cta-button"
            >
              Book Appointment
              <ArrowRight size={17} />
            </motion.a>

          </motion.div>
        </div>
      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="about-ios-footer">

        <div className="about-ios-container">

          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.7,
            }}
            className="about-ios-footer-content"
          >

            <div className="about-ios-footer-brand">
              <HeartPulse size={25} />

              <h2>
                Wellborn Physio
              </h2>

              <span>
                Rehab & Centre
              </span>
            </div>

            <div className="about-ios-footer-details">

              <p>
                <MapPin size={15} />
                Karayanchavadi, Poonamallee, Chennai
              </p>

              <a href="tel:+919342752147">
                <Phone size={15} />
                +91 93427 52147
              </a>

            </div>

            <div className="about-ios-footer-bottom">
              © {new Date().getFullYear()} Wellborn Physio.
              All Rights Reserved.
            </div>

          </motion.div>
        </div>
      </footer>

      {/* =================================================
          CSS
      ================================================= */}

      <style>{`

        /* =================================================
           BASE
        ================================================= */

        .about-ios-page {
          width: 100%;
          min-height: 100%;
          overflow-x: clip;
          background: #f5f7fb;
          color: #111827;
        }

        .dark .about-ios-page {
          background: #05070d;
          color: #f8fafc;
        }

        .about-ios-container {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 22px;
        }

        /* =================================================
           HERO
        ================================================= */

        .about-ios-hero {
          position: relative;
          overflow: hidden;
          padding: 90px 0 78px;
          color: white;

          background:
            radial-gradient(
              circle at 12% 18%,
              rgba(255,255,255,.15),
              transparent 22%
            ),
            radial-gradient(
              circle at 85% 12%,
              rgba(103,232,249,.15),
              transparent 25%
            ),
            linear-gradient(
              135deg,
              #1746d2,
              #2563eb 48%,
              #06b6d4
            );
        }

        .about-ios-grid-overlay {
          position: absolute;
          inset: 0;

          background-image:
            linear-gradient(
              rgba(255,255,255,.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,.035) 1px,
              transparent 1px
            );

          background-size: 42px 42px;
          mask-image: linear-gradient(
            to bottom,
            black,
            transparent
          );

          pointer-events: none;
        }

        .about-ios-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(2px);
        }

        .about-ios-orb-1 {
          width: 260px;
          height: 260px;
          top: -90px;
          left: -80px;
          background: rgba(255,255,255,.10);
        }

        .about-ios-orb-2 {
          width: 340px;
          height: 340px;
          right: -120px;
          bottom: -150px;
          background: rgba(103,232,249,.12);
        }

        .about-ios-orb-3 {
          width: 150px;
          height: 150px;
          top: 20%;
          left: 48%;
          background: rgba(255,255,255,.05);
        }

        .about-ios-hero-grid {
          position: relative;
          z-index: 2;

          display: grid;
          grid-template-columns:
            minmax(0,1fr)
            minmax(0,1fr);

          gap: 70px;
          align-items: center;
        }

        /* =================================================
           HERO CONTENT
        ================================================= */

        .about-ios-chip {
          display: inline-flex;
          align-items: center;
          gap: 9px;

          padding: 8px 12px;
          border-radius: 999px;

          background: rgba(255,255,255,.11);
          border: 1px solid rgba(255,255,255,.22);

          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);

          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.25),
            0 10px 30px rgba(0,0,0,.10);

          font-size: 12px;
          font-weight: 700;
        }

        .about-ios-chip-icon {
          width: 25px;
          height: 25px;

          border-radius: 50%;

          display: flex;
          align-items: center;
          justify-content: center;

          background: rgba(255,255,255,.15);
        }

        .about-ios-hero-title {
          margin-top: 22px;

          font-size: clamp(
            3rem,
            6vw,
            5.5rem
          );

          line-height: .95;
          letter-spacing: -.065em;
          font-weight: 900;
        }

        .about-ios-hero-title span {
          display: block;
          margin-top: 10px;

          color: transparent;

          background:
            linear-gradient(
              90deg,
              #ffffff,
              #c8f7ff
            );

          -webkit-background-clip: text;
          background-clip: text;
        }

        .about-ios-hero-description {
          max-width: 610px;
          margin-top: 24px;

          color: rgba(255,255,255,.86);

          font-size: 16px;
          line-height: 1.8;
        }

        .about-ios-feature-row {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 24px;
        }

        .about-ios-feature {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          padding: 8px 11px;

          border-radius: 999px;

          background: rgba(255,255,255,.09);
          border: 1px solid rgba(255,255,255,.17);

          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);

          font-size: 11px;
          font-weight: 700;
        }

        .about-ios-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 11px;
          margin-top: 28px;
        }

        .about-ios-primary-btn,
        .about-ios-secondary-btn {
          min-height: 50px;

          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          padding: 0 18px;
          border-radius: 16px;

          text-decoration: none;
          font-weight: 800;

          transition:
            transform .3s ease,
            box-shadow .3s ease,
            background .3s ease;
        }

        .about-ios-primary-btn {
          color: #1750d5;
          background: rgba(255,255,255,.97);

          box-shadow:
            0 14px 35px rgba(0,0,0,.18);
        }

        .about-ios-primary-btn:hover {
          transform: translateY(-4px) scale(1.02);

          box-shadow:
            0 20px 45px rgba(0,0,0,.22);
        }

        .about-ios-secondary-btn {
          color: white;

          background: rgba(255,255,255,.09);
          border: 1px solid rgba(255,255,255,.22);

          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
        }

        .about-ios-secondary-btn:hover {
          transform: translateY(-3px);

          background: rgba(255,255,255,.15);
        }

        /* =================================================
           HERO IMAGE
        ================================================= */

        .about-ios-image-glow {
          position: absolute;
          inset: 8%;

          border-radius: 50%;

          background:
            rgba(103,232,249,.25);

          filter: blur(75px);
        }

        .about-ios-image-shell {
          position: relative;
          z-index: 2;

          width: min(100%, 570px);
          margin-left: auto;

          padding: 10px;

          border-radius: 33px;

          background: rgba(255,255,255,.12);

          border: 1px solid rgba(255,255,255,.22);

          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);

          box-shadow:
            0 35px 90px rgba(0,0,0,.22);

          transition:
            transform .7s cubic-bezier(.16,1,.3,1),
            box-shadow .7s ease;

          transform-style: preserve-3d;
        }

        .about-ios-window-bar {
          height: 25px;

          display: flex;
          align-items: center;

          gap: 6px;
          padding-left: 7px;
        }

        .about-ios-window-bar span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .about-ios-window-bar span:nth-child(1) {
          background: #ff5f57;
        }

        .about-ios-window-bar span:nth-child(2) {
          background: #ffbd2e;
        }

        .about-ios-window-bar span:nth-child(3) {
          background: #28c840;
        }

        .about-ios-image-wrap {
          position: relative;
          overflow: hidden;
          border-radius: 26px;
        }

        .about-ios-hero-image {
          display: block;

          width: 100%;

          height: clamp(
            320px,
            44vw,
            510px
          );

          object-fit: cover;
        }

        .about-ios-image-shine {
          position: absolute;

          top: -50%;
          left: -120%;

          width: 55%;
          height: 200%;

          transform: rotate(20deg);

          background:
            linear-gradient(
              90deg,
              transparent,
              rgba(255,255,255,.18),
              transparent
            );

          animation:
            aboutImageShine
            6s
            ease-in-out
            infinite;

          pointer-events: none;
        }

        @keyframes aboutImageShine {
          0% {
            left: -120%;
          }

          35% {
            left: 145%;
          }

          100% {
            left: 145%;
          }
        }

        .about-ios-trust {
          position: absolute;

          left: 16px;
          bottom: 16px;

          display: flex;
          align-items: center;
          gap: 10px;

          padding: 10px 12px;

          border-radius: 17px;

          background:
            rgba(255,255,255,.92);

          color: #111827;

          box-shadow:
            0 15px 40px rgba(0,0,0,.18);

          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);

          animation:
            aboutTrustFloat
            4.5s
            ease-in-out
            infinite;
        }

        .about-ios-trust-icon {
          width: 35px;
          height: 35px;

          border-radius: 12px;

          display: flex;
          align-items: center;
          justify-content: center;

          color: #16a34a;
          background: #ecfdf5;
        }

        .about-ios-trust strong {
          display: block;
          font-size: 12px;
        }

        .about-ios-trust span {
          display: block;

          margin-top: 2px;

          color: #64748b;
          font-size: 9px;
        }

        @keyframes aboutTrustFloat {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        /* =================================================
           CONTENT SECTION
        ================================================= */

        .about-ios-section {
          padding: 105px 0;

          background:
            linear-gradient(
              180deg,
              #f7f9fc,
              #ffffff
            );
        }

        .dark .about-ios-section {
          background:
            linear-gradient(
              180deg,
              #05070d,
              #08111e
            );
        }

        .about-ios-two-column {
          display: grid;

          grid-template-columns:
            minmax(0,1fr)
            minmax(0,1fr);

          gap: 80px;
          align-items: center;
        }

        .about-ios-secondary-glow {
          position: absolute;
          inset: 10%;

          border-radius: 50%;

          background:
            rgba(37,99,235,.10);

          filter: blur(70px);
        }

        .about-ios-secondary-card {
          position: relative;
          z-index: 2;

          padding: 9px;

          border-radius: 30px;

          background:
            rgba(255,255,255,.82);

          border: 1px solid #e8eef6;

          box-shadow:
            0 25px 70px rgba(15,23,42,.10);

          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);

          transition:
            transform .65s cubic-bezier(.16,1,.3,1),
            box-shadow .65s ease;
        }

        .dark .about-ios-secondary-card {
          background:
            rgba(15,23,42,.84);

          border-color:
            rgba(71,85,105,.55);

          box-shadow:
            0 25px 70px rgba(0,0,0,.30);
        }

        .about-ios-secondary-card img {
          width: 100%;
          height: 520px;

          display: block;

          object-fit: cover;

          border-radius: 23px;
        }

        .about-ios-experience {
          position: absolute;

          left: 24px;
          bottom: 24px;

          display: flex;
          flex-direction: column;

          padding: 14px 17px;

          border-radius: 18px;

          background:
            rgba(255,255,255,.92);

          box-shadow:
            0 15px 40px rgba(0,0,0,.15);

          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        .about-ios-experience strong {
          color: #2563eb;
          font-size: 27px;
          font-weight: 900;
        }

        .about-ios-experience span {
          margin-top: 2px;
          color: #64748b;
          font-size: 10px;
        }

        .about-ios-section-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          color: #2563eb;

          font-size: 11px;
          font-weight: 800;

          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .dark .about-ios-section-tag {
          color: #60a5fa;
        }

        .about-ios-section-tag.centered {
          justify-content: center;
        }

        .about-ios-section-title {
          margin-top: 15px;

          color: #111827;

          font-size: clamp(
            2.2rem,
            4vw,
            3.8rem
          );

          line-height: 1.08;
          letter-spacing: -.045em;

          font-weight: 900;
        }

        .dark .about-ios-section-title {
          color: white;
        }

        .about-ios-section-title span {
          display: block;
          margin-top: 4px;
          color: #2563eb;
        }

        .dark .about-ios-section-title span {
          color: #60a5fa;
        }

        .about-ios-section-title.centered {
          text-align: center;
        }

        .about-ios-text {
          margin-top: 20px;

          color: #64748b;

          font-size: 15px;
          line-height: 1.85;
        }

        .dark .about-ios-text {
          color: #cbd5e1;
        }

        .about-ios-text strong {
          color: #111827;
        }

        .dark .about-ios-text strong {
          color: white;
        }

        .about-ios-check-list {
          display: grid;
          gap: 8px;
          margin-top: 25px;
        }

        .about-ios-check {
          display: flex;
          align-items: center;
          gap: 11px;

          padding: 10px 12px;

          border-radius: 16px;

          background:
            rgba(248,250,252,.90);

          border: 1px solid #e9eef5;

          box-shadow:
            0 8px 25px rgba(15,23,42,.04);

          transition:
            transform .35s ease,
            box-shadow .35s ease;
        }

        .dark .about-ios-check {
          background:
            rgba(15,23,42,.74);

          border-color:
            rgba(51,65,85,.80);
        }

        .about-ios-check:hover {
          box-shadow:
            0 14px 35px rgba(15,23,42,.08);
        }

        .about-ios-check-icon {
          width: 33px;
          height: 33px;

          border-radius: 11px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          color: #16a34a;
          background: #ecfdf5;
        }

        .dark .about-ios-check-icon {
          background:
            rgba(22,163,74,.10);
        }

        .about-ios-check > span:last-child {
          color: #475569;

          font-size: 13px;
          font-weight: 600;
        }

        .dark .about-ios-check > span:last-child {
          color: #cbd5e1;
        }

        /* =================================================
           STATS
        ================================================= */

        .about-ios-stats {
          position: relative;
          overflow: hidden;

          padding: 70px 0;

          color: white;

          background:
            linear-gradient(
              135deg,
              #1746d2,
              #2563eb,
              #0891b2
            );
        }

        .about-ios-stats-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(35px);
        }

        .about-ios-stats-orb-1 {
          width: 380px;
          height: 380px;

          left: -120px;
          top: -160px;

          background:
            rgba(255,255,255,.08);

          animation:
            aboutStatsOrb1
            10s
            ease-in-out
            infinite;
        }

        .about-ios-stats-orb-2 {
          width: 330px;
          height: 330px;

          right: -110px;
          bottom: -140px;

          background:
            rgba(103,232,249,.10);

          animation:
            aboutStatsOrb2
            12s
            ease-in-out
            infinite;
        }

        @keyframes aboutStatsOrb1 {
          0%,100% {
            transform: translate(0,0) scale(1);
          }

          50% {
            transform: translate(70px,30px) scale(1.14);
          }
        }

        @keyframes aboutStatsOrb2 {
          0%,100% {
            transform: translate(0,0) scale(1);
          }

          50% {
            transform: translate(-55px,-30px) scale(1.1);
          }
        }

        .about-ios-stats-grid {
          position: relative;
          z-index: 2;

          display: grid;

          grid-template-columns:
            repeat(4,minmax(0,1fr));

          gap: 12px;
        }

        .about-ios-stat {
          padding: 18px 10px;

          border-radius: 22px;

          text-align: center;

          transition:
            transform .4s ease,
            background .4s ease;
        }

        .about-ios-stat:hover {
          background:
            rgba(255,255,255,.08);

          transform:
            translateY(-8px)
            scale(1.03);
        }

        /* =================================================
           WHY
        ================================================= */

        .about-ios-why {
          padding: 100px 0;

          background:
            linear-gradient(
              180deg,
              #f3f6fb,
              #edf4fa
            );
        }

        .dark .about-ios-why {
          background:
            linear-gradient(
              180deg,
              #0a0f18,
              #0c1522
            );
        }

        .about-ios-centered {
          max-width: 760px;
          margin: 0 auto;
          text-align: center;
        }

        .about-ios-subtitle {
          margin-top: 15px;

          color: #64748b;

          font-size: 14px;
          line-height: 1.8;
        }

        .dark .about-ios-subtitle {
          color: #94a3b8;
        }

        .about-ios-cards {
          display: grid;

          grid-template-columns:
            repeat(3,minmax(0,1fr));

          gap: 17px;

          margin-top: 44px;
        }

        .about-ios-card {
          position: relative;
          overflow: hidden;

          min-height: 255px;

          padding: 25px;

          border-radius: 26px;

          background:
            rgba(255,255,255,.80);

          border: 1px solid
            rgba(255,255,255,.95);

          box-shadow:
            0 20px 55px
            rgba(15,23,42,.07);

          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);

          transition:
            transform .55s cubic-bezier(.16,1,.3,1),
            box-shadow .55s ease,
            border-color .35s ease;
        }

        .dark .about-ios-card {
          background:
            rgba(15,23,42,.82);

          border-color:
            rgba(71,85,105,.55);

          box-shadow:
            0 20px 55px rgba(0,0,0,.25);
        }

        .about-ios-card::before {
          content: "";

          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              135deg,
              rgba(59,130,246,.08),
              transparent 48%,
              rgba(34,211,238,.08)
            );

          opacity: 0;

          transition:
            opacity .45s ease;
        }

        .about-ios-card:hover::before {
          opacity: 1;
        }

        .about-ios-card-icon {
          position: relative;
          z-index: 2;

          width: 55px;
          height: 55px;

          border-radius: 17px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin-bottom: 19px;

          transition:
            transform .45s cubic-bezier(.16,1,.3,1);
        }

        .about-ios-card-icon.blue {
          color: #2563eb;
          background: #eef4ff;
        }

        .about-ios-card-icon.purple {
          color: #7c3aed;
          background: #f3efff;
        }

        .about-ios-card-icon.green {
          color: #16a34a;
          background: #ecfdf5;
        }

        .dark .about-ios-card-icon.blue {
          background:
            rgba(37,99,235,.14);
        }

        .dark .about-ios-card-icon.purple {
          background:
            rgba(124,58,237,.14);
        }

        .dark .about-ios-card-icon.green {
          background:
            rgba(22,163,74,.12);
        }

        .about-ios-card h3 {
          position: relative;
          z-index: 2;

          margin: 0;

          color: #111827;

          font-size: 19px;
          font-weight: 850;
        }

        .dark .about-ios-card h3 {
          color: white;
        }

        .about-ios-card p {
          position: relative;
          z-index: 2;

          margin-top: 11px;

          color: #64748b;

          font-size: 13px;
          line-height: 1.8;
        }

        .dark .about-ios-card p {
          color: #cbd5e1;
        }

        .about-ios-card-line {
          position: relative;
          z-index: 2;

          width: 46px;
          height: 4px;

          margin-top: 21px;

          border-radius: 999px;

          background:
            linear-gradient(
              90deg,
              #2563eb,
              #06b6d4
            );

          transition:
            width .55s cubic-bezier(.16,1,.3,1);
        }

        .about-ios-card:hover
        .about-ios-card-line {
          width: 90px;
        }

        /* =================================================
           CTA
        ================================================= */

        .about-ios-cta {
          position: relative;
          overflow: hidden;

          padding: 75px 0;

          background:
            linear-gradient(
              135deg,
              #1746d2,
              #2563eb,
              #06b6d4
            );

          color: white;
        }

        .about-ios-cta-ring {
          position: absolute;

          width: 430px;
          height: 430px;

          right: -150px;
          top: -220px;

          border-radius: 50%;

          border:
            1px solid
            rgba(255,255,255,.16);
        }

        .about-ios-cta-glow {
          position: absolute;

          width: 280px;
          height: 280px;

          left: 10%;
          bottom: -150px;

          border-radius: 50%;

          background:
            rgba(103,232,249,.13);

          filter: blur(55px);
        }

        .about-ios-cta-content {
          position: relative;
          z-index: 2;

          max-width: 800px;
          margin: 0 auto;

          text-align: center;
        }

        .about-ios-cta-icon {
          width: 58px;
          height: 58px;

          margin: 0 auto;

          border-radius: 18px;

          display: flex;
          align-items: center;
          justify-content: center;

          background:
            rgba(255,255,255,.11);

          border:
            1px solid
            rgba(255,255,255,.18);

          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);

          animation:
            aboutCtaIcon
            3s
            ease-in-out
            infinite;
        }

        @keyframes aboutCtaIcon {
          0%,100% {
            transform:
              translateY(0)
              rotate(0deg);
          }

          50% {
            transform:
              translateY(-8px)
              rotate(6deg);
          }
        }

        .about-ios-cta-title {
          margin-top: 20px;

          font-size: clamp(
            2.1rem,
            5vw,
            3.7rem
          );

          line-height: 1.05;
          letter-spacing: -.04em;

          font-weight: 900;
        }

        .about-ios-cta-text {
          max-width: 620px;

          margin: 17px auto 0;

          color: rgba(255,255,255,.82);

          font-size: 15px;
          line-height: 1.75;
        }

        .about-ios-cta-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;

          margin-top: 25px;

          min-height: 50px;
          padding: 0 19px;

          border-radius: 16px;

          background: white;
          color: #2563eb;

          text-decoration: none;

          font-size: 13px;
          font-weight: 850;

          box-shadow:
            0 15px 40px
            rgba(0,0,0,.18);

          transition:
            transform .35s ease,
            box-shadow .35s ease;
        }

        .about-ios-cta-button:hover {
          box-shadow:
            0 22px 50px
            rgba(0,0,0,.24);
        }

        /* =================================================
           FOOTER
        ================================================= */

        .about-ios-footer {
          padding: 44px 0 28px;

          background:
            linear-gradient(
              180deg,
              #05070d,
              #03050a
            );

          color: white;
        }

        .about-ios-footer-content {
          text-align: center;
        }

        .about-ios-footer-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;

          gap: 8px;
        }

        .about-ios-footer-brand svg {
          color: #22d3ee;
        }

        .about-ios-footer-brand h2 {
          margin: 0;

          color: #67e8f9;

          font-size: 23px;
          font-weight: 900;
        }

        .about-ios-footer-brand span {
          width: 100%;

          margin-top: -1px;

          color: #64748b;

          font-size: 9px;
          font-weight: 700;

          letter-spacing: .18em;

          text-transform: uppercase;
        }

        .about-ios-footer-details {
          display: grid;
          gap: 9px;

          margin-top: 23px;
        }

        .about-ios-footer-details p,
        .about-ios-footer-details a {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          margin: 0;

          color: #94a3b8;

          font-size: 12px;

          text-decoration: none;

          transition:
            color .25s ease;
        }

        .about-ios-footer-details a:hover {
          color: white;
        }

        .about-ios-footer-bottom {
          margin-top: 23px;

          padding-top: 17px;

          border-top:
            1px solid
            rgba(255,255,255,.06);

          color: #475569;

          font-size: 10px;
        }

        /* =================================================
           TABLET
        ================================================= */

        @media (max-width: 1050px) {

          .about-ios-hero-grid {
            gap: 45px;
          }

          .about-ios-two-column {
            gap: 55px;
          }

          .about-ios-cards {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

          .about-ios-cards
          .about-ios-card:last-child {
            grid-column: 1 / -1;
            max-width: 50%;
            margin: 0 auto;
            width: 100%;
          }

        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 900px) {

          .about-ios-hero {
            padding-top: 78px;
            padding-bottom: 62px;
          }

          .about-ios-hero-grid {
            grid-template-columns: 1fr;
            gap: 45px;
          }

          .about-ios-image-shell {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
          }

          .about-ios-two-column {
            grid-template-columns: 1fr;
            gap: 48px;
          }

          .about-ios-cards {
            grid-template-columns: 1fr;
          }

          .about-ios-cards
          .about-ios-card:last-child {
            grid-column: auto;
            max-width: none;
          }

        }

        /* =================================================
           SMALL MOBILE
        ================================================= */

        @media (max-width: 640px) {

          .about-ios-container {
            padding-left: 15px;
            padding-right: 15px;
          }

          .about-ios-hero {
            padding-top: 72px;
            padding-bottom: 58px;
          }

          .about-ios-chip {
            padding: 7px 10px;
            font-size: 10px;
          }

          .about-ios-hero-title {
            font-size: 3.05rem;
          }

          .about-ios-hero-description {
            font-size: 14px;
            line-height: 1.75;
          }

          .about-ios-feature-row {
            gap: 7px;
          }

          .about-ios-feature {
            font-size: 10px;
            padding: 7px 9px;
          }

          .about-ios-hero-actions {
            flex-direction: column;
          }

          .about-ios-primary-btn,
          .about-ios-secondary-btn {
            width: 100%;
          }

          .about-ios-image-shell {
            padding: 8px;
            border-radius: 27px;
          }

          .about-ios-window-bar {
            height: 21px;
          }

          .about-ios-image-wrap {
            border-radius: 21px;
          }

          .about-ios-hero-image {
            height: 350px;
          }

          .about-ios-trust {
            left: 11px;
            bottom: 11px;
            padding: 8px 10px;
          }

          .about-ios-trust-icon {
            width: 31px;
            height: 31px;
          }

          .about-ios-section {
            padding: 76px 0;
          }

          .about-ios-secondary-card {
            padding: 7px;
            border-radius: 26px;
          }

          .about-ios-secondary-card img {
            height: 370px;
            border-radius: 21px;
          }

          .about-ios-experience {
            left: 14px;
            bottom: 14px;
            padding: 11px 14px;
            border-radius: 17px;
          }

          .about-ios-text {
            font-size: 14px;
            line-height: 1.8;
          }

          .about-ios-check {
            padding: 9px 10px;
          }

          .about-ios-check > span:last-child {
            font-size: 12px;
          }

          .about-ios-stats {
            padding: 50px 0;
          }

          .about-ios-stats-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
            gap: 6px;
          }

          .about-ios-stat {
            padding: 15px 5px;
          }

          .about-ios-stat h3 {
            font-size: 2rem;
          }

          .about-ios-why {
            padding: 75px 0;
          }

          .about-ios-cards {
            margin-top: 30px;
          }

          .about-ios-card {
            min-height: auto;
            padding: 22px;
            border-radius: 22px;
          }

          .about-ios-card h3 {
            font-size: 18px;
          }

          .about-ios-card p {
            font-size: 13px;
          }

          .about-ios-cta {
            padding: 62px 0;
          }

          .about-ios-cta-title {
            font-size: 2.25rem;
          }

          .about-ios-cta-text {
            font-size: 13px;
          }

          .about-ios-footer {
            padding: 36px 0 25px;
          }

          .about-ios-footer-brand h2 {
            font-size: 19px;
          }

        }

        /* =================================================
           SMALL iPHONE
        ================================================= */

        @media (max-width: 390px) {

          .about-ios-container {
            padding-left: 12px;
            padding-right: 12px;
          }

          .about-ios-hero-title {
            font-size: 2.65rem;
          }

          .about-ios-hero-description {
            font-size: 13px;
          }

          .about-ios-feature-row {
            flex-direction: column;
            align-items: stretch;
          }

          .about-ios-feature {
            justify-content: center;
          }

          .about-ios-image-shell {
            border-radius: 24px;
          }

          .about-ios-hero-image {
            height: 315px;
          }

          .about-ios-secondary-card {
            border-radius: 23px;
          }

          .about-ios-secondary-card img {
            height: 330px;
          }

          .about-ios-section-title {
            font-size: 2.15rem;
          }

          .about-ios-stat h3 {
            font-size: 1.8rem;
          }

          .about-ios-stat p {
            font-size: 10px;
          }

          .about-ios-cta-title {
            font-size: 2rem;
          }

          .about-ios-footer-brand h2 {
            font-size: 17px;
          }

        }

        /* =================================================
           VERY SMALL
        ================================================= */

        @media (max-width: 340px) {

          .about-ios-hero-title {
            font-size: 2.4rem;
          }

          .about-ios-chip {
            font-size: 9px;
          }

          .about-ios-card {
            padding: 19px;
          }

          .about-ios-check {
            gap: 8px;
          }

          .about-ios-check > span:last-child {
            font-size: 11px;
          }

        }

        /* =================================================
           TOUCH DEVICES
        ================================================= */

        @media (hover: none) {

          .about-ios-primary-btn:hover,
          .about-ios-secondary-btn:hover,
          .about-ios-card:hover,
          .about-ios-secondary-card:hover {
            transform: none;
          }

        }

        /* =================================================
           REDUCED MOTION
        ================================================= */

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