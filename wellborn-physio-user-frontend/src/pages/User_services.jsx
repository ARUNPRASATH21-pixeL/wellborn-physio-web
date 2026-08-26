import React, { useEffect, useState } from "react";
import { API, getData } from "../services/api";
import { motion } from "framer-motion";

import {
  HeartPulse,
  Activity,
  Stethoscope,
  Dumbbell,
  Brain,
  Baby,
  Trophy,
  Bone,
  ArrowRight,
  CheckCircle2,
  Phone,
  MapPin,
  ShieldCheck,
} from "lucide-react";

/* =====================================================
   ANIMATIONS
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
    filter: "blur(7px)",
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
   SERVICES DATA
===================================================== */

const fallbackServiceIcons = [
  Bone,
  Brain,
  Baby,
  Trophy,
  Activity,
  Dumbbell,
];

/* =====================================================
   IMAGE URL HELPER
===================================================== */

const getServiceImage = (service) => {
  if (!service) return null;

  const image =
    service.imageUrl ??
    service.image ??
    service.imagePath ??
    service.photoUrl ??
    service.photo ??
    service.imageName ??
    service.fileUrl ??
    service.fileName ??
    null;

  if (image === null || image === undefined) {
    console.log("❌ No image field found for service:", service);
    return null;
  }

  let imageString = String(image).trim();

  if (!imageString) {
    return null;
  }

  console.log("🖼️ Original service image:", imageString);

  /* =====================================================
     DATA IMAGE
  ===================================================== */

  if (imageString.startsWith("data:image/")) {
    return imageString;
  }

  /* =====================================================
     COMPLETE URL
  ===================================================== */

  if (
    imageString.startsWith("http://") ||
    imageString.startsWith("https://")
  ) {
    return imageString;
  }

  /* =====================================================
     BACKEND BASE URL
  ===================================================== */

  const baseUrl =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8080";

  const cleanBase = String(baseUrl).replace(/\/+$/, "");

  /* =====================================================
     NORMALIZE IMAGE PATH
  ===================================================== */

  imageString = imageString
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  const finalUrl = `${cleanBase}/${imageString}`;

  console.log("✅ Final service image URL:", finalUrl);

  return finalUrl;
};

/* =====================================================
   SERVICES PAGE
===================================================== */

