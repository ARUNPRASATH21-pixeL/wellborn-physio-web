package com.Website.wellborn.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin")
@Data
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long adminId;

    private String adminName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String role;

    private String phone;

    private String address;

    // Password reset token - HASH ONLY
    private String resetToken;

    private LocalDateTime resetTokenExpiry;

    @Column(nullable = false)
    private boolean emailVerified = false;

    // OTP HASH ONLY
    private String emailVerificationOtpHash;

    private LocalDateTime emailVerificationOtpExpiry;

    private LocalDateTime emailVerificationOtpCreatedAt;

    @Column(nullable = false)
    private int emailVerificationOtpAttempts = 0;

    private LocalDateTime createdAt;
}