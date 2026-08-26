import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  API,
  getData,
  putData,
  deleteData,
} from "../services/api";

import {
  Star,
  Trash2,
  MessageSquareText,
  ClipboardCheck,
  X,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  ChevronDown,
  Mail,
  Search,
  Users,
  Clock3,
  BadgeCheck,
  XCircle,
  Sparkles,
  Filter,
} from "lucide-react";

/* =========================================================
   WELLBORN PHYSIO
   ADMIN REVIEWS
   ========================================================= */

export default function AdminReviewsFull() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [statusOpenId, setStatusOpenId] = useState(null);

  const filterRef = useRef(null);

  /* =======================================================
     DELETE POPUP
     ======================================================= */

  const [deletePopup, setDeletePopup] = useState({
    open: false,
    id: null,
    review: null,
  });

  /* =======================================================
     STATUS POPUP
     ======================================================= */

  const [statusPopup, setStatusPopup] = useState({
    open: false,
    review: null,
    newStatus: "",
  });

  /* =======================================================
     SUCCESS
     ======================================================= */

  const [successPopup, setSuccessPopup] = useState({
    open: false,
    message: "",
  });

  /* =======================================================
     ERROR
     ======================================================= */

  const [errorPopup, setErrorPopup] = useState({
    open: false,
    message: "",
  });

  /* =======================================================
     DARK MODE
     ======================================================= */

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof document === "undefined") {
      return false;
    }

    return document.documentElement.classList.contains(
      "wellborn-admin-dark"
    );
  });

  /* =======================================================
     THEME LISTENER
     ======================================================= */

  useEffect(() => {
    const root = document.documentElement;

    const updateTheme = () => {
      setDarkMode(
        root.classList.contains("wellborn-admin-dark")
      );
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  /* =======================================================
     OUTSIDE CLICK
     ======================================================= */

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target)
      ) {
        setFilterOpen(false);
      }

      const statusDropdown = event.target.closest(
        "[data-status-dropdown]"
      );

      if (!statusDropdown) {
        setStatusOpenId(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  /* =======================================================
     LOAD REVIEWS
     ======================================================= */

  const load = async () => {
    try {
      setLoading(true);

      const response = await getData(
        API.REVIEW_GET_ALL
      );

      const data = Array.isArray(response)
        ? response
        : [];

      setRows(data);
    } catch (error) {
      console.error(
        "Reviews loading error:",
        error
      );

      setRows([]);

      setErrorPopup({
        open: true,
        message:
          error?.message ||
          "Failed to load reviews.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  /* =======================================================
     STATISTICS
     ======================================================= */

  const statistics = useMemo(() => {
    const total = rows.length;

    const approved = rows.filter(
      (review) =>
        (review.status || "PENDING") ===
        "APPROVED"
    ).length;

    const pending = rows.filter(
      (review) =>
        (review.status || "PENDING") ===
        "PENDING"
    ).length;

    const rejected = rows.filter(
      (review) =>
        (review.status || "PENDING") ===
        "REJECTED"
    ).length;

    const ratings = rows
      .map((review) => Number(review.rating))
      .filter(
        (rating) =>
          !Number.isNaN(rating) &&
          rating > 0
      );

    const average =
      ratings.length > 0
        ? (
            ratings.reduce(
              (sum, rating) =>
                sum + rating,
              0
            ) / ratings.length
          ).toFixed(1)
        : "0.0";

    return {
      total,
      approved,
      pending,
      rejected,
      average,
    };
  }, [rows]);

  /* =======================================================
     FILTERED REVIEWS
     ======================================================= */

  const filteredRows = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return rows.filter((review) => {
      const status =
        review.status || "PENDING";

      if (
        filterStatus !== "ALL" &&
        status !== filterStatus
      ) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return (
        String(
          review.patientName || ""
        )
          .toLowerCase()
          .includes(keyword) ||
        String(review.email || "")
          .toLowerCase()
          .includes(keyword) ||
        String(
          review.reviewText || ""
        )
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [
    rows,
    filterStatus,
    search,
  ]);

  /* =======================================================
     FILTER OPTIONS
     ======================================================= */

  const filterOptions = [
    {
      value: "ALL",
      label: "All Reviews",
      icon: MessageSquareText,
      color: "cyan",
      count: statistics.total,
    },
    {
      value: "PENDING",
      label: "Pending",
      icon: Clock3,
      color: "amber",
      count: statistics.pending,
    },
    {
      value: "APPROVED",
      label: "Approved",
      icon: BadgeCheck,
      color: "emerald",
      count: statistics.approved,
    },
    {
      value: "REJECTED",
      label: "Rejected",
      icon: XCircle,
      color: "red",
      count: statistics.rejected,
    },
  ];

  const selectedFilter =
    filterOptions.find(
      (item) =>
        item.value === filterStatus
    ) || filterOptions[0];

  /* =======================================================
     STATUS CHANGE
     ======================================================= */

  const handleStatusChange = (
    review,
    newStatus
  ) => {
    setStatusOpenId(null);

    const currentStatus =
      review?.status || "PENDING";

    if (
      !review?.reviewId ||
      currentStatus === newStatus
    ) {
      return;
    }

    setStatusPopup({
      open: true,
      review,
      newStatus,
    });
  };

  /* =======================================================
     CONFIRM STATUS CHANGE
     ======================================================= */

  const confirmStatusChange = async () => {
    const {
      review,
      newStatus,
    } = statusPopup;

    if (!review?.reviewId) {
      return;
    }

    const id = review.reviewId;

    setStatusPopup({
      open: false,
      review: null,
      newStatus: "",
    });

    setUpdatingId(id);

    try {
      await putData(
        `${API.REVIEW_UPDATE}/${id}?status=${encodeURIComponent(
          newStatus
        )}`
      );

      setRows((previous) =>
        previous.map((item) =>
          item.reviewId === id
            ? {
                ...item,
                status: newStatus,
              }
            : item
        )
      );

      setSuccessPopup({
        open: true,
        message: `Status updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      setErrorPopup({
        open: true,
        message:
          error?.message ||
          "Failed to update status.",
      });
    } finally {
      setUpdatingId(null);
    }
  };

  /* =======================================================
     DELETE
     ======================================================= */

  const handleDelete = (review) => {
    if (!review?.reviewId) {
      return;
    }

    setDeletePopup({
      open: true,
      id: review.reviewId,
      review,
    });
  };

  /* =======================================================
     CONFIRM DELETE
     ======================================================= */

  const confirmDelete = async () => {
    const id = deletePopup.id;

    setDeletePopup({
      open: false,
      id: null,
      review: null,
    });

    if (!id) {
      return;
    }

    setDeletingId(id);

    try {
      await deleteData(
        `${API.REVIEW_DELETE}/${id}`
      );

      setRows((previous) =>
        previous.filter(
          (item) =>
            item.reviewId !== id
        )
      );

      if (expandedId === id) {
        setExpandedId(null);
      }

      setSuccessPopup({
        open: true,
        message:
          "Review deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      setErrorPopup({
        open: true,
        message:
          error?.message ||
          "Failed to delete review.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  /* =======================================================
     CLEAR SEARCH
     ======================================================= */

  const clearSearch = () => {
    setSearch("");
  };

  /* =======================================================
     MAIN
     ======================================================= */

  return (
    <>
      <main
        className={`
          relative
          z-10
          mx-auto
          w-full
          max-w-[1500px]
          min-w-0

          px-2.5
          pb-6
          pt-3

          min-[360px]:px-3
          min-[360px]:pt-4

          min-[380px]:px-3.5

          sm:px-5
          sm:pt-5

          lg:px-8
          lg:pt-6

          transition-colors
          duration-300

          ${
            darkMode
              ? "bg-[#07131a] text-white"
              : "bg-[#f5f8fa] text-slate-900"
          }
        `}
      >
        <div
          className="
            mx-auto
            w-full
            max-w-[1240px]
            min-w-0
          "
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className={`
              mb-3
              overflow-hidden
              rounded-2xl
              border
              p-3

              min-[360px]:p-3.5
              min-[380px]:p-4

              sm:mb-4
              sm:rounded-3xl
              sm:p-5

              lg:p-6

              ${
                darkMode
                  ? "border-slate-700/60 bg-slate-900/80"
                  : "border-slate-200/70 bg-white"
              }

              shadow-sm
            `}
          >
            <div
              className="
                flex
                min-w-0
                items-center
                justify-between
              "
            >
              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-2.5
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
                    rounded-xl

                    min-[360px]:h-11
                    min-[360px]:w-11

                    sm:h-12
                    sm:w-12
                    sm:rounded-2xl

                    ${
                      darkMode
                        ? "bg-cyan-400/10 text-cyan-300"
                        : "bg-cyan-50 text-cyan-600"
                    }
                  `}
                >
                  <MessageSquareText
                    size={19}
                  />
                </div>

                <div className="min-w-0">
                  <div
                    className="
                      flex
                      items-center
                      gap-1.5
                    "
                  >
                    <h1
                      className={`
                        truncate
                        text-[17px]
                        font-black
                        tracking-tight

                        min-[360px]:text-lg
                        sm:text-xl
                        lg:text-2xl

                        ${
                          darkMode
                            ? "text-white"
                            : "text-slate-900"
                        }
                      `}
                    >
                      Reviews
                    </h1>

                    <Sparkles
                      size={13}
                      className="
                        shrink-0
                        text-cyan-500
                      "
                    />
                  </div>

                  <p
                    className={`
                      mt-0.5
                      truncate
                      text-[8px]

                      min-[360px]:text-[9px]
                      sm:text-[10px]

                      ${
                        darkMode
                          ? "text-slate-400"
                          : "text-slate-500"
                      }
                    `}
                  >
                    Manage and monitor patient
                    feedback
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              STATISTICS
          ================================================= */}

          <div
            className="
              mb-3
              grid
              grid-cols-2
              gap-2

              min-[360px]:gap-2.5

              sm:grid-cols-4
              sm:gap-3

              lg:grid-cols-5
            "
          >
            <StatCard
              icon={Users}
              title="Total"
              value={statistics.total}
              darkMode={darkMode}
              type="total"
            />

            <StatCard
              icon={BadgeCheck}
              title="Approved"
              value={statistics.approved}
              darkMode={darkMode}
              type="approved"
            />

            <StatCard
              icon={Clock3}
              title="Pending"
              value={statistics.pending}
              darkMode={darkMode}
              type="pending"
            />

            <StatCard
              icon={XCircle}
              title="Rejected"
              value={statistics.rejected}
              darkMode={darkMode}
              type="rejected"
            />

            <div
              className="
                col-span-2
                sm:col-span-4
                lg:col-span-1
              "
            >
              <StatCard
                icon={Star}
                title="Avg Rating"
                value={statistics.average}
                darkMode={darkMode}
                type="rating"
                star
              />
            </div>
          </div>

          {/* =================================================
              SEARCH + FILTER
          ================================================= */}

          <div
            className={`
              mb-3
              rounded-2xl
              border
              p-2.5

              min-[360px]:p-3

              sm:mb-4
              sm:rounded-3xl
              sm:p-4

              ${
                darkMode
                  ? "border-slate-700/60 bg-slate-900/70"
                  : "border-slate-200/70 bg-white"
              }

              shadow-sm
            `}
          >
            <div
              className="
                flex
                min-w-0
                flex-col
                gap-2

                sm:flex-row
              "
            >
              {/* SEARCH */}

              <div
                className="
                  relative
                  min-w-0
                  flex-1
                "
              >
                <Search
                  size={15}
                  className={`
                    pointer-events-none
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2

                    ${
                      darkMode
                        ? "text-slate-500"
                        : "text-slate-400"
                    }
                  `}
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search reviews..."
                  className={`
                    h-10
                    w-full
                    min-w-0
                    rounded-xl
                    border
                    pl-9
                    pr-9
                    text-[10px]
                    outline-none

                    min-[360px]:text-[11px]

                    sm:h-11
                    sm:text-sm

                    ${
                      darkMode
                        ? "border-slate-700 bg-slate-800/70 text-white placeholder:text-slate-500 focus:border-cyan-500"
                        : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500 focus:bg-white"
                    }
                  `}
                />

                {search && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="
                      absolute
                      right-2.5
                      top-1/2
                      -translate-y-1/2
                      rounded-md
                      p-1
                    "
                  >
                    <X
                      size={13}
                      className={
                        darkMode
                          ? "text-slate-400"
                          : "text-slate-500"
                      }
                    />
                  </button>
                )}
              </div>

              {/* FILTER */}

              <div
                ref={filterRef}
                className="
                  relative
                  w-full
                  sm:w-[190px]
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    setFilterOpen(
                      (previous) =>
                        !previous
                    )
                  }
                  className={`
                    flex
                    h-10
                    w-full
                    items-center
                    gap-2
                    rounded-xl
                    border
                    px-3

                    min-[360px]:h-11

                    ${
                      filterOpen
                        ? darkMode
                          ? "border-cyan-500 bg-slate-800"
                          : "border-cyan-400 bg-white"
                        : darkMode
                        ? "border-slate-700 bg-slate-800/70"
                        : "border-slate-200 bg-slate-50"
                    }
                  `}
                >
                  <div
                    className={`
                      flex
                      h-6
                      w-6
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg

                      ${
                        darkMode
                          ? "bg-cyan-500/10 text-cyan-300"
                          : "bg-cyan-50 text-cyan-600"
                      }
                    `}
                  >
                    <Filter size={12} />
                  </div>

                  <span
                    className={`
                      min-w-0
                      flex-1
                      truncate
                      text-left
                      text-[10px]
                      font-black

                      sm:text-xs

                      ${
                        darkMode
                          ? "text-white"
                          : "text-slate-800"
                      }
                    `}
                  >
                    {selectedFilter.label}
                  </span>

                  <span
                    className={`
                      rounded-md
                      px-1.5
                      py-0.5
                      text-[8px]
                      font-black

                      ${
                        darkMode
                          ? "bg-slate-700 text-slate-300"
                          : "bg-slate-100 text-slate-500"
                      }
                    `}
                  >
                    {selectedFilter.count}
                  </span>

                  <ChevronDown
                    size={14}
                    className={`
                      shrink-0
                      transition-transform

                      ${
                        filterOpen
                          ? "rotate-180"
                          : ""
                      }

                      ${
                        darkMode
                          ? "text-slate-400"
                          : "text-slate-500"
                      }
                    `}
                  />
                </button>

                {filterOpen && (
                  <div
                    className={`
                      absolute
                      left-0
                      right-0
                      top-[calc(100%+7px)]
                      z-[3000]

                      overflow-hidden
                      rounded-2xl
                      border
                      p-1.5
                      shadow-2xl

                      ${
                        darkMode
                          ? "border-slate-700 bg-slate-900"
                          : "border-slate-200 bg-white"
                      }

                      animate-[wellbornDropdown_.18s_ease-out]
                    `}
                  >
                    {filterOptions.map(
                      (option) => {
                        const Icon =
                          option.icon;

                        const selected =
                          filterStatus ===
                          option.value;

                        return (
                          <button
                            key={
                              option.value
                            }
                            type="button"
                            onClick={() => {
                              setFilterStatus(
                                option.value
                              );
                              setFilterOpen(
                                false
                              );
                            }}
                            className={`
                              flex
                              w-full
                              items-center
                              gap-2.5
                              rounded-xl
                              px-2.5
                              py-2.5

                              ${
                                selected
                                  ? darkMode
                                    ? "bg-cyan-500/10"
                                    : "bg-cyan-50"
                                  : darkMode
                                  ? "hover:bg-slate-800"
                                  : "hover:bg-slate-50"
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
                                rounded-xl

                                ${
                                  option.color ===
                                  "cyan"
                                    ? darkMode
                                      ? "bg-cyan-500/10 text-cyan-300"
                                      : "bg-cyan-50 text-cyan-600"
                                    : option.color ===
                                      "amber"
                                    ? darkMode
                                      ? "bg-amber-500/10 text-amber-300"
                                      : "bg-amber-50 text-amber-600"
                                    : option.color ===
                                      "emerald"
                                    ? darkMode
                                      ? "bg-emerald-500/10 text-emerald-300"
                                      : "bg-emerald-50 text-emerald-600"
                                    : darkMode
                                    ? "bg-red-500/10 text-red-300"
                                    : "bg-red-50 text-red-600"
                                }
                              `}
                            >
                              <Icon
                                size={14}
                              />
                            </div>

                            <div className="min-w-0 flex-1 text-left">
                              <p
                                className={`
                                  truncate
                                  text-[10px]
                                  font-black

                                  sm:text-xs

                                  ${
                                    darkMode
                                      ? "text-white"
                                      : "text-slate-800"
                                  }
                                `}
                              >
                                {
                                  option.label
                                }
                              </p>

                              <p className="mt-0.5 text-[8px] text-slate-500">
                                {
                                  option.count
                                }{" "}
                                review
                                {option.count !==
                                1
                                  ? "s"
                                  : ""}
                              </p>
                            </div>

                            {selected && (
                              <CheckCircle2
                                size={15}
                                className="text-cyan-500"
                              />
                            )}
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </div>

            <div
              className="
                mt-2
                px-1
                text-[8px]
                text-slate-500

                sm:text-[10px]
              "
            >
              Showing{" "}
              {filteredRows.length} of{" "}
              {rows.length} reviews
            </div>
          </div>

          {/* =================================================
              REVIEWS
          ================================================= */}

          {loading ? (
            <LoadingState
              darkMode={darkMode}
            />
          ) : filteredRows.length ===
            0 ? (
            <EmptyState
              darkMode={darkMode}
              search={search}
            />
          ) : (
            <div
              className="
                space-y-2.5
                sm:space-y-3
              "
            >
              {filteredRows.map(
                (review) => (
                  <ReviewCard
                    key={
                      review.reviewId
                    }
                    review={review}
                    darkMode={darkMode}
                    isExpanded={
                      expandedId ===
                      review.reviewId
                    }
                    onToggle={() =>
                      setExpandedId(
                        expandedId ===
                          review.reviewId
                          ? null
                          : review.reviewId
                      )
                    }
                    onStatus={
                      handleStatusChange
                    }
                    onDelete={
                      handleDelete
                    }
                    isUpdating={
                      updatingId ===
                      review.reviewId
                    }
                    isDeleting={
                      deletingId ===
                      review.reviewId
                    }
                    statusOpenId={
                      statusOpenId
                    }
                    setStatusOpenId={
                      setStatusOpenId
                    }
                  />
                )
              )}
            </div>
          )}
        </div>
      </main>

      {/* =====================================================
          STATUS MODAL
      ===================================================== */}

      {statusPopup.open && (
        <ConfirmModal
          darkMode={darkMode}
          title="Update Review Status?"
          message={`Change status to ${statusPopup.newStatus}?`}
          onConfirm={
            confirmStatusChange
          }
          onCancel={() =>
            setStatusPopup({
              open: false,
              review: null,
              newStatus: "",
            })
          }
          confirmText="Update"
          isDanger={false}
        />
      )}

      {/* =====================================================
          DELETE MODAL
      ===================================================== */}

      {deletePopup.open && (
        <ConfirmModal
          darkMode={darkMode}
          title="Delete Review?"
          message="This review will be permanently removed."
          onConfirm={confirmDelete}
          onCancel={() =>
            setDeletePopup({
              open: false,
              id: null,
              review: null,
            })
          }
          confirmText="Delete"
          isDanger
        />
      )}

      {/* =====================================================
          SUCCESS
      ===================================================== */}

      {successPopup.open && (
        <CenterMessage
          darkMode={darkMode}
          message={
            successPopup.message
          }
          type="success"
          onClose={() =>
            setSuccessPopup({
              open: false,
              message: "",
            })
          }
        />
      )}

      {/* =====================================================
          ERROR
      ===================================================== */}

      {errorPopup.open && (
        <CenterMessage
          darkMode={darkMode}
          message={
            errorPopup.message
          }
          type="error"
          onClose={() =>
            setErrorPopup({
              open: false,
              message: "",
            })
          }
        />
      )}
    </>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  icon: Icon,
  title,
  value,
  darkMode,
  type,
  star,
}) {
  const iconStyle = {
    total: darkMode
      ? "bg-cyan-500/10 text-cyan-300"
      : "bg-cyan-50 text-cyan-600",

    approved: darkMode
      ? "bg-emerald-500/10 text-emerald-300"
      : "bg-emerald-50 text-emerald-600",

    pending: darkMode
      ? "bg-amber-500/10 text-amber-300"
      : "bg-amber-50 text-amber-600",

    rejected: darkMode
      ? "bg-red-500/10 text-red-300"
      : "bg-red-50 text-red-600",

    rating: darkMode
      ? "bg-violet-500/10 text-violet-300"
      : "bg-violet-50 text-violet-600",
  };

  return (
    <div
      className={`
        min-w-0
        overflow-hidden
        rounded-2xl
        border
        p-2.5

        min-[360px]:p-3
        sm:p-4

        ${
          darkMode
            ? "border-slate-700/60 bg-slate-900/70"
            : "border-slate-200/70 bg-white"
        }

        shadow-sm
      `}
    >
      <div className="flex min-w-0 items-center gap-2">
        <div
          className={`
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-xl

            min-[360px]:h-9
            min-[360px]:w-9

            sm:h-10
            sm:w-10

            ${iconStyle[type]}
          `}
        >
          <Icon
            size={15}
            fill={
              star && type === "rating"
                ? "currentColor"
                : "none"
            }
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-[7px] font-bold uppercase tracking-wider text-slate-500 sm:text-[9px]">
            {title}
          </p>

          <p
            className={`
              mt-0.5
              truncate
              text-base
              font-black

              min-[360px]:text-lg
              sm:text-xl

              ${
                darkMode
                  ? "text-white"
                  : "text-slate-900"
              }
            `}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REVIEW CARD
========================================================= */

function ReviewCard({
  review,
  darkMode,
  isExpanded,
  onToggle,
  onStatus,
  onDelete,
  isUpdating,
  isDeleting,
  statusOpenId,
  setStatusOpenId,
}) {
  const status =
    review.status || "PENDING";

  const rating =
    Number(review.rating) || 0;

  const statusOptions = [
    {
      value: "PENDING",
      label: "Pending",
      icon: Clock3,
      color: "amber",
    },
    {
      value: "APPROVED",
      label: "Approved",
      icon: BadgeCheck,
      color: "emerald",
    },
    {
      value: "REJECTED",
      label: "Rejected",
      icon: XCircle,
      color: "red",
    },
  ];

  const selectedStatus =
    statusOptions.find(
      (item) =>
        item.value === status
    ) || statusOptions[0];

  const SelectedStatusIcon =
    selectedStatus.icon;

  return (
    <article
      className={`
        relative
        w-full
        min-w-0
        overflow-visible
        rounded-2xl
        border
        transition-all
        duration-300

        sm:rounded-3xl

        ${
          darkMode
            ? "border-slate-700/60 bg-slate-900/75"
            : "border-slate-200/70 bg-white"
        }

        ${
          isExpanded
            ? darkMode
              ? "shadow-xl shadow-black/20"
              : "shadow-lg shadow-slate-200/70"
            : ""
        }
      `}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <button
        type="button"
        onClick={onToggle}
        className="
          block
          w-full
          min-w-0
          text-left
        "
      >
        <div
          className={`
            flex
            min-w-0
            items-center
            gap-2.5
            p-3

            min-[360px]:p-3.5
            min-[380px]:p-4
            sm:p-5

            ${
              isExpanded
                ? darkMode
                  ? "border-b border-slate-700/40"
                  : "border-b border-slate-100"
                : ""
            }
          `}
        >
          {/* AVATAR */}

          <div
            className={`
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              text-xs
              font-black

              min-[360px]:h-10
              min-[360px]:w-10

              sm:h-11
              sm:w-11

              ${
                darkMode
                  ? "bg-cyan-500/10 text-cyan-300"
                  : "bg-cyan-50 text-cyan-600"
              }
            `}
          >
            {String(
              review.patientName ||
                "A"
            )
              .charAt(0)
              .toUpperCase()}
          </div>

          {/* NAME + TEXT */}

          <div className="min-w-0 flex-1">
            <div
              className="
                flex
                min-w-0
                items-center
                gap-1.5
              "
            >
              <h3
                className={`
                  min-w-0
                  max-w-full
                  truncate
                  text-[11px]
                  font-black

                  min-[360px]:text-xs
                  sm:text-sm

                  ${
                    darkMode
                      ? "text-white"
                      : "text-slate-900"
                  }
                `}
              >
                {review.patientName ||
                  "Anonymous"}
              </h3>

              <div
                className="
                  ml-auto
                  flex
                  shrink-0
                  items-center
                  gap-0.5
                "
              >
                {Array.from({
                  length: 5,
                }).map(
                  (_, index) => (
                    <Star
                      key={index}
                      size={9}
                      fill={
                        index < rating
                          ? "currentColor"
                          : "none"
                      }
                      className={
                        index < rating
                          ? "text-amber-400"
                          : darkMode
                          ? "text-slate-700"
                          : "text-slate-300"
                      }
                    />
                  )
                )}
              </div>
            </div>

            {!isExpanded && (
              <p
                className={`
                  mt-1
                  truncate
                  text-[8px]
                  leading-relaxed

                  min-[360px]:text-[9px]
                  sm:text-xs

                  ${
                    darkMode
                      ? "text-slate-400"
                      : "text-slate-500"
                  }
                `}
              >
                {review.reviewText ||
                  "No review text"}
              </p>
            )}
          </div>

          {/* STATUS */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-1.5
            "
          >
            <StatusBadge
              status={status}
              darkMode={darkMode}
            />

            <ChevronDown
              size={15}
              className={`
                transition-transform
                duration-300

                ${
                  isExpanded
                    ? "rotate-180"
                    : ""
                }

                ${
                  darkMode
                    ? "text-slate-500"
                    : "text-slate-400"
                }
              `}
            />
          </div>
        </div>
      </button>

      {/* =================================================
          DETAILS
      ================================================= */}

      {isExpanded && (
        <div
          className="
            space-y-2.5
            p-3

            min-[360px]:space-y-3
            min-[360px]:p-3.5
            min-[380px]:p-4
            sm:p-5
          "
        >
          {/* PATIENT */}

          <DetailBox
            title="PATIENT NAME"
            darkMode={darkMode}
            icon={Users}
          >
            <p
              className={`
                break-words
                text-[10px]
                font-bold

                min-[360px]:text-[11px]
                sm:text-sm

                ${
                  darkMode
                    ? "text-white"
                    : "text-slate-800"
                }
              `}
            >
              {review.patientName ||
                "Anonymous"}
            </p>
          </DetailBox>

          {/* EMAIL */}

          {review.email && (
            <DetailBox
              title="EMAIL"
              darkMode={darkMode}
              icon={Mail}
              accent="cyan"
            >
              <p
                className={`
                  break-all
                  text-[10px]
                  font-semibold

                  min-[360px]:text-[11px]
                  sm:text-sm

                  ${
                    darkMode
                      ? "text-cyan-200"
                      : "text-cyan-700"
                  }
                `}
              >
                {review.email}
              </p>
            </DetailBox>
          )}

          {/* RATING */}

          <DetailBox
            title="RATING"
            darkMode={darkMode}
            icon={Star}
            accent="amber"
          >
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({
                  length: 5,
                }).map(
                  (_, index) => (
                    <Star
                      key={index}
                      size={15}
                      fill={
                        index < rating
                          ? "currentColor"
                          : "none"
                      }
                      className={
                        index < rating
                          ? "text-amber-400"
                          : darkMode
                          ? "text-slate-700"
                          : "text-slate-300"
                      }
                    />
                  )
                )}
              </div>

              <span
                className={`
                  text-[10px]
                  font-black

                  min-[360px]:text-[11px]
                  sm:text-sm

                  ${
                    darkMode
                      ? "text-slate-300"
                      : "text-slate-600"
                  }
                `}
              >
                {rating}/5
              </span>
            </div>
          </DetailBox>

          {/* REVIEW */}

          <DetailBox
            title="REVIEW"
            darkMode={darkMode}
            icon={MessageSquareText}
          >
            <p
              className={`
                break-words
                whitespace-pre-wrap
                text-[9px]
                leading-[1.6]

                min-[360px]:text-[10px]
                sm:text-sm

                ${
                  darkMode
                    ? "text-slate-300"
                    : "text-slate-700"
                }
              `}
            >
              {review.reviewText ||
                "No review text"}
            </p>
          </DetailBox>

          {/* STATUS */}

          <DetailBox
            title="STATUS"
            darkMode={darkMode}
            icon={ClipboardCheck}
          >
            <div
              className="
                relative
                w-full
              "
              data-status-dropdown
            >
              <button
                type="button"
                disabled={
                  isUpdating ||
                  isDeleting
                }
                onClick={(event) => {
                  event.stopPropagation();

                  setStatusOpenId(
                    statusOpenId ===
                      review.reviewId
                      ? null
                      : review.reviewId
                  );
                }}
                className={`
                  flex
                  h-10
                  w-full
                  items-center
                  gap-2
                  rounded-xl
                  border
                  px-2.5
                  shadow-sm

                  ${
                    status === "APPROVED"
                      ? darkMode
                        ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                        : "border-emerald-300 bg-emerald-100 text-emerald-800"
                      : status ===
                        "REJECTED"
                      ? darkMode
                        ? "border-red-500/40 bg-red-500/15 text-red-300"
                        : "border-red-300 bg-red-100 text-red-800"
                      : darkMode
                      ? "border-amber-500/40 bg-amber-500/15 text-amber-300"
                      : "border-amber-300 bg-amber-100 text-amber-800"
                  }
                `}
              >
                <div
                  className={`
                    flex
                    h-6
                    w-6
                    shrink-0
                    items-center
                    justify-center
                    rounded-lg

                    ${
                      selectedStatus.color ===
                      "amber"
                        ? darkMode
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-amber-200/70 text-amber-800"
                        : selectedStatus.color ===
                          "emerald"
                        ? darkMode
                          ? "bg-emerald-500/20 text-emerald-300"
                          : "bg-emerald-200/70 text-emerald-800"
                        : darkMode
                        ? "bg-red-500/20 text-red-300"
                        : "bg-red-200/70 text-red-800"
                    }
                  `}
                >
                  <SelectedStatusIcon
                    size={12}
                  />
                </div>

                <span
                  className="
                    flex-1
                    text-left
                    text-[10px]
                    font-black
                    uppercase

                    sm:text-xs
                  "
                >
                  {
                    selectedStatus.label
                  }
                </span>

                <ChevronDown
                  size={14}
                  className={`
                    transition-transform

                    ${
                      statusOpenId ===
                      review.reviewId
                        ? "rotate-180"
                        : ""
                    }
                  `}
                />
              </button>

              {/* =================================================
                  STATUS DROPDOWN
                  OPENS ABOVE
              ================================================= */}

              {statusOpenId ===
                review.reviewId && (
                <div
                  className={`
                    absolute
                    left-0
                    right-0
                    bottom-[calc(100%+6px)]
                    z-[99999]

                    overflow-hidden
                    rounded-2xl
                    border
                    p-1.5
                    shadow-2xl

                    ${
                      darkMode
                        ? "border-slate-700 bg-slate-900"
                        : "border-slate-200 bg-white"
                    }

                    animate-[wellbornDropdown_.18s_ease-out]
                  `}
                >
                  {statusOptions.map(
                    (option) => (
                      <StatusOption
                        key={
                          option.value
                        }
                        option={option}
                        selected={
                          status ===
                          option.value
                        }
                        darkMode={
                          darkMode
                        }
                        onClick={(event) => {
                          event.stopPropagation();

                          onStatus(
                            review,
                            option.value
                          );
                        }}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          </DetailBox>

          {/* DELETE */}

          <DetailBox
            title="ACTION"
            darkMode={darkMode}
            icon={Trash2}
            accent="red"
          >
            <button
              type="button"
              onClick={() =>
                onDelete(review)
              }
              disabled={
                isUpdating ||
                isDeleting
              }
              className={`
                flex
                h-9
                w-full
                items-center
                justify-center
                gap-1.5
                rounded-xl
                border
                text-[9px]
                font-black

                min-[360px]:h-10
                min-[360px]:text-[10px]

                sm:text-xs

                ${
                  darkMode
                    ? "border-red-500/20 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                    : "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                }
              `}
            >
              {isDeleting ? (
                <Loader2
                  size={14}
                  className="animate-spin"
                />
              ) : (
                <>
                  <Trash2 size={13} />
                  Delete Review
                </>
              )}
            </button>
          </DetailBox>
        </div>
      )}
    </article>
  );
}

/* =========================================================
   STATUS OPTION
========================================================= */

function StatusOption({
  option,
  selected,
  darkMode,
  onClick,
}) {
  const Icon = option.icon;

  const colorClass =
    option.value === "APPROVED"
      ? darkMode
        ? "text-emerald-300 hover:bg-emerald-500/20"
        : "text-emerald-800 hover:bg-emerald-50"
      : option.value === "REJECTED"
      ? darkMode
        ? "text-red-300 hover:bg-red-500/20"
        : "text-red-800 hover:bg-red-50"
      : darkMode
      ? "text-amber-300 hover:bg-amber-500/20"
      : "text-amber-800 hover:bg-amber-50";

  const iconClass =
    option.value === "APPROVED"
      ? darkMode
        ? "bg-emerald-500/10 text-emerald-300"
        : "bg-emerald-100 text-emerald-800"
      : option.value === "REJECTED"
      ? darkMode
        ? "bg-red-500/10 text-red-300"
        : "bg-red-100 text-red-800"
      : darkMode
      ? "bg-amber-500/10 text-amber-300"
      : "bg-amber-100 text-amber-800";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex
        w-full
        items-center
        gap-2.5
        rounded-xl
        px-2.5
        py-2.5
        transition-all

        ${colorClass}

        ${
          selected
            ? darkMode
              ? "bg-slate-800 font-black"
              : "bg-slate-100 font-black"
            : ""
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
          rounded-xl

          ${iconClass}
        `}
      >
        <Icon size={14} />
      </div>

      <span
        className="
          flex-1
          text-left
          text-[10px]
          uppercase

          sm:text-xs
        "
      >
        {option.label}
      </span>

      {selected && (
        <CheckCircle2
          size={15}
          className="text-current"
        />
      )}
    </button>
  );
}

/* =========================================================
   DETAIL BOX
========================================================= */

function DetailBox({
  title,
  children,
  darkMode,
  icon: Icon,
  accent,
}) {
  const accentClasses =
    accent === "cyan"
      ? darkMode
        ? "text-cyan-400"
        : "text-cyan-600"
      : accent === "amber"
      ? darkMode
        ? "text-amber-400"
        : "text-amber-600"
      : accent === "red"
      ? darkMode
        ? "text-red-400"
        : "text-red-600"
      : darkMode
      ? "text-slate-400"
      : "text-slate-500";

  return (
    <div
      className={`
        min-w-0
        overflow-visible
        rounded-xl
        border
        p-2.5

        min-[360px]:rounded-2xl
        min-[360px]:p-3

        sm:p-4

        ${
          darkMode
            ? "border-slate-700/50 bg-slate-800/35"
            : "border-slate-100 bg-slate-50/70"
        }
      `}
    >
      <div
        className="
          mb-1.5
          flex
          items-center
          gap-1.5
        "
      >
        <Icon
          size={11}
          className={accentClasses}
        />

        <p
          className="
            text-[7px]
            font-black
            uppercase
            tracking-[0.12em]

            min-[360px]:text-[8px]
            sm:text-[9px]

            text-slate-500
          "
        >
          {title}
        </p>
      </div>

      <div className="min-w-0">
        {children}
      </div>
    </div>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
  darkMode,
}) {
  const normalized =
    status || "PENDING";

  const styles = {
    APPROVED: darkMode
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
      : "border-emerald-200 bg-emerald-50 text-emerald-700",

    REJECTED: darkMode
      ? "border-red-500/20 bg-red-500/10 text-red-300"
      : "border-red-200 bg-red-50 text-red-700",

    PENDING: darkMode
      ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
      : "border-amber-200 bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`
        max-w-[70px]
        truncate
        rounded-lg
        border
        px-1.5
        py-1
        text-[6px]
        font-black
        uppercase
        tracking-wide

        min-[360px]:max-w-[80px]
        min-[360px]:text-[7px]

        sm:px-2
        sm:text-[8px]

        ${
          styles[normalized] ||
          styles.PENDING
        }
      `}
    >
      {normalized}
    </span>
  );
}

/* =========================================================
   CONFIRM MODAL
========================================================= */

function ConfirmModal({
  darkMode,
  title,
  message,
  isDanger,
  onConfirm,
  onCancel,
  confirmText,
}) {
  return (
    <div
      className="
        fixed
        inset-0
        z-[9000]
        flex
        items-center
        justify-center
        p-3
        sm:p-4
      "
    >
      <div
        className="
          absolute
          inset-0
          bg-black/60
          backdrop-blur-sm
        "
        onClick={onCancel}
      />

      <div
        className={`
          relative
          w-full
          max-w-[330px]
          overflow-hidden
          rounded-3xl
          border
          p-4
          shadow-2xl

          min-[360px]:p-5

          sm:max-w-sm
          sm:p-6

          ${
            darkMode
              ? "border-slate-700 bg-slate-900"
              : "border-slate-200 bg-white"
          }
        `}
      >
        <button
          type="button"
          onClick={onCancel}
          className={`
            absolute
            right-3
            top-3
            rounded-lg
            p-1.5

            ${
              darkMode
                ? "text-slate-400 hover:bg-slate-800"
                : "text-slate-500 hover:bg-slate-100"
            }
          `}
        >
          <X size={16} />
        </button>

        <div
          className={`
            mb-3
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl

            sm:h-14
            sm:w-14

            ${
              isDanger
                ? darkMode
                  ? "bg-red-500/10 text-red-400"
                  : "bg-red-50 text-red-600"
                : darkMode
                ? "bg-cyan-500/10 text-cyan-400"
                : "bg-cyan-50 text-cyan-600"
            }
          `}
        >
          {isDanger ? (
            <ShieldAlert size={21} />
          ) : (
            <CheckCircle2 size={21} />
          )}
        </div>

        <h2
          className={`
            pr-7
            text-base
            font-black

            sm:text-xl

            ${
              darkMode
                ? "text-white"
                : "text-slate-900"
            }
          `}
        >
          {title}
        </h2>

        <p
          className={`
            mt-2
            text-[9px]
            leading-relaxed

            sm:text-sm

            ${
              darkMode
                ? "text-slate-400"
                : "text-slate-500"
            }
          `}
        >
          {message}
        </p>

        <div
          className="
            mt-5
            flex
            gap-2
          "
        >
          <button
            type="button"
            onClick={onCancel}
            className={`
              h-10
              flex-1
              rounded-xl
              border
              text-[9px]
              font-black

              sm:text-xs

              ${
                darkMode
                  ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }
            `}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`
              h-10
              flex-1
              rounded-xl
              text-[9px]
              font-black
              text-white

              sm:text-xs

              ${
                isDanger
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-cyan-600 hover:bg-cyan-700"
              }
            `}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SUCCESS / ERROR MESSAGE
========================================================= */

function CenterMessage({
  darkMode,
  message,
  type,
  onClose,
}) {
  useEffect(() => {
    const timer = setTimeout(
      onClose,
      2500
    );

    return () =>
      clearTimeout(timer);
  }, [onClose]);

  const success =
    type === "success";

  return (
    <div
      className="
        fixed
        left-0
        right-0
        top-[72px]
        z-[99999]

        pointer-events-none

        flex
        justify-center

        px-3

        sm:top-[82px]
        sm:px-4

        lg:top-[92px]
      "
    >
      <div
        className={`
          pointer-events-auto
          relative
          w-full
          max-w-[430px]

          overflow-hidden
          rounded-2xl
          border
          px-4
          py-3

          shadow-2xl
          backdrop-blur-xl

          sm:px-5
          sm:py-3.5

          animate-[wellbornReviewMessage_.28s_ease-out]

          ${
            success
              ? darkMode
                ? "border-emerald-500/30 bg-emerald-950/95"
                : "border-emerald-200 bg-emerald-50/95"
              : darkMode
              ? "border-red-500/30 bg-red-950/95"
              : "border-red-200 bg-red-50/95"
          }
        `}
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-2.5
          "
        >
          <div
            className={`
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full

              sm:h-10
              sm:w-10

              ${
                success
                  ? darkMode
                    ? "bg-emerald-500/15"
                    : "bg-emerald-100"
                  : darkMode
                  ? "bg-red-500/15"
                  : "bg-red-100"
              }
            `}
          >
            {success ? (
              <CheckCircle2
                size={18}
                className={
                  darkMode
                    ? "text-emerald-300"
                    : "text-emerald-600"
                }
              />
            ) : (
              <AlertTriangle
                size={18}
                className={
                  darkMode
                    ? "text-red-300"
                    : "text-red-600"
                }
              />
            )}
          </div>

          <p
            className={`
              min-w-0
              flex-1
              break-words
              text-[10px]
              font-bold
              leading-relaxed

              sm:text-xs

              ${
                success
                  ? darkMode
                    ? "text-emerald-200"
                    : "text-emerald-800"
                  : darkMode
                  ? "text-red-200"
                  : "text-red-800"
              }
            `}
          >
            {message}
          </p>

          <button
            type="button"
            onClick={onClose}
            className={`
              shrink-0
              rounded-lg
              p-1

              ${
                success
                  ? darkMode
                    ? "text-emerald-400 hover:bg-emerald-500/10"
                    : "text-emerald-600 hover:bg-emerald-100"
                  : darkMode
                  ? "text-red-400 hover:bg-red-500/10"
                  : "text-red-600 hover:bg-red-100"
              }
            `}
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LOADING
========================================================= */

function LoadingState({
  darkMode,
}) {
  return (
    <div
      className="
        space-y-2.5
        sm:space-y-3
      "
    >
      {[1, 2, 3, 4].map(
        (item) => (
          <div
            key={item}
            className={`
              h-[72px]
              animate-pulse
              rounded-2xl

              sm:h-[82px]
              sm:rounded-3xl

              ${
                darkMode
                  ? "bg-slate-800"
                  : "bg-slate-200"
              }
            `}
          />
        )
      )}
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  darkMode,
  search,
}) {
  return (
    <div
      className={`
        flex
        min-h-[260px]
        flex-col
        items-center
        justify-center
        rounded-3xl
        border
        p-5
        text-center

        sm:min-h-[320px]

        ${
          darkMode
            ? "border-slate-700 bg-slate-900/60"
            : "border-slate-200 bg-white"
        }
      `}
    >
      <div
        className={`
          flex
          h-14
          w-14
          items-center
          justify-center
          rounded-2xl

          ${
            darkMode
              ? "bg-slate-800 text-slate-500"
              : "bg-slate-100 text-slate-400"
          }
        `}
      >
        <MessageSquareText
          size={24}
        />
      </div>

      <h3
        className={`
          mt-4
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
        No reviews found
      </h3>

      <p className="mt-1 text-[9px] text-slate-500 sm:text-xs">
        {search
          ? "Try another search."
          : "Reviews will appear here."}
      </p>
    </div>
  );
}

/* =========================================================
   ANIMATIONS
========================================================= */

const styles = `
@keyframes wellbornDropdown {
  0% {
    opacity: 0;
    transform: translateY(5px) scale(.98);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes wellbornReviewMessage {
  0% {
    opacity: 0;
    transform: translateY(-10px) scale(.96);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
`;

/* =========================================================
   ADD STYLES ONCE
========================================================= */

if (
  typeof document !== "undefined" &&
  !document.getElementById(
    "wellborn-premium-reviews-styles"
  )
) {
  const style =
    document.createElement("style");

  style.id =
    "wellborn-premium-reviews-styles";

  style.innerHTML = styles;

  document.head.appendChild(style);
}