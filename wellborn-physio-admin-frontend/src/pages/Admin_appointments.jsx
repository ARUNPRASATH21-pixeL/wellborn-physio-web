import React, { useEffect, useMemo, useState } from "react";

import {
  CalendarCheck,
  Clock3,
  CheckCircle2,
  CircleAlert,
  Search,
  Trash2,
  UserRound,
  Phone,
  Mail,
  CalendarDays,
  X,
  ChevronDown,
  Eye,
  XCircle,
  Activity,
  FileText,
  Hash,
  UsersRound,
  AlertTriangle,
  Calendar,
} from "lucide-react";

import {
  API,
  getData,
  putData,
  deleteData,
} from "../services/api";

export default function Admin_appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [appointmentView, setAppointmentView] = useState("ACTIVE");

  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  const [deleteAppointment, setDeleteAppointment] =
    useState(null);

  const [statusConfirmation, setStatusConfirmation] =
    useState(null);

  // Queue for multiple past due appointments
  const [datePassedQueue, setDatePassedQueue] = useState([]);
  const [currentDatePassed, setCurrentDatePassed] = useState(null);

  const [rescheduleModal, setRescheduleModal] =
    useState(null);

  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const [updatingId, setUpdatingId] = useState(null);

  const [error, setError] = useState("");

  const [successPopup, setSuccessPopup] = useState(null);

  /* ==========================================================
     NORMALIZE STATUS
  ========================================================== */

  const normalizeStatus = (status) => {
    return String(status || "PENDING")
      .trim()
      .toUpperCase();
  };

  /* ==========================================================
     GET APPOINTMENT ID
  ========================================================== */

  const getAppointmentId = (appointment) => {
    return (
      appointment?.appointmentId ??
      appointment?.id ??
      null
    );
  };

  /* ==========================================================
     GET SERVICE NAME
  ========================================================== */

  const getServiceName = (appointment) => {
    return (
      appointment?.serviceName ||
      appointment?.service?.serviceName ||
      appointment?.service?.name ||
      "Physiotherapy"
    );
  };

  /* ==========================================================
     GET AGE CATEGORY
  ========================================================== */

  const getAgeCategory = (appointment) => {
    return (
      appointment?.ageCategory ||
      appointment?.ageGroup ||
      appointment?.age_category ||
      appointment?.age_group ||
      "—"
    );
  };

  /* ==========================================================
     SUCCESS POPUP
  ========================================================== */

  const showSuccessPopup = (
    title,
    message,
    type = "success"
  ) => {
    setSuccessPopup({
      title,
      message,
      type,
    });

    window.setTimeout(() => {
      setSuccessPopup(null);
    }, 2800);
  };

  /* ==========================================================
     LOAD APPOINTMENTS
  ========================================================== */

  const loadAppointments = async () => {
    try {
      setError("");
      setLoading(true);

      const response = await getData(
        API.APPOINTMENT_GET_ALL
      );

      let data = [];

      if (Array.isArray(response)) {
        data = response;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (Array.isArray(response?.content)) {
        data = response.content;
      }

      setAppointments(data);

      checkDateTimePassedAppointments(data);
    } catch (err) {
      console.error(
        "Failed to load appointments:",
        err
      );

      setError(
        err?.message ||
          "Unable to load appointments. Please make sure the server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  /* ==========================================================
     DATE + TIME PARSER
  ========================================================== */

  const getAppointmentDateTime = (appointment) => {
    const date = appointment?.appointmentDate;
    const time = appointment?.appointmentTime;

    if (!date) {
      return null;
    }

    try {
      const dateString = String(date).trim();

      let timeString = "00:00:00";

      if (time) {
        timeString = String(time).trim();

        if (
          timeString.split(":").length === 2
        ) {
          timeString += ":00";
        }
      }

      const parsed = new Date(
        `${dateString}T${timeString}`
      );

      if (
        Number.isNaN(parsed.getTime())
      ) {
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  };

  /* ==========================================================
     CHECK PASSED DATE + TIME (QUEUE BASED FOR MULTIPLE)
  ========================================================== */

  const checkDateTimePassedAppointments = (
    list
  ) => {
    const now = new Date();
    const passedList = [];

    for (const appointment of list) {
      const status = normalizeStatus(
        appointment?.status
      );

      if (status !== "CONFIRMED" && status !== "PENDING") {
        continue;
      }

      const appointmentDateTime =
        getAppointmentDateTime(
          appointment
        );

      if (!appointmentDateTime) {
        continue;
      }

      if (appointmentDateTime >= now) {
        continue;
      }

      const id =
        getAppointmentId(appointment);

      if (!id) {
        continue;
      }

      const sessionKey =
        `wellborn-passed-appointment-${id}`;

      const alreadyAsked =
        sessionStorage.getItem(sessionKey);

      if (alreadyAsked === "true") {
        continue;
      }

      passedList.push(appointment);
    }

    if (passedList.length > 0) {
      passedList.forEach(app => {
        sessionStorage.setItem(`wellborn-passed-appointment-${getAppointmentId(app)}`, "true");
      });
      setCurrentDatePassed(passedList[0]);
      setDatePassedQueue(passedList.slice(1));
    }
  };

  /* ==========================================================
     DATE FORMAT
  ========================================================== */

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    try {
      const value = String(date);

      const match = value.match(
        /^(\d{4})-(\d{2})-(\d{2})$/
      );

      if (match) {
        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);

        const parsed = new Date(
          year,
          month - 1,
          day
        );

        return parsed.toLocaleDateString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );
      }

      const parsed = new Date(value);

      if (
        Number.isNaN(parsed.getTime())
      ) {
        return value;
      }

      return parsed.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );
    } catch {
      return String(date);
    }
  };

  /* ==========================================================
     TIME FORMAT
  ========================================================== */

  const formatTime = (time) => {
    if (!time) {
      return "—";
    }

    try {
      const value = String(time);

      const parts = value.split(":");

      if (parts.length >= 2) {
        let hours = Number(parts[0]);
        const minutes = parts[1];

        const ampm =
          hours >= 12 ? "PM" : "AM";

        hours = hours % 12;
        hours = hours || 12;

        return `${String(hours).padStart(
          2,
          "0"
        )}:${minutes} ${ampm}`;
      }

      return value;
    } catch {
      return String(time);
    }
  };

  /* ==========================================================
     CREATED DATE
  ========================================================== */

  const formatCreatedAt = (value) => {
    if (!value) {
      return "—";
    }

    try {
      const parsed = new Date(value);

      if (
        Number.isNaN(parsed.getTime())
      ) {
        return String(value);
      }

      return parsed.toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return String(value);
    }
  };

  /* ==========================================================
     STATUS LABEL & CLASS
  ========================================================== */

  const getStatusLabel = (status) => {
    const normalized = normalizeStatus(status);

    switch (normalized) {
      case "CONFIRMED":
        return "Confirmed";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
      case "CANCELED":
        return "Cancelled";
      default:
        return "Pending";
    }
  };

  const getStatusClass = (status) => {
    switch (normalizeStatus(status)) {
      case "CONFIRMED":
        return "status-confirmed";
      case "COMPLETED":
        return "status-completed";
      case "CANCELLED":
      case "CANCELED":
        return "status-cancelled";
      default:
        return "status-pending";
    }
  };

  const getStatusIcon = (status) => {
    switch (normalizeStatus(status)) {
      case "CONFIRMED":
        return <CheckCircle2 size={13} />;
      case "COMPLETED":
        return <CheckCircle2 size={13} />;
      case "CANCELLED":
      case "CANCELED":
        return <XCircle size={13} />;
      default:
        return <Clock3 size={13} />;
    }
  };

  const renderStatusBadge = (status) => {
    return (
      <span className={`wellborn-status-pill ${getStatusClass(status)}`}>
        {getStatusIcon(status)}
        {getStatusLabel(status)}
      </span>
    );
  };

  /* ==========================================================
     COUNTS
  ========================================================== */

  const counts = useMemo(() => {
    let pending = 0;
    let confirmed = 0;
    let completed = 0;
    let cancelled = 0;

    appointments.forEach((appointment) => {
      const status = normalizeStatus(appointment?.status);
      switch (status) {
        case "PENDING":
          pending++;
          break;
        case "CONFIRMED":
          confirmed++;
          break;
        case "COMPLETED":
          completed++;
          break;
        case "CANCELLED":
        case "CANCELED":
          cancelled++;
          break;
        default:
          pending++;
          break;
      }
    });

    return {
      total: appointments.length,
      pending,
      confirmed,
      completed,
      cancelled,
    };
  }, [appointments]);

  /* ==========================================================
     ACTIVE & COMPLETED APPOINTMENTS
  ========================================================== */

  const activeAppointments = useMemo(() => {
    const list = appointments.filter(
      (appointment) => normalizeStatus(appointment?.status) !== "COMPLETED"
    );
    return list.sort((a, b) => {
      const dateA = getAppointmentDateTime(a);
      const dateB = getAppointmentDateTime(b);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateA - dateB;
    });
  }, [appointments]);

  const completedAppointments = useMemo(() => {
    const list = appointments.filter(
      (appointment) => normalizeStatus(appointment?.status) === "COMPLETED"
    );
    return list.sort((a, b) => {
      const dateA = getAppointmentDateTime(a);
      const dateB = getAppointmentDateTime(b);
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      return dateB - dateA;
    });
  }, [appointments]);

  const currentAppointments = useMemo(() => {
    return appointmentView === "COMPLETED"
      ? completedAppointments
      : activeAppointments;
  }, [appointmentView, activeAppointments, completedAppointments]);

  /* ==========================================================
     SEARCH + FILTER
  ========================================================== */

  const filteredAppointments = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return currentAppointments.filter((appointment) => {
      const status = normalizeStatus(appointment?.status);
      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter;

      if (!matchesStatus) return false;
      if (!keyword) return true;

      const searchableValues = [
        appointment?.patientName,
        appointment?.phone,
        appointment?.email,
        appointment?.serviceName,
        appointment?.service?.serviceName,
        appointment?.service?.name,
        appointment?.message,
        appointment?.appointmentDate,
        appointment?.appointmentTime,
        appointment?.status,
        appointment?.appointmentId,
        appointment?.ageCategory,
        appointment?.ageGroup,
      ];

      return searchableValues
        .filter((value) => value !== null && value !== undefined)
        .some((value) => String(value).toLowerCase().includes(keyword));
    });
  }, [currentAppointments, search, statusFilter]);

  /* ==========================================================
     STATUS UPDATE LOGIC
  ========================================================== */

  const requestStatusUpdate = (appointment, newStatus) => {
    const currentStatus = normalizeStatus(appointment?.status);
    const nextStatus = normalizeStatus(newStatus);

    if (currentStatus === nextStatus) return;

    setStatusConfirmation({
      appointment,
      newStatus: nextStatus,
    });
  };

  const updateStatus = async (appointment, newStatus) => {
    const id = getAppointmentId(appointment);

    if (!id) {
      setError("Unable to update appointment. Appointment ID is missing.");
      return;
    }

    try {
      setUpdatingId(id);
      setError("");

      const payload = {
        patientName: appointment?.patientName || "",
        phone: appointment?.phone || "",
        email: appointment?.email || "",
        appointmentDate: appointment?.appointmentDate || null,
        appointmentTime: appointment?.appointmentTime || null,
        ageCategory:
          appointment?.ageCategory || appointment?.ageGroup || null,
        message: appointment?.message || "",
        serviceId:
          appointment?.serviceId ?? appointment?.service?.serviceId ?? null,
        serviceName:
          appointment?.serviceName ??
          appointment?.service?.serviceName ??
          appointment?.service?.name ??
          null,
        status: newStatus,
      };

      await putData(`${API.APPOINTMENT_UPDATE}/${id}`, payload);

      setAppointments((previous) =>
        previous.map((item) => {
          const itemId = getAppointmentId(item);
          if (itemId === id) {
            return { ...item, status: newStatus };
          }
          return item;
        })
      );

      setSelectedAppointment((previous) => {
        if (!previous || getAppointmentId(previous) !== id) return previous;
        return { ...previous, status: newStatus };
      });

      setStatusConfirmation(null);
      
      if (currentDatePassed && getAppointmentId(currentDatePassed) === id) {
        if (datePassedQueue.length > 0) {
          setCurrentDatePassed(datePassedQueue[0]);
          setDatePassedQueue(datePassedQueue.slice(1));
        } else {
          setCurrentDatePassed(null);
        }
      }

      const patientLabel = appointment?.patientName || "Patient";

      if (newStatus === "COMPLETED") {
        showSuccessPopup(
          "Appointment Completed",
          `${patientLabel}'s appointment has been successfully marked as completed.`,
          "completed"
        );
      } else if (newStatus === "PENDING") {
        showSuccessPopup(
          "Appointment Kept Pending",
          `${patientLabel}'s appointment remains active with Pending status.`,
          "pending"
        );
      } else if (newStatus === "CONFIRMED") {
        showSuccessPopup(
          "Appointment Confirmed",
          `${patientLabel}'s appointment has been confirmed.`,
          "confirmed"
        );
      } else if (newStatus === "CANCELLED") {
        showSuccessPopup(
          "Appointment Cancelled",
          `${patientLabel}'s appointment has been cancelled.`,
          "cancelled"
        );
      }
    } catch (err) {
      console.error("Failed to update appointment:", err);
      setError(err?.message || "Unable to update appointment status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const confirmStatusChange = async () => {
    if (!statusConfirmation) return;
    const { appointment, newStatus } = statusConfirmation;
    await updateStatus(appointment, newStatus);
  };

  const handleDatePassedDecision = async (markCompleted) => {
    if (!currentDatePassed) return;
    const appointment = currentDatePassed;

    if (markCompleted) {
      await updateStatus(appointment, "COMPLETED");
      return;
    }

    const target = currentDatePassed;
    if (datePassedQueue.length > 0) {
      setCurrentDatePassed(datePassedQueue[0]);
      setDatePassedQueue(datePassedQueue.slice(1));
    } else {
      setCurrentDatePassed(null);
    }

    setNewDate(target?.appointmentDate || "");
    setNewTime(target?.appointmentTime || "");
    setRescheduleModal(target);
  };

  /* ==========================================================
     RESCHEDULE SUBMIT LOGIC
  ========================================================== */

  const handleRescheduleSubmit = async () => {
    if (!rescheduleModal) return;

    const id = getAppointmentId(rescheduleModal);
    if (!id) {
      setError("Unable to reschedule appointment. ID is missing.");
      return;
    }

    if (!newDate || !newTime) {
      setError("Please select both a valid date and time for rescheduling.");
      return;
    }

    try {
      setUpdatingId(id);
      setError("");

      const payload = {
        patientName: rescheduleModal?.patientName || "",
        phone: rescheduleModal?.phone || "",
        email: rescheduleModal?.email || "",
        appointmentDate: newDate,
        appointmentTime: newTime.length === 5 ? `${newTime}:00` : newTime,
        ageCategory:
          rescheduleModal?.ageCategory || rescheduleModal?.ageGroup || null,
        message: rescheduleModal?.message || "",
        serviceId:
          rescheduleModal?.serviceId ?? rescheduleModal?.service?.serviceId ?? null,
        serviceName:
          rescheduleModal?.serviceName ??
          rescheduleModal?.service?.serviceName ??
          rescheduleModal?.service?.name ??
          null,
        status: "PENDING",
      };

      await putData(`${API.APPOINTMENT_UPDATE}/${id}`, payload);

      sessionStorage.removeItem(`wellborn-passed-appointment-${id}`);

      setAppointments((previous) =>
        previous.map((item) => {
          const itemId = getAppointmentId(item);
          if (itemId === id) {
            return {
              ...item,
              appointmentDate: newDate,
              appointmentTime: newTime,
              status: "PENDING",
            };
          }
          return item;
        })
      );

      setRescheduleModal(null);
      showSuccessPopup(
        "Appointment Rescheduled",
        `Appointment for ${rescheduleModal?.patientName || "Patient"} has been successfully rescheduled.`,
        "confirmed"
      );
    } catch (err) {
      console.error("Failed to reschedule appointment:", err);
      setError(err?.message || "Unable to reschedule appointment. Please check valid future slots.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteAppointment) return;

    const id = getAppointmentId(deleteAppointment);
    if (!id) {
      setError("Unable to delete appointment. Appointment ID is missing.");
      return;
    }

    try {
      setUpdatingId(id);
      setError("");

      await deleteData(`${API.APPOINTMENT_DELETE}/${id}`);

      setAppointments((previous) =>
        previous.filter((item) => getAppointmentId(item) !== id)
      );

      setDeleteAppointment(null);
      setSelectedAppointment(null);

      showSuccessPopup(
        "Appointment Deleted",
        "The appointment has been permanently deleted.",
        "delete"
      );
    } catch (err) {
      console.error("Failed to delete appointment:", err);
      setError(err?.message || "Unable to delete appointment.");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ==========================================================
     CSS STYLES
  ========================================================== */

  useEffect(() => {
    const oldStyle = document.getElementById(
      "wellborn-admin-appointments-style"
    );
    if (oldStyle) oldStyle.remove();

    const style = document.createElement("style");
    style.id = "wellborn-admin-appointments-style";

    style.innerHTML = `
      * { box-sizing: border-box; }

      .wellborn-appointments-page {
        width: 100%;
        min-height: calc(100vh - 78px);
        padding: 24px;
        background: #f5f7fb;
        color: #0f172a;
        overflow-x: hidden;
      }

      .wellborn-appointments-container {
        width: 100%;
        max-width: 1500px;
        margin: 0 auto;
      }

      .wellborn-appointments-header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 20px;
        margin-bottom: 24px;
      }

      .wellborn-appointments-title {
        margin: 0;
        font-size: 28px;
        line-height: 1.15;
        font-weight: 850;
        letter-spacing: -0.8px;
        color: #0f172a;
      }

      .wellborn-appointments-subtitle {
        margin: 8px 0 0;
        color: #64748b;
        font-size: 13px;
        line-height: 1.5;
      }

      .wellborn-appointment-error {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        margin-bottom: 17px;
        padding: 13px 15px;
        border: 1px solid #fecaca;
        border-radius: 14px;
        background: #fef2f2;
        color: #b91c1c;
        font-size: 12px;
        font-weight: 650;
        line-height: 1.5;
      }

      /* Uniform Stats Cards */
      .wellborn-appointment-stats {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 14px;
        margin-bottom: 20px;
      }

      .wellborn-stat-card {
        position: relative;
        padding: 18px;
        border: 1px solid #e2e8f0;
        border-radius: 18px;
        background: #ffffff;
        box-shadow: 0 8px 28px rgba(15,23,42,.055);
      }

      .wellborn-stat-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .wellborn-stat-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background: #eff6ff;
        color: #2563eb;
      }

      .wellborn-stat-label {
        margin: 12px 0 4px;
        color: #64748b;
        font-size: 11px;
        font-weight: 700;
      }

      .wellborn-stat-value {
        margin: 0;
        color: #0f172a;
        font-size: 24px;
        line-height: 1;
        font-weight: 850;
      }

      .wellborn-stat-pending .wellborn-stat-icon { background: #fff7ed; color: #ea580c; }
      .wellborn-stat-confirmed .wellborn-stat-icon { background: #ecfdf5; color: #059669; }
      .wellborn-stat-completed .wellborn-stat-icon { background: #f0fdf4; color: #16a34a; }

      /* Sliding Tabs Container */
      .wellborn-appointment-tabs {
        position: relative;
        display: grid;
        grid-template-columns: 1fr 1fr;
        width: min(480px, 100%);
        min-height: 46px;
        margin-bottom: 18px;
        padding: 3px;
        border: 1px solid #dfe6f0;
        border-radius: 14px;
        background: #ffffff;
        box-shadow: 0 6px 20px rgba(15,23,42,.06);
        overflow: hidden;
      }

      .wellborn-appointment-tabs::before {
        content: "";
        position: absolute;
        top: 3px;
        bottom: 3px;
        left: 3px;
        width: calc(50% - 3px);
        border-radius: 11px;
        background: linear-gradient(135deg,#2563eb,#1d4ed8);
        box-shadow: 0 4px 14px rgba(37,99,235,.22);
        transition: transform .3s cubic-bezier(0.25, 1, 0.5, 1);
        pointer-events: none;
      }

      .wellborn-appointment-tabs.completed-active::before {
        transform: translateX(100%);
      }

      .wellborn-appointment-tab {
        position: relative;
        z-index: 2;
        min-height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 0 8px;
        border: none;
        border-radius: 11px;
        background: transparent;
        color: #64748b;
        font-family: inherit;
        font-size: 11.5px;
        font-weight: 800;
        cursor: pointer;
        transition: color .25s ease;
        white-space: nowrap;
        -webkit-tap-highlight-color: transparent;
      }

      .wellborn-appointment-tab.active { color: #ffffff; }
      .wellborn-appointment-tab:not(.active):hover { color: #2563eb; }

      .wellborn-tab-count {
        min-width: 18px;
        height: 17px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0 4px;
        border-radius: 999px;
        background: #edf4ff;
        color: #2563eb;
        font-size: 9.5px;
        font-weight: 850;
        flex-shrink: 0;
        transition: background .25s ease, color .25s ease;
      }

      .wellborn-appointment-tab.active .wellborn-tab-count {
        background: rgba(255,255,255,.24);
        color: #ffffff;
      }

      .wellborn-appointments-toolbar {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 18px;
      }

      .wellborn-search-wrap {
        position: relative;
        flex: 1;
        min-width: 0;
      }

      .wellborn-search-icon {
        position: absolute;
        top: 50%;
        left: 15px;
        transform: translateY(-50%);
        color: #94a3b8;
        pointer-events: none;
      }

      .wellborn-appointment-search {
        width: 100%;
        height: 46px;
        padding: 0 16px 0 43px;
        border: 1px solid #dbe3ef;
        border-radius: 14px;
        outline: none;
        background: #ffffff;
        color: #0f172a;
        font-family: inherit;
        font-size: 13px;
      }

      .wellborn-appointment-search:focus {
        border-color: #60a5fa;
        box-shadow: 0 0 0 4px rgba(59,130,246,.10);
      }

      .wellborn-status-filter {
        position: relative;
        flex: 0 0 170px;
      }

      .wellborn-status-select {
        width: 100%;
        height: 46px;
        appearance: none;
        padding: 0 35px 0 14px;
        border: 1px solid #dbe3ef;
        border-radius: 14px;
        outline: none;
        background: #ffffff;
        color: #334155;
        font-family: inherit;
        font-size: 13px;
        font-weight: 650;
        cursor: pointer;
      }

      .wellborn-status-filter > svg {
        position: absolute; right: 13px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #64748b;
      }

      .wellborn-appointments-card {
        width: 100%;
        border: 1px solid #e2e8f0;
        border-radius: 22px;
        background: #ffffff;
        box-shadow: 0 10px 35px rgba(15,23,42,.065);
        overflow: hidden;
      }

      .wellborn-table-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        padding: 16px 20px;
        border-bottom: 1px solid #e8edf4;
      }

      .wellborn-table-title {
        margin: 0; color: #0f172a; font-size: 15px; font-weight: 850;
      }

      .wellborn-table-count {
        display: inline-flex; align-items: center; justify-content: center;
        min-width: 28px; height: 24px; padding: 0 8px; margin-left: 7px;
        border-radius: 99px; background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 850;
      }

      .wellborn-table-scroll {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      .wellborn-appointments-table {
        width: 100%;
        min-width: 1050px;
        border-collapse: collapse;
      }

      .wellborn-appointments-table th {
        padding: 13px 16px;
        background: #f8fafc;
        color: #64748b;
        font-size: 10px;
        font-weight: 850;
        letter-spacing: .6px;
        text-transform: uppercase;
        text-align: left;
        white-space: nowrap;
      }

      .wellborn-appointments-table td {
        padding: 14px 16px;
        border-top: 1px solid #edf1f6;
        color: #334155;
        font-size: 12px;
        vertical-align: middle;
      }

      .wellborn-appointments-table tbody tr:hover { background: #f8fbff; }

      .wellborn-patient-cell {
        display: flex; align-items: center; gap: 10px; min-width: 170px;
      }

      .wellborn-patient-avatar {
        width: 38px; height: 38px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
        border-radius: 12px; background: #eff6ff; color: #2563eb;
      }

      .wellborn-patient-name {
        max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #0f172a; font-size: 12px; font-weight: 750;
      }

      .wellborn-patient-id { margin-top: 3px; color: #94a3b8; font-size: 10px; }

      .wellborn-service-pill {
        display: inline-flex; align-items: center; max-width: 180px; padding: 6px 10px; border-radius: 9px;
        background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }

      .wellborn-age-pill {
        display: inline-flex; align-items: center; gap: 5px; padding: 6px 10px; border-radius: 9px;
        background: #f5f3ff; color: #6d28d9; font-size: 11px; font-weight: 750; white-space: nowrap;
      }

      .wellborn-date-cell {
        display: flex; align-items: center; gap: 7px; white-space: nowrap; color: #475569; font-weight: 650;
      }
      .wellborn-date-cell svg { color: #2563eb; flex-shrink: 0; }

      /* Status Styles */
      .wellborn-status-select-wrap { position: relative; width: 140px; }
      .wellborn-status-dropdown {
        width: 100%; height: 38px; appearance: none; padding: 0 28px 0 10px; border-radius: 11px;
        outline: none; font-family: inherit; font-size: 11px; font-weight: 800; cursor: pointer; transition: all .2s ease;
      }
      .wellborn-status-dropdown option { background: #ffffff; color: #0f172a; font-weight: 700; padding: 6px; }

      .wellborn-status-pill {
        display: inline-flex; align-items: center; gap: 6px; padding: 6px 11px; border-radius: 10px; font-size: 11px; font-weight: 800;
      }
      .status-pending { background: #fff7ed; border: 1.5px solid #fed7aa; color: #ea580c; }
      .status-confirmed { background: #ecfdf5; border: 1.5px solid #a7f3d0; color: #059669; }
      .status-completed { background: #f0fdf4; border: 1.5px solid #bbf7d0; color: #16a34a; }
      .status-cancelled { background: #fef2f2; border: 1.5px solid #fecaca; color: #dc2626; }

      .wellborn-status-chevron, .wellborn-status-loading {
        position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none;
      }
      .wellborn-status-loading { animation: wellbornSpin .8s linear infinite; }
      @keyframes wellbornSpin { from { transform: translateY(-50%) rotate(0deg); } to { transform: translateY(-50%) rotate(360deg); } }

      .wellborn-action-button {
        width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
        border: 1px solid #e2e8f0; border-radius: 9px; background: #ffffff; cursor: pointer;
      }
      .wellborn-action-view { color: #2563eb; }
      .wellborn-action-view:hover { background: #eff6ff; border-color: #bfdbfe; }
      .wellborn-action-delete { color: #dc2626; }
      .wellborn-action-delete:hover { background: #fef2f2; border-color: #fecaca; }

      .wellborn-empty-state { padding: 55px 20px; text-align: center; }
      .wellborn-empty-icon {
        width: 54px; height: 54px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;
        border-radius: 16px; background: #eff6ff; color: #2563eb;
      }
      .wellborn-loading { display: flex; align-items: center; justify-content: center; gap: 10px; min-height: 240px; color: #64748b; font-size: 13px; font-weight: 650; }

      /* Modals */
      .wellborn-modal-overlay {
        position: fixed; inset: 0; z-index: 10050; display: flex; align-items: center; justify-content: center;
        padding: 16px; background: rgba(15,23,42,.68); backdrop-filter: blur(9px); overflow-y: auto;
      }
      .wellborn-modal {
        position: relative; width: min(600px, 100%); max-height: 85vh; display: flex; flex-direction: column;
        margin: auto; border: 1px solid #e2e8f0; border-radius: 20px; background: #ffffff; box-shadow: 0 25px 70px rgba(15,23,42,.28); overflow: hidden;
      }
      .wellborn-modal-header {
        display: flex; align-items: center; justify-content: space-between; gap: 15px; padding: 16px 18px; border-bottom: 1px solid #edf1f6; background: inherit; position: sticky; top: 0; z-index: 10;
      }
      .wellborn-modal-title { margin: 0; color: #0f172a; font-size: 16px; font-weight: 800; }
      .wellborn-modal-close { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border: none; border-radius: 9px; background: #f1f5f9; color: #64748b; cursor: pointer; }
      .wellborn-modal-body { padding: 18px; overflow-y: auto; }

      .wellborn-detail-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 10px; }
      .wellborn-detail-item {
        min-width: 0; min-height: 68px; padding: 11px 13px; border: 1px solid #e8edf4; border-radius: 12px; background: #f8fafc;
        display: flex; flex-direction: column; justify-content: center;
      }
      .wellborn-detail-item.full { grid-column: 1/-1; min-height: auto; }
      .wellborn-detail-label { display: flex; align-items: center; gap: 5px; margin-bottom: 5px; color: #94a3b8; font-size: 9.5px; font-weight: 800; text-transform: uppercase; }
      .wellborn-detail-label svg { color: #2563eb; }
      .wellborn-detail-value { color: #334155; font-size: 12.5px; font-weight: 700; word-break: break-word; }
      .wellborn-message-value { line-height: 1.5; font-weight: 500; color: #475569; white-space: pre-wrap; }

      .wellborn-status-confirm-modal, .wellborn-date-passed-modal, .wellborn-reschedule-modal, .wellborn-delete-modal {
        width: min(430px,100%); margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 22px; background: #ffffff; box-shadow: 0 30px 80px rgba(0,0,0,.25); text-align: center;
      }
      .wellborn-date-passed-icon, .wellborn-status-confirm-icon, .wellborn-reschedule-icon, .wellborn-delete-icon {
        width: 54px; height: 54px; margin: 0 auto 14px; display: flex; align-items: center; justify-content: center; border-radius: 15px;
      }
      .wellborn-date-passed-icon { background: #fff7ed; color: #ea580c; }
      .wellborn-status-confirm-icon { background: #eff6ff; color: #2563eb; }
      .wellborn-reschedule-icon { background: #eff6ff; color: #2563eb; }
      .wellborn-delete-icon { background: #fef2f2; color: #dc2626; }

      .wellborn-date-passed-modal h3, .wellborn-status-confirm-modal h3, .wellborn-reschedule-modal h3, .wellborn-delete-modal h3 { margin: 0; color: #0f172a; font-size: 17px; font-weight: 850; }
      .wellborn-date-passed-modal p, .wellborn-status-confirm-modal p, .wellborn-reschedule-modal p, .wellborn-delete-modal p { margin: 8px 0 16px; color: #64748b; font-size: 11.5px; line-height: 1.6; }

      .wellborn-passed-appointment-info { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; margin-bottom: 16px; text-align: left; }
      .wellborn-passed-info-box { padding: 9px 11px; border: 1px solid #e5e7eb; border-radius: 11px; background: #f8fafc; }
      .wellborn-passed-info-label { display: block; margin-bottom: 3px; color: #94a3b8; font-size: 8.5px; font-weight: 800; text-transform: uppercase; }
      .wellborn-passed-info-value { color: #334155; font-size: 11.5px; font-weight: 750; }

      .wellborn-reschedule-form { text-align: left; margin-bottom: 18px; display: flex; flex-direction: column; gap: 12px; }
      .wellborn-form-group { display: flex; flex-direction: column; gap: 5px; }
      .wellborn-form-group label { color: #475569; font-size: 11px; font-weight: 750; text-transform: uppercase; }
      .wellborn-form-group input { width: 100%; height: 42px; padding: 0 12px; border: 1px solid #cbd5e1; border-radius: 10px; font-family: inherit; font-size: 13px; color: #0f172a; outline: none; background: #fff; }
      .wellborn-form-group input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.1); }

      .wellborn-status-confirm-actions, .wellborn-date-passed-actions, .wellborn-reschedule-actions, .wellborn-delete-actions { display: flex; justify-content: center; gap: 8px; }
      .wellborn-modal-button {
        min-height: 40px; padding: 0 15px; border: none; border-radius: 10px; font-family: inherit; font-size: 11px; font-weight: 800; cursor: pointer;
      }
      .wellborn-cancel-button { background: #f1f5f9; color: #475569; }
      .wellborn-confirm-status-button { background: #2563eb; color: #ffffff; }
      .wellborn-confirm-delete-button { background: #dc2626; color: #ffffff; }
      .wellborn-confirm-completed-button { background: linear-gradient(135deg,#16a34a,#15803d); color: #ffffff; }

      /* Success Toast */
      .wellborn-success-popup-wrap { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); z-index: 25000; width: min(420px, calc(100vw - 28px)); pointer-events: none; }
      .wellborn-success-popup {
        display: flex; align-items: flex-start; gap: 12px; padding: 14px 16px; border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 16px;
        background: rgba(15, 23, 42, 0.94); color: #f8fafc; box-shadow: 0 20px 50px rgba(15, 23, 42, 0.35); backdrop-filter: blur(14px); pointer-events: auto;
      }
      .wellborn-success-popup-icon { width: 36px; height: 36px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border-radius: 11px; }
      .popup-icon-completed, .popup-icon-confirmed { background: rgba(22, 163, 74, 0.2); color: #4ade80; }
      .popup-icon-pending { background: rgba(234, 88, 12, 0.2); color: #fb923c; }
      .popup-icon-cancelled, .popup-icon-delete { background: rgba(220, 38, 38, 0.2); color: #f87171; }
      .wellborn-success-popup-title { margin: 0 0 2px; color: #f8fafc; font-size: 12px; font-weight: 800; }
      .wellborn-success-popup-message { margin: 0; color: #cbd5e1; font-size: 11px; line-height: 1.4; }

      /* =====================================================
         DARK THEME SUPPORT
      ===================================================== */
      .wellborn-admin-dark .wellborn-appointments-page { background: #0b1120; color: #e2e8f0; }
      .wellborn-admin-dark .wellborn-appointments-title { color: #f8fafc; }
      .wellborn-admin-dark .wellborn-appointments-subtitle { color: #94a3b8; }
      .wellborn-admin-dark .wellborn-stat-card { background: #172033; border-color: #334155; }
      .wellborn-admin-dark .wellborn-stat-value { color: #f8fafc; }
      .wellborn-admin-dark .wellborn-stat-label { color: #94a3b8; }
      .wellborn-admin-dark .wellborn-appointment-tabs { background: #172033; border-color: #334155; }
      .wellborn-admin-dark .wellborn-appointment-tab { color: #94a3b8; }
      .wellborn-admin-dark .wellborn-appointment-search, .wellborn-admin-dark .wellborn-status-select { background: #172033; border-color: #475569; color: #f8fafc; }
      .wellborn-admin-dark .wellborn-appointments-card { background: #172033; border-color: #334155; }
      .wellborn-admin-dark .wellborn-table-header { border-color: #334155; }
      .wellborn-admin-dark .wellborn-table-title { color: #f8fafc; }
      .wellborn-admin-dark .wellborn-appointments-table th { background: #111827; color: #94a3b8; }
      .wellborn-admin-dark .wellborn-appointments-table td { border-color: #263449; color: #cbd5e1; }
      .wellborn-admin-dark .wellborn-appointments-table tbody tr:hover { background: #1c293d; }
      .wellborn-admin-dark .wellborn-patient-name { color: #f8fafc; }
      .wellborn-admin-dark .wellborn-service-pill { background: #243044; color: #cbd5e1; }
      .wellborn-admin-dark .wellborn-age-pill { background: #2e2449; color: #c4b5fd; }
      .wellborn-admin-dark .wellborn-date-cell { color: #cbd5e1; }

      .wellborn-admin-dark .status-pending { background: rgba(234, 88, 12, 0.15) !important; border: 1.5px solid #ea580c !important; color: #fb923c !important; }
      .wellborn-admin-dark .status-confirmed { background: rgba(5, 150, 105, 0.15) !important; border: 1.5px solid #059669 !important; color: #34d399 !important; }
      .wellborn-admin-dark .status-completed { background: rgba(22, 163, 74, 0.15) !important; border: 1.5px solid #16a34a !important; color: #4ade80 !important; }
      .wellborn-admin-dark .status-cancelled { background: rgba(220, 38, 38, 0.15) !important; border: 1.5px solid #dc2626 !important; color: #f87171 !important; }

      .wellborn-admin-dark .wellborn-status-dropdown option { background: #172033; color: #f8fafc; }
      .wellborn-admin-dark .wellborn-action-button { background: #172033; border-color: #334155; }
      .wellborn-admin-dark .wellborn-modal, .wellborn-admin-dark .wellborn-delete-modal, .wellborn-admin-dark .wellborn-reschedule-modal, .wellborn-admin-dark .wellborn-status-confirm-modal, .wellborn-admin-dark .wellborn-date-passed-modal { background: #172033; border-color: #334155; }
      .wellborn-admin-dark .wellborn-modal-header { border-color: #334155; background: #172033; }
      .wellborn-admin-dark .wellborn-modal-title, .wellborn-admin-dark .wellborn-delete-modal h3, .wellborn-admin-dark .wellborn-reschedule-modal h3, .wellborn-admin-dark .wellborn-status-confirm-modal h3, .wellborn-admin-dark .wellborn-date-passed-modal h3 { color: #f8fafc; }
      .wellborn-admin-dark .wellborn-detail-item, .wellborn-admin-dark .wellborn-passed-info-box { background: #1e293b; border-color: #334155; }
      .wellborn-admin-dark .wellborn-detail-value, .wellborn-admin-dark .wellborn-passed-info-value { color: #e2e8f0; }
      .wellborn-admin-dark .wellborn-cancel-button { background: #334155; color: #e2e8f0; }
      .wellborn-admin-dark .wellborn-form-group input { background: #1e293b; border-color: #334155; color: #f8fafc; }

      /* =====================================================
         RESPONSIVE MEDIA QUERIES (DESKTOP vs MOBILE TEXT SWITCH)
      ===================================================== */
      .tab-text-desktop { display: inline; }
      .tab-text-mobile { display: none; }

      @media (max-width:1050px) {
        .wellborn-appointments-page { padding: 18px; }
        .wellborn-appointment-stats { grid-template-columns: repeat(2,minmax(0,1fr)); }
      }

      @media (max-width:700px) {
        .wellborn-appointments-page { padding: 12px; }
        .wellborn-appointments-title { font-size: 22px; }
        .wellborn-appointment-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
        .wellborn-appointments-toolbar { flex-direction: column; align-items: stretch; gap: 8px; }
        .wellborn-status-filter { width: 100%; flex: none; }
        
        /* Mobile short text display */
        .tab-text-desktop { display: none; }
        .tab-text-mobile { display: inline; }

        .wellborn-appointment-tabs { width: 100%; min-height: 42px; margin-bottom: 14px; }
        .wellborn-appointment-tab { font-size: 11px; padding: 0 6px; gap: 5px; min-height: 34px; font-weight: 850; }
        .wellborn-tab-count { min-width: 17px; height: 16px; font-size: 9px; padding: 0 4px; }
      }
    `;

    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  /* ==========================================================
     ESC KEY
  ========================================================== */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (successPopup) { setSuccessPopup(null); return; }
      if (rescheduleModal) { setRescheduleModal(null); return; }
      if (currentDatePassed) { return; }
      if (statusConfirmation) { setStatusConfirmation(null); return; }
      if (deleteAppointment) { setDeleteAppointment(null); return; }
      if (selectedAppointment) { setSelectedAppointment(null); }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [successPopup, rescheduleModal, currentDatePassed, statusConfirmation, deleteAppointment, selectedAppointment]);

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="wellborn-appointments-page">
      <div className="wellborn-appointments-container">

        {/* HEADER */}
        <div className="wellborn-appointments-header">
          <div>
            <h1 className="wellborn-appointments-title">Appointments</h1>
            <p className="wellborn-appointments-subtitle">
              Manage patient appointments, schedules and booking status.
            </p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="wellborn-appointment-error">
            <CircleAlert size={17} />
            <span>{error}</span>
          </div>
        )}

        {/* STATS */}
        <div className="wellborn-appointment-stats">
          <div className="wellborn-stat-card">
            <div className="wellborn-stat-top"><div className="wellborn-stat-icon"><CalendarCheck size={19} /></div></div>
            <p className="wellborn-stat-label">Total Appointments</p>
            <p className="wellborn-stat-value">{counts.total}</p>
          </div>
          <div className="wellborn-stat-card wellborn-stat-pending">
            <div className="wellborn-stat-top"><div className="wellborn-stat-icon"><Clock3 size={19} /></div></div>
            <p className="wellborn-stat-label">Pending</p>
            <p className="wellborn-stat-value">{counts.pending}</p>
          </div>
          <div className="wellborn-stat-card wellborn-stat-confirmed">
            <div className="wellborn-stat-top"><div className="wellborn-stat-icon"><CheckCircle2 size={19} /></div></div>
            <p className="wellborn-stat-label">Confirmed</p>
            <p className="wellborn-stat-value">{counts.confirmed}</p>
          </div>
          <div className="wellborn-stat-card wellborn-stat-completed">
            <div className="wellborn-stat-top"><div className="wellborn-stat-icon"><CheckCircle2 size={19} /></div></div>
            <p className="wellborn-stat-label">Completed</p>
            <p className="wellborn-stat-value">{counts.completed}</p>
          </div>
        </div>

        {/* TABS */}
        <div className={`wellborn-appointment-tabs ${appointmentView === "COMPLETED" ? "completed-active" : ""}`}>
          <button
            type="button"
            className={`wellborn-appointment-tab ${appointmentView === "ACTIVE" ? "active" : ""}`}
            onClick={() => { setAppointmentView("ACTIVE"); setStatusFilter("ALL"); }}
          >
            <CalendarCheck size={13} />
            <span>
              <span className="tab-text-desktop">Active Appointments</span>
              <span className="tab-text-mobile">Active</span>
            </span>
            <span className="wellborn-tab-count">{activeAppointments.length}</span>
          </button>

          <button
            type="button"
            className={`wellborn-appointment-tab ${appointmentView === "COMPLETED" ? "active" : ""}`}
            onClick={() => { setAppointmentView("COMPLETED"); setStatusFilter("ALL"); }}
          >
            <CheckCircle2 size={13} />
            <span>
              <span className="tab-text-desktop">Completed Appointments</span>
              <span className="tab-text-mobile">Completed</span>
            </span>
            <span className="wellborn-tab-count">{completedAppointments.length}</span>
          </button>
        </div>

        {/* SEARCH & FILTER */}
        <div className="wellborn-appointments-toolbar">
          <div className="wellborn-search-wrap">
            <Search size={18} className="wellborn-search-icon" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient, age or service..."
              className="wellborn-appointment-search"
            />
          </div>

          <div className="wellborn-status-filter">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="wellborn-status-select"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              {appointmentView === "COMPLETED" && <option value="COMPLETED">Completed</option>}
              <option value="CANCELLED">Cancelled</option>
            </select>
            <ChevronDown size={16} />
          </div>
        </div>

        {/* TABLE VIEW */}
        <div className="wellborn-appointments-card">
          <div className="wellborn-table-header">
            <h2 className="wellborn-table-title">
              {appointmentView === "COMPLETED" ? "Completed Appointments" : "Appointment List"}
              <span className="wellborn-table-count">{filteredAppointments.length}</span>
            </h2>
          </div>

          {loading ? (
            <div className="wellborn-loading">
              <Clock3 size={19} className="wellborn-loading-spinner" />
              Loading appointments...
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="wellborn-empty-state">
              <div className="wellborn-empty-icon"><CalendarCheck size={27} /></div>
              <h3>{appointmentView === "COMPLETED" ? "No completed appointments" : "No appointments found"}</h3>
              <p>{appointmentView === "COMPLETED" ? "Completed appointments will appear here." : "Try changing your search or status filter."}</p>
            </div>
          ) : (
            <div className="wellborn-table-scroll">
              <table className="wellborn-appointments-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Age Category</th>
                    <th>Service</th>
                    <th>Appointment Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.map((appointment, index) => {
                    const id = getAppointmentId(appointment) ?? index;
                    const status = normalizeStatus(appointment?.status);

                    return (
                      <tr key={id}>
                        <td>
                          <div className="wellborn-patient-cell">
                            <div className="wellborn-patient-avatar"><UserRound size={18} /></div>
                            <div>
                              <div className="wellborn-patient-name">{appointment?.patientName || "Unknown Patient"}</div>
                              <div className="wellborn-patient-id">ID: #{appointment?.appointmentId ?? appointment?.id ?? "—"}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="wellborn-age-pill">
                            <UsersRound size={12} />
                            {getAgeCategory(appointment)}
                          </span>
                        </td>
                        <td>
                          <span className="wellborn-service-pill">{getServiceName(appointment)}</span>
                        </td>
                        <td>
                          <div className="wellborn-date-cell">
                            <CalendarDays size={15} />
                            <span>{formatDate(appointment?.appointmentDate)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="wellborn-date-cell">
                            <Clock3 size={15} />
                            <span>{formatTime(appointment?.appointmentTime)}</span>
                          </div>
                        </td>
                        <td>
                          {status === "COMPLETED" ? (
                            renderStatusBadge("COMPLETED")
                          ) : (
                            <div className="wellborn-status-select-wrap">
                              <select
                                value={status}
                                disabled={updatingId === id}
                                onChange={(e) => requestStatusUpdate(appointment, e.target.value)}
                                className={`wellborn-status-dropdown ${getStatusClass(status)}`}
                              >
                                <option value="PENDING">⏳ Pending</option>
                                <option value="CONFIRMED">✅ Confirmed</option>
                                <option value="CANCELLED">❌ Cancelled</option>
                              </select>
                              {updatingId === id ? (
                                <Clock3 size={13} className="wellborn-status-loading" />
                              ) : (
                                <ChevronDown size={14} className="wellborn-status-chevron" />
                              )}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="wellborn-actions">
                            <button
                              type="button"
                              className="wellborn-action-button wellborn-action-view"
                              onClick={() => setSelectedAppointment(appointment)}
                              title="View Appointment"
                              aria-label="View Appointment"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* VIEW MODAL */}
      {selectedAppointment && (
        <div className="wellborn-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedAppointment(null); }}>
          <div className="wellborn-modal" role="dialog" aria-modal="true">
            <div className="wellborn-modal-header">
              <h2 className="wellborn-modal-title">Appointment Details</h2>
              <button type="button" className="wellborn-modal-close" onClick={() => setSelectedAppointment(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="wellborn-modal-body">
              <div className="wellborn-detail-grid">
                <div className="wellborn-detail-item">
                  <div className="wellborn-detail-label"><UserRound size={12} /> Patient Name</div>
                  <div className="wellborn-detail-value">{selectedAppointment?.patientName || "—"}</div>
                </div>
                <div className="wellborn-detail-item">
                  <div className="wellborn-detail-label"><Activity size={12} /> Status</div>
                  <div className="wellborn-detail-value">{renderStatusBadge(selectedAppointment?.status)}</div>
                </div>
                <div className="wellborn-detail-item">
                  <div className="wellborn-detail-label"><Phone size={12} /> Phone</div>
                  <div className="wellborn-detail-value">{selectedAppointment?.phone || "—"}</div>
                </div>
                <div className="wellborn-detail-item">
                  <div className="wellborn-detail-label"><Mail size={12} /> Email</div>
                  <div className="wellborn-detail-value">{selectedAppointment?.email || "—"}</div>
                </div>
                <div className="wellborn-detail-item">
                  <div className="wellborn-detail-label"><UsersRound size={12} /> Age Category</div>
                  <div className="wellborn-detail-value">{getAgeCategory(selectedAppointment)}</div>
                </div>
                <div className="wellborn-detail-item">
                  <div className="wellborn-detail-label"><CalendarDays size={12} /> Appointment Date</div>
                  <div className="wellborn-detail-value">{formatDate(selectedAppointment?.appointmentDate)}</div>
                </div>
                <div className="wellborn-detail-item">
                  <div className="wellborn-detail-label"><Clock3 size={12} /> Appointment Time</div>
                  <div className="wellborn-detail-value">{formatTime(selectedAppointment?.appointmentTime)}</div>
                </div>
                <div className="wellborn-detail-item">
                  <div className="wellborn-detail-label"><Activity size={12} /> Service</div>
                  <div className="wellborn-detail-value">{getServiceName(selectedAppointment)}</div>
                </div>
                <div className="wellborn-detail-item">
                  <div className="wellborn-detail-label"><Clock3 size={12} /> Created At</div>
                  <div className="wellborn-detail-value">{formatCreatedAt(selectedAppointment?.createdAt)}</div>
                </div>
                <div className="wellborn-detail-item">
                  <div className="wellborn-detail-label"><Hash size={12} /> Appointment ID</div>
                  <div className="wellborn-detail-value">#{selectedAppointment?.appointmentId ?? selectedAppointment?.id ?? "—"}</div>
                </div>
                <div className="wellborn-detail-item full">
                  <div className="wellborn-detail-label"><FileText size={12} /> Patient Message</div>
                  <div className="wellborn-detail-value wellborn-message-value">{selectedAppointment?.message || "No message provided."}</div>
                </div>
              </div>
              <div style={{ marginTop: "20px", display: "flex", justifyContent: normalizeStatus(selectedAppointment?.status) === "COMPLETED" ? "flex-end" : "space-between", alignItems: "center" }}>
                {normalizeStatus(selectedAppointment?.status) !== "COMPLETED" && (
                  <button
                    type="button"
                    className="wellborn-modal-button wellborn-cancel-button"
                    onClick={() => {
                      const target = selectedAppointment;
                      setSelectedAppointment(null);
                      setNewDate(target?.appointmentDate || "");
                      setNewTime(target?.appointmentTime || "");
                      setRescheduleModal(target);
                    }}
                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <Calendar size={14} /> Reschedule Date / Time
                  </button>
                )}
                <button
                  type="button"
                  className="wellborn-action-button wellborn-action-delete"
                  onClick={() => { setSelectedAppointment(null); setDeleteAppointment(selectedAppointment); }}
                  style={{ width: "auto", padding: "0 18px", height: "38px", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DATE PASSED QUEUE MODAL */}
      {currentDatePassed && (
        <div className="wellborn-modal-overlay">
          <div className="wellborn-date-passed-modal" role="dialog" aria-modal="true">
            <div className="wellborn-date-passed-icon"><AlertTriangle size={29} /></div>
            <h3>Appointment Time Passed {datePassedQueue.length > 0 && `(1 of ${datePassedQueue.length + 1})`}</h3>
            <p>
              The scheduled time for <strong>{currentDatePassed?.patientName || "this patient"}</strong> has already passed.<br />
              Was the treatment completed?
            </p>
            <div className="wellborn-passed-appointment-info">
              <div className="wellborn-passed-info-box">
                <span className="wellborn-passed-info-label">Patient & ID</span>
                <span className="wellborn-passed-info-value">{currentDatePassed?.patientName || "Patient"} (#{getAppointmentId(currentDatePassed)})</span>
              </div>
              <div className="wellborn-passed-info-box">
                <span className="wellborn-passed-info-label">Service</span>
                <span className="wellborn-passed-info-value">{getServiceName(currentDatePassed)}</span>
              </div>
              <div className="wellborn-passed-info-box">
                <span className="wellborn-passed-info-label">Date</span>
                <span className="wellborn-passed-info-value">{formatDate(currentDatePassed?.appointmentDate)}</span>
              </div>
              <div className="wellborn-passed-info-box">
                <span className="wellborn-passed-info-label">Time</span>
                <span className="wellborn-passed-info-value">{formatTime(currentDatePassed?.appointmentTime)}</span>
              </div>
            </div>
            <div className="wellborn-date-passed-actions">
              <button
                type="button"
                className="wellborn-modal-button wellborn-cancel-button"
                onClick={() => handleDatePassedDecision(false)}
                disabled={updatingId !== null}
              >
                Reschedule Slot
              </button>
              <button
                type="button"
                className="wellborn-modal-button wellborn-confirm-completed-button"
                onClick={() => handleDatePassedDecision(true)}
                disabled={updatingId !== null}
              >
                {updatingId !== null ? "Updating..." : "Yes, Completed"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {rescheduleModal && (
        <div className="wellborn-modal-overlay">
          <div className="wellborn-reschedule-modal" role="dialog" aria-modal="true">
            <div className="wellborn-reschedule-icon"><Calendar size={27} /></div>
            <h3>Reschedule Appointment</h3>
            <p>
              Select a new date and time for <strong>{rescheduleModal?.patientName || "this patient"}</strong>.
            </p>
            <div className="wellborn-reschedule-form">
              <div className="wellborn-form-group">
                <label>New Appointment Date</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </div>
              <div className="wellborn-form-group">
                <label>New Appointment Time</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                />
              </div>
            </div>
            <div className="wellborn-reschedule-actions">
              <button
                type="button"
                className="wellborn-modal-button wellborn-cancel-button"
                onClick={() => setRescheduleModal(null)}
                disabled={updatingId !== null}
              >
                Cancel
              </button>
              <button
                type="button"
                className="wellborn-modal-button wellborn-confirm-status-button"
                onClick={handleRescheduleSubmit}
                disabled={updatingId !== null}
              >
                {updatingId !== null ? "Saving..." : "Save & Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUS CONFIRMATION MODAL */}
      {statusConfirmation && (
        <div className="wellborn-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setStatusConfirmation(null); }}>
          <div className="wellborn-status-confirm-modal" role="dialog">
            <div className="wellborn-status-confirm-icon">
              {statusConfirmation.newStatus === "CANCELLED" ? <XCircle size={27} /> : <CheckCircle2 size={27} />}
            </div>
            <h3>Change Appointment Status?</h3>
            <p>
              Are you sure you want to change the status for <strong>{statusConfirmation?.appointment?.patientName || "this patient"}</strong> to <strong>{getStatusLabel(statusConfirmation.newStatus)}</strong>?
            </p>
            <div className="wellborn-status-confirm-actions">
              <button type="button" className="wellborn-modal-button wellborn-cancel-button" onClick={() => setStatusConfirmation(null)}>
                Cancel
              </button>
              <button type="button" className="wellborn-modal-button wellborn-confirm-status-button" onClick={confirmStatusChange}>
                Yes, {getStatusLabel(statusConfirmation.newStatus)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteAppointment && (
        <div className="wellborn-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setDeleteAppointment(null); }}>
          <div className="wellborn-delete-modal" role="dialog">
            <div className="wellborn-delete-icon"><Trash2 size={24} /></div>
            <h3>Delete Appointment?</h3>
            <p>
              Are you sure you want to delete the appointment for <strong>{deleteAppointment?.patientName || "this patient"}</strong>?<br />
              This action cannot be undone.
            </p>
            <div className="wellborn-delete-actions">
              <button type="button" className="wellborn-modal-button wellborn-cancel-button" onClick={() => setDeleteAppointment(null)}>
                Cancel
              </button>
              <button type="button" className="wellborn-modal-button wellborn-confirm-delete-button" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS POPUP TOAST */}
      {successPopup && (
        <div className="wellborn-success-popup-wrap">
          <div className="wellborn-success-popup">
            <div className={`wellborn-success-popup-icon popup-icon-${successPopup.type}`}>
              {successPopup.type === "completed" && <CheckCircle2 size={20} />}
              {successPopup.type === "confirmed" && <CheckCircle2 size={20} />}
              {successPopup.type === "pending" && <Clock3 size={20} />}
              {successPopup.type === "cancelled" && <XCircle size={20} />}
              {successPopup.type === "delete" && <Trash2 size={20} />}
            </div>
            <div>
              <div className="wellborn-success-popup-title">{successPopup.title}</div>
              <p className="wellborn-success-popup-message">{successPopup.message}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}