package com.Website.wellborn.Dto;

import java.time.LocalDate;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDto {

    private String patientName;

    private String phone;

    private String email;

    private LocalDate appointmentDate;

    private LocalTime appointmentTime;

    private String ageCategory;

    private String message;

    private Long serviceId;

    private String serviceName;

    private String status;

    // FCM token of the user who is booking
    private String fcmToken;
}