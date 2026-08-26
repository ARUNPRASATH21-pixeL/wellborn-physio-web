package com.Website.wellborn.Service;

import com.Website.wellborn.Dto.AppointmentDto;
import com.Website.wellborn.Dto.AppointmentRespDto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentService {

    // =========================================================
    // BOOK APPOINTMENT
    // =========================================================

    AppointmentRespDto bookAppointment(
            AppointmentDto request
    );

    // =========================================================
    // UPDATE APPOINTMENT
    // =========================================================

    AppointmentRespDto updateAppointment(
            Long appointmentId,
            AppointmentDto request
    );

    // =========================================================
    // GET ALL APPOINTMENTS
    // =========================================================

    List<AppointmentRespDto> getAllAppointments();

    // =========================================================
    // GET APPOINTMENT BY ID
    // =========================================================

    AppointmentRespDto getAppointmentById(
            Long appointmentId
    );

    // =========================================================
    // DELETE APPOINTMENT
    // =========================================================

    void deleteAppointment(
            Long appointmentId
    );

    // =========================================================
    // AUTO COMPLETE APPOINTMENTS
    // =========================================================
    //
    // PENDING / CONFIRMED
    //        ↓
    // Appointment date + time passed
    //        ↓
    // COMPLETED
    //
    // Uses India time (Asia/Kolkata)
    // =========================================================

    void autoCompleteAppointments();

	List<LocalTime> getBookedTimes(LocalDate appointmentDate);
}