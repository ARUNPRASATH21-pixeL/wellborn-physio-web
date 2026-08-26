package com.Website.wellborn.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import lombok.Data;

@Entity
@Table(name = "contact")
@Data
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long contactId;

    private String name;

    private String email;

    private String phone;

    private String subject;

    @Column(length = 1000)
    private String message;

    private LocalDateTime createdAt;

    // ==============================
    // ADMIN MESSAGE STATUS
    // ==============================

    private String status;

    // ==============================
    // MESSAGE PRIORITY
    // ==============================

    private String priority;

    // ==============================
    // READ / REPLY TRACKING
    // ==============================

    private LocalDateTime readAt;

    private LocalDateTime repliedAt;

    // ==============================
    // ADMIN NOTE
    // ==============================

    @Column(length = 1000)
    private String adminNote;
}