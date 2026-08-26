package com.Website.wellborn.ServiceImpl;

import com.Website.wellborn.Dto.ReviewDto;
import com.Website.wellborn.Dto.ReviewRespDto;
import com.Website.wellborn.Entity.Review;
import com.Website.wellborn.Repositery.ReviewRepository;
import com.Website.wellborn.Service.NotificationService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;

@Service
@Transactional
public class ReviewServiceImpl {

    private final ReviewRepository repo;
    private final NotificationService notificationService;

    // Same pattern used on the frontend
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    private static final int NAME_MAX_LENGTH = 100;
    private static final int EMAIL_MAX_LENGTH = 150;
    private static final int REVIEW_MIN_LENGTH = 10;
    private static final int REVIEW_MAX_LENGTH = 2000;
    private static final int FCM_TOKEN_MAX_LENGTH = 4096;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public ReviewServiceImpl(
            ReviewRepository repo,
            NotificationService notificationService) {

        this.repo = repo;
        this.notificationService = notificationService;
    }

    // =========================================================
    // ENTITY -> RESPONSE DTO
    // =========================================================

    private ReviewRespDto out(Review x) {

        ReviewRespDto d = new ReviewRespDto();

        d.setReviewId(x.getReviewId());
        d.setPatientName(x.getPatientName());
        d.setEmail(x.getEmail());
        d.setRating(x.getRating());
        d.setReviewText(x.getReviewText());
        d.setStatus(x.getStatus());
        d.setCreatedAt(x.getCreatedAt());
        d.setUpdatedAt(x.getUpdatedAt());

        return d;
    }

    // =========================================================
    // SAVE NEW REVIEW (USER ACTION)
    // =========================================================

    @Transactional
    public ReviewRespDto save(ReviewDto r) {

        if (r == null) {
            throw new IllegalArgumentException(
                    "Review data is required"
            );
        }

        // =====================================================
        // PATIENT NAME
        // =====================================================

        if (r.getPatientName() == null
                || r.getPatientName().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Patient name is required"
            );
        }

        String patientName = r.getPatientName().trim();

        if (patientName.length() < 2) {

            throw new IllegalArgumentException(
                    "Please enter a valid name"
            );
        }

        if (patientName.length() > NAME_MAX_LENGTH) {

            throw new IllegalArgumentException(
                    "Patient name must be under "
                            + NAME_MAX_LENGTH
                            + " characters"
            );
        }

        // =====================================================
        // EMAIL
        // =====================================================

