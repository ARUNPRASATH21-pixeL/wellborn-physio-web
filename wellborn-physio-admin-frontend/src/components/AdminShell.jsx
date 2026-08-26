import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  Menu,
  X,
  Home,
  UserRound,
  Stethoscope,
  CalendarCheck,
  Mail,
  Star,
  Settings,
  LogOut,
  Bell,
  MessageCircle,
} from "lucide-react";

import {
  logout,
  API,
  getData,
} from "../services/api";


export default function AdminShell({ children }) {

  const navigate = useNavigate();
  const location = useLocation();


  /* =====================================================
     LOGIN PAGE
  ===================================================== */

  const isLoginPage =
    location.pathname === "/admin/login";


  /* =====================================================
     LOGIN PROTECTION
  ===================================================== */

  useEffect(() => {

    if (isLoginPage) {
      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token || !token.trim()) {

      navigate(
        "/admin/login",
        {
          replace: true,
        }
      );

    }

  }, [
    navigate,
    isLoginPage,
  ]);


  /* =====================================================
     THEME
     
     Supported values:
     
     light
     dark
     system
     
     system means:
     Windows / Browser system theme
  ===================================================== */

  const getStoredTheme = () => {

    const storedTheme =
      localStorage.getItem(
        "wellborn-admin-theme"
      );

    if (
      storedTheme === "light" ||
      storedTheme === "dark" ||
      storedTheme === "system"
    ) {

      return storedTheme;

    }

    return "system";

  };


  const getSystemTheme = () => {

    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {

      return "light";

    }


    return window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches
      ? "dark"
      : "light";

  };


  const [theme, setTheme] =
    useState(getStoredTheme);


  /* =====================================================
     GET ACTUAL THEME
     
     If selected theme = system,
     calculate actual theme from OS/browser.
  ===================================================== */

  const getActualTheme = (
    selectedTheme
  ) => {

    if (
      selectedTheme === "dark"
    ) {

      return "dark";

    }


    if (
      selectedTheme === "light"
    ) {

      return "light";

    }


    /*
     * SYSTEM
     *
     * Windows/browser dark
     * -> dark
     *
     * Windows/browser light
     * -> light
     */

    return getSystemTheme();

  };


  /* =====================================================
     APPLY THEME
  ===================================================== */

  const applyTheme = (
    selectedTheme
  ) => {

    const validTheme =
      selectedTheme === "dark" ||
      selectedTheme === "light" ||
      selectedTheme === "system"
        ? selectedTheme
        : "system";


    const actualTheme =
      getActualTheme(
        validTheme
      );


    /*
     * React state stores the USER'S
     * selected option.
     *
     * Example:
     *
     * selected = system
     * actual   = dark
     */

    setTheme(
      validTheme
    );


    /*
     * Save selected option.
     */

    localStorage.setItem(
      "wellborn-admin-theme",
      validTheme
    );


    /* =================================================
       HTML
    ================================================= */

    document.documentElement.setAttribute(
      "data-wellborn-theme",
      actualTheme
    );


    document.documentElement.setAttribute(
      "data-wellborn-theme-selection",
      validTheme
    );


    document.documentElement.classList.toggle(
      "wellborn-admin-dark",
      actualTheme === "dark"
    );


    document.documentElement.classList.toggle(
      "wellborn-admin-light",
      actualTheme === "light"
    );


    /* =================================================
       BODY
    ================================================= */

    document.body.setAttribute(
      "data-wellborn-theme",
      actualTheme
    );


    document.body.setAttribute(
      "data-wellborn-theme-selection",
      validTheme
    );


    document.body.classList.toggle(
      "wellborn-admin-dark",
      actualTheme === "dark"
    );


    document.body.classList.toggle(
      "wellborn-admin-light",
      actualTheme === "light"
    );


    /* =================================================
       ROOT
    ================================================= */

    const root =
      document.getElementById("root");


    if (root) {

      root.setAttribute(
        "data-wellborn-theme",
        actualTheme
      );


      root.setAttribute(
        "data-wellborn-theme-selection",
        validTheme
      );


      root.classList.toggle(
        "wellborn-admin-dark",
        actualTheme === "dark"
      );


      root.classList.toggle(
        "wellborn-admin-light",
        actualTheme === "light"
      );

    }

  };


  /* =====================================================
     INITIAL THEME + SYSTEM THEME LISTENER
  ===================================================== */

  useEffect(() => {

    if (isLoginPage) {
      return;
    }


    /*
     * Read selected theme.
     */

    const storedTheme =
      localStorage.getItem(
        "wellborn-admin-theme"
      );


    const selectedTheme =
      storedTheme === "dark" ||
      storedTheme === "light" ||
      storedTheme === "system"
        ? storedTheme
        : "system";


    /*
     * Apply initial theme.
     */

    applyTheme(
      selectedTheme
    );


    /* =================================================
       SYSTEM THEME
       
       Detect Windows/browser theme.
    ================================================= */

    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );


    const handleSystemThemeChange =
      () => {

        /*
         * Only react to OS theme changes
         * when Admin setting is SYSTEM.
         */

        const currentTheme =
          localStorage.getItem(
            "wellborn-admin-theme"
          );


        if (
          currentTheme !== "system"
        ) {

          return;

        }


        /*
         * Recalculate actual theme.
         */

        applyTheme("system");

      };


    /* =================================================
       CUSTOM THEME EVENT
       
       Settings page can send:
       
       window.dispatchEvent(
         new CustomEvent(
           "wellborn-theme-change",
           {
             detail: {
               theme: "system"
             }
           }
         )
       );
    ================================================= */

    const handleThemeChange =
      (event) => {

        const selected =
          event?.detail?.theme;


        if (
          selected === "dark" ||
          selected === "light" ||
          selected === "system"
        ) {

          applyTheme(
            selected
          );

        }

      };


    /* =================================================
       STORAGE EVENT
       
       Useful when another browser tab
       changes the theme.
    ================================================= */

    const handleStorage =
      (event) => {

        if (
          event.key ===
          "wellborn-admin-theme"
        ) {

          const selected =
            event.newValue === "dark" ||
            event.newValue === "light" ||
            event.newValue === "system"
              ? event.newValue
              : "system";


          applyTheme(
            selected
          );

        }

      };


    /*
     * Modern browsers.
     */

    if (
      typeof mediaQuery.addEventListener ===
      "function"
    ) {

      mediaQuery.addEventListener(
        "change",
        handleSystemThemeChange
      );

    } else {

      /*
       * Older browser fallback.
       */

      mediaQuery.addListener(
        handleSystemThemeChange
      );

    }


    window.addEventListener(
      "wellborn-theme-change",
      handleThemeChange
    );


    window.addEventListener(
      "storage",
      handleStorage
    );


    return () => {

      if (
        typeof mediaQuery.removeEventListener ===
        "function"
      ) {

        mediaQuery.removeEventListener(
          "change",
          handleSystemThemeChange
        );

      } else {

        mediaQuery.removeListener(
          handleSystemThemeChange
        );

      }


      window.removeEventListener(
        "wellborn-theme-change",
        handleThemeChange
      );


      window.removeEventListener(
        "storage",
        handleStorage
      );

    };

  }, [
    isLoginPage,
  ]);


  /* =====================================================
     MOBILE MENU
  ===================================================== */

  const [menuOpen, setMenuOpen] =
    useState(false);


  /* =====================================================
     BADGE COUNTS
  ===================================================== */

  const [
    appointmentCount,
    setAppointmentCount
  ] = useState(0);


  const [
    messageCount,
    setMessageCount
  ] = useState(0);


  const [
    reviewCount,
    setReviewCount
  ] = useState(0);


  /* =====================================================
     CENTER NOTIFICATION PANEL
  ===================================================== */

  const [
    notificationCenterOpen,
    setNotificationCenterOpen
  ] = useState(false);


  const notificationCenterRef =
    useRef(null);


  /* =====================================================
     NOTIFICATION POPUP
  ===================================================== */

  const [
    notification,
    setNotification
  ] = useState(null);


  const notificationTimerRef =
    useRef(null);


  const firstNotificationLoadRef =
    useRef(true);


  const previousAppointmentIdsRef =
    useRef(new Set());


  const previousMessageIdsRef =
    useRef(new Set());


  const previousReviewIdsRef =
    useRef(new Set());


  /* =====================================================
     READ STORAGE KEYS
  ===================================================== */

  const APPOINTMENT_READ_KEY =
    "wellborn-admin-read-appointments";


  const MESSAGE_READ_KEY =
    "wellborn-admin-read-messages";


  const REVIEW_READ_KEY =
    "wellborn-admin-read-reviews";


  /* =====================================================
     GET READ IDS
  ===================================================== */

  const getReadIds = (
    key
  ) => {

    try {

      const stored =
        localStorage.getItem(key);


      if (!stored) {

        return new Set();

      }


      const parsed =
        JSON.parse(stored);


      if (!Array.isArray(parsed)) {

        return new Set();

      }


      return new Set(
        parsed.map(String)
      );

    } catch (error) {

      console.error(
        "Notification read-state error:",
        error
      );


      return new Set();

    }

  };


  /* =====================================================
     SAVE READ IDS
  ===================================================== */

  const saveReadIds = (
    key,
    ids
  ) => {

    try {

      localStorage.setItem(
        key,
        JSON.stringify(
          Array.from(ids)
        )
      );

    } catch (error) {

      console.error(
        "Unable to save notification read state:",
        error
      );

    }

  };


  /* =====================================================
     SHOW NOTIFICATION
  ===================================================== */

  const showNotification = ({
    type,
    title,
    message,
    count = 1,
  }) => {

    if (
      notificationTimerRef.current
    ) {

      clearTimeout(
        notificationTimerRef.current
      );

    }


    setNotification({

      type,
      title,
      message,
      count,
      id: Date.now(),

    });


    notificationTimerRef.current =
      setTimeout(() => {

        setNotification(null);

      }, 5000);

  };


  /* =====================================================
     CLOSE NOTIFICATION
  ===================================================== */

  const closeNotification = () => {

    if (
      notificationTimerRef.current
    ) {

      clearTimeout(
        notificationTimerRef.current
      );

    }


    setNotification(null);

  };


  /* =====================================================
     OPEN CENTER
  ===================================================== */

  const openNotificationCenter = () => {

    setNotificationCenterOpen(
      previous =>
        !previous
    );

  };


  /* =====================================================
     CLOSE CENTER
  ===================================================== */

  const closeNotificationCenter = () => {

    setNotificationCenterOpen(false);

  };


  /* =====================================================
     MARK APPOINTMENTS READ
  ===================================================== */

  const markAppointmentsAsRead = (
    appointmentIds
  ) => {

    if (
      !Array.isArray(
        appointmentIds
      ) ||
      appointmentIds.length === 0
    ) {

      return;

    }


    const readIds =
      getReadIds(
        APPOINTMENT_READ_KEY
      );


    appointmentIds.forEach(
      (id) => {

        if (
          id !== undefined &&
          id !== null
        ) {

          readIds.add(
            String(id)
          );

        }

      }
    );


    saveReadIds(
      APPOINTMENT_READ_KEY,
      readIds
    );

  };


  /* =====================================================
     MARK MESSAGES READ
  ===================================================== */

  const markMessagesAsRead = (
    messageIds
  ) => {

    if (
      !Array.isArray(
        messageIds
      ) ||
      messageIds.length === 0
    ) {

      return;

    }


    const readIds =
      getReadIds(
        MESSAGE_READ_KEY
      );


    messageIds.forEach(
      (id) => {

        if (
          id !== undefined &&
          id !== null
        ) {

          readIds.add(
            String(id)
          );

        }

      }
    );


    saveReadIds(
      MESSAGE_READ_KEY,
      readIds
    );

  };


  /* =====================================================
     MARK REVIEWS READ
  ===================================================== */

  const markReviewsAsRead = (
    reviewIds
  ) => {

    if (
      !Array.isArray(
        reviewIds
      ) ||
      reviewIds.length === 0
    ) {

      return;

    }


    const readIds =
      getReadIds(
        REVIEW_READ_KEY
      );


    reviewIds.forEach(
      (id) => {

        if (
          id !== undefined &&
          id !== null
        ) {

          readIds.add(
            String(id)
          );

        }

      }
    );


    saveReadIds(
      REVIEW_READ_KEY,
      readIds
    );

  };


  /* =====================================================
     GET APPOINTMENT ID
  ===================================================== */

  const getAppointmentId = (
    appointment
  ) => {

    return (
      appointment?.appointmentId ??
      appointment?.id ??
      appointment?._id
    );

  };


  /* =====================================================
     GET MESSAGE ID
  ===================================================== */

  const getMessageId = (
    message
  ) => {

    return (
      message?.contactId ??
      message?.messageId ??
      message?.id ??
      message?._id
    );

  };


  /* =====================================================
     GET REVIEW ID
  ===================================================== */

  const getReviewId = (
    review
  ) => {

    return (
      review?.reviewId ??
      review?.id ??
      review?._id
    );

  };


  /* =====================================================
     FETCH BADGE COUNTS
  ===================================================== */

  const fetchBadgeCounts =
    async () => {

      try {

        /* =============================================
           APPOINTMENTS
        ============================================= */

        const aptRes =
          await getData(
            API?.APPOINTMENT_GET_ALL ||
            "/appointment/getall"
          );


        const aptList =
          Array.isArray(aptRes)
            ? aptRes
            : Array.isArray(aptRes?.data)
              ? aptRes.data
              : [];


        const pendingAppointments =
          aptList.filter(
            (appointment) => {

              const status =
                String(
                  appointment?.status ??
                  appointment?.appointmentStatus ??
                  ""
                )
                  .trim()
                  .toUpperCase();


              return (
                status === "PENDING" ||
                status === "NEW" ||
                status === ""
              );

            }
          );


        const readAppointmentIds =
          getReadIds(
            APPOINTMENT_READ_KEY
          );


        const unreadAppointments =
          pendingAppointments.filter(
            (appointment) => {

              const id =
                getAppointmentId(
                  appointment
                );


              if (
                id === undefined ||
                id === null
              ) {

                return false;

              }


              return !readAppointmentIds.has(
                String(id)
              );

            }
          );


        setAppointmentCount(
          unreadAppointments.length
        );


        /* =============================================
           CONTACT MESSAGES
        ============================================= */

        const msgRes =
          await getData(
            API?.CONTACT_GET_ALL
          );


        const msgList =
          Array.isArray(msgRes)
            ? msgRes
            : Array.isArray(msgRes?.data)
              ? msgRes.data
              : [];


        const newMessages =
          msgList.filter(
            (message) => {

              const status =
                String(
                  message?.status || "NEW"
                )
                  .trim()
                  .toUpperCase();


              return status === "NEW";

            }
          );


        const readMessageIds =
          getReadIds(
            MESSAGE_READ_KEY
          );


        const unreadMessages =
          newMessages.filter(
            (message) => {

              const id =
                getMessageId(
                  message
                );


              if (
                id === undefined ||
                id === null
              ) {

                return false;

              }


              return !readMessageIds.has(
                String(id)
              );

            }
          );


        setMessageCount(
          unreadMessages.length
        );


        /* =============================================
           REVIEWS
        ============================================= */

        const reviewRes =
          await getData(
            API?.REVIEW_GET_ALL ||
            "/review/getall"
          );


        const reviewList =
          Array.isArray(reviewRes)
            ? reviewRes
            : Array.isArray(reviewRes?.data)
              ? reviewRes.data
              : [];


        const pendingReviews =
          reviewList.filter(
            (review) => {

              const status =
                String(
                  review?.status || ""
                )
                  .trim()
                  .toUpperCase();


              return status === "PENDING";

            }
          );


        const readReviewIds =
          getReadIds(
            REVIEW_READ_KEY
          );


        const unreadReviews =
          pendingReviews.filter(
            (review) => {

              const id =
                getReviewId(
                  review
                );


              if (
                id === undefined ||
                id === null
              ) {

                return false;

              }


              return !readReviewIds.has(
                String(id)
              );

            }
          );


        setReviewCount(
          unreadReviews.length
        );


        /* =============================================
           FIRST LOAD
        ============================================= */

        if (
          firstNotificationLoadRef.current
        ) {

          previousAppointmentIdsRef.current =
            new Set(
              unreadAppointments
                .map(
                  getAppointmentId
                )
                .filter(
                  id =>
                    id !== undefined &&
                    id !== null
                )
                .map(String)
            );


          previousMessageIdsRef.current =
            new Set(
              unreadMessages
                .map(
                  getMessageId
                )
                .filter(
                  id =>
                    id !== undefined &&
                    id !== null
                )
                .map(String)
            );


          previousReviewIdsRef.current =
            new Set(
              unreadReviews
                .map(
                  getReviewId
                )
                .filter(
                  id =>
                    id !== undefined &&
                    id !== null
                )
                .map(String)
            );


          firstNotificationLoadRef.current =
            false;


          return;

        }


        /* =============================================
           CURRENT APPOINTMENT IDS
        ============================================= */

        const currentAppointmentIds =
          new Set(
            unreadAppointments
              .map(
                getAppointmentId
              )
              .filter(
                id =>
                  id !== undefined &&
                  id !== null
              )
              .map(String)
          );


        const newlyAddedAppointments =
          unreadAppointments.filter(
            (appointment) => {

              const id =
                getAppointmentId(
                  appointment
                );


              return (
                id !== undefined &&
                id !== null &&
                !previousAppointmentIdsRef.current.has(
                  String(id)
                )
              );

            }
          );


        /* =============================================
           CURRENT MESSAGE IDS
        ============================================= */

        const currentMessageIds =
          new Set(
            unreadMessages
              .map(
                getMessageId
              )
              .filter(
                id =>
                  id !== undefined &&
                  id !== null
              )
              .map(String)
          );


        const newlyAddedMessages =
          unreadMessages.filter(
            (message) => {

              const id =
                getMessageId(
                  message
                );


              return (
                id !== undefined &&
                id !== null &&
                !previousMessageIdsRef.current.has(
                  String(id)
                )
              );

            }
          );


        /* =============================================
           CURRENT REVIEW IDS
        ============================================= */

        const currentReviewIds =
          new Set(
            unreadReviews
              .map(
                getReviewId
              )
              .filter(
                id =>
                  id !== undefined &&
                  id !== null
              )
              .map(String)
          );


        const newlyAddedReviews =
          unreadReviews.filter(
            (review) => {

              const id =
                getReviewId(
                  review
                );


              return (
                id !== undefined &&
                id !== null &&
                !previousReviewIdsRef.current.has(
                  String(id)
                )
              );

            }
          );


        /* =============================================
           APPOINTMENT POPUP
        ============================================= */

        if (
          newlyAddedAppointments.length > 0
        ) {

          const latest =
            newlyAddedAppointments[
              newlyAddedAppointments.length - 1
            ];


          const patientName =
            latest?.patientName ||
            latest?.name ||
            "New patient";


          const total =
            newlyAddedAppointments.length;


          showNotification({

            type: "appointment",

            title:
              total === 1
                ? "New Appointment"
                : `${total} New Appointments`,

            message:
              total === 1
                ? `${patientName} has booked a new appointment.`
                : `${total} new appointment requests are waiting.`,

            count: total,

          });

        }


        /* =============================================
           MESSAGE POPUP
        ============================================= */

        if (
          newlyAddedMessages.length > 0
        ) {

          const latest =
            newlyAddedMessages[
              newlyAddedMessages.length - 1
            ];


          const sender =
            latest?.name ||
            latest?.senderName ||
            latest?.patientName ||
            "Someone";


          const total =
            newlyAddedMessages.length;


          showNotification({

            type: "message",

            title:
              total === 1
                ? "New Message"
                : `${total} New Messages`,

            message:
              total === 1
                ? `${sender} sent you a new message.`
                : `${total} new messages are waiting.`,

            count: total,

          });

        }


        /* =============================================
           REVIEW POPUP
        ============================================= */

        if (
          newlyAddedReviews.length > 0
        ) {

          const latest =
            newlyAddedReviews[
              newlyAddedReviews.length - 1
            ];


          const patientName =
            latest?.patientName ||
            "Someone";


          const total =
            newlyAddedReviews.length;


          showNotification({

            type: "review",

            title:
              total === 1
                ? "New Review"
                : `${total} New Reviews`,

            message:
              total === 1
                ? `${patientName} left a new review.`
                : `${total} new reviews are waiting.`,

            count: total,

          });

        }


        previousAppointmentIdsRef.current =
          currentAppointmentIds;


        previousMessageIdsRef.current =
          currentMessageIds;


        previousReviewIdsRef.current =
          currentReviewIds;

      } catch (error) {

        console.error(
          "Badge count fetch error:",
          error
        );

      }

    };


  /* =====================================================
     FETCH NOTIFICATIONS
  ===================================================== */

  useEffect(() => {

    if (isLoginPage) {
      return;
    }


    fetchBadgeCounts();


    const interval =
      setInterval(
        fetchBadgeCounts,
        30000
      );


    return () => {

      clearInterval(
        interval
      );

    };

  }, [
    isLoginPage,
    location.pathname,
  ]);


  /* =====================================================
     MARK CURRENT PAGE READ
  ===================================================== */

  useEffect(() => {

    if (isLoginPage) {
      return;
    }


    const markCurrentPageAsRead =
      async () => {

        try {

          /* ===========================================
             APPOINTMENTS
          =========================================== */

          if (
            location.pathname ===
            "/admin/appointments"
          ) {

            const response =
              await getData(
                API?.APPOINTMENT_GET_ALL ||
                "/appointment/getall"
              );


            const list =
              Array.isArray(response)
                ? response
                : Array.isArray(response?.data)
                  ? response.data
                  : [];


            const ids =
              list
                .filter(
                  (appointment) => {

                    const status =
                      String(
                        appointment?.status ??
                        appointment?.appointmentStatus ??
                        ""
                      )
                        .trim()
                        .toUpperCase();


                    return (
                      status === "PENDING" ||
                      status === "NEW" ||
                      status === ""
                    );

                  }
                )
                .map(
                  getAppointmentId
                )
                .filter(
                  id =>
                    id !== undefined &&
                    id !== null
                );


            markAppointmentsAsRead(
              ids
            );


            setAppointmentCount(0);


            previousAppointmentIdsRef.current =
              new Set();

          }


          /* ===========================================
             MESSAGES
          =========================================== */

          if (
            location.pathname ===
            "/admin/messages"
          ) {

            const response =
              await getData(
                API?.CONTACT_GET_ALL
              );


            const list =
              Array.isArray(response)
                ? response
                : Array.isArray(response?.data)
                  ? response.data
                  : [];


            const ids =
              list
                .filter(
                  (message) => {

                    const status =
                      String(
                        message?.status || "NEW"
                      )
                        .trim()
                        .toUpperCase();


                    return status === "NEW";

                  }
                )
                .map(
                  getMessageId
                )
                .filter(
                  id =>
                    id !== undefined &&
                    id !== null
                );


            markMessagesAsRead(
              ids
            );


            setMessageCount(0);


            previousMessageIdsRef.current =
              new Set();

          }


          /* ===========================================
             REVIEWS
          =========================================== */

          if (
            location.pathname ===
            "/admin/reviews"
          ) {

            const response =
              await getData(
                API?.REVIEW_GET_ALL ||
                "/review/getall"
              );


            const list =
              Array.isArray(response)
                ? response
                : Array.isArray(response?.data)
                  ? response.data
                  : [];


            const ids =
              list
                .filter(
                  (review) => {

                    const status =
                      String(
                        review?.status || ""
                      )
                        .trim()
                        .toUpperCase();


                    return status === "PENDING";

                  }
                )
                .map(
                  getReviewId
                )
                .filter(
                  id =>
                    id !== undefined &&
                    id !== null
                );


            markReviewsAsRead(
              ids
            );


            setReviewCount(0);


            previousReviewIdsRef.current =
              new Set();

          }

        } catch (error) {

          console.error(
            "Unable to mark notifications as read:",
            error
          );

        }

      };


    markCurrentPageAsRead();

  }, [
    location.pathname,
    isLoginPage,
  ]);


  /* =====================================================
     CLOSE NOTIFICATION CENTER OUTSIDE CLICK
  ===================================================== */

  useEffect(() => {

    const handleOutsideClick =
      (event) => {

        if (
          notificationCenterRef.current &&
          !notificationCenterRef.current.contains(
            event.target
          )
        ) {

          setNotificationCenterOpen(
            false
          );

        }

      };


    if (
      notificationCenterOpen
    ) {

      document.addEventListener(
        "mousedown",
        handleOutsideClick
      );


      document.addEventListener(
        "touchstart",
        handleOutsideClick
      );

    }


    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );


      document.removeEventListener(
        "touchstart",
        handleOutsideClick
      );

    };

  }, [
    notificationCenterOpen,
  ]);


  /* =====================================================
     NAVIGATION ITEMS
  ===================================================== */

  const navItems = [

    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: Home,
    },

    {
      name: "Doctors",
      path: "/admin/doctors",
      icon: UserRound,
    },

    {
      name: "Services",
      path: "/admin/services",
      icon: Stethoscope,
    },

    {
      name: "Appointments",
      path: "/admin/appointments",
      icon: CalendarCheck,
      badge: appointmentCount,
    },

    {
      name: "Messages",
      path: "/admin/messages",
      icon: Mail,
      badge: messageCount,
    },

    {
      name: "Reviews",
      path: "/admin/reviews",
      icon: Star,
      badge: reviewCount,
    },

    {
      name: "Settings",
      path: "/admin/settings",
      icon: Settings,
    },

  ];


  /* =====================================================
     CLOSE MOBILE MENU ON ROUTE CHANGE
  ===================================================== */

  useEffect(() => {

    setMenuOpen(false);

    setNotificationCenterOpen(
      false
    );

  }, [
    location.pathname,
  ]);


  /* =====================================================
     MOBILE OUTSIDE CLICK
  ===================================================== */

  useEffect(() => {

    const handleOutsideClick =
      (event) => {

        if (!menuOpen) {
          return;
        }


        const navbar =
          document.querySelector(
            ".wellborn-admin-navbar"
          );


        if (
          navbar &&
          !navbar.contains(
            event.target
          )
        ) {

          setMenuOpen(false);

        }

      };


    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );


    document.addEventListener(
      "touchstart",
      handleOutsideClick
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );


      document.removeEventListener(
        "touchstart",
        handleOutsideClick
      );

    };

  }, [
    menuOpen,
  ]);


  /* =====================================================
     GLOBAL ADMIN CSS
  ===================================================== */

  useEffect(() => {

    const oldStyle =
      document.getElementById(
        "wellborn-admin-shell-style"
      );


    if (oldStyle) {
      oldStyle.remove();
    }


    const style =
      document.createElement("style");


    style.id =
      "wellborn-admin-shell-style";


    style.innerHTML = `

      html,
      body,
      #root {

        width: 100%;
        max-width: 100%;
        min-height: 100%;
        margin: 0;
        padding: 0;

      }


      html,
      body {

        overflow-x: hidden;

      }


      *,
      *::before,
      *::after {

        box-sizing: border-box;

      }


      /* =================================================
         LIGHT THEME
      ================================================= */

      :root {

        --wellborn-admin-bg:
          #f5f7fb;

        --wellborn-admin-surface:
          #ffffff;

        --wellborn-admin-surface-2:
          #f8fafc;

        --wellborn-admin-border:
          #e2e8f0;

        --wellborn-admin-text:
          #1e293b;

        --wellborn-admin-text-strong:
          #0f172a;

        --wellborn-admin-text-muted:
          #64748b;

        --wellborn-admin-navbar-start:
          #2446b8;

        --wellborn-admin-navbar-middle:
          #1d4ed8;

        --wellborn-admin-navbar-end:
          #2563eb;

      }


      /* =================================================
         DARK THEME
      ================================================= */

      html[data-wellborn-theme="dark"],
      body[data-wellborn-theme="dark"],
      #root[data-wellborn-theme="dark"] {

        --wellborn-admin-bg:
          #070d1a;

        --wellborn-admin-surface:
          #0f172a;

        --wellborn-admin-surface-2:
          #111c30;

        --wellborn-admin-border:
          #24344d;

        --wellborn-admin-text:
          #dbeafe;

        --wellborn-admin-text-strong:
          #f8fafc;

        --wellborn-admin-text-muted:
          #94a3b8;

        --wellborn-admin-navbar-start:
          #0b1735;

        --wellborn-admin-navbar-middle:
          #102653;

        --wellborn-admin-navbar-end:
          #163b78;

      }


      /* =================================================
         GLOBAL BACKGROUND
      ================================================= */

      html {

        background:
          var(--wellborn-admin-bg);

        transition:
          background-color .25s ease;

      }


      body {

        background:
          var(--wellborn-admin-bg);

        color:
          var(--wellborn-admin-text);

        transition:
          background-color .25s ease,
          color .25s ease;

      }


      body.wellborn-admin-dark {

        background:
          #070d1a !important;

        color:
          #dbeafe !important;

      }


      #root {

        background:
          var(--wellborn-admin-bg);

        color:
          var(--wellborn-admin-text);

        transition:
          background-color .25s ease,
          color .25s ease;

      }


      #root.wellborn-admin-dark {

        background:
          #070d1a !important;

        color:
          #dbeafe !important;

      }


      /* =================================================
         SHELL
      ================================================= */

      .wellborn-admin-shell {

        width: 100%;
        max-width: 100%;
        min-height: 100vh;

        margin: 0;
        padding: 0;

        overflow-x: hidden;

        background:
          var(--wellborn-admin-bg);

        color:
          var(--wellborn-admin-text);

        transition:
          background-color .25s ease,
          color .25s ease;

      }


      .wellborn-admin-shell.wellborn-admin-dark {

        background:
          #070d1a !important;

        color:
          #dbeafe !important;

      }


      /* =================================================
         NAVBAR
      ================================================= */

      .wellborn-admin-navbar {

        position: fixed;

        top: 0;
        left: 0;

        z-index: 9999;

        width: 100%;
        max-width: 100%;

        height: 78px;

        margin: 0;
        padding: 0;

        background:
          linear-gradient(
            135deg,
            var(--wellborn-admin-navbar-start),
            var(--wellborn-admin-navbar-middle),
            var(--wellborn-admin-navbar-end)
          );

        box-shadow:
          0 5px 22px
          rgba(15,23,42,.18);

        transition:
          background .25s ease,
          box-shadow .25s ease;

      }


      html[data-wellborn-theme="dark"]
      .wellborn-admin-navbar {

        background:
          linear-gradient(
            135deg,
            #08142e,
            #0d2450,
            #12386e
          ) !important;

        box-shadow:
          0 7px 30px
          rgba(0,0,0,.45);

      }


      /* =================================================
         NAVBAR INNER
      ================================================= */

      .wellborn-admin-navbar-inner {

        width: 100%;
        max-width: 100%;

        height: 78px;
        min-height: 78px;

        display: grid;

        grid-template-columns:
          minmax(210px, 1fr)
          auto
          minmax(210px, 1fr);

        align-items: center;

        gap: 10px;

        margin: 0;

        padding: 0 24px;

      }


      /* =================================================
         BRAND
      ================================================= */

      .wellborn-admin-brand {

        justify-self: start;

        display: flex;

        align-items: center;

        gap: 10px;

        min-width: 0;

        margin: 0;
        padding: 0;

        border: none;
        outline: none;

        background: transparent;

        color: white;

        cursor: pointer;

        text-align: left;

        overflow: visible;

      }


      .wellborn-admin-logo {

        width: 48px;
        height: 48px;

        min-width: 48px;
        min-height: 48px;

        display: block;

        object-fit: cover;

        border-radius: 12px;

        background: white;

        padding: 3px;

        box-shadow:
          0 4px 13px
          rgba(0,0,0,.18);

        transition:
          transform .25s ease,
          box-shadow .25s ease;

      }


      .wellborn-admin-brand:hover
      .wellborn-admin-logo {

        transform:
          scale(1.04);

        box-shadow:
          0 7px 18px
          rgba(0,0,0,.24);

      }


      .wellborn-admin-brand-text {

        display: flex;

        flex-direction: column;

        justify-content: center;

        min-width: 0;

        overflow: visible;

      }


      .wellborn-admin-brand-text h2 {

        margin: 0;

        color: white;

        font-size: 17px;

        font-weight: 750;

        line-height: 1.15;

        white-space: nowrap;

      }


      .wellborn-admin-brand-text p {

        margin: 3px 0 0;

        color: #dbeafe;

        font-size: 10px;

        font-weight: 500;

        line-height: 1.1;

        white-space: nowrap;

      }


      /* =================================================
         DESKTOP NAV
      ================================================= */

      .wellborn-admin-nav {

        justify-self: center;

        display: flex;

        align-items: center;

        justify-content: center;

        gap: 2px;

        white-space: nowrap;

      }


      .wellborn-admin-nav-button {

        min-height: 40px;

        display: flex;

        align-items: center;

        justify-content: center;

        gap: 6px;

        margin: 0;

        padding: 8px 10px;

        border: none;

        border-radius: 10px;

        background: transparent;

        color: white;

        font-family: inherit;

        font-size: 12px;

        font-weight: 650;

        white-space: nowrap;

        cursor: pointer;

        position: relative;

        transition:
          background-color .2s ease,
          transform .2s ease;

      }


      .wellborn-admin-nav-button:hover {

        background:
          rgba(255,255,255,.14);

        transform:
          translateY(-1px);

      }


      .wellborn-admin-nav-button.active {

        background:
          rgba(59,130,246,.85);

        box-shadow:
          0 4px 12px
          rgba(0,0,0,.16);

      }


      html[data-wellborn-theme="dark"]
      .wellborn-admin-nav-button.active {

        background:
          #1e4f91;

      }


      .wellborn-nav-badge {

        display: inline-flex;

        align-items: center;
        justify-content: center;

        min-width: 18px;

        height: 18px;

        padding: 0 5px;

        border-radius: 9px;

        background: #ef4444;

        color: white;

        font-size: 10px;

        font-weight: 800;

        margin-left: 2px;

      }


      /* =================================================
         CONTROLS
      ================================================= */

      .wellborn-admin-controls {

        justify-self: end;

        display: flex;

        align-items: center;

        gap: 8px;

        position: relative;

      }


      /* =================================================
         LOGOUT
      ================================================= */

      .wellborn-desktop-logout {

        min-height: 42px;

        display: flex;

        align-items: center;

        justify-content: center;

        gap: 6px;

        margin: 0;

        padding: 0 12px;

        border: none;

        border-radius: 11px;

        background:
          rgba(255,255,255,.14);

        color: white;

        font-family: inherit;

        font-size: 12px;

        font-weight: 650;

        cursor: pointer;

        transition:
          background-color .2s ease,
          transform .2s ease;

      }


      .wellborn-desktop-logout:hover {

        background: #dc2626;

        transform:
          translateY(-1px);

      }


      /* =================================================
         FCM BELL
      ================================================= */

      .wellborn-fcm-bell-wrap {

        position: relative;

        display: flex;

        align-items: center;
        justify-content: center;

      }


      .wellborn-fcm-bell-button {

        width: 42px;
        height: 42px;

        min-width: 42px;
        min-height: 42px;

        display: flex;

        align-items: center;
        justify-content: center;

        border-radius: 11px;

        background:
          rgba(255,255,255,.16);

        color: white;

        border:
          1px solid
          rgba(255,255,255,.28);

        cursor: pointer;

        transition:
          transform .2s ease,
          background-color .2s ease;

      }


      .wellborn-fcm-bell-button:hover {

        background:
          rgba(255,255,255,.28);

        transform:
          scale(1.05);

      }


      .wellborn-fcm-bell-button:active {

        transform:
          scale(.96);

      }


      .wellborn-fcm-bell-badge {

        position: absolute;

        top: -4px;
        right: -4px;

        min-width: 18px;

        height: 18px;

        padding: 0 4px;

        border-radius: 9px;

        background: #ef4444;

        color: white;

        font-size: 9px;

        font-weight: 800;

        display: flex;

        align-items: center;
        justify-content: center;

        box-shadow:
          0 2px 6px
          rgba(239,68,68,.5);

        border:
          1.5px solid
          var(--wellborn-admin-navbar-middle);

      }


      /* =================================================
         CENTER NOTIFICATION
      ================================================= */

      .wellborn-fcm-center-overlay {

        position: fixed;

        top: 0;
        left: 0;

        z-index: 999998;

        width: 100vw;
        height: 100vh;

        pointer-events: none;

      }


      .wellborn-fcm-center-panel {

        position: absolute;

        top: 96px;
        left: 50%;

        transform:
          translateX(-50%);

        width:
          min(
            430px,
            calc(100vw - 30px)
          );

        max-width: 430px;

        background:
          var(--wellborn-admin-surface);

        border:
          1px solid
          var(--wellborn-admin-border);

        border-radius: 16px;

        box-shadow:
          0 20px 60px
          rgba(15,23,42,.25);

        overflow: hidden;

        pointer-events: auto;

        animation:
          wellbornCenterNotificationIn
          .28s
          cubic-bezier(.22,1,.36,1)
          both;

        transition:
          background-color .25s ease,
          border-color .25s ease;

      }


      @keyframes wellbornCenterNotificationIn {

        from {

          opacity: 0;

          transform:
            translateX(-50%)
            translateY(-20px)
            scale(.94);

        }

        to {

          opacity: 1;

          transform:
            translateX(-50%)
            translateY(0)
            scale(1);

        }

      }


      .wellborn-fcm-center-header {

        display: flex;

        align-items: center;

        justify-content: space-between;

        gap: 10px;

        padding: 14px 16px;

        background:
          var(--wellborn-admin-surface-2);

        border-bottom:
          1px solid
          var(--wellborn-admin-border);

      }


      .wellborn-fcm-center-header-left {

        display: flex;

        align-items: center;

        gap: 9px;

      }


      .wellborn-fcm-center-header-icon {

        width: 34px;
        height: 34px;

        min-width: 34px;

        display: flex;

        align-items: center;
        justify-content: center;

        border-radius: 10px;

        background:
          linear-gradient(
            135deg,
            #2563eb,
            #4f46e5
          );

        color: white;

      }


      .wellborn-fcm-center-header h4 {

        margin: 0;

        color:
          var(--wellborn-admin-text-strong);

        font-size: 14px;

        font-weight: 800;

      }


      .wellborn-fcm-center-unread {

        font-size: 11px;

        font-weight: 700;

        color:
          var(--wellborn-admin-text-muted);

        white-space: nowrap;

      }


      .wellborn-fcm-center-close {

        width: 30px;
        height: 30px;

        min-width: 30px;

        display: flex;

        align-items: center;
        justify-content: center;

        border: none;

        border-radius: 9px;

        background:
          var(--wellborn-admin-border);

        color:
          var(--wellborn-admin-text-muted);

        cursor: pointer;

        transition:
          background-color .2s ease,
          color .2s ease;

      }


      .wellborn-fcm-center-close:hover {

        background:
          #cbd5e1;

        color:
          var(--wellborn-admin-text-strong);

      }


      html[data-wellborn-theme="dark"]
      .wellborn-fcm-center-close:hover {

        background:
          #334155;

      }


      .wellborn-fcm-center-body {

        max-height: 330px;

        overflow-y: auto;

      }


      .wellborn-fcm-center-item {

        width: 100%;

        display: flex;

        align-items: flex-start;

        gap: 12px;

        padding: 14px 16px;

        border: none;

        border-bottom:
          1px solid
          var(--wellborn-admin-border);

        background: transparent;

        text-align: left;

        cursor: pointer;

        transition:
          background-color .18s ease;

      }


      .wellborn-fcm-center-item:hover {

        background:
          var(--wellborn-admin-surface-2);

      }


      .wellborn-fcm-center-item:last-child {

        border-bottom: none;

      }


      .wellborn-fcm-center-item-icon {

        width: 40px;
        height: 40px;

        min-width: 40px;

        display: flex;

        align-items: center;
        justify-content: center;

        border-radius: 11px;

        color: white;

      }


      .wellborn-fcm-center-item-icon.appointment {

        background:
          linear-gradient(
            135deg,
            #2563eb,
            #4f46e5
          );

      }


      .wellborn-fcm-center-item-icon.message {

        background:
          linear-gradient(
            135deg,
            #059669,
            #0d9488
          );

      }


      .wellborn-fcm-center-item-icon.review {

        background:
          linear-gradient(
            135deg,
            #f59e0b,
            #d97706
          );

      }


      .wellborn-fcm-center-item-content {

        flex: 1;

        min-width: 0;

      }


      .wellborn-fcm-center-item-title {

        margin: 0;

        color:
          var(--wellborn-admin-text-strong);

        font-size: 13px;

        font-weight: 800;

        line-height: 1.3;

      }


      .wellborn-fcm-center-item-desc {

        margin: 4px 0 0;

        color:
          var(--wellborn-admin-text-muted);

        font-size: 11px;

        line-height: 1.4;

      }


      .wellborn-fcm-center-empty {

        padding: 30px 16px;

        text-align: center;

        color:
          var(--wellborn-admin-text-muted);

        font-size: 12px;

        font-weight: 600;

      }


      /* =================================================
         MOBILE MENU BUTTON
      ================================================= */

      .wellborn-mobile-menu-button {

        display: none;

        width: 42px;
        height: 42px;

        min-width: 42px;
        min-height: 42px;

        align-items: center;
        justify-content: center;

        margin: 0;
        padding: 0;

        border: none;

        border-radius: 11px;

        background:
          rgba(255,255,255,.14);

        color: white;

        cursor: pointer;

        position: relative;

        transition:
          background-color .2s ease,
          transform .2s ease;

      }


      .wellborn-mobile-menu-button:hover {

        background:
          rgba(255,255,255,.22);

      }


      /* =================================================
         MOBILE MENU
      ================================================= */

      .wellborn-mobile-menu {

        display: none;

        width: 100%;
        max-width: 100%;

        margin: 0;

        padding: 10px 14px 15px;

        background:
          linear-gradient(
            180deg,
            var(--wellborn-admin-navbar-start),
            var(--wellborn-admin-navbar-middle)
          );

        border-top:
          1px solid
          rgba(255,255,255,.12);

        box-shadow:
          0 12px 25px
          rgba(0,0,0,.18);

      }


      .wellborn-mobile-menu.open {

        display: block;

      }


      .wellborn-mobile-nav-button {

        width: 100%;

        min-height: 47px;

        display: flex;

        align-items: center;

        justify-content: space-between;

        margin: 0 0 4px;

        padding: 10px 14px;

        border: none;

        border-radius: 11px;

        background: transparent;

        color: white;

        font-family: inherit;

        font-size: 14px;

        font-weight: 650;

        cursor: pointer;

        transition:
          background-color .2s ease;

      }


      .wellborn-mobile-nav-button:hover {

        background:
          rgba(255,255,255,.10);

      }


      .wellborn-mobile-nav-button.active {

        background:
          #3b82f6;

        box-shadow:
          0 4px 12px
          rgba(0,0,0,.14);

      }


      html[data-wellborn-theme="dark"]
      .wellborn-mobile-nav-button.active {

        background:
          #1e4f91;

      }


      .wellborn-mobile-nav-left {

        display: flex;

        align-items: center;

        gap: 12px;

      }


      .wellborn-mobile-menu-dot {

        width: 9px;
        height: 9px;

        border-radius: 50%;

        background: #22c55e;

        display: inline-block;

        box-shadow:
          0 0 8px
          rgba(34,197,94,.55);

      }


      .wellborn-mobile-badge {

        display: inline-flex;

        align-items: center;
        justify-content: center;

        min-width: 20px;

        height: 20px;

        padding: 0 6px;

        border-radius: 10px;

        background: #22c55e;

        color: white;

        font-size: 10px;

        font-weight: 800;

      }


      .wellborn-mobile-logout {

        width: 100%;

        min-height: 47px;

        display: flex;

        align-items: center;

        gap: 12px;

        margin: 8px 0 0;

        padding: 10px 14px;

        border:
          1px solid
          rgba(255,255,255,.10);

        border-radius: 11px;

        background:
          rgba(220,38,38,.10);

        color: white;

        font-family: inherit;

        font-size: 14px;

        font-weight: 650;

        text-align: left;

        cursor: pointer;

      }


      /* =================================================
         CONTENT
      ================================================= */

      .wellborn-admin-content {

        --admin-navbar-height: 78px;

        --admin-page-gap: 14px;

        width: 100%;
        max-width: 100%;

        min-height:
          calc(
            100vh -
            var(--admin-navbar-height)
          );

        margin: 0;

        padding:
          calc(
            var(--admin-navbar-height) +
            var(--admin-page-gap)
          )
          14px
          14px
          24px;

        overflow-x: hidden;

        background:
          var(--wellborn-admin-bg);

        color:
          var(--wellborn-admin-text);

        transition:
          background-color .25s ease,
          color .25s ease;

      }


      html[data-wellborn-theme="dark"]
      .wellborn-admin-content {

        background:
          #070d1a !important;

        color:
          #dbeafe !important;

      }


      .wellborn-admin-content > *:first-child {

        margin-top: 0;

      }


      /* =================================================
         AUTO NOTIFICATION
      ================================================= */

      .wellborn-admin-notification-wrapper {

        position: fixed;

        top: 18px;
        left: 50%;

        transform:
          translateX(-50%);

        z-index: 999999;

        width:
          min(
            calc(100vw - 30px),
            430px
          );

        pointer-events: none;

      }


      .wellborn-admin-notification {

        width: 100%;

        display: flex;

        align-items: center;

        gap: 12px;

        padding: 12px 14px;

        border-radius: 16px;

        background:
          var(--wellborn-admin-surface);

        border:
          1px solid
          var(--wellborn-admin-border);

        box-shadow:
          0 18px 55px
          rgba(15,23,42,.25);

        backdrop-filter:
          blur(18px);

        -webkit-backdrop-filter:
          blur(18px);

        pointer-events: auto;

        animation:
          wellbornNotificationIn
          .42s
          cubic-bezier(.22,1,.36,1)
          both;

      }


      @keyframes wellbornNotificationIn {

        from {

          opacity: 0;

          transform:
            translateY(-28px)
            scale(.94);

        }

        to {

          opacity: 1;

          transform:
            translateY(0)
            scale(1);

        }

      }


      .wellborn-notification-icon {

        width: 42px;
        height: 42px;

        min-width: 42px;

        display: flex;

        align-items: center;
        justify-content: center;

        border-radius: 13px;

        color: white;

        box-shadow:
          0 7px 18px
          rgba(37,99,235,.22);

      }


      .wellborn-notification-icon.appointment {

        background:
          linear-gradient(
            135deg,
            #2563eb,
            #4f46e5
          );

      }


      .wellborn-notification-icon.message {

        background:
          linear-gradient(
            135deg,
            #059669,
            #0d9488
          );

      }


      .wellborn-notification-icon.review {

        background:
          linear-gradient(
            135deg,
            #f59e0b,
            #d97706
          );

      }


      .wellborn-notification-content {

        flex: 1;

        min-width: 0;

      }


      .wellborn-notification-title {

        margin: 0;

        color:
          var(--wellborn-admin-text-strong);

        font-size: 13px;

        font-weight: 800;

        line-height: 1.25;

      }


      .wellborn-notification-message {

        margin: 3px 0 0;

        color:
          var(--wellborn-admin-text-muted);

        font-size: 11px;

        font-weight: 550;

        line-height: 1.35;

      }


      .wellborn-notification-count {

        display: inline-flex;

        align-items: center;
        justify-content: center;

        min-width: 22px;

        height: 22px;

        padding: 0 6px;

        margin-left: 5px;

        border-radius: 11px;

        background: #ef4444;

        color: white;

        font-size: 10px;

        font-weight: 800;

      }


      .wellborn-notification-close {

        width: 28px;
        height: 28px;

        min-width: 28px;

        display: flex;

        align-items: center;
        justify-content: center;

        border: none;

        border-radius: 9px;

        background:
          var(--wellborn-admin-surface-2);

        color:
          var(--wellborn-admin-text-muted);

        cursor: pointer;

        transition:
          background-color .2s ease,
          color .2s ease;

      }


      .wellborn-notification-close:hover {

        background:
          var(--wellborn-admin-border);

        color:
          var(--wellborn-admin-text-strong);

      }


      /* =================================================
         DARK COMMON ADMIN SURFACES
      ================================================= */

      html[data-wellborn-theme="dark"]
      .wellborn-admin-shell
      .bg-white {

        background-color:
          #0f172a !important;

      }


      html[data-wellborn-theme="dark"]
      .wellborn-admin-shell
      .bg-slate-50 {

        background-color:
          #0b1324 !important;

      }


      html[data-wellborn-theme="dark"]
      .wellborn-admin-shell
      .bg-gray-50 {

        background-color:
          #0b1324 !important;

      }


      html[data-wellborn-theme="dark"]
      .wellborn-admin-shell
      .bg-gray-100 {

        background-color:
          #111c30 !important;

      }


      html[data-wellborn-theme="dark"]
      .wellborn-admin-shell
      .bg-blue-50 {

        background-color:
          #102653 !important;

      }


      html[data-wellborn-theme="dark"]
      .wellborn-admin-shell
      .border-gray-100,

      html[data-wellborn-theme="dark"]
      .wellborn-admin-shell
      .border-gray-200,

      html[data-wellborn-theme="dark"]
      .wellborn-admin-shell
      .border-slate-100,

      html[data-wellborn-theme="dark"]
      .wellborn-admin-shell
      .border-slate-200 {

        border-color:
          #24344d !important;

      }


      html[data-wellborn-theme="dark"]
      .wellborn-admin-shell
      .text-gray-900,

      html[data-wellborn-theme="dark"]
      .wellborn-admin-shell
      .text-slate-900 {

        color:
          #f8fafc !important;

      }


      html[data-wellborn-theme="dark"]
      .wellborn-admin-shell
      .text-gray-800,

      html[data-wellborn-theme="dark"]
      .wellborn-admin-shell
      .text-slate-800 {

        color:
          #e2e8f0 !important;

      }


      html[data-wellborn-theme="dark"]
      .wellborn-admin-shell
      .text-gray-700,

      html[data-wellborn-theme="dark"]
      .wellborn-admin-shell
      .text-slate-700 {

        color:
          #cbd5e1 !important;

      }


      html[data-wellborn-theme="dark"]
      .wellborn-admin-shell
      .text-gray-600,

      html[data-wellborn-theme="dark"]
      .wellborn-admin-shell
      .text-slate-600 {

        color:
          #94a3b8 !important;

      }


      html[data-wellborn-theme="dark"]
      .wellborn-admin-shell
      input,

      html[data-wellborn-theme="dark"]
      .wellborn-admin-shell
      textarea,

      html[data-wellborn-theme="dark"]
      .wellborn-admin-shell
      select {

        background-color:
          #0f172a !important;

        color:
          #f8fafc !important;

        border-color:
          #334155 !important;

      }


      html[data-wellborn-theme="dark"]
      .wellborn-admin-shell
      input::placeholder,

      html[data-wellborn-theme="dark"]
      .wellborn-admin-shell
      textarea::placeholder {

        color:
          #64748b !important;

      }


      /* =================================================
         1250
      ================================================= */

      @media (max-width: 1250px) {

        .wellborn-admin-navbar-inner {

          padding:
            0 15px;

        }


        .wellborn-admin-nav {

          gap: 1px;

        }


        .wellborn-admin-nav-button {

          padding:
            8px 7px;

          font-size:
            11px;

          gap:
            4px;

        }


        .wellborn-desktop-logout {

          padding:
            0 9px;

          font-size:
            11px;

        }

      }


      /* =================================================
         TABLET + MOBILE
      ================================================= */

      @media (max-width: 1023px) {

        .wellborn-admin-navbar {

          height: 76px;

        }


        .wellborn-admin-navbar-inner {

          width: 100% !important;

          max-width: 100% !important;

          height: 76px !important;

          min-height: 76px !important;

          display: flex !important;

          align-items: center !important;

          justify-content: space-between !important;

          padding:
            8px 12px !important;

          gap:
            8px !important;

          overflow:
            visible !important;

        }


        .wellborn-admin-nav {

          display:
            none !important;

        }


        .wellborn-desktop-logout {

          display:
            none !important;

        }


        .wellborn-admin-brand {

          flex:
            0 1 auto !important;

          width:
            auto !important;

          min-width:
            0 !important;

          max-width:
            calc(100% - 170px) !important;

          display:
            flex !important;

          align-items:
            center !important;

          justify-content:
            flex-start !important;

          transform:
            translateX(2px) !important;

          gap:
            8px !important;

          margin:
            0 !important;

          padding:
            0 !important;

          overflow:
            hidden !important;

          white-space:
            nowrap !important;

        }


        .wellborn-admin-logo {

          flex:
            0 0 auto !important;

          width:
            44px !important;

          height:
            44px !important;

          min-width:
            44px !important;

          min-height:
            44px !important;

          border-radius:
            10px !important;

          padding:
            2px !important;

        }


        .wellborn-admin-brand-text {

          flex:
            0 1 auto !important;

          min-width:
            0 !important;

          max-width:
            100% !important;

          display:
            flex !important;

          flex-direction:
            column !important;

          justify-content:
            center !important;

          align-items:
            flex-start !important;

          overflow:
            hidden !important;

        }


        .wellborn-admin-brand-text h2 {

          display:
            block !important;

          width:
            100% !important;

          margin:
            0 !important;

          font-size:
            11.5px !important;

          line-height:
            1.1 !important;

          font-weight:
            750 !important;

          white-space:
            nowrap !important;

          overflow:
            hidden !important;

          text-overflow:
            ellipsis !important;

        }


        .wellborn-admin-brand-text p {

          display:
            block !important;

          width:
            100% !important;

          margin:
            3px 0 0 !important;

          font-size:
            7.5px !important;

          line-height:
            1 !important;

          white-space:
            nowrap !important;

          overflow:
            hidden !important;

          text-overflow:
            ellipsis !important;

        }


        .wellborn-admin-controls {

          flex:
            0 0 auto !important;

          width:
            auto !important;

          display:
            flex !important;

          align-items:
            center !important;

          justify-content:
            flex-end !important;

          gap:
            6px !important;

          margin:
            0 !important;

          padding:
            0 !important;

          flex-shrink:
            0 !important;

        }


        .wellborn-fcm-bell-button,
        .wellborn-mobile-menu-button {

          width:
            38px !important;

          height:
            38px !important;

          min-width:
            38px !important;

          min-height:
            38px !important;

          border-radius:
            10px !important;

        }


        .wellborn-mobile-menu-button {

          display:
            flex !important;

          align-items:
            center !important;

          justify-content:
            center !important;

        }


        .wellborn-fcm-bell-button svg,
        .wellborn-mobile-menu-button svg {

          width:
            18px !important;

          height:
            18px !important;

        }


        .wellborn-admin-content {

          --admin-navbar-height:
            76px;

          --admin-page-gap:
            12px;

          width:
            100% !important;

          max-width:
            100% !important;

          min-height:
            calc(100vh - 76px) !important;

          margin:
            0 !important;

          padding:
            calc(76px + 12px)
            10px
            20px
            10px !important;

          overflow-x:
            hidden !important;

        }


        .wellborn-fcm-center-panel {

          top:
            88px;

        }

      }


      /* =================================================
         MOBILE
      ================================================= */

      @media (max-width: 480px) {

        .wellborn-admin-navbar-inner {

          padding:
            6px 8px !important;

          gap:
            5px !important;

        }


        .wellborn-admin-brand {

          max-width:
            calc(100% - 130px) !important;

        }


        .wellborn-admin-controls {

          gap:
            5px !important;

        }


        .wellborn-fcm-bell-button,
        .wellborn-mobile-menu-button {

          width:
            36px !important;

          height:
            36px !important;

          min-width:
            36px !important;

          min-height:
            36px !important;

        }


        .wellborn-fcm-center-panel {

          top:
            84px;

          width:
            calc(100vw - 24px);

          max-width:
            calc(100vw - 24px);

          border-radius:
            15px;

        }


        .wellborn-fcm-center-header {

          padding:
            12px 13px;

        }


        .wellborn-fcm-center-item {

          padding:
            13px;

        }


        .wellborn-fcm-center-item-icon {

          width:
            38px;

          height:
            38px;

          min-width:
            38px;

        }


        .wellborn-fcm-center-header h4 {

          font-size:
            13px;

        }


        .wellborn-fcm-center-unread {

          font-size:
            10px;

        }


        .wellborn-admin-notification-wrapper {

          top:
            14px;

          width:
            calc(100vw - 24px);

        }

      }

    `;


    document.head.appendChild(
      style
    );


    return () => {

      style.remove();

    };

  }, []);


  /* =====================================================
     NAVIGATION
  ===================================================== */

  const handleNavigate = (
    path
  ) => {

    setMenuOpen(false);

    setNotificationCenterOpen(
      false
    );

    navigate(path);

  };


  /* =====================================================
     ACTIVE NAV
  ===================================================== */

  const isActive = (
    path
  ) => {

    if (
      path ===
      "/admin/dashboard"
    ) {

      return (
        location.pathname ===
        path
      );

    }


    return location.pathname.startsWith(
      path
    );

  };


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {

    logout();

    setMenuOpen(false);

    setNotificationCenterOpen(
      false
    );

    closeNotification();

    navigate(
      "/admin/login",
      {
        replace: true,
      }
    );

  };


  /* =====================================================
     LOGIN PAGE
  ===================================================== */

  if (isLoginPage) {

    return (
      <>
        {children}
      </>
    );

  }


  /* =====================================================
     TOTAL UNREAD
  ===================================================== */

  const totalUnread =
    appointmentCount +
    messageCount +
    reviewCount;


  /* =====================================================
     RETURN
  ===================================================== */

  return (

    <div
      className={
        `wellborn-admin-shell ${
          theme === "dark"
            ? "wellborn-admin-dark"
            : "wellborn-admin-light"
        }`
      }
    >

      {/* =================================================
          AUTOMATIC NEW NOTIFICATION
      ================================================= */}

      {notification && (

        <div
          className="wellborn-admin-notification-wrapper"
          role="alert"
          aria-live="polite"
        >

          <div
            className="wellborn-admin-notification"
          >

            <div
              className={
                `wellborn-notification-icon ${
                  notification.type
                }`
              }
            >

              {notification.type ===
              "appointment" ? (

                <CalendarCheck
                  size={21}
                  strokeWidth={2.4}
                />

              ) : notification.type ===
              "review" ? (

                <Star
                  size={21}
                  strokeWidth={2.4}
                />

              ) : (

                <MessageCircle
                  size={21}
                  strokeWidth={2.4}
                />

              )}

            </div>


            <div
              className="wellborn-notification-content"
            >

              <p
                className="wellborn-notification-title"
              >

                {notification.title}

                {notification.count > 1 && (

                  <span
                    className="wellborn-notification-count"
                  >
                    {notification.count}
                  </span>

                )}

              </p>


              <p
                className="wellborn-notification-message"
              >
                {notification.message}
              </p>

            </div>


            <button
              type="button"
              className="wellborn-notification-close"
              onClick={
                closeNotification
              }
              aria-label="Close notification"
            >

              <X
                size={16}
                strokeWidth={2.5}
              />

            </button>

          </div>

        </div>

      )}


      {/* =================================================
          CENTER NOTIFICATION PANEL
      ================================================= */}

      {notificationCenterOpen && (

        <div
          className="wellborn-fcm-center-overlay"
          aria-live="polite"
        >

          <div
            className="wellborn-fcm-center-panel"
            ref={notificationCenterRef}
          >

            <div
              className="wellborn-fcm-center-header"
            >

              <div
                className="wellborn-fcm-center-header-left"
              >

                <div
                  className="wellborn-fcm-center-header-icon"
                >

                  <Bell
                    size={17}
                    strokeWidth={2.4}
                  />

                </div>

                <h4>
                  Notifications
                </h4>

              </div>


              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >

                <span
                  className="wellborn-fcm-center-unread"
                >

                  {totalUnread} unread

                </span>


                <button
                  type="button"
                  className="wellborn-fcm-center-close"
                  onClick={
                    closeNotificationCenter
                  }
                  aria-label="Close notifications"
                >

                  <X
                    size={16}
                    strokeWidth={2.5}
                  />

                </button>

              </div>

            </div>


            <div
              className="wellborn-fcm-center-body"
            >

              {totalUnread === 0 ? (

                <div
                  className="wellborn-fcm-center-empty"
                >

                  No new notifications

                </div>

              ) : (

                <>

                  {appointmentCount > 0 && (

                    <button
                      type="button"
                      className="wellborn-fcm-center-item"
                      onClick={() =>
                        handleNavigate(
                          "/admin/appointments"
                        )
                      }
                    >

                      <div
                        className={
                          "wellborn-fcm-center-item-icon appointment"
                        }
                      >

                        <CalendarCheck
                          size={19}
                          strokeWidth={2.4}
                        />

                      </div>


                      <div
                        className="wellborn-fcm-center-item-content"
                      >

                        <p
                          className="wellborn-fcm-center-item-title"
                        >

                          New Appointments (
                          {appointmentCount}
                          )

                        </p>


                        <p
                          className="wellborn-fcm-center-item-desc"
                        >

                          You have{" "}
                          {appointmentCount}{" "}
                          pending appointment
                          requests.

                        </p>

                      </div>

                    </button>

                  )}


                  {messageCount > 0 && (

                    <button
                      type="button"
                      className="wellborn-fcm-center-item"
                      onClick={() =>
                        handleNavigate(
                          "/admin/messages"
                        )
                      }
                    >

                      <div
                        className={
                          "wellborn-fcm-center-item-icon message"
                        }
                      >

                        <Mail
                          size={19}
                          strokeWidth={2.4}
                        />

                      </div>


                      <div
                        className="wellborn-fcm-center-item-content"
                      >

                        <p
                          className="wellborn-fcm-center-item-title"
                        >

                          New Messages (
                          {messageCount}
                          )

                        </p>


                        <p
                          className="wellborn-fcm-center-item-desc"
                        >

                          You have{" "}
                          {messageCount}{" "}
                          unread contact
                          messages.

                        </p>

                      </div>

                    </button>

                  )}


                  {reviewCount > 0 && (

                    <button
                      type="button"
                      className="wellborn-fcm-center-item"
                      onClick={() =>
                        handleNavigate(
                          "/admin/reviews"
                        )
                      }
                    >

                      <div
                        className={
                          "wellborn-fcm-center-item-icon review"
                        }
                      >

                        <Star
                          size={19}
                          strokeWidth={2.4}
                        />

                      </div>


                      <div
                        className="wellborn-fcm-center-item-content"
                      >

                        <p
                          className="wellborn-fcm-center-item-title"
                        >

                          New Reviews (
                          {reviewCount}
                          )

                        </p>


                        <p
                          className="wellborn-fcm-center-item-desc"
                        >

                          You have{" "}
                          {reviewCount}{" "}
                          new pending
                          reviews.

                        </p>

                      </div>

                    </button>

                  )}

                </>

              )}

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          NAVBAR
      ================================================= */}

      <header
        className="wellborn-admin-navbar"
      >

        <div
          className="wellborn-admin-navbar-inner"
        >

          {/* BRAND */}

          <button
            type="button"
            className="wellborn-admin-brand"
            onClick={() =>
              handleNavigate(
                "/admin/dashboard"
              )
            }
          >

            <img
              src="/assets/wellborn physio.jpg"
              alt="Wellborn Physio"
              className="wellborn-admin-logo"
            />


            <div
              className="wellborn-admin-brand-text"
            >

              <h2>
                Wellborn Physio
              </h2>

              <p>
                Admin Panel
              </p>

            </div>

          </button>


          {/* DESKTOP NAVIGATION */}

          <nav
            className="wellborn-admin-nav"
          >

            {navItems.map(
              (item) => {

                const Icon =
                  item.icon;


                return (

                  <button
                    key={item.path}
                    type="button"
                    className={
                      `wellborn-admin-nav-button ${
                        isActive(item.path)
                          ? "active"
                          : ""
                      }`
                    }
                    onClick={() =>
                      handleNavigate(
                        item.path
                      )
                    }
                  >

                    <Icon
                      size={15}
                      strokeWidth={2.3}
                    />


                    <span>
                      {item.name}
                    </span>


                    {item.badge > 0 && (

                      <span
                        className="wellborn-nav-badge"
                      >
                        {item.badge}
                      </span>

                    )}

                  </button>

                );

              }
            )}

          </nav>


          {/* CONTROLS */}

          <div
            className="wellborn-admin-controls"
          >

            {/* FCM BELL */}

            <div
              className="wellborn-fcm-bell-wrap"
            >

              <button
                type="button"
                className="wellborn-fcm-bell-button"
                onClick={
                  openNotificationCenter
                }
                title="Notifications"
                aria-label="Notifications"
                aria-expanded={
                  notificationCenterOpen
                }
              >

                <Bell
                  size={18}
                  strokeWidth={2.4}
                />


                {totalUnread > 0 && (

                  <span
                    className="wellborn-fcm-bell-badge"
                  >

                    {totalUnread}

                  </span>

                )}

              </button>

            </div>


            {/* DESKTOP LOGOUT */}

            <button
              type="button"
              className="wellborn-desktop-logout"
              onClick={
                handleLogout
              }
            >

              <LogOut
                size={16}
                strokeWidth={2.3}
              />

              <span>
                Logout
              </span>

            </button>


            {/* MOBILE MENU */}

            <button
              type="button"
              className="wellborn-mobile-menu-button"
              onClick={() =>
                setMenuOpen(
                  previous =>
                    !previous
                )
              }
              aria-label={
                menuOpen
                  ? "Close Menu"
                  : "Open Menu"
              }
            >

              {menuOpen ? (

                <X
                  size={20}
                  strokeWidth={2.4}
                />

              ) : (

                <Menu
                  size={20}
                  strokeWidth={2.4}
                />

              )}

            </button>

          </div>

        </div>


        {/* =================================================
            MOBILE MENU
        ================================================= */}

        <div
          className={
            `wellborn-mobile-menu ${
              menuOpen
                ? "open"
                : ""
            }`
          }
        >

          {navItems.map(
            (item) => {

              const Icon =
                item.icon;


              return (

                <button
                  key={item.path}
                  type="button"
                  className={
                    `wellborn-mobile-nav-button ${
                      isActive(item.path)
                        ? "active"
                        : ""
                    }`
                  }
                  onClick={() =>
                    handleNavigate(
                      item.path
                    )
                  }
                >

                  <div
                    className="wellborn-mobile-nav-left"
                  >

                    <Icon
                      size={18}
                      strokeWidth={2.3}
                    />

                    <span>
                      {item.name}
                    </span>

                  </div>


                  {item.badge > 0 && (

                    <div
                      className="flex items-center gap-2"
                    >

                      <span
                        className="wellborn-mobile-menu-dot"
                      />

                      <span
                        className="wellborn-mobile-badge"
                      >
                        {item.badge}
                      </span>

                    </div>

                  )}

                </button>

              );

            }
          )}


          {/* MOBILE LOGOUT */}

          <button
            type="button"
            className="wellborn-mobile-logout"
            onClick={
              handleLogout
            }
          >

            <LogOut
              size={18}
              strokeWidth={2.3}
            />

            <span>
              Logout
            </span>

          </button>

        </div>

      </header>


      {/* =================================================
          CONTENT
      ================================================= */}

      <main
        className="wellborn-admin-content"
      >

        {children}

      </main>

    </div>

  );

}