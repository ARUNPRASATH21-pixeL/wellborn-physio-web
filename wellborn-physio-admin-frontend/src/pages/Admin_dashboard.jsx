import React, { useEffect, useState } from "react";

import {
  API,
  getData,
} from "../services/api";

import {
  Stethoscope,
  CalendarDays,
  Mail,
  Award,
  Boxes,
  RotateCw,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ShieldCheck,
  MessageSquare,
  Sparkles,
} from "lucide-react";

/* =========================================================
   WELLBORN PHYSIO
   ADMIN DASHBOARD (FAST NON-BLOCKING SYNC)
========================================================= */

export default function Admin_dashboard() {

  /* =======================================================
     DARK MODE
  ======================================================= */

  const [darkMode, setDarkMode] = useState(() => {
    try {
      return document.documentElement.classList.contains(
        "wellborn-admin-dark"
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;

    const updateTheme = () => {
      setDarkMode(
        root.classList.contains(
          "wellborn-admin-dark"
        )
      );
    };

    updateTheme();

    const observer = new MutationObserver(
      updateTheme
    );

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  /* =======================================================
     DASHBOARD STATE
  ======================================================= */

  const [d, setD] = useState({
    totalDoctors: 0,
    totalServices: 0,
    totalAppointments: 0,
    totalContacts: 0,
    totalEmails: 0,
    totalReviews: 0,

    pendingAppointments: 0,
    confirmedAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,

    pendingReviews: 0,
    approvedReviews: 0,
    rejectedReviews: 0,
  });

  const [loading, setLoading] = useState(true);

  /* =======================================================
     NUMBER HELPER
  ======================================================= */

  const safeNumber = (value) => {
    const n = Number(value);

    return Number.isFinite(n)
      ? n
      : 0;
  };

  /* =======================================================
     STATUS NORMALIZER
  ======================================================= */

  const normalizeStatus = (status) => {
    if (
      status === undefined ||
      status === null
    ) {
      return "";
    }

    return String(status)
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");
  };

  /* =======================================================
     EXTRACT ARRAY
  ======================================================= */

  const extractArray = (
    response,
    keys = []
  ) => {

    if (Array.isArray(response)) {
      return response;
    }

    if (
      response &&
      Array.isArray(response.data)
    ) {
      return response.data;
    }

    if (
      response &&
      Array.isArray(response.content)
    ) {
      return response.content;
    }

    for (const key of keys) {
      if (
        response &&
        Array.isArray(response[key])
      ) {
        return response[key];
      }
    }

    return [];
  };

  /* =======================================================
     GET APPOINTMENT ENDPOINT
  ======================================================= */

  const getAppointmentEndpoint = () => {
    return (
      API?.APPOINTMENT_GET_ALL ||
      "/appointment/getall"
    );
  };

  /* =======================================================
     LOAD DASHBOARD (OPTIMIZED NON-BLOCKING SYNC)
  ======================================================= */

  const load = async (isBackground = false) => {

    if (!isBackground) {
      setLoading(true);
    }

    try {
      const appointmentEndpoint = getAppointmentEndpoint();

      // Step 1: Fetch core summary metrics and appointments instantly
      const [
        dashboardResult,
        appointmentsResult,
      ] = await Promise.allSettled([
        getData(API.DASHBOARD),
        getData(appointmentEndpoint),
      ]);

      let dashboardData = {};
      if (
        dashboardResult.status === "fulfilled" &&
        dashboardResult.value
      ) {
        dashboardData = dashboardResult.value;
      }

      let appointments = [];
      if (
        appointmentsResult.status === "fulfilled"
      ) {
        appointments = extractArray(
          appointmentsResult.value,
          [
            "appointments",
            "appointmentList",
            "result",
            "results",
            "data",
            "content",
          ]
        );
      }

      let pendingAppointments = 0;
      let confirmedAppointments = 0;
      let completedAppointments = 0;
      let cancelledAppointments = 0;

      appointments.forEach((appointment) => {
        const rawStatus =
          appointment?.status ??
          appointment?.appointmentStatus ??
          appointment?.appointment_status ??
          "";

        const status = normalizeStatus(rawStatus);

        switch (status) {
          case "PENDING":
          case "":
          case "NEW":
          case "REQUESTED":
            pendingAppointments++;
            break;

          case "CONFIRMED":
            confirmedAppointments++;
            break;

          case "COMPLETED":
            completedAppointments++;
            break;

          case "CANCELLED":
          case "CANCELED":
            cancelledAppointments++;
            break;

          default:
            pendingAppointments++;
            break;
        }
      });

      const appointmentListTotal = appointments.length;
      const dashboardTotalAppointments = safeNumber(
        dashboardData?.totalAppointments
      );

      const totalAppointments =
        appointmentListTotal > 0
          ? appointmentListTotal
          : dashboardTotalAppointments;

      if (appointmentsResult.status !== "fulfilled") {
        pendingAppointments = safeNumber(dashboardData?.pendingAppointments);
        confirmedAppointments = safeNumber(dashboardData?.confirmedAppointments);
        completedAppointments = safeNumber(dashboardData?.completedAppointments);
        cancelledAppointments = safeNumber(dashboardData?.cancelledAppointments);
      }

      // Update core counters right away so UI feels snappy
      setD((prev) => ({
        ...prev,
        totalDoctors: safeNumber(dashboardData?.totalDoctors),
        totalServices: safeNumber(dashboardData?.totalServices),
        totalAppointments,
        pendingAppointments,
        confirmedAppointments,
        completedAppointments,
        cancelledAppointments,
      }));

      if (!isBackground) {
        setLoading(false); // Instantly release spinner
      }

      // Step 2: Fetch secondary lists (Reviews & Contacts) asynchronously in the background
      Promise.allSettled([
        getData(API.REVIEW_GET_ALL),
        API?.CONTACT_GET_ALL ? getData(API.CONTACT_GET_ALL) : Promise.resolve([]),
      ]).then(([reviewsResult, contactsResult]) => {
        let reviews = [];
        if (reviewsResult.status === "fulfilled") {
          reviews = extractArray(reviewsResult.value, [
            "reviews",
            "result",
            "results",
            "data",
            "content",
          ]);
        }

        let contacts = [];
        if (contactsResult.status === "fulfilled") {
          contacts = extractArray(contactsResult.value, [
            "contacts",
            "messages",
            "result",
            "results",
            "data",
            "content",
          ]);
        }

        let pendingReviews = 0;
        let approvedReviews = 0;
        let rejectedReviews = 0;

        reviews.forEach((review) => {
          const status = normalizeStatus(review?.status);
          if (status === "PENDING") pendingReviews++;
          if (status === "APPROVED") approvedReviews++;
          if (status === "REJECTED") rejectedReviews++;
        });

        const calculatedEmails =
          contacts.filter((c) => c?.email).length ||
          appointments.filter((a) => a?.email).length;

        setD((prev) => ({
          ...prev,
          totalContacts: safeNumber(dashboardData?.totalContacts) || contacts.length,
          totalEmails: safeNumber(dashboardData?.totalEmails) || calculatedEmails,
          totalReviews: safeNumber(dashboardData?.totalReviews) || reviews.length,
          pendingReviews: safeNumber(dashboardData?.pendingReviews) || pendingReviews,
          approvedReviews: safeNumber(dashboardData?.approvedReviews) || approvedReviews,
          rejectedReviews: safeNumber(dashboardData?.rejectedReviews) || rejectedReviews,
        }));
      });

    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );
      if (!isBackground) {
        setLoading(false);
      }
    }
  };

  /* =======================================================
     INITIAL LOAD & AUTO-POLLING (EVERY 60s)
  ======================================================= */

  useEffect(() => {
    load(false);
    const interval = setInterval(() => {
      load(true); // background silent refresh
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  /* =======================================================
     QUICK CARDS
  ======================================================= */

  const cards = [

    {
      label: "Doctors",
      value: d.totalDoctors,
      description: "Registered doctors",
      icon: Stethoscope,
      light: "bg-cyan-50 text-cyan-600 border-cyan-100",
      dark: "bg-cyan-500/10 text-cyan-300 border-cyan-400/30",
    },

    {
      label: "Services",
      value: d.totalServices,
      description: "Available services",
      icon: Boxes,
      light: "bg-purple-50 text-purple-600 border-purple-100",
      dark: "bg-purple-500/10 text-purple-300 border-purple-400/30",
    },

    {
      label: "Appointments",
      value: d.totalAppointments,
      description: "Total appointments",
      icon: CalendarDays,
      light: "bg-blue-50 text-blue-600 border-blue-100",
      dark: "bg-blue-500/10 text-blue-300 border-blue-400/30",
    },

    {
      label: "Messages",
      value: d.totalContacts,
      description: "Contact messages",
      icon: MessageSquare,
      light: "bg-orange-50 text-orange-600 border-orange-100",
      dark: "bg-orange-500/10 text-orange-300 border-orange-400/30",
    },

    {
      label: "Emails",
      value: d.totalEmails,
      description: "Registered emails",
      icon: Mail,
      light: "bg-emerald-50 text-emerald-600 border-emerald-100",
      dark: "bg-emerald-500/10 text-emerald-300 border-emerald-400/30",
    },

    {
      label: "Reviews",
      value: d.totalReviews,
      description: "Customer reviews",
      icon: Award,
      light: "bg-pink-50 text-pink-600 border-pink-100",
      dark: "bg-pink-500/10 text-pink-300 border-pink-400/30",
    },
  ];

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div
      className={`
        min-h-screen
        w-full
        min-w-0
        overflow-x-hidden
        transition-colors
        duration-300

        ${
          darkMode
            ? "bg-slate-950 text-slate-100"
            : "bg-slate-50 text-slate-900"
        }
      `}
    >

      <main
        className="
          relative
          z-10
          mx-auto
          w-full
          max-w-[1500px]
          min-w-0
          px-2.5
          pt-4
          pb-5
          min-[380px]:px-3
          min-[380px]:pt-5
          sm:px-5
          sm:pt-6
          sm:pb-6
          lg:px-8
          lg:pt-7
        "
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <section
          className={`
            mb-4
            w-full
            min-w-0
            overflow-hidden
            rounded-2xl
            border
            p-3
            min-[380px]:p-4
            sm:mb-6
            sm:p-6

            ${
              darkMode
                ? `
                  border-slate-700
                  bg-slate-900
                  shadow-lg
                  shadow-black/20
                `
                : `
                  border-slate-200
                  bg-white
                  shadow-md
                  shadow-slate-200/50
                `
            }
          `}
        >

          <div
            className="
              flex
              min-w-0
              flex-col
              gap-3
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <div
              className="
                flex
                min-w-0
                flex-1
                items-center
                gap-2.5
                sm:gap-4
              "
            >

              <div
                className={`
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-xl
                  border
                  p-1.5
                  min-[380px]:h-11
                  min-[380px]:w-11
                  sm:h-14
                  sm:w-14
                  sm:rounded-2xl

                  ${
                    darkMode
                      ? "border-slate-600 bg-slate-800"
                      : "border-slate-200 bg-white"
                  }
                `}
              >

                <img
                  src="/assets/logo.png"
                  alt="Wellborn Physio"
                  className="
                    h-full
                    w-full
                    object-contain
                  "
                  onError={(e) => {
                    e.currentTarget.style.display =
                      "none";

                    if (
                      e.currentTarget
                        .nextElementSibling
                    ) {
                      e.currentTarget
                        .nextElementSibling
                        .style.display =
                        "flex";
                    }
                  }}
                />

                <div
                  style={{
                    display: "none",
                  }}
                  className="
                    h-full
                    w-full
                    items-center
                    justify-center
                    rounded-lg
                    bg-cyan-500
                    text-white
                  "
                >
                  <ShieldCheck size={20} />
                </div>

              </div>

              <div
                className="
                  min-w-0
                  flex-1
                  overflow-hidden
                "
              >

                <div
                  className="
                    mb-0.5
                    flex
                    items-center
                    gap-1.5
                  "
                >

                  <span
                    className="
                      h-1.5
                      w-1.5
                      shrink-0
                      rounded-full
                      bg-emerald-500
                      animate-pulse
                    "
                  />

                  <span
                    className={`
                      truncate
                      text-[7px]
                      font-bold
                      uppercase
                      tracking-wider
                      min-[380px]:text-[8px]
                      sm:text-[10px]

                      ${
                        darkMode
                          ? "text-emerald-400"
                          : "text-emerald-600"
                      }
                    `}
                  >
                    Live Control Center
                  </span>

                </div>

                <h1
                  className={`
                    truncate
                    text-base
                    font-black
                    leading-tight
                    min-[380px]:text-lg
                    sm:text-2xl
                    lg:text-3xl

                    ${
                      darkMode
                        ? "text-white"
                        : "text-slate-900"
                    }
                  `}
                >
                  Wellborn Physio Dashboard
                </h1>

                <p
                  className={`
                    mt-0.5
                    truncate
                    text-[8px]
                    min-[380px]:text-[9px]
                    sm:text-xs

                    ${
                      darkMode
                        ? "text-slate-400"
                        : "text-slate-500"
                    }
                  `}
                >
                  Real-time analytics and clinic management overview
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={() => load(false)}
              disabled={loading}
              className={`
                flex
                h-9
                w-full
                items-center
                justify-center
                gap-1.5
                rounded-xl
                border
                px-3
                text-[9px]
                font-bold
                transition-all
                active:scale-95
                sm:h-10
                sm:w-auto
                sm:px-4
                sm:text-xs
                disabled:cursor-not-allowed
                disabled:opacity-60

                ${
                  darkMode
                    ? `
                      border-slate-700
                      bg-slate-800
                      text-slate-200
                      hover:bg-slate-700
                    `
                    : `
                      border-slate-200
                      bg-white
                      text-slate-700
                      hover:bg-slate-50
                    `
                }
              `}
            >

              <RotateCw
                size={14}
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              <span>
                {loading
                  ? "Syncing..."
                  : "Refresh Stats"}
              </span>

            </button>

          </div>

        </section>

        {/* =================================================
            TITLE
        ================================================= */}

        <div
          className="
            mb-2.5
            flex
            items-center
            gap-1.5
            px-0.5
            sm:mb-4
            sm:gap-2
          "
        >

          <div
            className={`
              flex
              h-6
              w-6
              shrink-0
              items-center
              justify-center
              rounded-md
              border
              min-[380px]:h-7
              min-[380px]:w-7
              sm:h-8
              sm:w-8
              sm:rounded-lg

              ${
                darkMode
                  ? `
                    border-cyan-400/30
                    bg-cyan-500/10
                    text-cyan-300
                  `
                  : `
                    border-cyan-100
                    bg-cyan-50
                    text-cyan-600
                  `
              }
            `}
          >
            <Sparkles size={13} />
          </div>

          <h2
            className={`
              text-xs
              font-extrabold
              min-[380px]:text-sm
              sm:text-base

              ${
                darkMode
                  ? "text-slate-100"
                  : "text-slate-800"
              }
            `}
          >
            Quick Overview
          </h2>

        </div>

        {/* =================================================
            QUICK CARDS
        ================================================= */}

        <div
          className="
            grid
            w-full
            min-w-0
            grid-cols-2
            gap-2
            min-[380px]:gap-2.5
            sm:gap-4
            lg:grid-cols-3
            lg:gap-5
          "
        >

          {cards.map((card) => (

            <DashboardCard
              key={card.label}
              {...card}
              iconStyle={
                darkMode
                  ? card.dark
                  : card.light
              }
              darkMode={darkMode}
            />

          ))}

        </div>

        {/* =================================================
            STATUS
        ================================================= */}

        <div
          className="
            mt-4
            grid
            w-full
            min-w-0
            grid-cols-1
            gap-3
            min-[380px]:mt-5
            sm:mt-6
            sm:gap-5
            lg:grid-cols-2
          "
        >

          <StatusCard
            darkMode={darkMode}
            title="Appointments"
            subtitle="Live appointment status"
            icon={CalendarDays}
            iconStyle={
              darkMode
                ? "bg-blue-500/10 text-blue-300 border-blue-400/30"
                : "bg-blue-50 text-blue-600 border-blue-100"
            }
            rows={[
              {
                label: "Pending",
                value: d.pendingAppointments,
                icon: Clock,
                style: darkMode
                  ? "bg-amber-500/10 text-amber-300 border-amber-400/30"
                  : "bg-amber-50 text-amber-600 border-amber-100",
              },
              {
                label: "Confirmed",
                value: d.confirmedAppointments,
                icon: CheckCircle2,
                style: darkMode
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-400/30"
                  : "bg-emerald-50 text-emerald-600 border-emerald-100",
              },
              {
                label: "Completed",
                value: d.completedAppointments,
                icon: CheckCircle2,
                style: darkMode
                  ? "bg-blue-500/10 text-blue-300 border-blue-400/30"
                  : "bg-blue-50 text-blue-600 border-blue-100",
              },
              {
                label: "Cancelled",
                value: d.cancelledAppointments,
                icon: XCircle,
                style: darkMode
                  ? "bg-rose-500/10 text-rose-300 border-rose-400/30"
                  : "bg-rose-50 text-rose-600 border-rose-100",
              },
            ]}
          />

          <StatusCard
            darkMode={darkMode}
            title="Reviews"
            subtitle="Customer review status"
            icon={Award}
            iconStyle={
              darkMode
                ? "bg-pink-500/10 text-pink-300 border-pink-400/30"
                : "bg-pink-50 text-pink-600 border-pink-100"
            }
            rows={[
              {
                label: "Pending",
                value: d.pendingReviews,
                icon: Clock,
                style: darkMode
                  ? "bg-amber-500/10 text-amber-300 border-amber-400/30"
                  : "bg-amber-50 text-amber-600 border-amber-100",
              },
              {
                label: "Approved",
                value: d.approvedReviews,
                icon: CheckCircle2,
                style: darkMode
                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-400/30"
                  : "bg-emerald-50 text-emerald-600 border-emerald-100",
              },
              {
                label: "Rejected",
                value: d.rejectedReviews,
                icon: XCircle,
                style: darkMode
                  ? "bg-rose-500/10 text-rose-300 border-rose-400/30"
                  : "bg-rose-50 text-rose-600 border-rose-100",
              },
            ]}
          />

        </div>

        {/* =================================================
            DATABASE STATUS
        ================================================= */}

        <div
          className={`
            mt-3
            w-full
            overflow-hidden
            rounded-xl
            border
            p-3
            sm:mt-5
            sm:rounded-2xl
            sm:p-4

            ${
              darkMode
                ? "border-slate-700 bg-slate-900"
                : "border-slate-200 bg-white"
            }
          `}
        >

          <div
            className="
              flex
              items-center
              justify-between
              gap-2
            "
          >

            <div
              className="
                flex
                min-w-0
                items-center
                gap-2
              "
            >

              <div
                className={`
                  flex
                  h-8
                  w-8
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg
                  border

                  ${
                    darkMode
                      ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300"
                      : "border-cyan-100 bg-cyan-50 text-cyan-600"
                  }
                `}
              >
                <TrendingUp size={14} />
              </div>

              <div className="min-w-0">

                <p
                  className={`
                    truncate
                    text-[9px]
                    font-bold
                    sm:text-xs

                    ${
                      darkMode
                        ? "text-slate-200"
                        : "text-slate-800"
                    }
                  `}
                >
                  Database Synchronized
                </p>

                <p
                  className={`
                    hidden
                    truncate
                    text-[10px]
                    sm:block

                    ${
                      darkMode
                        ? "text-slate-500"
                        : "text-slate-400"
                    }
                  `}
                >
                  Live Wellborn Physio backend connection
                </p>

              </div>

            </div>

            <div
              className={`
                flex
                shrink-0
                items-center
                gap-1
                rounded-lg
                border
                px-2
                py-1.5
                text-[8px]
                font-bold

                ${
                  darkMode
                    ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                    : "border-emerald-100 bg-emerald-50 text-emerald-600"
                }
              `}
            >

              <span
                className="
                  h-1.5
                  w-1.5
                  rounded-full
                  bg-emerald-500
                  animate-pulse
                "
              />

              <span className="hidden sm:inline">
                Secure
              </span>

              <ArrowUpRight size={10} />

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

/* =========================================================
   DASHBOARD CARD
========================================================= */

function DashboardCard({
  label,
  value,
  description,
  icon: Icon,
  iconStyle,
  darkMode,
}) {

  return (
    <div
      className={`
        w-full
        min-w-0
        overflow-hidden
        rounded-xl
        border
        p-2.5
        min-[380px]:p-3
        sm:rounded-2xl
        sm:p-5
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:shadow-lg

        ${
          darkMode
            ? `
              border-slate-800/80
              bg-slate-900
              hover:border-cyan-500/40
            `
            : `
              border-slate-200
              bg-white
              hover:border-slate-300
              hover:shadow-md
            `
        }
      `}
    >

      <div
        className="
          flex
          items-center
          justify-between
          gap-1.5
          sm:gap-3
        "
      >

        <div className="min-w-0 flex-1">

          <p
            className={`
              truncate
              text-[8px]
              font-bold
              uppercase
              tracking-wide
              min-[380px]:text-[9px]
              sm:text-[10px]

              ${
                darkMode
                  ? "text-slate-400"
                  : "text-slate-500"
              }
            `}
          >
            {label}
          </p>

          <p
            className={`
              mt-1
              text-xl
              font-black
              leading-none
              min-[380px]:text-2xl
              sm:mt-2
              sm:text-3xl

              ${
                darkMode
                  ? "text-white"
                  : "text-slate-900"
              }
            `}
          >
            {value ?? 0}
          </p>

        </div>

        <div
          className={`
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            border
            min-[380px]:h-9
            min-[380px]:w-9
            sm:h-11
            sm:w-11
            sm:rounded-xl

            ${iconStyle}
          `}
        >

          <Icon
            size={15}
            className="sm:hidden"
          />

          <Icon
            size={19}
            className="hidden sm:block"
          />

        </div>

      </div>

      <p
        className={`
          mt-2
          hidden
          truncate
          text-[9px]
          sm:block
          sm:text-[10px]

          ${
            darkMode
              ? "text-slate-500"
              : "text-slate-400"
          }
        `}
      >
        {description}
      </p>

    </div>
  );
}

/* =========================================================
   STATUS CARD
========================================================= */

function StatusCard({
  title,
  subtitle,
  icon: Icon,
  iconStyle,
  rows,
  darkMode,
}) {

  return (
    <div
      className={`
        w-full
        min-w-0
        overflow-hidden
        rounded-xl
        border
        sm:rounded-2xl

        ${
          darkMode
            ? "border-slate-800 bg-slate-900"
            : "border-slate-200 bg-white"
        }
      `}
    >

      <div
        className={`
          flex
          items-center
          gap-2.5
          border-b
          p-3
          min-[380px]:p-4
          sm:p-5

          ${
            darkMode
              ? "border-slate-800"
              : "border-slate-100"
          }
        `}
      >

        <div
          className={`
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            border
            min-[380px]:h-9
            min-[380px]:w-9
            sm:h-11
            sm:w-11
            sm:rounded-xl

            ${iconStyle}
          `}
        >

          <Icon
            size={15}
            className="sm:hidden"
          />

          <Icon
            size={19}
            className="hidden sm:block"
          />

        </div>

        <div className="min-w-0 flex-1">

          <h2
            className={`
              truncate
              text-sm
              font-black
              min-[380px]:text-[15px]
              sm:text-base

              ${
                darkMode
                  ? "text-white"
                  : "text-slate-800"
              }
            `}
          >
            {title}
          </h2>

          <p
            className={`
              truncate
              text-[8px]
              min-[380px]:text-[9px]
              sm:text-[10px]

              ${
                darkMode
                  ? "text-slate-500"
                  : "text-slate-400"
              }
            `}
          >
            {subtitle}
          </p>

        </div>

      </div>

      <div
        className="
          space-y-1.5
          p-2.5
          min-[380px]:space-y-2
          min-[380px]:p-3
          sm:space-y-2.5
          sm:p-4
        "
      >

        {rows.map((row) => {

          const RowIcon =
            row.icon;

          return (
            <div
              key={row.label}
              className={`
                flex
                items-center
                justify-between
                gap-2
                rounded-lg
                border
                px-2.5
                py-2
                min-[380px]:px-3
                sm:rounded-xl
                sm:px-4
                sm:py-3

                ${
                  darkMode
                    ? "border-slate-800/60 bg-slate-950/60"
                    : "border-slate-100 bg-slate-50/80"
                }
              `}
            >

              <div
                className="
                  flex
                  min-w-0
                  flex-1
                  items-center
                  gap-2
                  sm:gap-3
                "
              >

                <div
                  className={`
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg
                    border
                    min-[380px]:h-8
                    min-[380px]:w-8
                    sm:h-9
                    sm:w-9

                    ${row.style}
                  `}
                >

                  <RowIcon
                    size={13}
                    className="sm:hidden"
                  />

                  <RowIcon
                    size={16}
                    className="hidden sm:block"
                  />

                </div>

                <span
                  className={`
                    truncate
                    whitespace-nowrap
                    text-[9px]
                    min-[380px]:text-[10px]
                    sm:text-xs
                    font-semibold

                    ${
                      darkMode
                        ? "text-slate-300"
                        : "text-slate-600"
                    }
                  `}
                >
                  {row.label}
                </span>

              </div>

              <span
                className={`
                  flex
                  min-w-[28px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-md
                  border
                  px-2
                  py-1
                  text-[9px]
                  font-black
                  sm:min-w-[36px]
                  sm:text-xs

                  ${
                    darkMode
                      ? "border-slate-700 bg-slate-800 text-white"
                      : "border-slate-200 bg-white text-slate-800"
                  }
                `}
              >
                {row.value ?? 0}
              </span>

            </div>
          );
        })}

      </div>

    </div>
  );
}