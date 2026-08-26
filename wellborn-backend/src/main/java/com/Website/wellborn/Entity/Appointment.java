package com.Website.wellborn.Entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "appointments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long appointmentId;

    // Patient details
    private String patientName;

    private String phone;

    private String email;

    // Appointment date
    private LocalDate appointmentDate;

    // User selected appointment time
    private LocalTime appointmentTime;

    // Age category
    private String ageCategory;

    // Patient problem/message
    private String message;

    // PENDING / CONFIRMED / COMPLETED / CANCELLED
    private String status;

    // Created / updated time
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Physio service
    @ManyToOne
    @JoinColumn(name = "service_id")
    private PhysioService service;

  
}