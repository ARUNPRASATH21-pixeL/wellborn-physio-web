import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  API,
  getData,
  putData,
  getAuth,
} from "../services/api";

import {
  UserRound,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  LockKeyhole,
  Save,
  KeyRound,
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  X,
  AlertCircle,
  Moon,
  Sun,
  Monitor,
  Bell,
  BellOff,
  Palette,
  Volume2,
} from "lucide-react";

/* =========================================================
   EMPTY PASSWORD
========================================================= */

const EMPTY_PASSWORD = {
  oldPassword: "",
  newPassword: "",
  confirm: "",
};

/* =========================================================
   STORAGE KEYS
========================================================= */

const THEME_STORAGE_KEY =
  "wellborn_admin_theme";

const NOTIFICATION_STORAGE_KEY =
  "wellborn_admin_notifications_enabled";

/* =========================================================
   SAFE PARSE
========================================================= */

const safeParse = (value) => {
  if (!value) return null;

  if (typeof value === "object") {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

/* =========================================================
   NORMALIZE ID
========================================================= */

const normalizeId = (value) => {
  if (value === undefined || value === null) {
    return null;
  }

  const id = String(value).trim();

  if (
    !id ||
    id === "null" ||
    id === "undefined"
  ) {
    return null;
  }

  return id;
};

/* =========================================================
   CURRENT AUTH
========================================================= */

const getCurrentAdmin = () => {
  /* -------------------------------------------------------
     1. AUTH OBJECT - PRIMARY SOURCE
   ------------------------------------------------------- */

  try {
    const auth = safeParse(
      localStorage.getItem("auth")
    );

    if (
      auth &&
      auth.id !== undefined &&
      auth.id !== null
    ) {
      const id = normalizeId(auth.id);

      if (id) {
        return {
          id,
          token: auth.token || "",
          name: auth.name || "",
          email: auth.email || "",
          role: auth.role || "ADMIN",
        };
      }
    }
  } catch (error) {
    console.warn(
      "Wellborn auth read failed:",
      error
    );
  }

  /* -------------------------------------------------------
     2. TOKEN
   ------------------------------------------------------- */

  try {
    const token =
      localStorage.getItem("token");

    if (token) {
      const decoded =
        decodeJwtPayload(token);

      if (decoded) {
        const tokenId = normalizeId(
          decoded.id ??
            decoded.adminId ??
            decoded.sub
        );

        if (tokenId) {
          return {
            id: tokenId,
            token,
            name:
              decoded.name ||
              decoded.adminName ||
              "",
            email:
              decoded.email || "",
            role:
              decoded.role ||
              "ADMIN",
          };
        }
      }
    }
  } catch (error) {
    console.warn(
      "Wellborn token read failed:",
      error
    );
  }

  /* -------------------------------------------------------
     3. adminId - LAST FALLBACK
   ------------------------------------------------------- */

  try {
    const oldId = normalizeId(
      localStorage.getItem("adminId")
    );

    if (oldId) {
      return {
        id: oldId,
        token:
          localStorage.getItem(
            "token"
          ) || "",
        name:
          localStorage.getItem(
            "name"
          ) || "",
        email:
          localStorage.getItem(
            "email"
          ) || "",
        role:
          localStorage.getItem(
            "role"
          ) || "ADMIN",
      };
    }
  } catch {}

  return null;
};

/* =========================================================
   JWT PAYLOAD
========================================================= */

const decodeJwtPayload = (token) => {
  if (
    !token ||
    typeof token !== "string"
  ) {
    return null;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    let payload = parts[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    while (
      payload.length % 4 !== 0
    ) {
      payload += "=";
    }

    const decoded = atob(payload);

    const bytes = Array.from(
      decoded
    )
      .map(
        (char) =>
          "%" +
          char
            .charCodeAt(0)
            .toString(16)
            .padStart(2, "0")
      )
      .join("");

    return JSON.parse(
      decodeURIComponent(bytes)
    );
  } catch {
    return null;
  }
};

/* =========================================================
   SAVE CURRENT ADMIN
========================================================= */

const saveCurrentAdmin = (admin) => {
  if (!admin?.id) {
    return;
  }

  const id = normalizeId(admin.id);

  if (!id) {
    return;
  }

  try {
    localStorage.setItem(
      "adminId",
      id
    );

    localStorage.setItem(
      "name",
      admin.name || ""
    );

    localStorage.setItem(
      "email",
      admin.email || ""
    );

    localStorage.setItem(
      "role",
      admin.role || "ADMIN"
    );

    if (admin.token) {
      localStorage.setItem(
        "token",
        admin.token
      );
    }

    const existingAuth = safeParse(
      localStorage.getItem("auth")
    );

    localStorage.setItem(
      "auth",
      JSON.stringify({
        ...(existingAuth || {}),
        id,
        token:
          admin.token ||
          existingAuth?.token ||
          "",
        name:
          admin.name ||
          existingAuth?.name ||
          "",
        email:
          admin.email ||
          existingAuth?.email ||
          "",
        role:
          admin.role ||
          existingAuth?.role ||
          "ADMIN",
      })
    );
  } catch (error) {
    console.warn(
      "Unable to save current admin:",
      error
    );
  }
};

/* =========================================================
   EXTRACT PROFILE
========================================================= */

const extractProfile = (data) => {
  if (!data) {
    return {};
  }

  if (
    data.data &&
    typeof data.data === "object"
  ) {
    if (
      data.data.admin &&
      typeof data.data.admin ===
        "object"
    ) {
      return data.data.admin;
    }

    return data.data;
  }

  if (
    data.admin &&
    typeof data.admin ===
      "object"
  ) {
    return data.admin;
  }

  if (
    data.profile &&
    typeof data.profile ===
      "object"
  ) {
    return data.profile;
  }

  return data;
};

/* =========================================================
   THEME HELPERS
========================================================= */

const getStoredTheme = () => {
  try {
    const stored =
      localStorage.getItem(
        THEME_STORAGE_KEY
      );

    if (
      stored === "light" ||
      stored === "dark" ||
      stored === "system"
    ) {
      return stored;
    }
  } catch {}

  return "light";
};

const getSystemDarkMode = () => {
  if (
    typeof window === "undefined" ||
    !window.matchMedia
  ) {
    return false;
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;
};

const applyTheme = (theme) => {
  if (
    typeof document === "undefined"
  ) {
    return;
  }

  const root =
    document.documentElement;

  const shouldUseDark =
    theme === "dark" ||
    (theme === "system" &&
      getSystemDarkMode());

  root.classList.toggle(
    "wellborn-admin-dark",
    shouldUseDark
  );

  /*
   * Keep Tailwind dark mode compatibility.
   */

  root.classList.toggle(
    "dark",
    shouldUseDark
  );

  /*
   * Useful for the whole browser/application.
   */

  root.setAttribute(
    "data-wellborn-theme",
    shouldUseDark
      ? "dark"
      : "light"
  );

  root.style.colorScheme =
    shouldUseDark
      ? "dark"
      : "light";
};

/* =========================================================
   NOTIFICATION HELPERS
========================================================= */

const getStoredNotificationState =
  () => {
    try {
      const stored =
        localStorage.getItem(
          NOTIFICATION_STORAGE_KEY
        );

      if (stored === null) {
        return true;
      }

      return stored === "true";
    } catch {
      return true;
    }
  };

/* =========================================================
   ADMIN SETTINGS
========================================================= */

export default function Admin_settings() {
  /* =======================================================
     CURRENT ADMIN
  ======================================================= */

  const [admin, setAdmin] =
    useState(() =>
      getCurrentAdmin()
    );

  const [adminId, setAdminId] =
    useState(
      () =>
        getCurrentAdmin()?.id ||
        null
    );

  /* =======================================================
     FORM
  ======================================================= */

  const [form, setForm] = useState({
    adminName: "",
    email: "",
    phone: "",
    address: "",
    role: "ADMIN",
  });

  /* =======================================================
     PASSWORD
  ======================================================= */

  const [password, setPassword] =
    useState({
      ...EMPTY_PASSWORD,
    });

  /* =======================================================
     LOADING
  ======================================================= */

  const [loading, setLoading] =
    useState(false);

  const [
    profileLoading,
    setProfileLoading,
  ] = useState(true);

  const [
    passwordLoading,
    setPasswordLoading,
  ] = useState(false);

  /* =======================================================
     PASSWORD VISIBILITY
  ======================================================= */

  const [showOld, setShowOld] =
    useState(false);

  const [showNew, setShowNew] =
    useState(false);

  const [
    showConfirm,
    setShowConfirm,
  ] = useState(false);

  /* =======================================================
     NOTIFICATION POPUP
  ================================================       */

  const [
    notification,
    setNotification,
  ] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  /* =======================================================
     THEME
  ================================================       */

  const [themeMode, setThemeMode] =
    useState(() =>
      getStoredTheme()
    );

  const [darkMode, setDarkMode] =
    useState(() => {
      if (
        typeof document ===
        "undefined"
      ) {
        return false;
      }

      return (
        document.documentElement.classList.contains(
          "wellborn-admin-dark"
        ) ||
        document.documentElement.classList.contains(
          "dark"
        )
      );
    });

  /* =======================================================
     NOTIFICATION CONTROL
  ================================================       */

  const [
    notificationsEnabled,
    setNotificationsEnabled,
  ] = useState(() =>
    getStoredNotificationState()
  );

  const [
    notificationPermission,
    setNotificationPermission,
  ] = useState(() => {
    if (
      typeof Notification ===
      "undefined"
    ) {
      return "unsupported";
    }

    return Notification.permission;
  });

  /* =======================================================
     APPLY INITIAL THEME
  ================================================       */

  useEffect(() => {
    applyTheme(themeMode);
  }, [themeMode]);

  /* =======================================================
     THEME OBSERVER
  ================================================       */

  useEffect(() => {
    const root =
      document.documentElement;

    const updateTheme = () => {
      const isDark =
        root.classList.contains(
          "wellborn-admin-dark"
        ) ||
        root.classList.contains(
          "dark"
        );

      setDarkMode(isDark);
    };

    updateTheme();

    const observer =
      new MutationObserver(
        updateTheme
      );

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () =>
      observer.disconnect();
  }, []);

  /* =======================================================
     SYSTEM THEME LISTENER
  ================================================       */

  useEffect(() => {
    if (
      themeMode !== "system" ||
      typeof window === "undefined" ||
      !window.matchMedia
    ) {
      return;
    }

    const media =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      );

    const handleChange = () => {
      applyTheme("system");
    };

    if (
      media.addEventListener
    ) {
      media.addEventListener(
        "change",
        handleChange
      );
    } else {
      media.addListener(
        handleChange
      );
    }

    return () => {
      if (
        media.removeEventListener
      ) {
        media.removeEventListener(
          "change",
          handleChange
        );
      } else {
        media.removeListener(
          handleChange
        );
      }
    };
  }, [themeMode]);

  /* =======================================================
     CHANGE THEME (OPTIMIZED FOR ZERO LAG)
  ================================================       */

  const changeTheme = (
    selectedTheme
  ) => {
    setThemeMode(selectedTheme);

    try {
      localStorage.setItem(
        THEME_STORAGE_KEY,
        selectedTheme
      );
    } catch {}

    applyTheme(
      selectedTheme
    );

    window.dispatchEvent(
      new CustomEvent(
        "wellborn-theme-change",
        {
          detail: {
            theme: selectedTheme,
          },
        }
      )
    );
  };

  /* =======================================================
     NOTIFICATION
  ================================================       */

  const showNotification =
    useCallback(
      (
        type,
        title,
        message
      ) => {
        setNotification({
          show: true,
          type,
          title,
          message,
        });

        window.setTimeout(() => {
          setNotification(
            (previous) => ({
              ...previous,
              show: false,
            })
          );
        }, 4500);
      },
      []
    );

  const closeNotification = () => {
    setNotification(
      (previous) => ({
        ...previous,
        show: false,
      })
    );
  };

  /* =======================================================
     ENABLE / DISABLE ADMIN NOTIFICATIONS
  ================================================       */

  const toggleNotifications =
    async () => {
      const nextValue =
        !notificationsEnabled;

      /*
       * Disable
       */

      if (!nextValue) {
        setNotificationsEnabled(
          false
        );

        try {
          localStorage.setItem(
            NOTIFICATION_STORAGE_KEY,
            "false"
          );
        } catch {}

        window.dispatchEvent(
          new CustomEvent(
            "wellborn-notification-setting-change",
            {
              detail: {
                enabled: false,
              },
            }
          )
        );

        showNotification(
          "success",
          "Notifications Disabled",
          "Admin notifications have been turned off."
        );

        return;
      }

      /*
       * Enable
       */

      try {
        if (
          typeof Notification ===
          "undefined"
        ) {
          setNotificationsEnabled(
            true
          );

          localStorage.setItem(
            NOTIFICATION_STORAGE_KEY,
            "true"
          );

          window.dispatchEvent(
            new CustomEvent(
              "wellborn-notification-setting-change",
              {
                detail: {
                  enabled: true,
                },
              }
            )
          );

          showNotification(
            "success",
            "Notifications Enabled",
            "Notification preference has been enabled."
          );

          return;
        }

        /*
         * Browser permission already granted
         */

        if (
          Notification.permission ===
          "granted"
        ) {
          setNotificationPermission(
            "granted"
          );

          setNotificationsEnabled(
            true
          );

          localStorage.setItem(
            NOTIFICATION_STORAGE_KEY,
            "true"
          );

          window.dispatchEvent(
            new CustomEvent(
              "wellborn-notification-setting-change",
              {
                detail: {
                  enabled: true,
                },
              }
            )
          );

          showNotification(
            "success",
            "Notifications Enabled",
            "Admin notifications are enabled."
          );

          return;
        }

        /*
         * Request browser permission
         */

        if (
          Notification.permission ===
          "denied"
        ) {
          setNotificationPermission(
            "denied"
          );

          setNotificationsEnabled(
            false
          );

          localStorage.setItem(
            NOTIFICATION_STORAGE_KEY,
            "false"
          );

          showNotification(
            "error",
            "Notification Permission Blocked",
            "Browser notification permission is blocked. Please allow notifications from your browser site settings."
          );

          return;
        }

        const permission =
          await Notification.requestPermission();

        setNotificationPermission(
          permission
        );

        if (
          permission ===
          "granted"
        ) {
          setNotificationsEnabled(
            true
          );

          localStorage.setItem(
            NOTIFICATION_STORAGE_KEY,
            "true"
          );

          window.dispatchEvent(
            new CustomEvent(
              "wellborn-notification-setting-change",
              {
                detail: {
                  enabled: true,
                },
              }
            )
          );

          showNotification(
            "success",
            "Notifications Enabled",
            "Admin browser notifications are now enabled."
          );
        } else {
          setNotificationsEnabled(
            false
          );

          localStorage.setItem(
            NOTIFICATION_STORAGE_KEY,
            "false"
          );

          showNotification(
            "error",
            "Permission Not Granted",
            "Browser notification permission was not granted."
          );
        }
      } catch (error) {
        console.error(
          "Notification permission error:",
          error
        );

        showNotification(
          "error",
          "Notification Setup Failed",
          "Unable to update notification permission."
        );
      }
    };

  /* =======================================================
     TEST BROWSER NOTIFICATION
  ================================================       */

  const testNotification =
    async () => {
      if (
        !notificationsEnabled
      ) {
        showNotification(
          "error",
          "Notifications Disabled",
          "Enable admin notifications first."
        );

        return;
      }

      if (
        typeof Notification ===
        "undefined"
      ) {
        showNotification(
          "error",
          "Not Supported",
          "This browser does not support browser notifications."
        );

        return;
      }

      if (
        Notification.permission !==
        "granted"
      ) {
        showNotification(
          "error",
          "Permission Required",
          "Please enable browser notifications first."
        );

        return;
      }

      try {
        new Notification(
          "Wellborn Admin",
          {
            body: "Admin notifications are working correctly.",
            icon: "/favicon.ico",
          }
        );

        showNotification(
          "success",
          "Test Notification Sent",
          "Your browser notification system is working."
        );
      } catch (error) {
        console.error(
          "Test notification error:",
          error
        );

        showNotification(
          "error",
          "Test Failed",
          "Unable to display the test notification."
        );
      }
    };

  /* =======================================================
     LOAD CURRENT AUTH PROFILE
  ================================================       */

  useEffect(() => {
    let cancelled = false;

    const loadCurrentAdmin =
      async () => {
        setProfileLoading(true);

        const current =
          getCurrentAdmin();

        if (!current?.id) {
          if (!cancelled) {
            setAdmin(null);
            setAdminId(null);

            setForm({
              adminName: "",
              email: "",
              phone: "",
              address: "",
              role: "ADMIN",
            });

            setProfileLoading(false);
          }

          return;
        }

        if (cancelled) {
          return;
        }

        setAdmin(current);
        setAdminId(current.id);

        saveCurrentAdmin(current);

        setForm({
          adminName:
            current.name || "",
          email:
            current.email || "",
          phone: "",
          address: "",
          role:
            current.role || "ADMIN",
        });

        if (
          !API?.ADMIN_GET
        ) {
          setProfileLoading(
            false
          );
          return;
        }

        try {
          const url =
            `${API.ADMIN_GET}/${encodeURIComponent(
              current.id
            )}`;

          const data =
            await getData(url);

          if (cancelled) {
            return;
          }

          const profile =
            extractProfile(data);

          const responseId =
            normalizeId(
              profile?.id ??
                profile?.adminId ??
                current.id
            );

          const finalId =
            responseId ||
            current.id;

          setAdminId(finalId);

          const updatedAdmin = {
            ...current,
            id: finalId,
            name:
              profile?.adminName ??
              profile?.name ??
              current.name ??
              "",
            email:
              profile?.email ??
              current.email ??
              "",
            role:
              profile?.role ??
              current.role ??
              "ADMIN",
          };

          setAdmin(
            updatedAdmin
          );

          setForm({
            adminName:
              profile?.adminName ??
              profile?.name ??
              current.name ??
              "",

            email:
              profile?.email ??
              current.email ??
              "",

            phone:
              profile?.phone ?? "",

            address:
              profile?.address ?? "",

            role:
              profile?.role ??
              current.role ??
              "ADMIN",
          });

          saveCurrentAdmin(
            updatedAdmin
          );
        } catch (error) {
          console.warn(
            "Optional admin profile refresh failed:",
            error
          );
        } finally {
          if (!cancelled) {
            setProfileLoading(
              false
            );
          }
        }
      };

    loadCurrentAdmin();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     DETECT LOGIN / LOGOUT CHANGES
  ================================================       */

  useEffect(() => {
    const checkCurrentAdmin =
      () => {
        const current =
          getCurrentAdmin();

        if (!current?.id) {
          return;
        }

        setAdmin(
          (previous) => {
            if (
              previous?.id ===
                current.id &&
              previous?.name ===
                current.name &&
              previous?.email ===
                current.email
            ) {
              return previous;
            }

            return current;
          }
        );

        setAdminId(
          (previous) =>
            previous === current.id
              ? previous
              : current.id
        );

        setForm((previous) => {
          if (
            adminId === current.id
          ) {
            return previous;
          }

          return {
            ...previous,
            adminName:
              current.name ||
              "",
            email:
              current.email ||
              "",
            role:
              current.role ||
              "ADMIN",
          };
        });
      };

    checkCurrentAdmin();

    window.addEventListener(
      "storage",
      checkCurrentAdmin
    );

    const interval =
      window.setInterval(
        checkCurrentAdmin,
        700
      );

    return () => {
      window.removeEventListener(
        "storage",
        checkCurrentAdmin
      );

      window.clearInterval(
        interval
      );
    };
  }, [adminId]);

  /* =======================================================
     PROFILE FIELD
  ================================================       */

  const changeField = (
    field,
    value
  ) => {
    setForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );
  };

  /* =======================================================
     PASSWORD FIELD
  ================================================       */

  const changePasswordField = (
    field,
    value
  ) => {
    setPassword(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );
  };

  /* =======================================================
     UPDATE PROFILE
  ================================================       */

  const updateProfile =
    async () => {
      const current =
        getCurrentAdmin();

      const currentId =
        current?.id;

      if (!currentId) {
        showNotification(
          "error",
          "Session Required",
          "Please login again to update your administrator profile."
        );

        return;
      }

      if (
        !form.adminName.trim()
      ) {
        showNotification(
          "error",
          "Name Required",
          "Please enter admin name."
        );

        return;
      }

      if (
        !form.email.trim()
      ) {
        showNotification(
          "error",
          "Email Required",
          "Please enter admin email."
        );

        return;
      }

      try {
        setLoading(true);

        if (
          !API?.ADMIN_UPDATE
        ) {
          const updated = {
            ...current,
            id: currentId,
            name:
              form.adminName.trim(),
            email:
              form.email.trim(),
            role:
              form.role || "ADMIN",
          };

          saveCurrentAdmin(
            updated
          );

          setAdmin(updated);
          setAdminId(currentId);

          showNotification(
            "success",
            "Profile Updated",
            "Your profile information has been updated."
          );

          return;
        }

        const url =
          `${API.ADMIN_UPDATE}/${encodeURIComponent(
            currentId
          )}`;

        const payload = {
          adminName:
            form.adminName.trim(),

          email:
            form.email.trim(),

          phone:
            form.phone.trim(),

          address:
            form.address.trim(),

          role:
            form.role || "ADMIN",
        };

        const response =
          await putData(
            url,
            payload
          );

        console.log(
          "Admin update response:",
          response
        );

        const updatedAdmin = {
          ...current,
          id: currentId,
          name:
            payload.adminName,
          email:
            payload.email,
          role:
            payload.role,
        };

        saveCurrentAdmin(
          updatedAdmin
        );

        setAdmin(
          updatedAdmin
        );

        setAdminId(
          currentId
        );

        showNotification(
          "success",
          "Profile Updated",
          "Your administrator profile has been updated successfully."
        );
      } catch (error) {
        console.error(
          "Profile update error:",
          error
        );

        showNotification(
          "error",
          "Update Failed",
          error?.message ||
            "Unable to update your profile."
        );
      } finally {
        setLoading(false);
      }
    };

  /* =======================================================
     CHANGE PASSWORD
  ================================================       */

  const changePassword =
    async () => {
      const current =
        getCurrentAdmin();

      const currentId =
        current?.id;

      if (!currentId) {
        showNotification(
          "error",
          "Session Required",
          "Please login again to change your password."
        );

        return;
      }

      if (
        !password.oldPassword
      ) {
        showNotification(
          "error",
          "Current Password Required",
          "Enter your current password."
        );

        return;
      }

      if (
        !password.newPassword
      ) {
        showNotification(
          "error",
          "New Password Required",
          "Enter your new password."
        );

        return;
      }

      if (
        password.newPassword.length <
        6
      ) {
        showNotification(
          "error",
          "Password Too Short",
          "Password must contain at least 6 characters."
        );

        return;
      }

      if (
        password.newPassword !==
        password.confirm
      ) {
        showNotification(
          "error",
          "Passwords Don't Match",
          "New password and confirmation password must match."
        );

        return;
      }

      if (
        !API?.ADMIN_CHANGE_PASSWORD
      ) {
        showNotification(
          "error",
          "Password API Missing",
          "ADMIN_CHANGE_PASSWORD is not configured in api.js."
        );

        return;
      }

      try {
        setPasswordLoading(
          true
        );

        const url =
          `${API.ADMIN_CHANGE_PASSWORD}/${encodeURIComponent(
            currentId
          )}`;

        const payload = {
          oldPassword:
            password.oldPassword,

          newPassword:
            password.newPassword,

          confirmPassword:
            password.confirm,
        };

        await putData(
          url,
          payload
        );

        setPassword({
          ...EMPTY_PASSWORD,
        });

        setShowOld(false);
        setShowNew(false);
        setShowConfirm(false);

        showNotification(
          "success",
          "Password Changed",
          "Your administrator password has been changed successfully."
        );
      } catch (error) {
        console.error(
          "Password change error:",
          error
        );

        showNotification(
          "error",
          "Password Change Failed",
          error?.message ||
            "Unable to change your password."
        );
      } finally {
        setPasswordLoading(
          false
        );
      }
    };

  /* =======================================================
     NOTIFICATION TYPE
  ================================================       */

  const isSuccess =
    notification.type ===
    "success";

  const isError =
    notification.type ===
    "error";

  /* =======================================================
     UI
  ================================================       */

  return (
    <div
      className={`
        min-h-screen
        w-full
        overflow-x-hidden
        transition-colors
        duration-150

        ${
          darkMode
            ? "bg-slate-950 text-white"
            : "bg-slate-50 text-slate-900"
        }
      `}
    >
      {/* ===================================================
          NOTIFICATION
      =================================================== */}

      <div
        className={`
          fixed
          right-3
          top-4
          z-[99999]
          w-[calc(100%-24px)]
          max-w-[400px]
          transition-all
          duration-300

          sm:right-6
          sm:top-6

          ${
            notification.show
              ? "translate-x-0 opacity-100"
              : "pointer-events-none translate-x-[120%] opacity-0"
          }
        `}
      >
        <div
          className={`
            relative
            overflow-hidden
            rounded-2xl
            border
            p-4
            shadow-2xl
            backdrop-blur-xl

            ${
              darkMode
                ? "border-slate-700 bg-slate-900/95"
                : "border-slate-200 bg-white/95"
            }
          `}
        >
          <div
            className={`
              absolute
              left-0
              top-0
              h-[3px]
              w-full

              ${
                isSuccess
                  ? "bg-emerald-500"
                  : isError
                  ? "bg-red-500"
                  : "bg-blue-500"
              }
            `}
          />

          <div className="flex items-start gap-3">
            <div
              className={`
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl

                ${
                  isSuccess
                    ? "bg-emerald-500/10 text-emerald-400"
                    : isError
                    ? "bg-red-500/10 text-red-400"
                    : "bg-blue-500/10 text-blue-400"
                }
              `}
            >
              {isSuccess ? (
                <CheckCircle2 size={20} />
              ) : isError ? (
                <XCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
            </div>

            <div className="min-w-0 flex-1 pr-5">
              <h3
                className={`
                  text-sm
                  font-black

                  ${
                    darkMode
                      ? "text-white"
                      : "text-slate-900"
                  }
                `}
              >
                {notification.title}
              </h3>

              <p
                className={`
                  mt-1
                  text-[11px]
                  leading-relaxed

                  ${
                    darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                  }
                `}
              >
                {notification.message}
              </p>
            </div>

            <button
              type="button"
              onClick={
                closeNotification
              }
              className={`
                absolute
                right-2
                top-2
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-lg

                ${
                  darkMode
                    ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                    : "text-slate-400 hover:bg-slate-100"
                }
              `}
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main
        className="
          mx-auto
          w-full
          max-w-[1500px]
          px-3
          pb-8
          pt-4

          sm:px-5
          sm:pt-6

          lg:px-8
          lg:pt-8
        "
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <section
          className={`
            mb-5
            rounded-2xl
            border
            p-4
            shadow-sm

            sm:mb-6
            sm:p-6

            ${
              darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-white"
            }
          `}
        >
          <div className="flex items-start gap-3 sm:items-center">
            <div
              className={`
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                mt-0.5
                sm:mt-0
                sm:h-11
                sm:w-11

                ${
                  darkMode
                    ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                    : "border-cyan-100 bg-cyan-50 text-cyan-600"
                }
              `}
            >
              <SettingsIcon size={20} />
            </div>

            <div className="min-w-0 flex-1">
              <span
                className={`
                  block
                  text-[8px]
                  font-black
                  uppercase
                  tracking-widest
                  sm:text-[9px]

                  ${
                    darkMode
                      ? "text-cyan-300"
                      : "text-cyan-600"
                  }
                `}
              >
                Admin Control Center
              </span>

              <h1
                className={`
                  text-lg
                  font-black
                  leading-tight
                  sm:text-2xl
                  lg:text-3xl

                  ${
                    darkMode
                      ? "text-white"
                      : "text-slate-900"
                  }
                `}
              >
                Settings
              </h1>

              <p
                className={`
                  mt-0.5
                  text-[10px]
                  leading-normal
                  sm:text-xs

                  ${
                    darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                  }
                `}
              >
                Manage your admin profile and account security
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            CURRENT ACCOUNT BADGE
        ================================================= */}

        {admin?.id && (
          <div
            className={`
              mb-5
              flex
              items-center
              justify-between
              gap-3
              rounded-2xl
              border
              px-4
              py-3

              ${
                darkMode
                  ? "border-cyan-400/20 bg-cyan-500/5"
                  : "border-cyan-100 bg-cyan-50"
              }
            `}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl

                  ${
                    darkMode
                      ? "bg-cyan-400/10 text-cyan-300"
                      : "bg-white text-cyan-600"
                  }
                `}
              >
                <ShieldCheck size={17} />
              </div>

              <div className="min-w-0">
                <p
                  className={`
                    text-[9px]
                    font-black
                    uppercase
                    tracking-widest

                    ${
                      darkMode
                        ? "text-cyan-300"
                        : "text-cyan-600"
                    }
                  `}
                >
                  Current Admin
                </p>

                <p
                  className={`
                    truncate
                    text-xs
                    font-bold

                    ${
                      darkMode
                        ? "text-white"
                        : "text-slate-800"
                    }
                  `}
                >
                  {admin.name ||
                    admin.email ||
                    "Administrator"}
                </p>
              </div>
            </div>

            <div
              className={`
                shrink-0
                rounded-lg
                px-2.5
                py-1.5
                text-[9px]
                font-black

                ${
                  darkMode
                    ? "bg-slate-800 text-cyan-300"
                    : "bg-white text-cyan-700"
                }
              `}
            >
              ID: {admin.id}
            </div>
          </div>
        )}

        {/* =================================================
            APPEARANCE CONTROL
        ================================================= */}

        <section
          className={`
            mb-5
            overflow-hidden
            rounded-2xl
            border
            sm:mb-6

            ${
              darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-white"
            }
          `}
        >
          <CardHeader
            icon={Palette}
            title="Appearance"
            subtitle="Choose how the administrator panel should look"
            darkMode={darkMode}
          />

          <div className="p-4 sm:p-6">
            <div
              className="
                grid
                grid-cols-1
                gap-3

                sm:grid-cols-3
              "
            >
              <ThemeOption
                icon={Sun}
                title="Light"
                subtitle="Always use light mode"
                value="light"
                selected={
                  themeMode === "light"
                }
                darkMode={darkMode}
                onClick={() =>
                  changeTheme(
                    "light"
                  )
                }
              />

              <ThemeOption
                icon={Moon}
                title="Dark"
                subtitle="Always use dark mode"
                value="dark"
                selected={
                  themeMode === "dark"
                }
                darkMode={darkMode}
                onClick={() =>
                  changeTheme(
                    "dark"
                  )
                }
              />

              <ThemeOption
                icon={Monitor}
                title="System"
                subtitle="Follow device theme"
                value="system"
                selected={
                  themeMode === "system"
                }
                darkMode={darkMode}
                onClick={() =>
                  changeTheme(
                    "system"
                  )
                }
              />
            </div>
          </div>
        </section>

        {/* =================================================
            NOTIFICATION CONTROL
        ================================================= */}

        <section
          className={`
            mb-5
            overflow-hidden
            rounded-2xl
            border
            sm:mb-6

            ${
              darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-white"
            }
          `}
        >
          <CardHeader
            icon={Bell}
            title="Notification Control"
            subtitle="Manage browser notification preferences"
            darkMode={darkMode}
          />

          <div className="p-4 sm:p-6">
            <div
              className={`
                rounded-2xl
                border
                p-4
                sm:p-5

                ${
                  darkMode
                    ? "border-slate-800 bg-slate-950"
                    : "border-slate-200 bg-slate-50"
                }
              `}
            >
              <div
                className="
                  flex
                  flex-col
                  gap-4

                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={`
                      flex
                      h-11
                      w-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl

                      ${
                        notificationsEnabled
                          ? "bg-emerald-500/10 text-emerald-500"
                          : darkMode
                          ? "bg-slate-800 text-slate-500"
                          : "bg-slate-200 text-slate-500"
                      }
                    `}
                  >
                    {notificationsEnabled ? (
                      <Bell size={20} />
                    ) : (
                      <BellOff size={20} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3
                      className={`
                        text-sm
                        font-black

                        ${
                          darkMode
                            ? "text-white"
                            : "text-slate-900"
                        }
                      `}
                    >
                      Admin Notifications
                    </h3>

                    <p
                      className={`
                        mt-1
                        text-[10px]
                        leading-relaxed
                        sm:text-xs

                        ${
                          darkMode
                            ? "text-slate-400"
                            : "text-slate-500"
                        }
                      `}
                    >
                      Receive appointment, contact message
                      and other administrator alerts.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    toggleNotifications
                  }
                  className={`
                    relative
                    h-7
                    w-14
                    shrink-0
                    overflow-hidden
                    rounded-full
                    transition-all
                    duration-150

                    ${
                      notificationsEnabled
                        ? "bg-emerald-500 shadow-md shadow-emerald-500/20"
                        : darkMode
                        ? "bg-slate-700"
                        : "bg-slate-300"
                    }
                  `}
                  aria-label="Toggle admin notifications"
                >
                  <span
                    className={`
                      absolute
                      top-1
                      h-5
                      w-5
                      rounded-full
                      bg-white
                      shadow-md
                      transition-all
                      duration-150

                      ${
                        notificationsEnabled
                          ? "right-1"
                          : "left-1"
                      }
                    `}
                  />
                </button>
              </div>

              <div
                className={`
                  mt-4
                  flex
                  flex-col
                  gap-3
                  rounded-xl
                  border
                  p-3

                  sm:flex-row
                  sm:items-center
                  sm:justify-between

                  ${
                    darkMode
                      ? "border-slate-800 bg-slate-900"
                      : "border-slate-200 bg-white"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`
                      h-2
                      w-2
                      rounded-full

                      ${
                        notificationPermission ===
                        "granted"
                          ? "bg-emerald-500"
                          : notificationPermission ===
                            "denied"
                          ? "bg-red-500"
                          : "bg-amber-500"
                      }
                    `}
                  />

                  <p
                    className={`
                      text-[10px]
                      font-bold

                      ${
                        darkMode
                          ? "text-slate-300"
                          : "text-slate-600"
                      }
                    `}
                  >
                    Browser Permission:{" "}
                    <span className="uppercase">
                      {
                        notificationPermission
                      }
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    testNotification
                  }
                  disabled={
                    !notificationsEnabled
                  }
                  className={`
                    flex
                    h-9
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    border
                    px-4
                    text-[10px]
                    font-black
                    transition

                    ${
                      darkMode
                        ? "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }

                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  `}
                >
                  <Volume2 size={14} />
                  Test Notification
                </button>
              </div>

              <div
                className={`
                  mt-3
                  rounded-xl
                  border
                  p-3
                  text-[10px]
                  leading-relaxed

                  ${
                    darkMode
                      ? "border-cyan-400/10 bg-cyan-400/5 text-slate-400"
                      : "border-cyan-100 bg-cyan-50 text-slate-500"
                  }
                `}
              >
                <strong
                  className={
                    darkMode
                      ? "text-cyan-300"
                      : "text-cyan-700"
                  }
                >
                  FCM:
                </strong>{" "}
                This setting controls whether the admin
                notification system is enabled. Your
                existing Firebase FCM implementation can
                listen to the
                <code className="mx-1 rounded bg-slate-500/10 px-1">
                  wellborn-notification-setting-change
                </code>
                event.
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            PROFILE (SHORTENED HEADER TEXT FOR MOBILE)
        ================================================= */}

        <section
          className={`
            mb-5
            overflow-hidden
            rounded-2xl
            border

            sm:mb-6

            ${
              darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-white"
            }
          `}
        >
          <CardHeader
            icon={UserRound}
            title={<span className="text-xs sm:text-base">Personal Information</span>}
            subtitle="Keep your details up to date"
            darkMode={darkMode}
          />

          {profileLoading ? (
            <LoadingBlock
              darkMode={darkMode}
            />
          ) : (
            <div
              className="
                grid
                grid-cols-1
                gap-4
                p-4

                sm:grid-cols-2
                sm:gap-5
                sm:p-6
              "
            >
              <SettingsInput
                icon={UserRound}
                label="Admin Name"
                value={
                  form.adminName
                }
                placeholder="Enter admin name"
                darkMode={
                  darkMode
                }
                onChange={(value) =>
                  changeField(
                    "adminName",
                    value
                  )
                }
              />

              <SettingsInput
                icon={Mail}
                label="Email"
                type="email"
                value={
                  form.email
                }
                placeholder="Enter email"
                darkMode={
                  darkMode
                }
                onChange={(value) =>
                  changeField(
                    "email",
                    value
                  )
                }
              />

              <SettingsInput
                icon={Phone}
                label="Phone"
                type="tel"
                value={
                  form.phone
                }
                placeholder="Enter phone number"
                darkMode={
                  darkMode
                }
                onChange={(value) =>
                  changeField(
                    "phone",
                    value
                  )
                }
              />

              <SettingsInput
                icon={ShieldCheck}
                label="Role"
                value={
                  form.role
                }
                disabled
                darkMode={
                  darkMode
                }
                onChange={() => {}}
              />

              <div className="sm:col-span-2">
                <InputLabel
                  icon={MapPin}
                  label="Address"
                  darkMode={
                    darkMode
                  }
                />

                <textarea
                  rows={3}
                  value={
                    form.address ||
                    ""
                  }
                  onChange={(e) =>
                    changeField(
                      "address",
                      e.target.value
                    )
                  }
                  placeholder="Enter address"
                  className={`
                    w-full
                    resize-none
                    rounded-xl
                    border
                    px-3
                    py-3
                    text-xs
                    outline-none
                    transition

                    sm:px-4
                    sm:text-sm

                    ${
                      darkMode
                        ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-cyan-400"
                        : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-cyan-400"
                    }
                  `}
                />
              </div>

              <div
                className="
                  flex
                  sm:col-span-2
                  sm:justify-end
                "
              >
                <button
                  type="button"
                  onClick={
                    updateProfile
                  }
                  disabled={
                    loading ||
                    !adminId
                  }
                  className="
                    flex
                    h-11
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-cyan-600
                    px-6
                    text-xs
                    font-black
                    text-white
                    shadow-lg
                    transition
                    hover:bg-cyan-700
                    active:scale-[0.98]
                    disabled:cursor-not-allowed
                    disabled:opacity-60

                    sm:w-auto
                    sm:text-sm
                  "
                >
                  {loading ? (
                    <Spinner />
                  ) : (
                    <Save size={16} />
                  )}

                  {loading
                    ? "Saving..."
                    : "Save Profile"}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* =================================================
            PASSWORD (SHORTENED HEADER TEXT FOR MOBILE)
        ================================================= */}

        <section
          className={`
            overflow-hidden
            rounded-2xl
            border

            ${
              darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-slate-200 bg-white"
            }
          `}
        >
          <CardHeader
            icon={LockKeyhole}
            title={<span className="text-xs sm:text-base">Password</span>}
            subtitle="Update password for better security"
            darkMode={darkMode}
            indigo
          />

          <div
            className="
              grid
              grid-cols-1
              gap-4
              p-4

              sm:grid-cols-2
              sm:gap-5
              sm:p-6
            "
          >
            <PasswordInput
              label="Current Password"
              value={
                password.oldPassword
              }
              placeholder="Enter current password"
              show={showOld}
              onToggle={() =>
                setShowOld(
                  (value) => !value
                )
              }
              darkMode={
                darkMode
              }
              onChange={(value) =>
                changePasswordField(
                  "oldPassword",
                  value
                )
              }
            />

            <PasswordInput
              label="New Password"
              value={
                password.newPassword
              }
              placeholder="Enter new password"
              show={showNew}
              onToggle={() =>
                setShowNew(
                  (value) => !value
                )
              }
              darkMode={
                darkMode
              }
              onChange={(value) =>
                changePasswordField(
                  "newPassword",
                  value
                )
              }
            />

            <PasswordInput
              label="Confirm Password"
              value={
                password.confirm
              }
              placeholder="Confirm new password"
              show={showConfirm}
              onToggle={() =>
                setShowConfirm(
                  (value) => !value
                )
              }
              darkMode={
                darkMode
              }
              onChange={(value) =>
                changePasswordField(
                  "confirm",
                  value
                )
              }
            />

            <div
              className={`
                flex
                items-center
                gap-2
                rounded-xl
                border
                p-3

                ${
                  darkMode
                    ? "border-emerald-400/20 bg-emerald-500/5"
                    : "border-emerald-100 bg-emerald-50"
                }
              `}
            >
              <CheckCircle2
                size={16}
                className="shrink-0 text-emerald-500"
              />

              <p
                className={`
                  text-[10px]
                  leading-relaxed

                  ${
                    darkMode
                      ? "text-slate-300"
                      : "text-slate-600"
                  }
                `}
              >
                Use at least 6 characters and never share your password.
              </p>
            </div>

            <div
              className="
                flex
                sm:col-span-2
                sm:justify-end
              "
            >
              <button
                type="button"
                onClick={
                  changePassword
                }
                disabled={
                  passwordLoading ||
                  !adminId
                }
                className="
                  flex
                  h-11
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-indigo-600
                  px-6
                  text-xs
                  font-black
                  text-white
                  transition
                  hover:bg-indigo-700
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-60

                  sm:w-auto
                  sm:text-sm
                "
              >
                {passwordLoading ? (
                  <Spinner />
                ) : (
                  <KeyRound size={16} />
                )}

                {passwordLoading
                  ? "Changing..."
                  : "Change Password"}
              </button>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        * {
          box-sizing: border-box;
        }

        @media (
          prefers-reduced-motion: reduce
        ) {
          * {
            scroll-behavior: auto !important;
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

/* =========================================================
   THEME OPTION
========================================================= */

function ThemeOption({
  icon: Icon,
  title,
  subtitle,
  value,
  selected,
  darkMode,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative
        flex
        min-h-[100px]
        w-full
        items-center
        gap-3
        rounded-2xl
        border
        p-4
        text-left
        transition-all
        duration-150
        active:scale-[0.98]

        ${
          selected
            ? darkMode
              ? "border-cyan-400 bg-cyan-500/10 shadow-lg shadow-cyan-500/5"
              : "border-cyan-500 bg-cyan-50 shadow-lg shadow-cyan-500/10"
            : darkMode
            ? "border-slate-800 bg-slate-950 hover:border-slate-700"
            : "border-slate-200 bg-slate-50 hover:border-slate-300"
        }
      `}
    >
      <div
        className={`
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl

          ${
            selected
              ? darkMode
                ? "bg-cyan-400/10 text-cyan-300"
                : "bg-cyan-100 text-cyan-700"
              : darkMode
              ? "bg-slate-800 text-slate-400"
              : "bg-white text-slate-500"
          }
        `}
      >
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`
            text-xs
            font-black

            ${
              darkMode
                ? "text-white"
                : "text-slate-900"
            }
          `}
        >
          {title}
        </p>

        <p
          className={`
            mt-1
            text-[9px]
            leading-relaxed

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

      {selected && (
        <div
          className="
            absolute
            right-3
            top-3
            flex
            h-5
            w-5
            items-center
            justify-center
            rounded-full
            bg-cyan-500
            text-white
          "
        >
          <CheckCircle2 size={13} />
        </div>
      )}
    </button>
  );
}

/* =========================================================
   CARD HEADER
========================================================= */

function CardHeader({
  icon: Icon,
  title,
  subtitle,
  darkMode,
  indigo = false,
}) {
  return (
    <div
      className={`
        flex
        items-center
        gap-3
        border-b
        p-4

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
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-xl
          border

          ${
            indigo
              ? darkMode
                ? "border-indigo-400/20 bg-indigo-500/10 text-indigo-300"
                : "border-indigo-100 bg-indigo-50 text-indigo-600"
              : darkMode
              ? "border-cyan-400/20 bg-cyan-500/10 text-cyan-300"
              : "border-cyan-100 bg-cyan-50 text-cyan-600"
          }
        `}
      >
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <div
          className={`
            text-sm
            font-black
            sm:text-base

            ${
              darkMode
                ? "text-white"
                : "text-slate-800"
            }
          `}
        >
          {title}
        </div>

        <p
          className={`
            mt-0.5
            truncate
            text-[9px]
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
  );
}

/* =========================================================
   INPUT LABEL
========================================================= */

function InputLabel({
  icon: Icon,
  label,
  darkMode,
}) {
  return (
    <label
      className={`
        mb-1.5
        flex
        items-center
        gap-1.5
        text-[9px]
        font-black
        uppercase
        tracking-wide

        ${
          darkMode
            ? "text-slate-300"
            : "text-slate-500"
        }
      `}
    >
      <Icon size={12} />
      {label}
    </label>
  );
}

/* =========================================================
   SETTINGS INPUT
========================================================= */

function SettingsInput({
  icon: Icon,
  label,
  value,
  placeholder,
  type = "text",
  disabled = false,
  onChange,
  darkMode,
}) {
  return (
    <div className="min-w-0">
      <InputLabel
        icon={Icon}
        label={label}
        darkMode={darkMode}
      />

      <input
        type={type}
        value={value || ""}
        disabled={disabled}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        placeholder={placeholder}
        className={`
          h-11
          w-full
          rounded-xl
          border
          px-3
          text-xs
          outline-none
          transition

          sm:px-4
          sm:text-sm

          ${
            darkMode
              ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-cyan-400"
              : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-cyan-400"
          }

          disabled:cursor-not-allowed
          disabled:opacity-60
        `}
      />
    </div>
  );
}

/* =========================================================
   PASSWORD INPUT
========================================================= */

function PasswordInput({
  label,
  value,
  placeholder,
  onChange,
  show,
  onToggle,
  darkMode,
}) {
  return (
    <div className="min-w-0">
      <label
        className={`
          mb-1.5
          block
          text-[9px]
          font-black
          uppercase
          tracking-wide

          ${
            darkMode
              ? "text-slate-300"
              : "text-slate-500"
          }
        `}
      >
        {label}
      </label>

      <div className="relative">
        <input
          type={
            show
              ? "text"
              : "password"
          }
          value={value}
          onChange={(e) =>
            onChange(
              e.target.value
            )
          }
          placeholder={placeholder}
          className={`
            h-11
            w-full
            rounded-xl
            border
            px-3
            pr-11
            text-xs
            outline-none
            transition

            sm:px-4
            sm:text-sm

            ${
              darkMode
                ? "border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-400"
                : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400"
            }
          `}
        />

        <button
          type="button"
          onClick={onToggle}
          className={`
            absolute
            right-2
            top-1/2
            flex
            h-7
            w-7
            -translate-y-1/2
            items-center
            justify-center
            rounded-lg

            ${
              darkMode
                ? "text-slate-400 hover:bg-slate-700 hover:text-white"
                : "text-slate-400 hover:bg-slate-200 hover:text-slate-700"
            }
          `}
        >
          {show ? (
            <EyeOff size={15} />
          ) : (
            <Eye size={15} />
          )}
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingBlock({
  darkMode,
}) {
  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-6">
      {Array.from({
        length: 5,
      }).map((_, index) => (
        <div
          key={index}
          className={`
            h-16
            animate-pulse
            rounded-xl

            ${
              darkMode
                ? "bg-slate-800"
                : "bg-slate-100"
            }

            ${
              index === 4
                ? "sm:col-span-2"
                : ""
            }
          `}
        />
      ))}
    </div>
  );
}

/* =========================================================
   SPINNER
========================================================= */

function Spinner() {
  return (
    <span
      className="
        h-4
        w-4
        animate-spin
        rounded-full
        border-2
        border-white
        border-t-transparent
      "
    />
  );
}