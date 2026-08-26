package com.Website.wellborn.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(
    name = "fcm_tokens",
    indexes = {
        @Index(name = "idx_fcm_role", columnList = "role")
    }
)
@Data
public class FcmToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
        name = "token",
        nullable = false,
        unique = true,
        length = 1000
    )
    private String token;

    @Column(
        name = "role",
        nullable = false,
        length = 20
    )
    private String role;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public FcmToken() {
    }

    @PrePersist
    protected void onCreate() {

        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {

        updatedAt = LocalDateTime.now();
    }
}