export default function Services() {
  const [services, setServices] = useState([]);

  const [imageErrors, setImageErrors] = useState({});

  /* =====================================================
     LOAD SERVICES
  ===================================================== */

  useEffect(() => {
    console.log("==========================================");
    console.log("SERVICE API:", API.SERVICE_GET_ALL);
    console.log("==========================================");

    let mounted = true;

    getData(API.SERVICE_GET_ALL)
      .then((data) => {
        console.log("SERVICE API RESPONSE:", data);
        console.log("FIRST SERVICE:", data?.[0]);

        if (!mounted) return;

        const list = Array.isArray(data) ? data : [];

        const publicServices = list.filter((x) => {
          if (!x) return false;

          const serviceName = String(
            x.serviceName ||
              x.name ||
              ""
          )
            .trim()
            .toLowerCase();

          const isNotOther =
            serviceName !== "other";

          const isActive =
            x.status !== false &&
            x.status !== "INACTIVE";

          return (
            isNotOther &&
            isActive
          );
        });

        console.log(
          "PUBLIC SERVICES:",
          publicServices
        );

        setServices(publicServices);
      })
      .catch((error) => {
        console.error(
          "❌ Failed to load services:",
          error
        );

        if (mounted) {
          setServices([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  /* =====================================================
     SERVICE CARDS
  ===================================================== */

  const serviceCards = services.map(
    (s, index) => ({
      id:
        s.id ??
        s.serviceId ??
        `${s.serviceName || s.name}-${index}`,

      icon:
        fallbackServiceIcons[
          index %
            fallbackServiceIcons.length
        ],

      title:
        s.serviceName ||
        s.name ||
        "Treatment",

      color:
        [
          "blue",
          "purple",
          "pink",
          "orange",
          "green",
          "cyan",
        ][index % 6],

      description:
        s.description ||
        s.details ||
        "Professional physiotherapy and care tailored for your recovery.",

      image:
        getServiceImage(s),

      points: [],
    })
  );

  /* =====================================================
     IMAGE ERROR
  ===================================================== */

  const handleImageError = (
    serviceId,
    event
  ) => {
    console.error(
      "❌ SERVICE IMAGE FAILED:",
      event?.currentTarget?.src
    );

    setImageErrors((previous) => ({
      ...previous,
      [serviceId]: true,
    }));
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <div className="services-ios-page">

      {/* =================================================
          HERO
      ================================================= */}

      <section className="services-ios-hero">

        <motion.div
          animate={{
            x: [0, 40, 0],
            y: [0, -25, 0],
            scale: [1, 1.12, 1],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="services-ios-orb services-ios-orb-one"
        />

        <motion.div
          animate={{
            x: [0, -35, 0],
            y: [0, 30, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="services-ios-orb services-ios-orb-two"
        />

        <motion.div
          animate={{
            x: [0, 22, -15, 0],
            y: [0, -18, 15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="services-ios-orb services-ios-orb-three"
        />

        <div className="services-ios-grid-overlay" />

        <div className="services-ios-container">

          <div className="services-ios-hero-grid">

            {/* LEFT */}

            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="relative z-10"
            >

              <motion.div
                variants={fadeLeft}
                className="services-ios-chip"
              >

                <span className="services-ios-chip-icon">
                  <HeartPulse size={15} />
                </span>

                <span>
                  Professional Physiotherapy
                </span>

              </motion.div>

              <motion.h1
                variants={fadeLeft}
                className="services-ios-hero-title"
              >
                Our
                <span>
                  Physiotherapy Services
                </span>
              </motion.h1>

              <motion.p
                variants={fadeLeft}
                className="services-ios-hero-description"
              >
                Personalized physiotherapy and
                rehabilitation services designed to
                reduce pain, restore movement and
                improve your quality of life.
              </motion.p>

              <motion.div
                variants={fadeLeft}
                className="services-ios-feature-row"
              >

                <span className="services-ios-feature">
                  <ShieldCheck size={14} />
                  Trusted Care
                </span>

                <span className="services-ios-feature">
                  <Activity size={14} />
                  Modern Treatment
                </span>

                <span className="services-ios-feature">
                  <HeartPulse size={14} />
                  Patient First
                </span>

              </motion.div>

              <motion.div
                variants={fadeLeft}
                className="services-ios-actions"
              >

                <a
                  href="/user/appointment"
                  className="services-ios-primary-btn"
                >
                  Book Appointment
                  <ArrowRight size={17} />
                </a>

                <a
                  href="#services-list"
                  className="services-ios-secondary-btn"
                >
                  Explore Services
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

              <div className="services-ios-image-glow" />

              <motion.div
                whileHover={{
                  y: -10,
                  rotateX: 2,
                  rotateY: -2,
                  scale: 1.015,
                }}
                className="services-ios-image-shell"
              >

                <div className="services-ios-window-bar">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="services-ios-image-wrap">

                  <motion.img
                    src="/images/services.jpeg"
                    alt="Physiotherapy Services"
                    onError={(event) => {
                      console.error(
                        "❌ HERO IMAGE NOT FOUND:",
                        event.currentTarget.src
                      );
                    }}
                    onLoad={(event) => {
                      console.log(
                        "✅ HERO IMAGE LOADED:",
                        event.currentTarget.src
                      );
                    }}
                    animate={{
                      y: [0, -7, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="services-ios-hero-image"
                  />

                  <div className="services-ios-image-shine" />

                  <div className="services-ios-floating-card">

                    <div className="services-ios-floating-icon">
                      <HeartPulse size={18} />
                    </div>

                    <div>
                      <strong>
                        Patient First
                      </strong>

                      <span>
                        Personalized Care
                      </span>
                    </div>

                  </div>

                </div>

              </motion.div>

            </motion.div>

          </div>

        </div>

      </section>

      {/* =================================================
          SERVICE INTRO
      ================================================= */}

      <section className="services-ios-intro">

        <div className="services-ios-container">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.25,
            }}
            variants={stagger}
            className="services-ios-centered-heading"
          >

            <motion.div
              variants={fadeUp}
              className="services-ios-section-tag"
            >
              <Stethoscope size={15} />
              OUR SERVICES
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="services-ios-section-title centered"
            >
              Complete Physiotherapy Care
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="services-ios-subtitle"
            >
              We provide personalized treatment and
              rehabilitation programs designed around
              your condition, mobility and recovery goals.
            </motion.p>

          </motion.div>

        </div>

      </section>

      {/* =================================================
          SERVICES GRID
      ================================================= */}

      <section
        id="services-list"
        className="services-ios-list-section"
      >

        <div className="services-ios-container">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.12,
            }}
            variants={stagger}
            className="services-ios-grid"
          >

            {serviceCards.length === 0 ? (

              <motion.div
                variants={cardAnimation}
                className="services-ios-empty"
              >

                <div className="services-ios-empty-icon">
                  <Stethoscope size={30} />
                </div>

                <h3>
                  No Services Available
                </h3>

                <p>
                  Services will appear here once
                  they are added by the administrator.
                </p>

              </motion.div>

            ) : (

              serviceCards.map((service) => {

                const Icon = service.icon;

                const showImage =
                  service.image &&
                  !imageErrors[service.id];

                return (

                  <motion.div
                    key={service.id}
                    variants={cardAnimation}
                    whileHover={{
                      y: -13,
                      scale: 1.015,
                    }}
                    className="services-ios-card"
                  >

                    {/* =================================================
                        IMAGE
                        IMAGE REMAINS EXACTLY
                        BUT ICON IS NOT ON IMAGE
                    ================================================= */}

                    {showImage && (

                      <div className="services-ios-card-image">

                        <motion.img
                          src={service.image}
                          alt={service.title}
                          loading="lazy"
                          onLoad={(event) => {
                            console.log(
                              "✅ SERVICE IMAGE LOADED:",
                              service.title,
                              event.currentTarget.src
                            );
                          }}
                          onError={(event) =>
                            handleImageError(
                              service.id,
                              event
                            )
                          }
                          whileHover={{
                            scale: 1.05,
                          }}
                        />

                        <div className="services-ios-card-image-overlay" />

                        <div className="services-ios-card-image-badge">
                          <HeartPulse size={13} />
                          Professional Care
                        </div>

                      </div>

                    )}

                    {/* =================================================
                        SERVICE NAME
                        ICON BEFORE SERVICE NAME
                    ================================================= */}

                    <div className="services-ios-service-title">

                      <div
                        className={`services-ios-card-icon ${service.color}`}
                      >

                        <motion.div
                          whileHover={{
                            rotate: -8,
                            scale: 1.12,
                          }}
                        >

                          <Icon size={21} />

                        </motion.div>

                      </div>

                      <h3>
                        {service.title}
                      </h3>

                    </div>

                    {/* =================================================
                        DESCRIPTION
                    ================================================= */}

                    <p className="services-ios-card-description">
                      {service.description}
                    </p>

                    {/* =================================================
                        POINTS
                    ================================================= */}

                    <div className="services-ios-point-list">

                      {service.points.map(
                        (point) => (

                          <div
                            key={point}
                            className="services-ios-point"
                          >

                            <span>
                              <CheckCircle2
                                size={16}
                              />
                            </span>

                            <p>
                              {point}
                            </p>

                          </div>

                        )
                      )}

                    </div>

                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <div className="services-ios-card-footer">

                      <span>
                        Learn More
                      </span>

                      <span className="services-ios-card-arrow">
                        <ArrowRight size={14} />
                      </span>

                    </div>

                    <div className="services-ios-card-line" />

                  </motion.div>

                );

              })

            )}

          </motion.div>

        </div>

      </section>

      {/* =================================================
          CARE STRIP
      ================================================= */}

      <section className="services-ios-care-strip">

        <div className="services-ios-container">

          <motion.div
            initial={{
              opacity: 0,
              y: 35,
              scale: 0.97,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            viewport={{
              once: true,
              amount: 0.3,
            }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="services-ios-care-card"
          >

            <div className="services-ios-care-icon">
              <ShieldCheck size={25} />
            </div>

            <div>

              <h3>
                Every treatment is designed around you.
              </h3>

              <p>
                Personalized care, professional guidance
                and a recovery plan that fits your needs.
              </p>

            </div>

            <motion.a
              href="/user/appointment"
              whileHover={{
                scale: 1.04,
                y: -2,
              }}
              whileTap={{
                scale: 0.97,
              }}
              className="services-ios-care-btn"
            >
              Get Started
              <ArrowRight size={16} />
            </motion.a>

          </motion.div>

        </div>

      </section>

      {/* =================================================
          CTA
      ================================================= */}

      <section className="services-ios-cta">

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
          className="services-ios-cta-ring"
        />

        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="services-ios-cta-glow"
        />

        <div className="services-ios-container">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.3,
            }}
            variants={stagger}
            className="services-ios-cta-content"
          >

            <motion.div
              variants={fadeUp}
              className="services-ios-cta-icon"
            >
              <HeartPulse size={29} />
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="services-ios-cta-title"
            >
              Ready To Start Your Recovery?
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="services-ios-cta-text"
            >
              Take the first step towards better mobility,
              less pain and a healthier lifestyle.
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
              className="services-ios-cta-button"
            >
              Book Your Appointment
              <ArrowRight size={17} />
            </motion.a>

          </motion.div>

        </div>

      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="services-ios-footer">

        <div className="services-ios-container">

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
            className="services-ios-footer-content"
          >

            <div className="services-ios-footer-brand">

              <HeartPulse size={25} />

              <h2>
                Wellborn Physio
              </h2>

              <span>
                Rehab & Centre
              </span>

            </div>

            <div className="services-ios-footer-details">

              <p>
                <MapPin size={15} />
                Karayanchavadi, Poonamallee, Chennai
              </p>

              <a href="tel:+919342752147">
                <Phone size={15} />
                +91 93427 52147
              </a>

            </div>

            <div className="services-ios-footer-bottom">
              © {new Date().getFullYear()} Wellborn Physio.
              All Rights Reserved.
            </div>

          </motion.div>

        </div>

      </footer>

      {/* =================================================
          STYLES
      ================================================= */}

      <style>{`

        .services-ios-page {
          width: 100%;
          min-height: 100%;
          overflow-x: clip;
          background: #f5f7fb;
          color: #111827;
        }

        .dark .services-ios-page {
          background: #05070d;
          color: #f8fafc;
        }

        .services-ios-container {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 22px;
        }

        /* =================================================
           HERO
        ================================================= */

        .services-ios-hero {
          position: relative;
          overflow: hidden;
          padding: 90px 0 78px;
          color: white;

          background:
            radial-gradient(
              circle at 12% 20%,
              rgba(255,255,255,.15),
              transparent 23%
            ),
            radial-gradient(
              circle at 86% 15%,
              rgba(103,232,249,.16),
              transparent 25%
            ),
            linear-gradient(
              135deg,
              #1746d2,
              #2563eb 48%,
              #06b6d4
            );
        }

        .services-ios-grid-overlay {
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

          mask-image:
            linear-gradient(
              to bottom,
              black,
              transparent
            );

          pointer-events: none;
        }

        .services-ios-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .services-ios-orb-one {
          width: 270px;
          height: 270px;
          top: -100px;
          left: -85px;
          background: rgba(255,255,255,.09);
          filter: blur(3px);
        }

        .services-ios-orb-two {
          width: 350px;
          height: 350px;
          right: -130px;
          bottom: -150px;
          background: rgba(103,232,249,.13);
          filter: blur(3px);
        }

        .services-ios-orb-three {
          width: 140px;
          height: 140px;
          top: 22%;
          left: 47%;
          background: rgba(255,255,255,.05);
          filter: blur(2px);
        }

        .services-ios-hero-grid {
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

        .services-ios-chip {
          display: inline-flex;
          align-items: center;
          gap: 9px;

          padding: 8px 12px;

          border-radius: 999px;

          background: rgba(255,255,255,.11);

          border:
            1px solid
            rgba(255,255,255,.22);

          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);

          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.25),
            0 10px 30px rgba(0,0,0,.10);

          font-size: 12px;
          font-weight: 700;
        }

        .services-ios-chip-icon {
          width: 25px;
          height: 25px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            rgba(255,255,255,.15);
        }

        .services-ios-hero-title {
          margin-top: 22px;

          font-size:
            clamp(
              3rem,
              6vw,
              5.2rem
            );

          line-height: .96;
          letter-spacing: -.06em;
          font-weight: 900;
        }

        .services-ios-hero-title span {
          display: block;
          margin-top: 10px;
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

        .services-ios-hero-description {
          max-width: 610px;
          margin-top: 24px;

          color:
            rgba(255,255,255,.86);

          font-size: 16px;
          line-height: 1.8;
        }

        .services-ios-feature-row {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 24px;
        }

        .services-ios-feature {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          padding: 8px 11px;

          border-radius: 999px;

          background:
            rgba(255,255,255,.09);

          border:
            1px solid
            rgba(255,255,255,.17);

          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);

          font-size: 11px;
          font-weight: 700;
        }

        .services-ios-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 11px;
          margin-top: 28px;
        }

        .services-ios-primary-btn,
        .services-ios-secondary-btn {
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

        .services-ios-primary-btn {
          color: #1750d5;
          background: rgba(255,255,255,.97);

          box-shadow:
            0 14px 35px rgba(0,0,0,.18);
        }

        .services-ios-primary-btn:hover {
          transform:
            translateY(-4px)
            scale(1.02);

          box-shadow:
            0 22px 50px rgba(0,0,0,.22);
        }

        .services-ios-secondary-btn {
          color: white;

          background:
            rgba(255,255,255,.09);

          border:
            1px solid
            rgba(255,255,255,.22);

          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
        }

        .services-ios-secondary-btn:hover {
          transform: translateY(-3px);

          background:
            rgba(255,255,255,.15);
        }

        /* =================================================
           HERO IMAGE
        ================================================= */

        .services-ios-image-glow {
          position: absolute;
          inset: 8%;

          border-radius: 50%;

          background:
            rgba(103,232,249,.25);

          filter: blur(75px);
        }

        .services-ios-image-shell {
          position: relative;
          z-index: 2;

          width: min(100%,570px);
          margin-left: auto;

          padding: 10px;

          border-radius: 33px;

          background:
            rgba(255,255,255,.12);

          border:
            1px solid
            rgba(255,255,255,.22);

          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);

          box-shadow:
            0 35px 90px rgba(0,0,0,.22);

          transform-style: preserve-3d;

          transition:
            transform .7s
            cubic-bezier(.16,1,.3,1),
            box-shadow .7s ease;
        }

        .services-ios-window-bar {
          height: 25px;

          display: flex;
          align-items: center;

          gap: 6px;
          padding-left: 7px;
        }

        .services-ios-window-bar span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .services-ios-window-bar span:nth-child(1) {
          background: #ff5f57;
        }

        .services-ios-window-bar span:nth-child(2) {
          background: #ffbd2e;
        }

        .services-ios-window-bar span:nth-child(3) {
          background: #28c840;
        }

        .services-ios-image-wrap {
          position: relative;
          overflow: hidden;
          border-radius: 26px;
        }

        .services-ios-hero-image {
          display: block;

          width: 100%;

          height:
            clamp(
              320px,
              44vw,
              510px
            );

          object-fit: cover;
        }

        .services-ios-image-shine {
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
            servicesImageShine
            6s
            ease-in-out
            infinite;

          pointer-events: none;
        }

        @keyframes servicesImageShine {
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

        .services-ios-floating-card {
          position: absolute;

          left: 16px;
          bottom: 16px;

          display: flex;
          align-items: center;

          gap: 10px;

          padding:
            10px 12px;

          border-radius: 17px;

          background:
            rgba(255,255,255,.92);

          color: #111827;

          box-shadow:
            0 15px 40px
            rgba(0,0,0,.18);

          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);

          animation:
            servicesFloatingCard
            4.5s
            ease-in-out
            infinite;
        }

        .services-ios-floating-icon {
          width: 35px;
          height: 35px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          color: #2563eb;
          background: #eef4ff;
        }

        .services-ios-floating-card strong {
          display: block;
          font-size: 12px;
        }

        .services-ios-floating-card span {
          display: block;

          margin-top: 2px;

          color: #64748b;
          font-size: 9px;
        }

        @keyframes servicesFloatingCard {
          0%,100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-7px);
          }
        }

        /* =================================================
           INTRO
        ================================================= */

        .services-ios-intro {
          padding:
            85px 0 20px;

          background:
            linear-gradient(
              180deg,
              #f7f9fc,
              #f5f7fb
            );
        }

        .dark .services-ios-intro {
          background:
            linear-gradient(
              180deg,
              #05070d,
              #07101b
            );
        }

        .services-ios-centered-heading {
          max-width: 780px;
          margin: 0 auto;
          text-align: center;
        }

        .services-ios-section-tag {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          color: #2563eb;

          font-size: 11px;
          font-weight: 800;

          letter-spacing: .13em;
          text-transform: uppercase;
        }

        .dark .services-ios-section-tag {
          color: #60a5fa;
        }

        .services-ios-section-title {
          margin-top: 15px;

          color: #111827;

          font-size:
            clamp(
              2.2rem,
              4vw,
              3.7rem
            );

          line-height: 1.08;
          letter-spacing: -.045em;
          font-weight: 900;
        }

        .dark .services-ios-section-title {
          color: white;
        }

        .services-ios-section-title.centered {
          text-align: center;
        }

        .services-ios-subtitle {
          max-width: 640px;

          margin: 15px auto 0;

          color: #64748b;

          font-size: 14px;
          line-height: 1.8;
        }

        .dark .services-ios-subtitle {
          color: #94a3b8;
        }

        /* =================================================
           SERVICE LIST
        ================================================= */

        .services-ios-list-section {
          padding:
            45px 0 95px;

          background:
            #f5f7fb;
        }

        .dark .services-ios-list-section {
          background:
            #07101b;
        }

        .services-ios-grid {
          display: grid;

          grid-template-columns:
            repeat(3,minmax(0,1fr));

          gap: 18px;
        }

        .services-ios-card {
          position: relative;
          overflow: hidden;

          min-height: 330px;

          padding: 26px;

          border-radius: 27px;

          background:
            rgba(255,255,255,.80);

          border:
            1px solid
            rgba(255,255,255,.95);

          box-shadow:
            0 20px 55px
            rgba(15,23,42,.07);

          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);

          transition:
            transform .6s
            cubic-bezier(.16,1,.3,1),
            box-shadow .6s ease,
            border-color .35s ease;

          transform-style: preserve-3d;
        }

        .dark .services-ios-card {
          background:
            rgba(15,23,42,.82);

          border-color:
            rgba(71,85,105,.55);

          box-shadow:
            0 20px 55px
            rgba(0,0,0,.25);
        }

        .services-ios-card::before {
          content: "";

          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              135deg,
              rgba(59,130,246,.08),
              transparent 45%,
              rgba(34,211,238,.08)
            );

          opacity: 0;

          transition:
            opacity .45s ease;

          pointer-events: none;
        }

        .services-ios-card:hover::before {
          opacity: 1;
        }

        /* =================================================
           SERVICE IMAGE
           IMAGE ONLY
           NO SERVICE ICON HERE
        ================================================= */

        .services-ios-card-image {
          position: relative;
          z-index: 2;

          width: 100%;
          height: 190px;

          margin-bottom: 0;

          overflow: hidden;

          border-radius: 20px;

          background:
            #eef4ff;

          box-shadow:
            0 12px 30px
            rgba(15,23,42,.08);
        }

        .services-ios-card-image img {
          display: block;

          width: 100%;
          height: 100%;

          object-fit: cover;

          transition:
            transform .55s
            cubic-bezier(.16,1,.3,1);
        }

        .services-ios-card:hover
        .services-ios-card-image img {
          transform: scale(1.05);
        }

        .services-ios-card-image-overlay {
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              180deg,
              transparent 50%,
              rgba(0,0,0,.32)
            );

          pointer-events: none;
        }

        .services-ios-card-image-badge {
          position: absolute;

          left: 12px;
          bottom: 12px;

          display: inline-flex;
          align-items: center;

          gap: 6px;

          padding:
            7px 10px;

          border-radius: 999px;

          color: white;

          background:
            rgba(15,23,42,.58);

          border:
            1px solid
            rgba(255,255,255,.22);

          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);

          font-size: 9px;
          font-weight: 800;

          box-shadow:
            0 8px 20px
            rgba(0,0,0,.12);
        }

        .dark .services-ios-card-image {
          background:
            #111827;

          box-shadow:
            0 12px 30px
            rgba(0,0,0,.25);
        }

        /* =================================================
           SERVICE NAME + ICON
           ICON IS BEFORE SERVICE NAME
        ================================================= */

        .services-ios-service-title {
          position: relative;
          z-index: 3;

          display: flex;
          align-items: center;

          gap: 11px;

          width: 100%;

          margin-top: 20px;
        }

        .services-ios-service-title h3 {
          margin: 0;

          min-width: 0;

          color: #111827;

          font-size: 19px;
          line-height: 1.35;
          font-weight: 850;

          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .dark .services-ios-service-title h3 {
          color: white;
        }

        /* =================================================
           SERVICE ICON
        ================================================= */

        .services-ios-service-title
        .services-ios-card-icon {
          position: relative;

          left: auto;
          bottom: auto;

          z-index: 3;

          width: 48px;
          height: 48px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 15px;

          margin: 0;

          border: 0;

          box-shadow:
            0 8px 20px
            rgba(15,23,42,.10);

          transition:
            transform .45s
            cubic-bezier(.16,1,.3,1);
        }

        .services-ios-service-title
        .services-ios-card-icon.blue {
          color: #2563eb;
          background: #eef4ff;
        }

        .services-ios-service-title
        .services-ios-card-icon.purple {
          color: #7c3aed;
          background: #f3efff;
        }

        .services-ios-service-title
        .services-ios-card-icon.pink {
          color: #db2777;
          background: #fdf2f8;
        }

        .services-ios-service-title
        .services-ios-card-icon.orange {
          color: #ea580c;
          background: #fff7ed;
        }

        .services-ios-service-title
        .services-ios-card-icon.green {
          color: #16a34a;
          background: #ecfdf5;
        }

        .services-ios-service-title
        .services-ios-card-icon.cyan {
          color: #0891b2;
          background: #ecfeff;
        }

        .dark .services-ios-service-title
        .services-ios-card-icon.blue {
          background:
            rgba(37,99,235,.14);
        }

        .dark .services-ios-service-title
        .services-ios-card-icon.purple {
          background:
            rgba(124,58,237,.14);
        }

        .dark .services-ios-service-title
        .services-ios-card-icon.pink {
          background:
            rgba(219,39,119,.12);
        }

        .dark .services-ios-service-title
        .services-ios-card-icon.orange {
          background:
            rgba(234,88,12,.12);
        }

        .dark .services-ios-service-title
        .services-ios-card-icon.green {
          background:
            rgba(22,163,74,.12);
        }

        .dark .services-ios-service-title
        .services-ios-card-icon.cyan {
          background:
            rgba(8,145,178,.12);
        }

        /* =================================================
           CARD DESCRIPTION
        ================================================= */

        .services-ios-card-description {
          position: relative;
          z-index: 2;

          margin-top: 12px;

          color: #64748b;

          font-size: 13px;
          line-height: 1.8;
        }

        .dark .services-ios-card-description {
          color: #cbd5e1;
        }

        /* =================================================
           POINT LIST
        ================================================= */

        .services-ios-point-list {
          position: relative;
          z-index: 2;

          display: grid;
          gap: 8px;

          margin-top: 18px;
        }

        .services-ios-point {
          display: flex;
          align-items: center;

          gap: 8px;
        }

        .services-ios-point span {
          width: 27px;
          height: 27px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 9px;

          color: #16a34a;
          background: #ecfdf5;
        }

        .dark .services-ios-point span {
          background:
            rgba(22,163,74,.11);
        }

        .services-ios-point p {
          margin: 0;

          color: #475569;

          font-size: 12px;
          line-height: 1.4;
        }

        .dark .services-ios-point p {
          color: #cbd5e1;
        }

        /* =================================================
           CARD FOOTER
        ================================================= */

        .services-ios-card-footer {
          position: relative;
          z-index: 2;

          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-top: 21px;

          color: #2563eb;

          font-size: 12px;
          font-weight: 800;
        }

        .dark .services-ios-card-footer {
          color: #60a5fa;
        }

        .services-ios-card-arrow {
          width: 31px;
          height: 31px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #eef4ff;

          transition:
            transform .35s ease;
        }

        .dark .services-ios-card-arrow {
          background:
            rgba(37,99,235,.14);
        }

        .services-ios-card:hover
        .services-ios-card-arrow {
          transform:
            translateX(5px);
        }

        .services-ios-card-line {
          position: absolute;

          left: 0;
          bottom: 0;

          width: 0;
          height: 4px;

          background:
            linear-gradient(
              90deg,
              #2563eb,
              #06b6d4
            );

          transition:
            width .55s
            cubic-bezier(.16,1,.3,1);
        }

        .services-ios-card:hover
        .services-ios-card-line {
          width: 100%;
        }

        /* =================================================
           EMPTY STATE
        ================================================= */

        .services-ios-empty {
          grid-column: 1 / -1;

          min-height: 250px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          text-align: center;

          padding: 35px;

          border-radius: 27px;

          background:
            rgba(255,255,255,.8);

          border:
            1px solid
            rgba(255,255,255,.95);

          box-shadow:
            0 20px 55px
            rgba(15,23,42,.07);
        }

        .services-ios-empty-icon {
          width: 65px;
          height: 65px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 20px;

          color: #2563eb;
          background: #eef4ff;

          margin-bottom: 15px;
        }

        .services-ios-empty h3 {
          margin: 0;

          font-size: 20px;
          font-weight: 850;

          color: #111827;
        }

        .services-ios-empty p {
          max-width: 450px;

          margin-top: 8px;

          color: #64748b;

          font-size: 13px;
          line-height: 1.7;
        }

        .dark .services-ios-empty {
          background:
            rgba(15,23,42,.82);

          border-color:
            rgba(71,85,105,.55);
        }

        .dark .services-ios-empty h3 {
          color: white;
        }

        .dark .services-ios-empty p {
          color: #94a3b8;
        }

        /* =================================================
           CARE STRIP
        ================================================= */

        .services-ios-care-strip {
          padding:
            10px 0 100px;

          background:
            #f5f7fb;
        }

        .dark .services-ios-care-strip {
          background:
            #07101b;
        }

        .services-ios-care-card {
          display: grid;

          grid-template-columns:
            auto
            minmax(0,1fr)
            auto;

          gap: 18px;

          align-items: center;

          padding: 22px 24px;

          border-radius: 25px;

          background:
            rgba(255,255,255,.78);

          border:
            1px solid
            rgba(255,255,255,.94);

          box-shadow:
            0 18px 50px
            rgba(15,23,42,.07);

          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
        }

        .dark .services-ios-care-card {
          background:
            rgba(15,23,42,.82);

          border-color:
            rgba(71,85,105,.55);

          box-shadow:
            0 18px 50px
            rgba(0,0,0,.24);
        }

        .services-ios-care-icon {
          width: 52px;
          height: 52px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 16px;

          color: #2563eb;
          background: #eef4ff;
        }

        .dark .services-ios-care-icon {
          background:
            rgba(37,99,235,.13);

          color: #60a5fa;
        }

        .services-ios-care-card h3 {
          margin: 0;

          color: #111827;

          font-size: 18px;
          font-weight: 850;
        }

        .dark .services-ios-care-card h3 {
          color: white;
        }

        .services-ios-care-card p {
          margin-top: 4px;

          color: #64748b;

          font-size: 12px;
          line-height: 1.6;
        }

        .dark .services-ios-care-card p {
          color: #94a3b8;
        }

        .services-ios-care-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          min-height: 45px;

          padding: 0 15px;

          border-radius: 14px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #06b6d4
            );

          text-decoration: none;

          font-size: 12px;
          font-weight: 800;

          box-shadow:
            0 10px 25px
            rgba(37,99,235,.18);
        }

        /* =================================================
           CTA
        ================================================= */

        .services-ios-cta {
          position: relative;
          overflow: hidden;

          padding: 78px 0;

          color: white;

          background:
            linear-gradient(
              135deg,
              #1746d2,
              #2563eb,
              #06b6d4
            );
        }

        .services-ios-cta-ring {
          position: absolute;

          width: 440px;
          height: 440px;

          right: -155px;
          top: -225px;

          border-radius: 50%;

          border:
            1px solid
            rgba(255,255,255,.15);
        }

        .services-ios-cta-glow {
          position: absolute;

          width: 290px;
          height: 290px;

          left: 8%;
          bottom: -150px;

          border-radius: 50%;

          background:
            rgba(103,232,249,.13);

          filter: blur(55px);
        }

        .services-ios-cta-content {
          position: relative;
          z-index: 2;

          max-width: 800px;

          margin: 0 auto;

          text-align: center;
        }

        .services-ios-cta-icon {
          width: 58px;
          height: 58px;

          margin: 0 auto;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 18px;

          background:
            rgba(255,255,255,.11);

          border:
            1px solid
            rgba(255,255,255,.18);

          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);

          animation:
            servicesCtaIcon
            3s
            ease-in-out
            infinite;
        }

        @keyframes servicesCtaIcon {
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

        .services-ios-cta-title {
          margin-top: 20px;

          font-size:
            clamp(
              2.1rem,
              5vw,
              3.6rem
            );

          line-height: 1.05;
          letter-spacing: -.04em;
          font-weight: 900;
        }

        .services-ios-cta-text {
          max-width: 620px;

          margin: 17px auto 0;

          color:
            rgba(255,255,255,.82);

          font-size: 15px;
          line-height: 1.75;
        }

        .services-ios-cta-button {
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

        .services-ios-cta-button:hover {
          box-shadow:
            0 22px 50px
            rgba(0,0,0,.24);
        }

        /* =================================================
           FOOTER
        ================================================= */

        .services-ios-footer {
          padding:
            44px 0 28px;

          background:
            linear-gradient(
              180deg,
              #05070d,
              #03050a
            );

          color: white;
        }

        .services-ios-footer-content {
          text-align: center;
        }

        .services-ios-footer-brand {
          display: flex;
          align-items: center;
          justify-content: center;

          flex-wrap: wrap;
          gap: 8px;
        }

        .services-ios-footer-brand svg {
          color: #22d3ee;
        }

        .services-ios-footer-brand h2 {
          margin: 0;

          color: #67e8f9;

          font-size: 23px;
          font-weight: 900;
        }

        .services-ios-footer-brand span {
          width: 100%;

          margin-top: -1px;

          color: #64748b;

          font-size: 9px;
          font-weight: 700;

          letter-spacing: .18em;

          text-transform: uppercase;
        }

        .services-ios-footer-details {
          display: grid;
          gap: 9px;

          margin-top: 23px;
        }

        .services-ios-footer-details p,
        .services-ios-footer-details a {
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

        .services-ios-footer-details a:hover {
          color: white;
        }

        .services-ios-footer-bottom {
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

          .services-ios-hero-grid {
            gap: 45px;
          }

          .services-ios-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 900px) {

          .services-ios-hero {
            padding-top: 78px;
            padding-bottom: 62px;
          }

          .services-ios-hero-grid {
            grid-template-columns: 1fr;
            gap: 45px;
          }

          .services-ios-image-shell {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
          }

          .services-ios-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

          .services-ios-care-card {
            grid-template-columns:
              auto
              minmax(0,1fr);
          }

          .services-ios-care-btn {
            grid-column: 1 / -1;
            justify-self: start;
          }

        }

        /* =================================================
           SMALL MOBILE
        ================================================= */

        @media (max-width: 640px) {

          .services-ios-container {
            padding-left: 15px;
            padding-right: 15px;
          }

          .services-ios-hero {
            padding-top: 72px;
            padding-bottom: 57px;
          }

          .services-ios-chip {
            padding: 7px 10px;
            font-size: 10px;
          }

          .services-ios-hero-title {
            font-size: 3rem;
          }

          .services-ios-hero-description {
            font-size: 14px;
            line-height: 1.75;
          }

          .services-ios-feature-row {
            flex-direction: column;
            align-items: stretch;
          }

          .services-ios-feature {
            justify-content: center;
          }

          .services-ios-actions {
            flex-direction: column;
          }

          .services-ios-primary-btn,
          .services-ios-secondary-btn {
            width: 100%;
          }

          .services-ios-image-shell {
            padding: 8px;
            border-radius: 27px;
          }

          .services-ios-window-bar {
            height: 21px;
          }

          .services-ios-image-wrap {
            border-radius: 21px;
          }

          .services-ios-hero-image {
            height: 350px;
          }

          .services-ios-floating-card {
            left: 11px;
            bottom: 11px;
            padding: 8px 10px;
          }

          .services-ios-floating-icon {
            width: 31px;
            height: 31px;
          }

          .services-ios-intro {
            padding:
              70px 0 10px;
          }

          .services-ios-section-title {
            font-size: 2.2rem;
          }

          .services-ios-list-section {
            padding:
              38px 0 78px;
          }

          .services-ios-grid {
            grid-template-columns: 1fr;
            gap: 14px;
          }

          .services-ios-card {
            min-height: auto;
            padding: 23px;
            border-radius: 23px;
          }

          /* =================================================
             MOBILE SERVICE TITLE
          ================================================= */

          .services-ios-service-title {
            gap: 9px;
            margin-top: 17px;
            align-items: flex-start;
          }

          .services-ios-service-title
          .services-ios-card-icon {
            width: 45px;
            height: 45px;

            border-radius: 13px;
          }

          .services-ios-service-title
          .services-ios-card-icon svg {
            width: 20px;
            height: 20px;
          }

          .services-ios-service-title h3 {
            font-size: 18px;
            line-height: 1.35;
            padding-top: 4px;
          }

          .services-ios-card-description {
            font-size: 13px;
          }

          .services-ios-card-image {
            height: 200px;
            border-radius: 18px;
          }

          .services-ios-care-strip {
            padding:
              0 0 75px;
          }

          .services-ios-care-card {
            grid-template-columns: 1fr;
            padding: 19px;
            border-radius: 22px;
          }

          .services-ios-care-btn {
            width: 100%;
            justify-self: stretch;
          }

          .services-ios-cta {
            padding: 65px 0;
          }

          .services-ios-cta-title {
            font-size: 2.2rem;
          }

          .services-ios-cta-text {
            font-size: 13px;
          }

          .services-ios-footer {
            padding:
              36px 0 25px;
          }

          .services-ios-footer-brand h2 {
            font-size: 19px;
          }

        }

        /* =================================================
           iPHONE
        ================================================= */

        @media (max-width: 390px) {

          .services-ios-container {
            padding-left: 12px;
            padding-right: 12px;
          }

          .services-ios-hero-title {
            font-size: 2.65rem;
          }

          .services-ios-hero-description {
            font-size: 13px;
          }

          .services-ios-hero-image {
            height: 315px;
          }

          .services-ios-floating-card {
            left: 9px;
            bottom: 9px;
          }

          .services-ios-section-title {
            font-size: 2rem;
          }

          .services-ios-card {
            padding: 20px;
            border-radius: 21px;
          }

          .services-ios-card-image {
            height: 185px;
            border-radius: 17px;
          }

          .services-ios-service-title {
            gap: 8px;
          }

          .services-ios-service-title
          .services-ios-card-icon {
            width: 42px;
            height: 42px;

            border-radius: 12px;
          }

          .services-ios-service-title
          .services-ios-card-icon svg {
            width: 19px;
            height: 19px;
          }

          .services-ios-service-title h3 {
            font-size: 17px;
            padding-top: 3px;
          }

          .services-ios-point p {
            font-size: 11px;
          }

          .services-ios-cta-title {
            font-size: 2rem;
          }

          .services-ios-footer-brand h2 {
            font-size: 17px;
          }

        }

        /* =================================================
           VERY SMALL
        ================================================= */

        @media (max-width: 340px) {

          .services-ios-hero-title {
            font-size: 2.4rem;
          }

          .services-ios-chip {
            font-size: 9px;
          }

          .services-ios-card {
            padding: 18px;
          }

          .services-ios-card-image {
            height: 170px;
          }

          .services-ios-service-title {
            gap: 7px;
          }

          .services-ios-service-title
          .services-ios-card-icon {
            width: 39px;
            height: 39px;
          }

          .services-ios-service-title
          .services-ios-card-icon svg {
            width: 18px;
            height: 18px;
          }

          .services-ios-service-title h3 {
            font-size: 16px;
          }

          .services-ios-care-card {
            padding: 17px;
          }

        }

        /* =================================================
           TOUCH
        ================================================= */

        @media (hover: none) {

          .services-ios-primary-btn:hover,
          .services-ios-secondary-btn:hover,
          .services-ios-card:hover {
            transform: none;
          }

        }

        /* =================================================
           REDUCE MOTION
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