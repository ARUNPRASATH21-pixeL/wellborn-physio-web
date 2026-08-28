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
  RefreshCw,
} from "lucide-react";

/* =========================================================
   ANIMATIONS
========================================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 30,
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
    x: -40,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeRight = {
  hidden: {
    opacity: 0,
    x: 40,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
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

const cardAnimation = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* =========================================================
   ICONS
========================================================= */

const fallbackServiceIcons = [
  Bone,
  Brain,
  Baby,
  Trophy,
  Activity,
  Dumbbell,
];

/* =========================================================
   IMAGE HELPER
========================================================= */

const getServiceImage = (service) => {
  if (!service) {
    return null;
  }

  const possibleImage =
    service.imageUrl ??
    service.image ??
    service.imagePath ??
    service.photoUrl ??
    service.photo ??
    service.imageName ??
    service.fileUrl ??
    service.fileName ??
    null;

  if (!possibleImage) {
    return null;
  }

  const imageString = String(possibleImage).trim();

  if (!imageString) {
    return null;
  }

  /* Base64 image */
  if (imageString.startsWith("data:image/")) {
    return imageString;
  }

  /* Cloudinary / external image */
  if (
    imageString.startsWith("http://") ||
    imageString.startsWith("https://")
  ) {
    return imageString;
  }

  /* Backend image */
  const baseUrl =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8080";

  const cleanBaseUrl = String(baseUrl).replace(/\/+$/, "");

  const cleanImagePath = imageString
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  return `${cleanBaseUrl}/${cleanImagePath}`;
};

/* =========================================================
   SERVICE NAME
========================================================= */

const getServiceName = (service) => {
  if (!service) {
    return "Treatment";
  }

  return (
    service.serviceName ??
    service.name ??
    service.title ??
    service.service ??
    "Treatment"
  );
};

/* =========================================================
   SERVICE DESCRIPTION
========================================================= */

const getServiceDescription = (service) => {
  if (!service) {
    return "Professional physiotherapy and rehabilitation care.";
  }

  return (
    service.description ??
    service.details ??
    service.serviceDescription ??
    "Professional physiotherapy and rehabilitation care tailored to your recovery."
  );
};

/* =========================================================
   SERVICES PAGE
========================================================= */

