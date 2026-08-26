package com.Website.wellborn.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Temporary admin signup state.
 * No admin account is created until email OTP and medical secret code pass.
 */
@Entity
@Table(
        name = "pending_admin_signup",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_pending_admin_signup_email",
                columnNames = "email"
        )
)
@Getter
@Setter
@NoArgsConstructor
public class PendingAdminSignup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 320)
    private String email;

    @Column(nullable = false, length = 120)
    private String adminName;

    @Column(nullable = false, length = 30)
    private String phone;

    // SHA-256 hash of the OTP. Never store the raw OTP.
    @Column(length = 64)
    private String otpHash;

    private LocalDateTime otpExpiry;
    private LocalDateTime otpCreatedAt;

    @Column(nullable = false)
    private int otpAttempts = 0;

    private LocalDateTime otpVerifiedAt;

    // SHA-256 hash of the temporary signup completion token.
    @Column(length = 64)
    private String signupTokenHash;

    private LocalDateTime signupTokenExpiry;

    @Column(nullable = false)
    private int secretCodeAttempts = 0;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
