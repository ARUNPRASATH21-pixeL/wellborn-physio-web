package com.Website.wellborn.Dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentRespDto {

    private Long appointmentId;

    private String patientName;

    private String phone;

    private String email;

    private LocalDate appointmentDate;

    private LocalTime appointmentTime;

    private String ageCategory;

    private String message;

    private String status;

    private String serviceName;

    private LocalDateTime createdAt;
}