        if (r.getEmail() == null
                || r.getEmail().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Email address is required"
            );
        }

        String email = r.getEmail().trim();

        if (email.length() > EMAIL_MAX_LENGTH) {

            throw new IllegalArgumentException(
                    "Email must be under "
                            + EMAIL_MAX_LENGTH
                            + " characters"
            );
        }

        if (!EMAIL_PATTERN.matcher(email).matches()) {

            throw new IllegalArgumentException(
                    "Please enter a valid email address"
            );
        }

        // =====================================================
        // RATING
        // =====================================================

        if (r.getRating() == null
                || r.getRating() < 1
                || r.getRating() > 5) {

            throw new IllegalArgumentException(
                    "Rating must be 1 to 5"
            );
        }

        // =====================================================
        // REVIEW TEXT
        // =====================================================

        if (r.getReviewText() == null
                || r.getReviewText().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Review text is required"
            );
        }

        String reviewText = r.getReviewText().trim();

        if (reviewText.length() < REVIEW_MIN_LENGTH) {

            throw new IllegalArgumentException(
                    "Review must be at least "
                            + REVIEW_MIN_LENGTH
                            + " characters"
            );
        }

        if (reviewText.length() > REVIEW_MAX_LENGTH) {

            throw new IllegalArgumentException(
                    "Review must be under "
                            + REVIEW_MAX_LENGTH
                            + " characters"
            );
        }

        // =====================================================
        // BUILD REVIEW ENTITY
        // =====================================================

        Review x = Review.builder()
                .patientName(patientName)
                .email(email)
                .rating(r.getRating())
                .reviewText(reviewText)
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // =====================================================
        // SAVE REVIEW
        // =====================================================

        Review saved = repo.save(x);

        // =====================================================
        // SEND NOTIFICATIONS
        // =====================================================

        // 1. ADMIN FCM NOTIFICATION (Notify all admins about new review)
        try {

            String adminTitle =
                    "New Review Submitted ⭐";

            String adminMessage =
                    saved.getPatientName()
                            + " left a "
                            + saved.getRating()
                            + "-star review: \""
                            + shorten(
                                    saved.getReviewText(),
                                    80
                            )
                            + "\"";

            notificationService.sendToAllAdmins(
                    adminTitle,
                    adminMessage,
                    "REVIEW_SUBMITTED"
            );

        } catch (Exception e) {
            System.err.println(
                    "Admin review notification failed: "
                            + e.getMessage()
            );
        }

        // 2. USER FCM NOTIFICATION (Confirmation sent to user)
        sendUserReviewNotification(saved, r.getFcmToken());

        return out(saved);
    }

    // =========================================================
    // SEND USER REVIEW NOTIFICATION
    // =========================================================

    private void sendUserReviewNotification(Review saved, String fcmToken) {
        try {

            if (fcmToken != null && !fcmToken.trim().isEmpty()) {

                String trimmedToken = fcmToken.trim();

                if (trimmedToken.length() > FCM_TOKEN_MAX_LENGTH) {
                    System.err.println("⚠️ Rejected oversized FCM token on review submission");
                    return;
                }

                String userTitle = "Feedback Received! 📝";
                String userMessage = "Thank you, "
                        + saved.getPatientName()
                        + "! Your review has been submitted successfully.";

                notificationService.sendToToken(
                        trimmedToken,
                        userTitle,
                        userMessage,
                        "REVIEW_CONFIRMATION"
                );

                System.out.println("✅ User review notification sent");
            }

        } catch (Exception e) {
            System.err.println(
                    "User FCM review notification failed: "
                            + e.getMessage()
            );
        }
    }

    // =========================================================
    // SHORTEN REVIEW TEXT
    // =========================================================

    private String shorten(String text, int max) {

        if (text == null) {
            return "";
        }

        return text.length() <= max
                ? text
                : text.substring(0, max) + "...";
    }

    // =========================================================
    // GET ALL REVIEWS
    // =========================================================

    @Transactional(readOnly = true)
    public List<ReviewRespDto> all() {

        return repo
                .findAllByOrderByCreatedAtDesc()
                .stream()
                .map(this::out)
                .toList();
    }

    // =========================================================
    // GET APPROVED REVIEWS
    // =========================================================

    @Transactional(readOnly = true)
    public List<ReviewRespDto> approved() {

        return repo
                .findByStatusOrderByCreatedAtDesc("APPROVED")
                .stream()
                .map(this::out)
                .toList();
    }

    // =========================================================
    // UPDATE REVIEW STATUS (ADMIN ONLY - NO USER PUSH SENT)
    // =========================================================

    @Transactional
    public ReviewRespDto update(Long id, String status) {

        if (id == null) {

            throw new IllegalArgumentException(
                    "Review ID is required"
            );
        }

        if (status == null
                || status.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Status is required"
            );
        }

        String normalizedStatus =
                status.trim().toUpperCase();

        if (!List.of(
                "PENDING",
                "APPROVED",
                "REJECTED"
        ).contains(normalizedStatus)) {

            throw new IllegalArgumentException(
                    "Invalid status. Allowed values: PENDING, APPROVED, REJECTED"
            );
        }

        Review x = repo
                .findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Review not found with ID: " + id
                        )
                );

        x.setStatus(normalizedStatus);
        x.setUpdatedAt(LocalDateTime.now());

        Review updated = repo.save(x);

        // Notify Admin only about status update (User is NOT disturbed)
        try {
            notificationService.sendToAllAdmins(
                    "Review Status Updated",
                    "Review from " + updated.getPatientName() + " has been marked as " + normalizedStatus,
                    "REVIEW_STATUS_UPDATED"
            );
        } catch (Exception e) {
            System.err.println("Admin review status notification failed: " + e.getMessage());
        }

        return out(updated);
    }

    // =========================================================
    // DELETE REVIEW
    // =========================================================

    @Transactional
    public void delete(Long id) {

        if (id == null) {

            throw new IllegalArgumentException(
                    "Review ID is required"
            );
        }

        if (!repo.existsById(id)) {

            throw new IllegalArgumentException(
                    "Review not found with ID: " + id
            );
        }

        repo.deleteById(id);
    }
}