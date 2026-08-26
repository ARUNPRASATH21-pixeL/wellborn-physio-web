import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  HeartPulse,
  Mail,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Quote,
  X,
  ThumbsUp,
  Maximize2,
  User,
} from "lucide-react";

import { API, postData, getData } from "../services/api";
import { getUserFcmToken } from "../services/fcm";

/* =========================================================
   ANIMATIONS
========================================================= */

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 35,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeLeft = {
  hidden: {
    opacity: 0,
    x: -45,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeRight = {
  hidden: {
    opacity: 0,
    x: 45,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const stagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
    },
  },
};

/* =========================================================
   STAR DISPLAY
========================================================= */

function StarRating({ rating = 0, size = 16 }) {
  const safeRating = Math.max(
    0,
    Math.min(5, Number(rating) || 0)
  );

  return (
    <div className="review-star-display">
      {[1, 2, 3, 4, 5].map((number) => (
        <Star
          key={number}
          size={size}
          fill={
            number <= safeRating
              ? "currentColor"
              : "none"
          }
          strokeWidth={
            number <= safeRating ? 2.5 : 1.7
          }
          className={
            number <= safeRating
              ? "review-star-filled"
              : "review-star-empty"
          }
        />
      ))}
    </div>
  );
}

/* =========================================================
   RATING SELECTOR
========================================================= */

function RatingSelector({ rating, setRating }) {
  const labels = {
    1: "Poor",
    2: "Fair",
    3: "Good",
    4: "Very Good",
    5: "Excellent",
  };

  const ratingMessages = {
    1: "We're sorry for your experience. We'll improve our care.",
    2: "Thank you for your feedback. We'll work on improving our service.",
    3: "Thank you for your feedback. We'll continue to improve.",
    4: "Thank you! We'll keep improving our service.",
    5: "Thank you for your trust and wonderful feedback.",
  };

  return (
    <div className="review-rating-box">
      <div className="review-rating-top">
        <div>
          <p className="review-rating-label">
            Your Rating
          </p>

          <p className="review-rating-sub">
            Select a rating based on your experience
          </p>
        </div>

        <div
          className={`review-rating-value ${
            rating === 0
              ? "review-rating-value-empty"
              : ""
          }`}
        >
          {rating === 0 ? (
            <strong>Select</strong>
          ) : (
            <>
              <strong>{rating}.0</strong>
              <span>/ 5</span>
            </>
          )}
        </div>
      </div>

      <div className="review-rating-stars">
        {[1, 2, 3, 4, 5].map((number) => (
          <motion.button
            key={number}
            type="button"
            aria-label={`Give ${number} star rating`}
            whileHover={{
              scale: 1.15,
              rotate: number % 2 === 0 ? 4 : -4,
            }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setRating(number)}
            className={`review-rating-star-button ${
              number <= rating ? "active" : ""
            }`}
          >
            <Star
              size={29}
              fill={
                number <= rating
                  ? "currentColor"
                  : "none"
              }
            />
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {rating === 0 ? (
          <motion.div
            key="empty-rating"
            initial={{
              opacity: 0,
              y: 5,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -5,
            }}
            className="review-rating-selected review-rating-placeholder"
          >
            <Star size={13} />
            Please select your rating
          </motion.div>
        ) : (
          <motion.div
            key={rating}
            initial={{
              opacity: 0,
              y: 5,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -5,
            }}
          >
            <div className="review-rating-selected">
              <Sparkles size={13} />
              {labels[rating]}
            </div>

            <motion.p
              key={`message-${rating}`}
              initial={{
                opacity: 0,
                y: 5,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -5,
              }}
              className="review-rating-message"
            >
              {ratingMessages[rating]}
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   REVIEW CARD
========================================================= */

function ReviewCard({ review, index }) {
  const name =
    review?.patientName ||
    "Wellborn Patient";

  const text =
    review?.reviewText ||
    "Great physiotherapy experience.";

  const rating = Number(review?.rating || 0);

  const initial =
    name.trim().charAt(0).toUpperCase() || "P";

  return (
    <motion.article
      variants={fadeUp}
      whileHover={{
        y: -7,
      }}
      className="review-card"
    >
      <div className="review-card-top">
        <div className="review-patient">
          <div className="review-avatar">
            {initial}
          </div>

          <div>
            <h3>{name}</h3>

            <div className="review-verified">
              <CheckCircle2 size={12} />
              Verified Patient
            </div>
          </div>
        </div>

        <div className="review-quote-icon">
          <Quote size={18} />
        </div>
      </div>

      <div className="review-card-rating">
        <StarRating
          rating={rating}
          size={15}
        />

        <span>{rating}.0</span>
      </div>

      <p className="review-card-text">
        "{text}"
      </p>

      <div className="review-card-bottom">
        <span>
          <ThumbsUp size={12} />
          Patient Experience
        </span>

        <span className="review-card-number">
          #{String(index + 1).padStart(2, "0")}
        </span>
      </div>
    </motion.article>
  );
}

/* =========================================================
   ALL REVIEWS MODAL CARD
========================================================= */

function ReviewModalCard({ review, index }) {
  const name =
    review?.patientName ||
    "Wellborn Patient";

  const text =
    review?.reviewText ||
    "Great physiotherapy experience.";

  const rating = Number(review?.rating || 0);

  const initial =
    name.trim().charAt(0).toUpperCase() || "P";

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 18,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        delay: Math.min(index * 0.035, 0.35),
      }}
      className="review-modal-card"
    >
      <div className="review-modal-card-top">
        <div className="review-patient">
          <div className="review-avatar">
            {initial}
          </div>

          <div>
            <h3>{name}</h3>

            <div className="review-verified">
              <CheckCircle2 size={12} />
              Verified Patient
            </div>
          </div>
        </div>

        <div className="review-modal-card-number">
          #{String(index + 1).padStart(2, "0")}
        </div>
      </div>

      <div className="review-modal-rating-row">
        <StarRating
          rating={rating}
          size={16}
        />

        <span>{rating}.0 / 5</span>
      </div>

      <p className="review-modal-card-text">
        "{text}"
      </p>

      <div className="review-modal-card-footer">
        <span>
          <ThumbsUp size={12} />
          Patient Experience
        </span>
      </div>
    </motion.article>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function User_reviews() {
  const [reviews, setReviews] = useState([]);

  const [rating, setRating] = useState(0);

  const [form, setForm] = useState({
    patientName: "",
    email: "",
    reviewText: "",
  });

  const [loadingReviews, setLoadingReviews] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const [successModal, setSuccessModal] =
    useState(false);

  const [showAllReviews, setShowAllReviews] =
    useState(false);

  useEffect(() => {
    document.title =
      "Patient Feedback | Wellborn Physio";

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });

    loadApprovedReviews();

    return () => {
      document.title = "Wellborn Physio";
    };
  }, []);

  useEffect(() => {
    if (showAllReviews || successModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [showAllReviews, successModal]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowAllReviews(false);
        setSuccessModal(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  const loadApprovedReviews = async () => {
    try {
      setLoadingReviews(true);

      // FIXED: Updated from API.REVIEW_APPROVED to API.REVIEW_GET_APPROVED
      const response = await getData(
        API.REVIEW_GET_APPROVED
      );

      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.reviews)
        ? response.reviews
        : [];

      setReviews(list);
    } catch (error) {
      console.error(
        "Failed to load reviews:",
        error
      );

      setReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    setError("");

    const patientName =
      form.patientName.trim();

    const email =
      form.email.trim();

    const reviewText =
      form.reviewText.trim();

    if (!patientName) {
      setError("Please enter your name.");
      return;
    }

    if (patientName.length < 2) {
      setError(
        "Please enter a valid name."
      );
      return;
    }

    if (!email) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError(
        "Please enter a valid email address."
      );
      return;
    }

    if (
      !rating ||
      rating < 1 ||
      rating > 5
    ) {
      setError(
        "Please select a rating before submitting your feedback."
      );
      return;
    }

    if (!reviewText) {
      setError(
        "Please write your feedback."
      );
      return;
    }

    if (reviewText.length < 10) {
      setError(
        "Please write at least 10 characters in your review."
      );
      return;
    }

    /* =====================================================
       GET FCM TOKEN (for push notification on submission)
       NOTE: fetched BEFORE building the payload, same pattern
       used on the Contact page. The backend reads
       request.getFcmToken() and uses it to send the
       "Feedback Received" push notification to the user.
       If this is null/empty, the backend just skips sending
       the user notification (admin notification still goes
       out regardless).
    ================================================     */

    let userFcmToken = null;
    try {
      userFcmToken = await getUserFcmToken();
    } catch (tokenError) {
      console.error("Could not retrieve FCM token:", tokenError);
    }

    try {
      setSubmitting(true);

      const payload = {
        patientName,
        email,
        rating: Number(rating),
        reviewText,
        fcmToken: userFcmToken || null,
      };

      await postData(
        API.REVIEW_SAVE,
        payload
      );

      setForm({
        patientName: "",
        email: "",
        reviewText: "",
      });

      setRating(0);

      setSuccessModal(true);
    } catch (error) {
      console.error(
        "Review submission failed:",
        error
      );

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data ||
        error?.message ||
        "Unable to submit your feedback. Please try again.";

      setError(
        typeof message === "string"
          ? message
          : "Unable to submit your feedback. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const reviewStats = useMemo(() => {
    if (!reviews.length) {
      return {
        total: 0,
        average: "0.0",
      };
    }

    const totalRating =
      reviews.reduce(
        (sum, item) =>
          sum +
          Number(item?.rating || 0),
        0
      );

    return {
      total: reviews.length,
      average: (
        totalRating /
        reviews.length
      ).toFixed(1),
    };
  }, [reviews]);

  const visibleReviews = useMemo(() => {
    return reviews.slice(0, 5);
  }, [reviews]);

  return (
    <div className="reviews-page">
      <AnimatePresence>
        {successModal && (
          <div className="review-modal-overlay">
            <motion.div
              className="review-modal-backdrop"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() =>
                setSuccessModal(false)
              }
            />

            <motion.div
              className="review-success-modal"
              initial={{
                opacity: 0,
                scale: 0.85,
                y: 25,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.85,
                y: 25,
              }}
            >
              <div className="review-modal-glow" />

              <button
                type="button"
                className="review-modal-close"
                onClick={() =>
                  setSuccessModal(false)
                }
              >
                <X size={17} />
              </button>

              <div className="review-success-icon">
                <CheckCircle2 size={38} />

                <span>
                  <Sparkles size={15} />
                </span>
              </div>

              <div className="review-success-tag">
                <Sparkles size={12} />
                Feedback Received
              </div>

              <h2>
                Thank You!
              </h2>

              <p>
                Your review sent successfully! Your valuable feedback has
                been submitted successfully.
                Our team will review it before
                displaying it publicly.
              </p>

              <button
                type="button"
                className="review-modal-action"
                onClick={() =>
                  setSuccessModal(false)
                }
              >
                Continue
                <ArrowRight size={17} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAllReviews && (
          <div className="all-reviews-overlay">
            <motion.div
              className="all-reviews-backdrop"
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              onClick={() =>
                setShowAllReviews(false)
              }
            />

            <motion.div
              className="all-reviews-modal"
              initial={{
                opacity: 0,
                scale: 0.94,
                y: 25,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
                y: 25,
              }}
              transition={{
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="all-reviews-modal-header">
                <div className="all-reviews-modal-heading">
                  <div className="all-reviews-modal-icon">
                    <MessageCircle size={20} />
                  </div>

                  <div>
                    <div className="all-reviews-modal-label">
                      <Sparkles size={12} />
                      PATIENT STORIES
                    </div>

                    <h2>
                      All Patient Reviews
                    </h2>

                    <p>
                      Real experiences shared by
                      patients of Wellborn Physio.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="all-reviews-close"
                  onClick={() =>
                    setShowAllReviews(false)
                  }
                  aria-label="Close reviews"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="all-reviews-summary">
                <div className="all-reviews-summary-item">
                  <div className="all-reviews-summary-icon blue">
                    <MessageCircle size={17} />
                  </div>

                  <div>
                    <strong>
                      {reviewStats.total}
                    </strong>

                    <span>
                      Total Reviews
                    </span>
                  </div>
                </div>

                <div className="all-reviews-summary-item">
                  <div className="all-reviews-summary-icon amber">
                    <Star
                      size={17}
                      fill="currentColor"
                    />
                  </div>

                  <div>
                    <strong>
                      {reviewStats.average}
                    </strong>

                    <span>
                      Average Rating
                    </span>
                  </div>
                </div>

                <div className="all-reviews-summary-item">
                  <div className="all-reviews-summary-icon cyan">
                    <CheckCircle2 size={17} />
                  </div>

                  <div>
                    <strong>
                      100%
                    </strong>

                    <span>
                      Patient Focused
                    </span>
                  </div>
                </div>
              </div>

              <div className="all-reviews-scroll">
                <div className="all-reviews-scroll-inner">
                  {reviews.map(
                    (review, index) => (
                      <ReviewModalCard
                        key={
                          review?.reviewId ||
                          review?.id ||
                          index
                        }
                        review={review}
                        index={index}
                      />
                    )
                  )}
                </div>
              </div>

              <div className="all-reviews-modal-footer">
                <div>
                  <ShieldCheck size={14} />

                  <span>
                    Showing reviews approved by
                    Wellborn Physio
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowAllReviews(false)
                  }
                >
                  Close
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <section className="reviews-hero">
        <div className="reviews-orb reviews-orb-one" />
        <div className="reviews-orb reviews-orb-two" />
        <div className="reviews-orb reviews-orb-three" />

        <div className="reviews-grid-pattern" />

        <div className="reviews-container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="reviews-hero-content"
          >
            <motion.div
              variants={fadeUp}
              className="reviews-chip"
            >
              <span className="reviews-chip-icon">
                <MessageCircle size={15} />
              </span>

              Patient Feedback
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="reviews-hero-title"
            >
              Your Experience
              <span>
                Matters To Us
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="reviews-hero-description"
            >
              Share your experience with
              Wellborn Physio and help us
              continue providing better
              physiotherapy and rehabilitation
              care.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="reviews-hero-pills"
            >
              <span>
                <ShieldCheck size={14} />
                Trusted Care
              </span>

              <span>
                <HeartPulse size={14} />
                Patient First
              </span>

              <span>
                <Star size={14} />
                Real Experiences
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="reviews-main">
        <div className="reviews-container">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{
              once: true,
              amount: 0.15,
            }}
            variants={stagger}
            className="reviews-stat-grid"
          >
            <motion.div
              variants={fadeUp}
              className="reviews-stat-card"
            >
              <div className="reviews-stat-icon blue">
                <MessageCircle size={21} />
              </div>

              <div>
                <strong>
                  {reviewStats.total}
                </strong>

                <span>
                  Patient Reviews
                </span>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="reviews-stat-card"
            >
              <div className="reviews-stat-icon amber">
                <Star
                  size={21}
                  fill="currentColor"
                />
              </div>

              <div>
                <strong>
                  {reviewStats.average}
                </strong>

                <span>
                  Average Rating
                </span>
              </div>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="reviews-stat-card"
            >
              <div className="reviews-stat-icon cyan">
                <CheckCircle2 size={21} />
              </div>

              <div>
                <strong>
                  100%
                </strong>

                <span>
                  Patient Focused
                </span>
              </div>
            </motion.div>
          </motion.div>

          <div className="reviews-columns">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.12,
              }}
              variants={fadeLeft}
              className="review-form-card"
            >
              <div className="review-card-glow" />

              <div className="review-form-header">
                <div>
                  <div className="review-form-label">
                    <MessageCircle size={13} />
                    PATIENT EXPERIENCE
                  </div>

                  <h2>
                    Share Your
                    <span>
                      Feedback
                    </span>
                  </h2>

                  <p>
                    Tell us about your
                    experience with Wellborn
                    Physio.
                  </p>
                </div>

                <motion.div
                  animate={{
                    y: [0, -6, 0],
                    rotate: [0, 5, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="review-form-icon"
                >
                  <HeartPulse size={21} />
                </motion.div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: -10,
                    }}
                    className="review-error"
                  >
                    <ShieldCheck size={19} />

                    <div>
                      <strong>
                        Unable to Submit
                      </strong>

                      <p>
                        {error}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setError("")
                      }
                    >
                      <X size={15} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <form
                onSubmit={handleSubmit}
                className="review-form"
              >
                <div className="review-field">
                  <label htmlFor="review-name">
                    Full Name
                  </label>

                  <div className="review-input-shell">
                    <span className="review-field-icon">
                      <User size={17} />
                    </span>

                    <input
                      id="review-name"
                      name="patientName"
                      type="text"
                      value={
                        form.patientName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter your full name"
                      autoComplete="name"
                      maxLength={100}
                      required
                    />
                  </div>
                </div>

                <div className="review-field">
                  <label htmlFor="review-email">
                    Email Address
                  </label>

                  <div className="review-input-shell">
                    <span className="review-field-icon">
                      <Mail size={17} />
                    </span>

                    <input
                      id="review-email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={
                        handleChange
                      }
                      placeholder="Enter your email address"
                      autoComplete="email"
                      maxLength={150}
                      required
                    />
                  </div>
                </div>

                <div className="review-field">
                  <RatingSelector
                    rating={rating}
                    setRating={setRating}
                  />
                </div>

                <div className="review-field">
                  <label htmlFor="review-text">
                    Your Feedback
                  </label>

                  <div className="review-textarea-shell">
                    <span className="review-textarea-icon">
                      <MessageCircle size={17} />
                    </span>

                    <textarea
                      id="review-text"
                      name="reviewText"
                      rows={6}
                      maxLength={2000}
                      value={
                        form.reviewText
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Tell us about your physiotherapy experience..."
                      required
                    />
                  </div>

                  <div className="review-character-count">
                    {form.reviewText.length}/2000
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={
                    submitting
                      ? {}
                      : {
                          y: -3,
                        }
                  }
                  whileTap={
                    submitting
                      ? {}
                      : {
                          scale: 0.98,
                        }
                  }
                  className="review-submit"
                >
                  <span>
                    {submitting
                      ? "Submitting..."
                      : "Submit Feedback"}
                  </span>

                  <span className="review-submit-icon">
                    {submitting ? (
                      <span className="review-spinner" />
                    ) : (
                      <Send size={17} />
                    )}
                  </span>
                </motion.button>

                <div className="review-form-note">
                  <ShieldCheck size={13} />

                  Your feedback will be reviewed
                  before appearing publicly.
                </div>
              </form>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{
                once: true,
                amount: 0.12,
              }}
              variants={fadeRight}
              className="reviews-list-section"
            >
              <div className="reviews-list-header">
                <div>
                  <div className="reviews-section-label">
                    <Sparkles size={13} />
                    PATIENT STORIES
                  </div>

                  <h2>
                    What Our Patients
                    <span>
                      Say
                    </span>
                  </h2>

                  <p>
                    Read experiences shared by
                    patients who have trusted
                    Wellborn Physio.
                  </p>
                </div>

                <div className="reviews-count-badge">
                  <strong>
                    {reviewStats.total}
                  </strong>

                  <span>
                    Reviews
                  </span>
                </div>
              </div>

              {loadingReviews && (
                <div className="reviews-loading">
                  <span className="reviews-loading-spinner" />

                  <p>
                    Loading patient reviews...
                  </p>
                </div>
              )}

              {!loadingReviews &&
                reviews.length === 0 && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 15,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="reviews-empty"
                  >
                    <div className="reviews-empty-icon">
                      <MessageCircle size={27} />
                    </div>

                    <h3>
                      No reviews yet
                    </h3>

                    <p>
                      Be the first patient to
                      share your experience.
                    </p>
                  </motion.div>
                )}

              {!loadingReviews &&
                reviews.length > 0 && (
                  <>
                    <motion.div
                      initial="hidden"
                      whileInView="visible"
                      viewport={{
                        once: true,
                        amount: 0.08,
                      }}
                      variants={stagger}
                      className="reviews-list"
                    >
                      {visibleReviews.map(
                        (review, index) => (
                          <ReviewCard
                            key={
                              review?.reviewId ||
                              review?.id ||
                              index
                            }
                            review={review}
                            index={index}
                          />
                        )
                      )}
                    </motion.div>

                    {reviews.length > 5 && (
                      <motion.button
                        type="button"
                        initial={{
                          opacity: 0,
                          y: 12,
                        }}
                        whileInView={{
                          opacity: 1,
                          y: 0,
                        }}
                        viewport={{
                          once: true,
                        }}
                        whileHover={{
                          y: -3,
                        }}
                        whileTap={{
                          scale: 0.98,
                        }}
                        onClick={() =>
                          setShowAllReviews(true)
                        }
                        className="view-more-reviews-button"
                      >
                        <span className="view-more-reviews-icon">
                          <Maximize2 size={16} />
                        </span>

                        <span className="view-more-reviews-content">
                          <strong>
                            View More Reviews
                          </strong>

                          <small>
                            See all {reviews.length} patient
                            experiences
                          </small>
                        </span>

                        <span className="view-more-reviews-arrow">
                          <ArrowRight size={17} />
                        </span>
                      </motion.button>
                    )}
                  </>
                )}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="reviews-cta">
        <div className="reviews-cta-orb left" />
        <div className="reviews-cta-orb right" />

        <motion.div
          animate={{
            y: [0, -7, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="reviews-cta-icon"
        >
          <HeartPulse size={27} />
        </motion.div>

        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
          }}
          variants={fadeUp}
        >
          Your Recovery,
          <span>
            Our Commitment.
          </span>
        </motion.h2>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
          }}
          variants={fadeUp}
        >
          Ready to begin your recovery journey?
          Book your appointment with Wellborn
          Physio today.
        </motion.p>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{
            once: true,
          }}
          variants={fadeUp}
          className="reviews-cta-actions"
        >
          <Link
            to="/user/appointment"
            className="reviews-cta-primary"
          >
            Book Appointment
            <ArrowRight size={16} />
          </Link>

          <Link
            to="/user/contact"
            className="reviews-cta-secondary"
          >
            Contact Us
            <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      <footer className="reviews-footer">
        <div className="reviews-container">
          <div className="reviews-footer-content">
            <div className="reviews-footer-brand">
              <div className="reviews-footer-icon">
                <HeartPulse size={21} />
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

            <p>
              Professional physiotherapy and
              rehabilitation care focused on
              helping you move better and live
              healthier.
            </p>

            <div className="reviews-footer-links">
              <Link to="/user/home">
                Home
              </Link>

              <Link to="/user/about">
                About
              </Link>

              <Link to="/user/services">
                Services
              </Link>

              <Link to="/user/doctors">
                Doctors
              </Link>

              <Link to="/user/appointment">
                Appointment
              </Link>

              <span className="active">
                Feedback
              </span>

              <Link to="/user/contact">
                Contact
              </Link>
            </div>

            <div className="reviews-footer-copy">
              © {new Date().getFullYear()}{" "}
              Wellborn Physio Rehab & Centre.
              All Rights Reserved.
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        * {
          box-sizing: border-box;
        }

        .reviews-page {
          width: 100%;
          min-height: 100vh;
          overflow-x: hidden;
          background: #f5f7fb;
          color: #111827;
        }

        .dark .reviews-page {
          background: #05070d;
          color: #f8fafc;
        }

        .reviews-container {
          width: 100%;
          max-width: 1280px;
          margin: auto;
          padding: 0 22px;
        }

        .reviews-hero {
          position: relative;
          overflow: hidden;
          padding: 88px 0 95px;
          color: white;

          background:
            radial-gradient(
              circle at 12% 18%,
              rgba(255,255,255,.16),
              transparent 23%
            ),
            radial-gradient(
              circle at 86% 15%,
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

        .reviews-hero-content {
          position: relative;
          z-index: 5;
          max-width: 820px;
          margin: auto;
          text-align: center;
        }

        .reviews-chip {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 13px;
          border-radius: 999px;
          background: rgba(255,255,255,.11);
          border: 1px solid rgba(255,255,255,.21);
          backdrop-filter: blur(18px);
          font-size: 11px;
          font-weight: 800;
        }

        .reviews-chip-icon {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255,255,255,.15);
        }

        .reviews-hero-title {
          margin-top: 21px;
          font-size: clamp(3rem, 7vw, 5.4rem);
          line-height: .94;
          letter-spacing: -.065em;
          font-weight: 900;
        }

        .reviews-hero-title span {
          display: block;
          margin-top: 9px;
          color: transparent;
          background: linear-gradient(90deg, white, #c7f9ff);
          background-clip: text;
          -webkit-background-clip: text;
        }

        .reviews-hero-description {
          max-width: 650px;
          margin: 23px auto 0;
          color: rgba(255,255,255,.84);
          font-size: 15px;
          line-height: 1.8;
        }

        .reviews-hero-pills {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 22px;
        }

        .reviews-hero-pills span {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 11px;
          border-radius: 999px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.14);
          font-size: 10px;
          font-weight: 700;
        }

        .reviews-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(5px);
        }

        .reviews-orb-one {
          width: 270px;
          height: 270px;
          left: -100px;
          top: -100px;
          background: rgba(255,255,255,.10);
          animation: reviewsOrbOne 12s ease-in-out infinite;
        }

        .reviews-orb-two {
          width: 340px;
          height: 340px;
          right: -120px;
          bottom: -150px;
          background: rgba(103,232,249,.12);
          animation: reviewsOrbTwo 15s ease-in-out infinite;
        }

        .reviews-orb-three {
          width: 110px;
          height: 110px;
          left: 48%;
          top: 20%;
          background: rgba(255,255,255,.045);
          animation: reviewsOrbThree 9s ease-in-out infinite;
        }

        @keyframes reviewsOrbOne {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(45px,-30px) scale(1.1); }
        }

        @keyframes reviewsOrbTwo {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-45px,30px) scale(1.1); }
        }

        @keyframes reviewsOrbThree {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(30px,-20px); }
        }

        .reviews-grid-pattern {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: .4;
          background-image:
            linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
          background-size: 42px 42px;
        }

        .reviews-main {
          padding: 90px 0;
          background: linear-gradient(180deg, #f7f9fc, white);
        }

        .dark .reviews-main {
          background: linear-gradient(180deg, #05070d, #08111e);
        }

        .reviews-stat-grid {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 14px;
          margin-bottom: 24px;
        }

        .reviews-stat-card {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 18px;
          border-radius: 20px;
          background: rgba(255,255,255,.88);
          border: 1px solid rgba(226,232,240,.8);
          box-shadow: 0 15px 40px rgba(15,23,42,.055);
          backdrop-filter: blur(18px);
        }

        .dark .reviews-stat-card {
          background: rgba(15,23,42,.82);
          border-color: rgba(71,85,105,.55);
        }

        .reviews-stat-icon {
          width: 46px;
          height: 46px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
        }

        .reviews-stat-icon.blue { color: #2563eb; background: #eff6ff; }
        .reviews-stat-icon.cyan { color: #0891b2; background: #ecfeff; }
        .reviews-stat-icon.amber { color: #f59e0b; background: #fffbeb; }

        .dark .reviews-stat-icon.blue { background: rgba(37,99,235,.13); }
        .dark .reviews-stat-icon.cyan { background: rgba(8,145,178,.13); }
        .dark .reviews-stat-icon.amber { background: rgba(245,158,11,.13); }

        .reviews-stat-card strong {
          display: block;
          color: #0f172a;
          font-size: 21px;
          font-weight: 900;
        }

        .dark .reviews-stat-card strong { color: white; }

        .reviews-stat-card span {
          display: block;
          margin-top: 2px;
          color: #64748b;
          font-size: 10px;
          font-weight: 700;
        }

        .reviews-columns {
          display: grid;
          grid-template-columns: minmax(0,1fr) minmax(0,1fr);
          gap: 22px;
          align-items: start;
        }

        .review-form-card {
          position: relative;
          overflow: hidden;
          padding: 30px;
          border-radius: 30px;
          background: rgba(255,255,255,.88);
          border: 1px solid rgba(255,255,255,.92);
          box-shadow: 0 24px 65px rgba(15,23,42,.08);
          backdrop-filter: blur(22px);
        }

        .dark .review-form-card {
          background: rgba(15,23,42,.84);
          border-color: rgba(71,85,105,.55);
          box-shadow: 0 24px 65px rgba(0,0,0,.28);
        }

        .review-card-glow {
          position: absolute;
          width: 230px;
          height: 230px;
          right: -100px;
          top: -110px;
          border-radius: 50%;
          background: rgba(37,99,235,.09);
          filter: blur(45px);
          pointer-events: none;
        }

        .review-form-header {
          position: relative;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .review-form-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #2563eb;
          font-size: 10px;
          font-weight: 850;
          letter-spacing: .14em;
        }

        .dark .review-form-label { color: #60a5fa; }

        .review-form-header h2 {
          margin-top: 8px;
          color: #111827;
          font-size: 29px;
          line-height: 1.05;
          font-weight: 900;
        }

        .review-form-header h2 span {
          display: block;
          color: #2563eb;
        }

        .dark .review-form-header h2 { color: white; }
        .dark .review-form-header h2 span { color: #60a5fa; }

        .review-form-header p {
          margin-top: 8px;
          color: #64748b;
          font-size: 12px;
          line-height: 1.7;
        }

        .dark .review-form-header p { color: #94a3b8; }

        .review-form-icon {
          width: 46px;
          height: 46px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          background: #eef4ff;
          color: #2563eb;
        }

        .dark .review-form-icon {
          background: rgba(37,99,235,.14);
          color: #60a5fa;
        }

        .review-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 20px;
          padding: 12px;
          border-radius: 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }

        .dark .review-error {
          background: rgba(220,38,38,.10);
          border-color: rgba(248,113,113,.20);
        }

        .review-error > svg { margin-top: 2px; flex-shrink: 0; }
        .review-error div { flex: 1; min-width: 0; }
        .review-error strong { display: block; font-size: 12px; color: #b91c1c; }
        .dark .review-error strong { color: #f87171; }
        .review-error p { margin-top: 3px; color: #dc2626; font-size: 10px; line-height: 1.5; }
        .dark .review-error p { color: #fca5a5; }
        .review-error button { border: none; background: transparent; color: #94a3b8; cursor: pointer; }

        .review-form { margin-top: 22px; }
        .review-field { margin-top: 14px; }
        .review-field label { display: block; margin-bottom: 7px; padding-left: 2px; color: #475569; font-size: 11px; font-weight: 800; }
        .dark .review-field label { color: #cbd5e1; }

        .review-input-shell { position: relative; display: flex; align-items: center; }
        .review-field-icon {
          position: absolute; left: 11px; width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 11px; background: #eff6ff; color: #2563eb;
          z-index: 2; pointer-events: none; transition: .25s ease;
        }
        .dark .review-field-icon { background: rgba(37,99,235,.14); color: #60a5fa; }
        .review-input-shell input {
          width: 100%; min-height: 55px; padding: 0 13px 0 56px;
          border: 1px solid #e2e8f0; border-radius: 16px; outline: none;
          background: rgba(248,250,252,.92); color: #111827; font-size: 12px; transition: .25s ease;
        }
        .review-input-shell input::placeholder { color: #94a3b8; }
        .review-input-shell input:focus {
          border-color: #3b82f6; background: white;
          box-shadow: 0 0 0 4px rgba(59,130,246,.10); transform: translateY(-1px);
        }
        .dark .review-input-shell input { background: #1e293b; border-color: #334155; color: white; }

        .review-rating-box {
          padding: 17px; border-radius: 18px;
          background: linear-gradient(135deg, #f8fbff, #f0f9ff); border: 1px solid #dbeafe;
        }
        .dark .review-rating-box {
          background: linear-gradient(135deg, rgba(30,41,59,.85), rgba(8,47,73,.45)); border-color: #334155;
        }
        .review-rating-top { display: flex; align-items: center; justify-content: space-between; }
        .review-rating-label { color: #334155; font-size: 12px; font-weight: 850; }
        .dark .review-rating-label { color: #e2e8f0; }
        .review-rating-sub { margin-top: 2px; color: #94a3b8; font-size: 9px; }
        .review-rating-value { display: flex; align-items: baseline; gap: 3px; }
        .review-rating-value strong { color: #2563eb; font-size: 20px; font-weight: 900; }
        .review-rating-value span { color: #94a3b8; font-size: 9px; }
        .review-rating-value-empty strong { color: #94a3b8; font-size: 12px; font-weight: 800; }
        .review-rating-stars { display: flex; align-items: center; gap: 5px; margin-top: 14px; }
        .review-rating-star-button {
          width: 43px; height: 43px; display: flex; align-items: center; justify-content: center;
          border: none; border-radius: 13px; background: white; color: #cbd5e1; cursor: pointer; transition: .2s ease;
        }
        .review-rating-star-button:hover, .review-rating-star-button.active { color: #f59e0b; }
        .review-rating-star-button.active { background: #fffbeb; box-shadow: 0 6px 18px rgba(245,158,11,.13); }
        .dark .review-rating-star-button { background: #0f172a; }
        .dark .review-rating-star-button.active { background: rgba(245,158,11,.10); }

        .review-rating-selected { display: flex; align-items: center; gap: 5px; margin-top: 9px; color: #0891b2; font-size: 10px; font-weight: 800; }
        .review-rating-placeholder { color: #94a3b8; }
        .review-rating-message { margin: 5px 0 0; color: #64748b; font-size: 9px; line-height: 1.55; font-weight: 500; }
        .dark .review-rating-message { color: #94a3b8; }

        .review-textarea-shell { position: relative; }
        .review-textarea-icon {
          position: absolute; left: 11px; top: 13px; width: 36px; height: 36px;
          display: flex; align-items: center; justify-content: center; border-radius: 11px;
          background: #eff6ff; color: #2563eb; z-index: 2; pointer-events: none;
        }
        .dark .review-textarea-icon { background: rgba(37,99,235,.14); color: #60a5fa; }
        .review-textarea-shell textarea {
          width: 100%; min-height: 135px; padding: 14px 14px 14px 56px;
          border: 1px solid #e2e8f0; border-radius: 16px; outline: none; resize: vertical;
          background: rgba(248,250,252,.92); color: #111827; font-size: 12px; line-height: 1.6; transition: .25s ease;
        }
        .review-textarea-shell textarea:focus {
          border-color: #3b82f6; background: white; box-shadow: 0 0 0 4px rgba(59,130,246,.10);
        }
        .dark .review-textarea-shell textarea { background: #1e293b; border-color: #334155; color: white; }

        .review-character-count { margin-top: 5px; text-align: right; color: #94a3b8; font-size: 9px; }

        .review-submit {
          width: 100%; min-height: 56px; margin-top: 17px; padding: 7px 8px 7px 17px;
          border: none; border-radius: 16px; display: flex; align-items: center; justify-content: space-between;
          background: linear-gradient(135deg, #2563eb, #0891b2); color: white; font-size: 13px; font-weight: 850;
          cursor: pointer; box-shadow: 0 13px 32px rgba(37,99,235,.22); transition: .25s ease;
        }
        .review-submit:disabled { opacity: .65; cursor: not-allowed; }
        .review-submit-icon {
          width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center;
          justify-content: center; background: rgba(255,255,255,.14);
        }
        .review-spinner, .reviews-loading-spinner { border-radius: 50%; animation: reviewSpinner .7s linear infinite; }
        .review-spinner { width: 17px; height: 17px; border: 2px solid rgba(255,255,255,.35); border-top-color: white; }
        @keyframes reviewSpinner { to { transform: rotate(360deg); } }

        .review-form-note {
          display: flex; align-items: center; justify-content: center; gap: 5px;
          margin-top: 10px; color: #94a3b8; font-size: 9px; text-align: center;
        }

        .reviews-list-section { min-width: 0; }
        .reviews-list-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 18px; margin-bottom: 20px; }
        .reviews-section-label { display: inline-flex; align-items: center; gap: 6px; color: #2563eb; font-size: 10px; font-weight: 850; letter-spacing: .14em; }
        .dark .reviews-section-label { color: #60a5fa; }
        .reviews-list-header h2 { margin-top: 8px; color: #111827; font-size: 29px; line-height: 1.08; font-weight: 900; }
        .dark .reviews-list-header h2 { color: white; }
        .reviews-list-header h2 span { display: block; color: #2563eb; }
        .dark .reviews-list-header h2 span { color: #60a5fa; }
        .reviews-list-header p { max-width: 500px; margin-top: 7px; color: #64748b; font-size: 12px; line-height: 1.7; }
        .dark .reviews-list-header p { color: #94a3b8; }

        .reviews-count-badge {
          flex-shrink: 0; min-width: 72px; padding: 10px 12px; border-radius: 15px; text-align: center;
          background: linear-gradient(135deg, #eff6ff, #ecfeff); border: 1px solid #dbeafe;
        }
        .reviews-count-badge strong { display: block; color: #2563eb; font-size: 19px; font-weight: 900; }
        .reviews-count-badge span { color: #64748b; font-size: 8px; font-weight: 800; text-transform: uppercase; }

        .reviews-list { display: grid; gap: 13px; }
        .review-card {
          position: relative; padding: 19px; border-radius: 21px; background: rgba(255,255,255,.9);
          border: 1px solid rgba(226,232,240,.8); box-shadow: 0 14px 38px rgba(15,23,42,.055); transition: box-shadow .3s ease;
        }
        .review-card:hover { box-shadow: 0 22px 48px rgba(37,99,235,.10); }
        .dark .review-card { background: rgba(15,23,42,.82); border-color: rgba(71,85,105,.55); }

        .review-card-top { display: flex; align-items: center; justify-content: space-between; }
        .review-patient { display: flex; align-items: center; gap: 10px; }
        .review-avatar {
          width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; border-radius: 14px; color: white; background: linear-gradient(135deg, #2563eb, #0891b2);
          font-size: 14px; font-weight: 900; box-shadow: 0 8px 20px rgba(37,99,235,.18);
        }
        .review-patient h3 { color: #0f172a; font-size: 12px; font-weight: 900; }
        .dark .review-patient h3 { color: white; }
        .review-verified { display: flex; align-items: center; gap: 4px; margin-top: 3px; color: #0891b2; font-size: 8px; font-weight: 800; }
        .review-quote-icon {
          width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
          border-radius: 12px; color: #2563eb; background: #eff6ff;
        }

        .review-card-rating { display: flex; align-items: center; gap: 6px; margin-top: 13px; }
        .review-star-display { display: flex; align-items: center; gap: 2px; }
        .review-star-filled { color: #f59e0b; }
        .review-star-empty { color: #cbd5e1; }
        .review-card-rating > span { color: #64748b; font-size: 9px; font-weight: 800; }

        .review-card-text { margin-top: 10px; color: #475569; font-size: 12px; line-height: 1.8; }
        .dark .review-card-text { color: #cbd5e1; }

        .review-card-bottom {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 14px; padding-top: 11px; border-top: 1px solid #f1f5f9;
        }
        .review-card-bottom span:first-child {
          display: inline-flex; align-items: center; gap: 4px; color: #94a3b8; font-size: 8px; font-weight: 700;
        }
        .review-card-number { color: #cbd5e1; font-size: 9px; font-weight: 800; }

        .view-more-reviews-button {
          width: 100%; margin-top: 15px; padding: 12px 13px; display: flex; align-items: center; gap: 12px;
          border: 1px solid rgba(37,99,235,.16); border-radius: 18px;
          background: linear-gradient(135deg, rgba(239,246,255,.95), rgba(236,254,255,.95));
          color: #2563eb; cursor: pointer; box-shadow: 0 10px 30px rgba(37,99,235,.07); transition: .25s ease;
        }
        .view-more-reviews-button:hover {
          border-color: rgba(37,99,235,.30); box-shadow: 0 15px 38px rgba(37,99,235,.12);
        }
        .view-more-reviews-icon {
          width: 39px; height: 39px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          border-radius: 12px; color: #2563eb; background: white; box-shadow: 0 5px 15px rgba(37,99,235,.08);
        }
        .view-more-reviews-content { flex: 1; min-width: 0; text-align: left; }
        .view-more-reviews-content strong { display: block; color: #1e40af; font-size: 11px; font-weight: 900; }
        .view-more-reviews-content small { display: block; margin-top: 2px; color: #64748b; font-size: 8px; font-weight: 700; }
        .view-more-reviews-arrow {
          width: 34px; height: 34px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          border-radius: 10px; color: white; background: linear-gradient(135deg, #2563eb, #0891b2);
        }
        .dark .view-more-reviews-button {
          background: linear-gradient(135deg, rgba(30,41,59,.92), rgba(8,47,73,.55));
          border-color: rgba(96,165,250,.18);
        }
        .dark .view-more-reviews-icon { background: rgba(15,23,42,.9); }
        .dark .view-more-reviews-content strong { color: #93c5fd; }
        .dark .view-more-reviews-content small { color: #94a3b8; }

        .reviews-loading {
          min-height: 260px; display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 12px; border-radius: 24px; background: rgba(255,255,255,.65); border: 1px solid #e2e8f0;
        }
        .reviews-loading-spinner { width: 35px; height: 35px; border: 3px solid #dbeafe; border-top-color: #2563eb; }
        .reviews-loading p { color: #64748b; font-size: 10px; font-weight: 700; }

        .reviews-empty { padding: 45px 20px; text-align: center; border-radius: 24px; background: rgba(255,255,255,.65); border: 1px dashed #cbd5e1; }
        .reviews-empty-icon { width: 62px; height: 62px; margin: auto; display: flex; align-items: center; justify-content: center; border-radius: 20px; color: #2563eb; background: #eff6ff; }
        .reviews-empty h3 { margin-top: 15px; color: #0f172a; font-size: 16px; font-weight: 900; }
        .reviews-empty p { margin-top: 5px; color: #94a3b8; font-size: 10px; }

        .all-reviews-overlay { position: fixed; inset: 0; z-index: 99998; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .all-reviews-backdrop { position: absolute; inset: 0; background: rgba(2,6,23,.78); backdrop-filter: blur(14px); }
        .all-reviews-modal {
          position: relative; z-index: 10; width: 100%; max-width: 900px; max-height: min(88vh, 850px);
          display: flex; flex-direction: column; overflow: hidden; border-radius: 30px;
          background: linear-gradient(145deg, rgba(255,255,255,.98), rgba(248,250,252,.98));
          border: 1px solid rgba(255,255,255,.9); box-shadow: 0 35px 100px rgba(0,0,0,.30);
        }
        .dark .all-reviews-modal {
          background: linear-gradient(145deg, #0f172a, #07111f);
          border-color: rgba(71,85,105,.65); box-shadow: 0 35px 100px rgba(0,0,0,.55);
        }

        .all-reviews-modal-header {
          position: relative; flex-shrink: 0; display: flex; align-items: flex-start; justify-content: space-between;
          gap: 18px; padding: 25px 25px 20px; border-bottom: 1px solid #e2e8f0;
        }
        .dark .all-reviews-modal-header { border-color: rgba(71,85,105,.45); }
        .all-reviews-modal-heading { display: flex; align-items: flex-start; gap: 13px; min-width: 0; }
        .all-reviews-modal-icon {
          width: 45px; height: 45px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          border-radius: 14px; color: #2563eb; background: linear-gradient(135deg, #eff6ff, #ecfeff); border: 1px solid #dbeafe;
        }
        .all-reviews-modal-label { display: flex; align-items: center; gap: 5px; color: #2563eb; font-size: 9px; font-weight: 900; letter-spacing: .14em; }
        .dark .all-reviews-modal-label { color: #60a5fa; }
        .all-reviews-modal-heading h2 { margin-top: 5px; color: #0f172a; font-size: 25px; line-height: 1.1; font-weight: 900; }
        .dark .all-reviews-modal-heading h2 { color: white; }
        .all-reviews-modal-heading p { margin-top: 5px; color: #64748b; font-size: 10px; line-height: 1.6; }
        .dark .all-reviews-modal-heading p { color: #94a3b8; }

        .all-reviews-close {
          width: 38px; height: 38px; flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          border-radius: 12px; border: 1px solid #e2e8f0; background: rgba(248,250,252,.9); color: #64748b; cursor: pointer; transition: .2s ease;
        }
        .all-reviews-close:hover { color: #dc2626; border-color: #fecaca; background: #fef2f2; transform: rotate(4deg); }
        .dark .all-reviews-close { background: rgba(30,41,59,.8); border-color: #334155; color: #94a3b8; }

        .all-reviews-summary {
          display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 10px;
          padding: 14px 25px; background: rgba(248,250,252,.75); border-bottom: 1px solid #e2e8f0;
        }
        .dark .all-reviews-summary { background: rgba(15,23,42,.55); border-color: rgba(71,85,105,.40); }
        .all-reviews-summary-item {
          display: flex; align-items: center; gap: 9px; padding: 10px 12px; border-radius: 14px;
          background: rgba(255,255,255,.8); border: 1px solid rgba(226,232,240,.8);
        }
        .dark .all-reviews-summary-item { background: rgba(30,41,59,.6); border-color: rgba(71,85,105,.45); }
        .all-reviews-summary-icon { width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 10px; }
        .all-reviews-summary-icon.blue { color: #2563eb; background: #eff6ff; }
        .all-reviews-summary-icon.amber { color: #f59e0b; background: #fffbeb; }
        .all-reviews-summary-icon.cyan { color: #0891b2; background: #ecfeff; }
        .all-reviews-summary-item strong { display: block; color: #0f172a; font-size: 15px; font-weight: 900; }
        .dark .all-reviews-summary-item strong { color: white; }
        .all-reviews-summary-item span { display: block; margin-top: 1px; color: #64748b; font-size: 8px; font-weight: 700; }
        .dark .all-reviews-summary-item span { color: #94a3b8; }

        .all-reviews-scroll {
          flex: 1; min-height: 0; overflow-y: auto; padding: 18px 25px 22px;
          overscroll-behavior: contain; scrollbar-width: thin; scrollbar-color: #93c5fd transparent;
        }
        .all-reviews-scroll::-webkit-scrollbar { width: 7px; }
        .all-reviews-scroll::-webkit-scrollbar-track { background: transparent; }
        .all-reviews-scroll::-webkit-scrollbar-thumb { border-radius: 999px; background: linear-gradient(180deg, #2563eb, #0891b2); }
        .all-reviews-scroll-inner { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 13px; }

        .review-modal-card {
          position: relative; padding: 17px; border-radius: 20px; background: rgba(255,255,255,.92);
          border: 1px solid rgba(226,232,240,.9); box-shadow: 0 10px 30px rgba(15,23,42,.055); transition: .25s ease;
        }
        .review-modal-card:hover {
          transform: translateY(-3px); border-color: rgba(37,99,235,.20); box-shadow: 0 18px 38px rgba(37,99,235,.09);
        }
        .dark .review-modal-card { background: rgba(15,23,42,.82); border-color: rgba(71,85,105,.55); }
        .review-modal-card-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
        .review-modal-card-number { color: #cbd5e1; font-size: 9px; font-weight: 900; }
        .dark .review-modal-card-number { color: #475569; }
        .review-modal-rating-row { display: flex; align-items: center; gap: 7px; margin-top: 12px; }
        .review-modal-rating-row span { color: #64748b; font-size: 9px; font-weight: 800; }
        .review-modal-card-text { margin-top: 10px; color: #475569; font-size: 11px; line-height: 1.8; }
        .dark .review-modal-card-text { color: #cbd5e1; }
        .review-modal-card-footer { margin-top: 12px; padding-top: 10px; border-top: 1px solid #f1f5f9; }
        .dark .review-modal-card-footer { border-color: rgba(71,85,105,.35); }
        .review-modal-card-footer span { display: inline-flex; align-items: center; gap: 5px; color: #94a3b8; font-size: 8px; font-weight: 700; }

        .all-reviews-modal-footer {
          flex-shrink: 0; display: flex; align-items: center; justify-content: space-between;
          gap: 12px; padding: 12px 25px; border-top: 1px solid #e2e8f0; background: rgba(248,250,252,.92);
        }
        .dark .all-reviews-modal-footer { background: rgba(15,23,42,.85); border-color: rgba(71,85,105,.45); }
        .all-reviews-modal-footer > div { display: flex; align-items: center; gap: 6px; color: #94a3b8; font-size: 8px; font-weight: 700; }
        .all-reviews-modal-footer > div svg { color: #0891b2; }
        .all-reviews-modal-footer button {
          display: inline-flex; align-items: center; justify-content: center; gap: 5px; padding: 8px 11px;
          border: none; border-radius: 10px; background: #eff6ff; color: #2563eb; font-size: 9px; font-weight: 850; cursor: pointer; transition: .2s ease;
        }
        .all-reviews-modal-footer button:hover { background: #dbeafe; }
        .dark .all-reviews-modal-footer button { background: rgba(37,99,235,.13); color: #60a5fa; }

        .reviews-cta {
          position: relative; overflow: hidden; padding: 78px 20px; text-align: center; color: white;
          background: linear-gradient(135deg, #1746d2, #2563eb 50%, #06b6d4);
        }
        .reviews-cta-icon {
          width: 58px; height: 58px; margin: auto; display: flex; align-items: center; justify-content: center;
          border-radius: 18px; background: rgba(255,255,255,.11); border: 1px solid rgba(255,255,255,.18); backdrop-filter: blur(16px);
        }
        .reviews-cta h2 { margin-top: 18px; font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.05; font-weight: 900; }
        .reviews-cta h2 span { display: block; color: #c7f9ff; }
        .reviews-cta > p { max-width: 600px; margin: 15px auto 0; color: rgba(255,255,255,.82); font-size: 14px; line-height: 1.8; }
        .reviews-cta-actions { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
        .reviews-cta-primary, .reviews-cta-secondary {
          min-height: 48px; display: inline-flex; align-items: center; justify-content: center;
          gap: 8px; padding: 0 17px; border-radius: 14px; text-decoration: none; font-size: 11px; font-weight: 850;
        }
        .reviews-cta-primary { color: #2563eb; background: white; box-shadow: 0 14px 32px rgba(0,0,0,.17); }
        .reviews-cta-secondary { color: white; background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.20); }
        .reviews-cta-orb { position: absolute; border-radius: 50%; filter: blur(45px); pointer-events: none; }
        .reviews-cta-orb.left { width: 260px; height: 260px; left: -100px; bottom: -130px; background: rgba(103,232,249,.15); }
        .reviews-cta-orb.right { width: 270px; height: 270px; right: -100px; top: -130px; background: rgba(255,255,255,.10); }

        .reviews-footer { padding: 45px 0 25px; background: linear-gradient(180deg, #05070d, #03050a); color: white; }
        .reviews-footer-content { text-align: center; }
        .reviews-footer-brand { display: inline-flex; align-items: center; gap: 10px; text-align: left; }
        .reviews-footer-icon {
          width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
          border-radius: 14px; color: #67e8f9; background: rgba(103,232,249,.08);
        }
        .reviews-footer-brand h2 { color: #67e8f9; font-size: 20px; font-weight: 900; }
        .reviews-footer-brand span { display: block; margin-top: 2px; color: #64748b; font-size: 9px; letter-spacing: .15em; text-transform: uppercase; }
        .reviews-footer-content > p { max-width: 600px; margin: 16px auto 0; color: #94a3b8; font-size: 11px; line-height: 1.8; }
        .reviews-footer-links { display: flex; justify-content: center; flex-wrap: wrap; gap: 16px; margin-top: 20px; }
        .reviews-footer-links a, .reviews-footer-links span { color: #64748b; font-size: 11px; text-decoration: none; transition: color .25s ease; }
        .reviews-footer-links a:hover, .reviews-footer-links .active { color: #60a5fa; }
        .reviews-footer-copy { margin-top: 22px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,.06); color: #475569; font-size: 10px; }

        .review-modal-overlay { position: fixed; inset: 0; z-index: 99999; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .review-modal-backdrop { position: absolute; inset: 0; background: rgba(5,7,13,.75); backdrop-filter: blur(12px); }
        .review-success-modal {
          position: relative; z-index: 10; width: 100%; max-width: 420px; padding: 32px; border-radius: 28px;
          background: linear-gradient(145deg, #0f172a, #0b1120); border: 1px solid rgba(103,232,249,.25);
          box-shadow: 0 25px 60px rgba(0,0,0,.5); text-align: center; color: white; overflow: hidden;
        }
        .review-modal-glow {
          position: absolute; top: -60px; left: 50%; transform: translateX(-50%);
          width: 180px; height: 180px; border-radius: 50%; background: rgba(37,99,235,.35); filter: blur(40px);
        }
        .review-modal-close {
          position: absolute; top: 18px; right: 18px; width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.12); color: #94a3b8;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
        }
        .review-success-icon {
          position: relative; width: 76px; height: 76px; margin: auto; display: flex; align-items: center; justify-content: center;
          border-radius: 24px; background: linear-gradient(135deg, rgba(37,99,235,.2), rgba(6,182,212,.2));
          border: 1px solid rgba(103,232,249,.3); color: #22d3ee;
        }
        .review-success-icon span { position: absolute; top: -6px; right: -6px; color: #38bdf8; }
        .review-success-tag {
          display: inline-flex; align-items: center; gap: 6px; margin-top: 20px; padding: 5px 12px;
          border-radius: 999px; background: rgba(34,211,238,.10); border: 1px solid rgba(34,211,238,.25);
          color: #22d3ee; font-size: 10px; font-weight: 800; text-transform: uppercase;
        }
        .review-success-modal h2 { margin-top: 14px; font-size: 25px; font-weight: 900; }
        .review-success-modal p { margin-top: 8px; color: #94a3b8; font-size: 12px; line-height: 1.7; }
        .review-modal-action {
          width: 100%; min-height: 48px; margin-top: 24px; border: none; border-radius: 14px;
          background: linear-gradient(135deg, #2563eb, #0891b2); color: white; font-size: 12px; font-weight: 850;
          display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;
        }

        @media (max-width: 950px) {
          .reviews-columns { grid-template-columns: 1fr; }
          .all-reviews-modal { max-width: 760px; }
          .all-reviews-scroll-inner { grid-template-columns: 1fr; }
        }

        @media (max-width: 700px) {
          .reviews-stat-grid { grid-template-columns: 1fr; }
          .all-reviews-summary { grid-template-columns: 1fr; }
          .all-reviews-summary-item { padding: 9px 11px; }
          .all-reviews-summary-item strong { font-size: 14px; }
        }

        @media (max-width: 640px) {
          .reviews-container { padding-left: 15px; padding-right: 15px; }
          .reviews-hero { padding: 75px 0 82px; }
          .reviews-hero-title { font-size: 3rem; }
          .reviews-hero-description { font-size: 13px; }
          .reviews-hero-pills { flex-direction: column; align-items: stretch; }
          .reviews-hero-pills span { justify-content: center; }
          .reviews-main { padding: 72px 0; }
          .review-form-card { padding: 22px; border-radius: 24px; }
          .reviews-list-header { flex-direction: column; }
          .reviews-count-badge { align-self: flex-start; }
          .review-rating-stars { justify-content: space-between; }
          .review-rating-star-button { width: 43px; height: 43px; }
          .reviews-cta { padding: 66px 15px; }
          .reviews-cta h2 { font-size: 2.15rem; }
          .reviews-cta-actions { flex-direction: column; }
          .reviews-cta-primary, .reviews-cta-secondary { width: 100%; }
          .review-success-modal { padding: 27px 21px; border-radius: 24px; }
          .all-reviews-overlay { padding: 10px; }
          .all-reviews-modal { max-height: 94vh; border-radius: 24px; }
          .all-reviews-modal-header { padding: 18px 17px 15px; }
          .all-reviews-modal-icon { width: 40px; height: 40px; }
          .all-reviews-modal-heading { gap: 10px; }
          .all-reviews-modal-heading h2 { font-size: 20px; }
          .all-reviews-modal-heading p { font-size: 9px; }
          .all-reviews-close { width: 34px; height: 34px; }
          .all-reviews-summary { padding: 10px 17px; gap: 7px; }
          .all-reviews-summary-item { padding: 8px 10px; }
          .all-reviews-summary-icon { width: 30px; height: 30px; }
          .all-reviews-scroll { padding: 14px 17px 18px; }
          .all-reviews-scroll-inner { gap: 10px; }
          .review-modal-card { padding: 15px; }
          .all-reviews-modal-footer { padding: 10px 17px; }
          .all-reviews-modal-footer > div span { font-size: 7px; }
          .all-reviews-modal-footer button { padding: 7px 9px; }
        }

        @media (max-width: 390px) {
          .reviews-container { padding-left: 12px; padding-right: 12px; }
          .reviews-hero-title { font-size: 2.65rem; }
          .review-form-card { padding: 19px; }
          .review-form-header h2 { font-size: 25px; }
          .review-form-icon { width: 40px; height: 40px; }
          .review-rating-box { padding: 14px; }
          .review-rating-star-button { width: 39px; height: 39px; }
          .review-rating-star-button svg { width: 25px; height: 25px; }
          .view-more-reviews-button { padding: 10px; gap: 9px; }
          .view-more-reviews-icon { width: 36px; height: 36px; }
          .view-more-reviews-arrow { width: 31px; height: 31px; }
          .all-reviews-modal-heading h2 { font-size: 18px; }
        }
      `}</style>
    </div>
  );
}