export default function Services() {
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [imageErrors, setImageErrors] = useState({});

  /* =======================================================
     LOAD SERVICES
  ======================================================= */

  const loadServices = async () => {
    console.log("");
    console.log("==========================================");
    console.log("🚀 LOADING SERVICES");
    console.log("SERVICE API:", API.SERVICE_GET_ALL);
    console.log("==========================================");

    try {
      setLoading(true);
      setError("");

      const response = await getData(API.SERVICE_GET_ALL);

      console.log("");
      console.log("==========================================");
      console.log("📦 RAW SERVICE API RESPONSE");
      console.log(response);
      console.log("==========================================");

      /*
        Some APIs return:

        [
          {...},
          {...}
        ]

        Some return:

        {
          data: [...]
        }

        Some return:

        {
          content: [...]
        }

        So handle all common formats.
      */

      let list = [];

      if (Array.isArray(response)) {
        list = response;
      } else if (Array.isArray(response?.data)) {
        list = response.data;
      } else if (Array.isArray(response?.content)) {
        list = response.content;
      } else if (Array.isArray(response?.services)) {
        list = response.services;
      } else if (Array.isArray(response?.result)) {
        list = response.result;
      }

      console.log("");
      console.log("==========================================");
      console.log("📋 EXTRACTED SERVICE LIST");
      console.log(list);
      console.log("📊 SERVICE COUNT:", list.length);
      console.log("==========================================");

      /*
        IMPORTANT:

        Don't aggressively filter services.

        Your admin already has active services.
        We only remove null values and "other".
      */

      const validServices = list.filter((service) => {
        if (!service) {
          return false;
        }

        const name = String(
          service.serviceName ??
            service.name ??
            service.title ??
            ""
        )
          .trim()
          .toLowerCase();

        if (name === "other") {
          return false;
        }

        return true;
      });

      console.log("");
      console.log("==========================================");
      console.log("🌐 PUBLIC SERVICES");
      console.log(validServices);
      console.log("📊 PUBLIC SERVICE COUNT:", validServices.length);
      console.log("==========================================");

      validServices.forEach((service, index) => {
        console.log(`SERVICE ${index + 1}:`, service);

        console.log(
          "NAME:",
          getServiceName(service)
        );

        console.log(
          "IMAGE:",
          getServiceImage(service)
        );
      });

      setServices(validServices);
    } catch (err) {
      console.error("");
      console.error("==========================================");
      console.error("❌ SERVICE API ERROR");
      console.error(err);
      console.error("==========================================");

      setServices([]);

      setError(
        "Unable to load services. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =======================================================
     USE EFFECT
  ======================================================= */

  useEffect(() => {
    loadServices();
  }, []);

  /* =======================================================
     SERVICE CARDS
  ======================================================= */

  const serviceCards = services.map(
    (service, index) => {
      const Icon =
        fallbackServiceIcons[
          index % fallbackServiceIcons.length
        ];

      const id =
        service.id ??
        service.serviceId ??
        service._id ??
        `${getServiceName(service)}-${index}`;

      return {
        id,

        icon: Icon,

        title: getServiceName(service),

        description:
          getServiceDescription(service),

        image: getServiceImage(service),

        color:
          [
            "blue",
            "purple",
            "pink",
            "orange",
            "green",
            "cyan",
          ][index % 6],

        points: [
          "Personalized treatment",
          "Professional guidance",
          "Recovery focused care",
        ],
      };
    }
  );

  /* =======================================================
     IMAGE ERROR
  ======================================================= */

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

  /* =======================================================
     IMAGE LOAD
  ======================================================= */

  const handleImageLoad = (
    serviceTitle,
    event
  ) => {
    console.log(
      "✅ SERVICE IMAGE LOADED:",
      serviceTitle,
      event.currentTarget.src
    );
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="services-page">

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="services-hero">

        <div className="services-orb services-orb-1" />

        <div className="services-orb services-orb-2" />

        <div className="services-grid-overlay" />

        <div className="services-container">

          <div className="services-hero-grid">

            {/* LEFT */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="services-hero-content"
            >

              <motion.div
                variants={fadeLeft}
                className="services-chip"
              >
                <span className="services-chip-icon">
                  <HeartPulse size={15} />
                </span>

                Professional Physiotherapy
              </motion.div>

              <motion.h1
                variants={fadeLeft}
                className="services-hero-title"
              >
                Our
                <span>
                  Physiotherapy Services
                </span>
              </motion.h1>

              <motion.p
                variants={fadeLeft}
                className="services-hero-description"
              >
                Personalized physiotherapy and
                rehabilitation services designed
                to reduce pain, restore movement
                and improve your quality of life.
              </motion.p>

              <motion.div
                variants={fadeLeft}
                className="services-feature-row"
              >

                <span className="services-feature">
                  <ShieldCheck size={14} />
                  Trusted Care
                </span>

                <span className="services-feature">
                  <Activity size={14} />
                  Modern Treatment
                </span>

                <span className="services-feature">
                  <HeartPulse size={14} />
                  Patient First
                </span>

              </motion.div>

              <motion.div
                variants={fadeLeft}
                className="services-actions"
              >

                <a
                  href="/user/appointment"
                  className="services-primary-btn"
                >
                  Book Appointment
                  <ArrowRight size={17} />
                </a>

                <a
                  href="#services-list"
                  className="services-secondary-btn"
                >
                  Explore Services
                </a>

              </motion.div>

            </motion.div>

            {/* RIGHT */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeRight}
              className="services-hero-image-area"
            >

              <div className="services-image-glow" />

              <div className="services-image-shell">

                <div className="services-window-bar">
                  <span />
                  <span />
                  <span />
                </div>

                <div className="services-image-wrap">

                  <motion.img
                    src="/images/services.jpeg"
                    alt="Physiotherapy Services"
                    className="services-hero-image"
                    onLoad={(event) => {
                      console.log(
                        "✅ HERO IMAGE LOADED:",
                        event.currentTarget.src
                      );
                    }}
                    onError={(event) => {
                      console.error(
                        "❌ HERO IMAGE NOT FOUND:",
                        event.currentTarget.src
                      );
                    }}
                    animate={{
                      y: [0, -6, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  <div className="services-image-overlay" />

                  <div className="services-floating-card">

                    <div className="services-floating-icon">
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

              </div>

            </motion.div>

          </div>

        </div>

      </section>

      {/* ===================================================
          INTRO
      =================================================== */}

      <section className="services-intro">

        <div className="services-container">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            variants={stagger}
            className="services-centered-heading"
          >

            <motion.div
              variants={fadeUp}
              className="services-section-tag"
            >
              <Stethoscope size={15} />
              OUR SERVICES
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="services-section-title"
            >
              Complete Physiotherapy Care
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="services-subtitle"
            >
              We provide personalized treatment
              and rehabilitation programs designed
              around your condition, mobility and
              recovery goals.
            </motion.p>

          </motion.div>

        </div>

      </section>

      {/* ===================================================
          SERVICES LIST
      =================================================== */}

      <section
        id="services-list"
        className="services-list-section"
      >

        <div className="services-container">

          {/* LOADING */}
          {loading && (
            <div className="services-loading">

              <div className="services-spinner">
                <RefreshCw
                  size={28}
                  className="spin"
                />
              </div>

              <h3>
                Loading Services...
              </h3>

              <p>
                Please wait while we load our
                physiotherapy services.
              </p>

            </div>
          )}

          {/* ERROR */}
          {!loading && error && (
            <div className="services-empty">

              <div className="services-empty-icon">
                <Stethoscope size={30} />
              </div>

              <h3>
                Unable to Load Services
              </h3>

              <p>
                {error}
              </p>

              <button
                type="button"
                onClick={loadServices}
                className="services-retry-btn"
              >
                <RefreshCw size={16} />
                Try Again
              </button>

            </div>
          )}

          {/* NO SERVICES */}
          {!loading &&
            !error &&
            serviceCards.length === 0 && (
              <div className="services-empty">

                <div className="services-empty-icon">
                  <Stethoscope size={30} />
                </div>

                <h3>
                  No Services Available
                </h3>

                <p>
                  Services will appear here once
                  they are added by the administrator.
                </p>

                <button
                  type="button"
                  onClick={loadServices}
                  className="services-retry-btn"
                >
                  <RefreshCw size={16} />
                  Refresh
                </button>

              </div>
            )}

          {/* SERVICE GRID */}
          {!loading &&
            !error &&
            serviceCards.length > 0 && (

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{
                  once: true,
                  amount: 0.08,
                }}
                variants={stagger}
                className="services-grid"
              >

                {serviceCards.map(
                  (service, index) => {

                    const Icon =
                      service.icon;

                    const showImage =
                      Boolean(
                        service.image
                      ) &&
                      !imageErrors[
                        service.id
                      ];

                    console.log(
                      "🎨 RENDERING SERVICE CARD:",
                      service.title,
                      service.image
                    );

                    return (
                      <motion.article
                        key={service.id}
                        variants={cardAnimation}
                        whileHover={{
                          y: -8,
                        }}
                        className="service-card"
                      >

                        {/* IMAGE */}
                        {showImage ? (
                          <div className="service-card-image">

                            <img
                              src={service.image}
                              alt={
                                service.title
                              }
                              loading="eager"
                              onLoad={(event) =>
                                handleImageLoad(
                                  service.title,
                                  event
                                )
                              }
                              onError={(event) =>
                                handleImageError(
                                  service.id,
                                  event
                                )
                              }
                            />

                            <div className="service-card-image-overlay" />

                            <div className="service-image-badge">
                              <HeartPulse
                                size={13}
                              />
                              Professional Care
                            </div>

                          </div>
                        ) : (
                          <div className="service-card-no-image">

                            <Icon size={45} />

                          </div>
                        )}

                        {/* TITLE */}
                        <div className="service-title-row">

                          <div
                            className={`service-icon ${service.color}`}
                          >
                            <Icon size={21} />
                          </div>

                          <h3>
                            {service.title}
                          </h3>

                        </div>

                        {/* DESCRIPTION */}
                        <p className="service-description">
                          {service.description}
                        </p>

                        {/* POINTS */}
                        <div className="service-points">

                          {service.points.map(
                            (point) => (
                              <div
                                key={point}
                                className="service-point"
                              >

                                <span>
                                  <CheckCircle2
                                    size={15}
                                  />
                                </span>

                                <p>
                                  {point}
                                </p>

                              </div>
                            )
                          )}

                        </div>

                        {/* FOOTER */}
                        <div className="service-card-footer">

                          <span>
                            Learn More
                          </span>

                          <span className="service-arrow">
                            <ArrowRight
                              size={15}
                            />
                          </span>

                        </div>

                        <div className="service-card-line" />

                      </motion.article>
                    );
                  }
                )}

              </motion.div>
            )}

        </div>

      </section>

      {/* ===================================================
          CARE STRIP
      =================================================== */}

      <section className="services-care-section">

        <div className="services-container">

          <motion.div
            initial={{
              opacity: 0,
              y: 25,
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
            className="services-care-card"
          >

            <div className="services-care-icon">
              <ShieldCheck size={25} />
            </div>

            <div className="services-care-content">

              <h3>
                Every treatment is designed
                around you.
              </h3>

              <p>
                Personalized care, professional
                guidance and a recovery plan that
                fits your needs.
              </p>

            </div>

            <a
              href="/user/appointment"
              className="services-care-btn"
            >
              Get Started
              <ArrowRight size={16} />
            </a>

          </motion.div>

        </div>

      </section>

      {/* ===================================================
          CTA
      =================================================== */}

      <section className="services-cta">

        <div className="services-cta-circle" />

        <div className="services-container">

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            variants={stagger}
            className="services-cta-content"
          >

            <motion.div
              variants={fadeUp}
              className="services-cta-icon"
            >
              <HeartPulse size={29} />
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="services-cta-title"
            >
              Ready To Start Your Recovery?
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="services-cta-text"
            >
              Take the first step towards better
              mobility, less pain and a healthier
              lifestyle.
            </motion.p>

            <motion.a
              variants={fadeUp}
              href="/user/appointment"
              className="services-cta-button"
            >
              Book Your Appointment
              <ArrowRight size={17} />
            </motion.a>

          </motion.div>

        </div>

      </section>

      {/* ===================================================
          FOOTER
      =================================================== */}

      <footer className="services-footer">

        <div className="services-container">

          <div className="services-footer-content">

            <div className="services-footer-brand">

              <HeartPulse size={25} />

              <h2>
                Wellborn Physio
              </h2>

              <span>
                Rehab & Centre
              </span>

            </div>

            <div className="services-footer-details">

              <p>
                <MapPin size={15} />
                Karayanchavadi,
                Poonamallee, Chennai
              </p>

              <a href="tel:+919342752147">
                <Phone size={15} />
                +91 93427 52147
              </a>

            </div>

            <div className="services-footer-bottom">
              © {new Date().getFullYear()}{" "}
              Wellborn Physio.
              All Rights Reserved.
            </div>

          </div>

        </div>

      </footer>

      {/* ===================================================
          STYLES
      =================================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .services-page {
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          background: #f5f7fb;
          color: #111827;
        }

        .dark .services-page {
          background: #05070d;
          color: #f8fafc;
        }

        .services-container {
          width: 100%;
          max-width: 1280px;
          margin: 0 auto;
          padding-left: 22px;
          padding-right: 22px;
        }

        /* ===================================================
           HERO
        =================================================== */

        .services-hero {
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

        .services-grid-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;

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
        }

        .services-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(4px);
        }

        .services-orb-1 {
          width: 280px;
          height: 280px;
          top: -110px;
          left: -90px;
          background: rgba(255,255,255,.10);
        }

        .services-orb-2 {
          width: 350px;
          height: 350px;
          right: -140px;
          bottom: -160px;
          background: rgba(103,232,249,.13);
        }

        .services-hero-grid {
          position: relative;
          z-index: 2;

          display: grid;

          grid-template-columns:
            minmax(0,1fr)
            minmax(0,1fr);

          gap: 65px;

          align-items: center;
        }

        .services-chip {
          display: inline-flex;
          align-items: center;
          gap: 9px;

          padding: 8px 12px;

          border-radius: 999px;

          background:
            rgba(255,255,255,.11);

          border:
            1px solid
            rgba(255,255,255,.22);

          backdrop-filter: blur(15px);

          font-size: 12px;
          font-weight: 700;
        }

        .services-chip-icon {
          width: 25px;
          height: 25px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            rgba(255,255,255,.15);
        }

        .services-hero-title {
          margin: 22px 0 0;

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

        .services-hero-title span {
          display: block;
          margin-top: 10px;

          color: transparent;

          background:
            linear-gradient(
              90deg,
              white,
              #c7f9ff
            );

          -webkit-background-clip: text;
          background-clip: text;
        }

        .services-hero-description {
          max-width: 610px;

          margin: 24px 0 0;

          color:
            rgba(255,255,255,.86);

          font-size: 16px;
          line-height: 1.8;
        }

        .services-feature-row {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;

          margin-top: 24px;
        }

        .services-feature {
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

          font-size: 11px;
          font-weight: 700;
        }

        .services-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 11px;

          margin-top: 28px;
        }

        .services-primary-btn,
        .services-secondary-btn {
          min-height: 50px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

          padding: 0 18px;

          border-radius: 16px;

          text-decoration: none;

          font-size: 13px;
          font-weight: 800;
        }

        .services-primary-btn {
          color: #1750d5;
          background: white;

          box-shadow:
            0 14px 35px
            rgba(0,0,0,.18);
        }

        .services-secondary-btn {
          color: white;

          background:
            rgba(255,255,255,.09);

          border:
            1px solid
            rgba(255,255,255,.22);
        }

        /* ===================================================
           HERO IMAGE
        =================================================== */

        .services-hero-image-area {
          position: relative;
        }

        .services-image-glow {
          position: absolute;
          inset: 8%;

          border-radius: 50%;

          background:
            rgba(103,232,249,.25);

          filter: blur(75px);
        }

        .services-image-shell {
          position: relative;
          z-index: 2;

          width: min(100%, 570px);

          margin-left: auto;

          padding: 10px;

          border-radius: 33px;

          background:
            rgba(255,255,255,.12);

          border:
            1px solid
            rgba(255,255,255,.22);

          box-shadow:
            0 35px 90px
            rgba(0,0,0,.22);
        }

        .services-window-bar {
          height: 25px;

          display: flex;
          align-items: center;

          gap: 6px;

          padding-left: 7px;
        }

        .services-window-bar span {
          width: 8px;
          height: 8px;

          border-radius: 50%;
        }

        .services-window-bar span:nth-child(1) {
          background: #ff5f57;
        }

        .services-window-bar span:nth-child(2) {
          background: #ffbd2e;
        }

        .services-window-bar span:nth-child(3) {
          background: #28c840;
        }

        .services-image-wrap {
          position: relative;
          overflow: hidden;

          border-radius: 26px;
        }

        .services-hero-image {
          display: block;

          width: 100%;
          height: 510px;

          object-fit: cover;
        }

        .services-image-overlay {
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              180deg,
              transparent 50%,
              rgba(0,0,0,.20)
            );

          pointer-events: none;
        }

        .services-floating-card {
          position: absolute;

          left: 16px;
          bottom: 16px;

          display: flex;
          align-items: center;
          gap: 10px;

          padding: 10px 12px;

          border-radius: 17px;

          color: #111827;

          background:
            rgba(255,255,255,.94);

          box-shadow:
            0 15px 40px
            rgba(0,0,0,.18);
        }

        .services-floating-icon {
          width: 35px;
          height: 35px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 12px;

          color: #2563eb;
          background: #eef4ff;
        }

        .services-floating-card strong {
          display: block;
          font-size: 12px;
        }

        .services-floating-card span {
          display: block;

          margin-top: 2px;

          color: #64748b;
          font-size: 9px;
        }

        /* ===================================================
           INTRO
        =================================================== */

        .services-intro {
          padding: 85px 0 25px;

          background:
            linear-gradient(
              180deg,
              #f7f9fc,
              #f5f7fb
            );
        }

        .dark .services-intro {
          background:
            linear-gradient(
              180deg,
              #05070d,
              #07101b
            );
        }

        .services-centered-heading {
          max-width: 780px;
          margin: 0 auto;
          text-align: center;
        }

        .services-section-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;

          color: #2563eb;

          font-size: 11px;
          font-weight: 800;

          letter-spacing: .13em;
        }

        .dark .services-section-tag {
          color: #60a5fa;
        }

        .services-section-title {
          margin: 15px 0 0;

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

        .dark .services-section-title {
          color: white;
        }

        .services-subtitle {
          max-width: 640px;

          margin: 15px auto 0;

          color: #64748b;

          font-size: 14px;
          line-height: 1.8;
        }

        .dark .services-subtitle {
          color: #94a3b8;
        }

        /* ===================================================
           SERVICES SECTION
        =================================================== */

        .services-list-section {
          padding: 45px 0 95px;

          background: #f5f7fb;
        }

        .dark .services-list-section {
          background: #07101b;
        }

        .services-grid {
          display: grid;

          grid-template-columns:
            repeat(3, minmax(0,1fr));

          gap: 20px;

          width: 100%;
        }

        /* ===================================================
           SERVICE CARD
        =================================================== */

        .service-card {
          position: relative;

          display: flex;
          flex-direction: column;

          width: 100%;
          min-width: 0;

          overflow: hidden;

          padding: 24px;

          border-radius: 26px;

          background: white;

          border:
            1px solid
            #e5e7eb;

          box-shadow:
            0 18px 50px
            rgba(15,23,42,.08);

          transition:
            box-shadow .35s ease,
            transform .35s ease;
        }

        .service-card:hover {
          box-shadow:
            0 28px 65px
            rgba(15,23,42,.13);
        }

        .dark .service-card {
          background: #0f172a;

          border-color:
            rgba(71,85,105,.55);

          box-shadow:
            0 18px 50px
            rgba(0,0,0,.28);
        }

        /* ===================================================
           SERVICE CARD IMAGE
        =================================================== */

        .service-card-image {
          position: relative;

          width: 100%;
          height: 205px;

          overflow: hidden;

          border-radius: 19px;

          background: #eef4ff;
        }

        .service-card-image img {
          display: block;

          width: 100%;
          height: 100%;

          object-fit: cover;

          transition:
            transform .5s
            cubic-bezier(.16,1,.3,1);
        }

        .service-card:hover
        .service-card-image img {
          transform: scale(1.05);
        }

        .service-card-image-overlay {
          position: absolute;
          inset: 0;

          pointer-events: none;

          background:
            linear-gradient(
              180deg,
              transparent 50%,
              rgba(0,0,0,.35)
            );
        }

        .service-image-badge {
          position: absolute;

          left: 11px;
          bottom: 11px;

          display: inline-flex;
          align-items: center;
          gap: 6px;

          padding: 7px 10px;

          border-radius: 999px;

          color: white;

          background:
            rgba(15,23,42,.62);

          border:
            1px solid
            rgba(255,255,255,.22);

          backdrop-filter: blur(10px);

          font-size: 9px;
          font-weight: 800;
        }

        .service-card-no-image {
          width: 100%;
          height: 205px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 19px;

          color: #2563eb;

          background:
            linear-gradient(
              135deg,
              #eef4ff,
              #ecfeff
            );
        }

        /* ===================================================
           TITLE
        =================================================== */

        .service-title-row {
          display: flex;
          align-items: center;

          gap: 11px;

          margin-top: 20px;

          width: 100%;
        }

        .service-icon {
          width: 48px;
          height: 48px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 15px;
        }

        .service-icon.blue {
          color: #2563eb;
          background: #eef4ff;
        }

        .service-icon.purple {
          color: #7c3aed;
          background: #f3efff;
        }

        .service-icon.pink {
          color: #db2777;
          background: #fdf2f8;
        }

        .service-icon.orange {
          color: #ea580c;
          background: #fff7ed;
        }

        .service-icon.green {
          color: #16a34a;
          background: #ecfdf5;
        }

        .service-icon.cyan {
          color: #0891b2;
          background: #ecfeff;
        }

        .dark .service-icon.blue {
          background: rgba(37,99,235,.14);
        }

        .dark .service-icon.purple {
          background: rgba(124,58,237,.14);
        }

        .dark .service-icon.pink {
          background: rgba(219,39,119,.12);
        }

        .dark .service-icon.orange {
          background: rgba(234,88,12,.12);
        }

        .dark .service-icon.green {
          background: rgba(22,163,74,.12);
        }

        .dark .service-icon.cyan {
          background: rgba(8,145,178,.12);
        }

        .service-title-row h3 {
          min-width: 0;

          margin: 0;

          color: #111827;

          font-size: 19px;
          line-height: 1.35;
          font-weight: 800;

          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .dark .service-title-row h3 {
          color: white;
        }

        /* ===================================================
           DESCRIPTION
        =================================================== */

        .service-description {
          margin: 13px 0 0;

          color: #64748b;

          font-size: 13px;
          line-height: 1.8;
        }

        .dark .service-description {
          color: #cbd5e1;
        }

        /* ===================================================
           POINTS
        =================================================== */

        .service-points {
          display: grid;
          gap: 8px;

          margin-top: 18px;
        }

        .service-point {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .service-point span {
          width: 26px;
          height: 26px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 8px;

          color: #16a34a;
          background: #ecfdf5;
        }

        .dark .service-point span {
          background:
            rgba(22,163,74,.11);
        }

        .service-point p {
          margin: 0;

          color: #475569;

          font-size: 12px;
        }

        .dark .service-point p {
          color: #cbd5e1;
        }

        /* ===================================================
           CARD FOOTER
        =================================================== */

        .service-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;

          margin-top: 21px;

          color: #2563eb;

          font-size: 12px;
          font-weight: 800;
        }

        .dark .service-card-footer {
          color: #60a5fa;
        }

        .service-arrow {
          width: 31px;
          height: 31px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background: #eef4ff;

          transition:
            transform .3s ease;
        }

        .dark .service-arrow {
          background:
            rgba(37,99,235,.14);
        }

        .service-card:hover
        .service-arrow {
          transform: translateX(5px);
        }

        .service-card-line {
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
            width .45s ease;
        }

        .service-card:hover
        .service-card-line {
          width: 100%;
        }

        /* ===================================================
           LOADING
        =================================================== */

        .services-loading {
          width: 100%;
          min-height: 300px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          text-align: center;

          padding: 40px;

          border-radius: 26px;

          background: white;

          border:
            1px solid
            #e5e7eb;

          box-shadow:
            0 18px 50px
            rgba(15,23,42,.06);
        }

        .dark .services-loading {
          background: #0f172a;
          border-color:
            rgba(71,85,105,.55);
        }

        .services-spinner {
          width: 65px;
          height: 65px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 20px;

          color: #2563eb;
          background: #eef4ff;
        }

        .spin {
          animation:
            serviceSpin 1s linear infinite;
        }

        @keyframes serviceSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        .services-loading h3 {
          margin: 16px 0 0;

          color: #111827;

          font-size: 20px;
          font-weight: 800;
        }

        .dark .services-loading h3 {
          color: white;
        }

        .services-loading p {
          margin: 7px 0 0;

          color: #64748b;

          font-size: 13px;
        }

        /* ===================================================
           EMPTY
        =================================================== */

        .services-empty {
          width: 100%;
          min-height: 300px;

          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;

          text-align: center;

          padding: 40px;

          border-radius: 26px;

          background: white;

          border:
            1px solid
            #e5e7eb;

          box-shadow:
            0 18px 50px
            rgba(15,23,42,.06);
        }

        .dark .services-empty {
          background: #0f172a;

          border-color:
            rgba(71,85,105,.55);
        }

        .services-empty-icon {
          width: 65px;
          height: 65px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 20px;

          color: #2563eb;
          background: #eef4ff;
        }

        .services-empty h3 {
          margin: 16px 0 0;

          color: #111827;

          font-size: 20px;
          font-weight: 800;
        }

        .dark .services-empty h3 {
          color: white;
        }

        .services-empty p {
          max-width: 500px;

          margin: 8px 0 0;

          color: #64748b;

          font-size: 13px;
          line-height: 1.7;
        }

        .services-retry-btn {
          margin-top: 18px;

          min-height: 43px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          padding: 0 16px;

          border: 0;
          border-radius: 13px;

          color: white;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #06b6d4
            );

          font-size: 12px;
          font-weight: 800;

          cursor: pointer;
        }

        /* ===================================================
           CARE
        =================================================== */

        .services-care-section {
          padding: 0 0 100px;

          background: #f5f7fb;
        }

        .dark .services-care-section {
          background: #07101b;
        }

        .services-care-card {
          display: grid;

          grid-template-columns:
            auto
            minmax(0,1fr)
            auto;

          gap: 18px;

          align-items: center;

          padding: 22px 24px;

          border-radius: 25px;

          background: white;

          border:
            1px solid
            #e5e7eb;

          box-shadow:
            0 18px 50px
            rgba(15,23,42,.07);
        }

        .dark .services-care-card {
          background: #0f172a;

          border-color:
            rgba(71,85,105,.55);
        }

        .services-care-icon {
          width: 52px;
          height: 52px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 16px;

          color: #2563eb;
          background: #eef4ff;
        }

        .services-care-content h3 {
          margin: 0;

          color: #111827;

          font-size: 18px;
          font-weight: 800;
        }

        .dark .services-care-content h3 {
          color: white;
        }

        .services-care-content p {
          margin: 4px 0 0;

          color: #64748b;

          font-size: 12px;
          line-height: 1.6;
        }

        .dark .services-care-content p {
          color: #94a3b8;
        }

        .services-care-btn {
          min-height: 45px;

          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

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
        }

        /* ===================================================
           CTA
        =================================================== */

        .services-cta {
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

        .services-cta-circle {
          position: absolute;

          width: 450px;
          height: 450px;

          right: -180px;
          top: -230px;

          border-radius: 50%;

          border:
            1px solid
            rgba(255,255,255,.15);
        }

        .services-cta-content {
          position: relative;
          z-index: 2;

          max-width: 800px;

          margin: 0 auto;

          text-align: center;
        }

        .services-cta-icon {
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
        }

        .services-cta-title {
          margin: 20px 0 0;

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

        .services-cta-text {
          max-width: 620px;

          margin: 17px auto 0;

          color:
            rgba(255,255,255,.82);

          font-size: 15px;
          line-height: 1.75;
        }

        .services-cta-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;

          gap: 8px;

          margin-top: 25px;

          min-height: 50px;

          padding: 0 19px;

          border-radius: 16px;

          color: #2563eb;
          background: white;

          text-decoration: none;

          font-size: 13px;
          font-weight: 850;

          box-shadow:
            0 15px 40px
            rgba(0,0,0,.18);
        }

        /* ===================================================
           FOOTER
        =================================================== */

        .services-footer {
          padding: 44px 0 28px;

          color: white;

          background:
            linear-gradient(
              180deg,
              #05070d,
              #03050a
            );
        }

        .services-footer-content {
          text-align: center;
        }

        .services-footer-brand {
          display: flex;
          align-items: center;
          justify-content: center;

          flex-wrap: wrap;
          gap: 8px;
        }

        .services-footer-brand svg {
          color: #22d3ee;
        }

        .services-footer-brand h2 {
          margin: 0;

          color: #67e8f9;

          font-size: 23px;
          font-weight: 900;
        }

        .services-footer-brand span {
          width: 100%;

          margin-top: -1px;

          color: #64748b;

          font-size: 9px;
          font-weight: 700;

          letter-spacing: .18em;
          text-transform: uppercase;
        }

        .services-footer-details {
          display: grid;
          gap: 9px;

          margin-top: 23px;
        }

        .services-footer-details p,
        .services-footer-details a {
          display: flex;
          align-items: center;
          justify-content: center;

          gap: 7px;

          margin: 0;

          color: #94a3b8;

          font-size: 12px;

          text-decoration: none;
        }

        .services-footer-bottom {
          margin-top: 23px;

          padding-top: 17px;

          border-top:
            1px solid
            rgba(255,255,255,.06);

          color: #475569;

          font-size: 10px;
        }

        /* ===================================================
           TABLET
        =================================================== */

        @media (max-width: 1050px) {

          .services-hero-grid {
            gap: 40px;
          }

          .services-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

        }

        /* ===================================================
           MOBILE
        =================================================== */

        @media (max-width: 900px) {

          .services-hero {
            padding-top: 75px;
            padding-bottom: 60px;
          }

          .services-hero-grid {
            grid-template-columns: 1fr;
            gap: 45px;
          }

          .services-image-shell {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
          }

          .services-hero-image {
            height: 420px;
          }

          .services-care-card {
            grid-template-columns:
              auto
              minmax(0,1fr);
          }

          .services-care-btn {
            grid-column: 1 / -1;
            justify-self: start;
          }

        }

        /* ===================================================
           SMALL MOBILE
        =================================================== */

        @media (max-width: 640px) {

          .services-container {
            padding-left: 15px;
            padding-right: 15px;
          }

          .services-hero {
            padding-top: 65px;
            padding-bottom: 55px;
          }

          .services-hero-title {
            font-size: 3rem;
          }

          .services-hero-description {
            font-size: 14px;
          }

          .services-feature-row {
            flex-direction: column;
          }

          .services-feature {
            justify-content: center;
          }

          .services-actions {
            flex-direction: column;
          }

          .services-primary-btn,
          .services-secondary-btn {
            width: 100%;
          }

          .services-hero-image {
            height: 350px;
          }

          .services-intro {
            padding-top: 65px;
          }

          .services-section-title {
            font-size: 2.2rem;
          }

          .services-list-section {
            padding-top: 35px;
            padding-bottom: 75px;
          }

          .services-grid {
            grid-template-columns: 1fr;
            gap: 15px;
          }

          .service-card {
            padding: 21px;
            border-radius: 23px;
          }

          .service-card-image,
          .service-card-no-image {
            height: 200px;
          }

          .service-title-row {
            margin-top: 17px;
          }

          .service-icon {
            width: 45px;
            height: 45px;
            border-radius: 13px;
          }

          .service-title-row h3 {
            font-size: 18px;
          }

          .services-care-section {
            padding-bottom: 75px;
          }

          .services-care-card {
            grid-template-columns: 1fr;
            padding: 19px;
            border-radius: 22px;
          }

          .services-care-btn {
            width: 100%;
          }

          .services-cta {
            padding: 65px 0;
          }

          .services-cta-title {
            font-size: 2.2rem;
          }

        }

        /* ===================================================
           VERY SMALL
        =================================================== */

        @media (max-width: 390px) {

          .services-container {
            padding-left: 12px;
            padding-right: 12px;
          }

          .services-hero-title {
            font-size: 2.65rem;
          }

          .services-hero-image {
            height: 315px;
          }

          .service-card {
            padding: 19px;
          }

          .service-card-image,
          .service-card-no-image {
            height: 185px;
          }

          .service-title-row {
            gap: 8px;
          }

          .service-icon {
            width: 42px;
            height: 42px;
          }

          .service-title-row h3 {
            font-size: 17px;
          }

        }

      `}</style>

    </div>
  );
}