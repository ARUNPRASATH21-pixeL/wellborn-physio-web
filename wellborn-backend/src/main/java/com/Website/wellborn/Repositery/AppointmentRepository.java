package com.Website.wellborn.Repositery;

import com.Website.wellborn.Entity.Appointment;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    // =========================================================
    // GET ALL - LATEST APPOINTMENTS FIRST
    // =========================================================

    List<Appointment> findAllByOrderByAppointmentDateDesc();

    // =========================================================
    // APPOINTMENT STATUS COUNTS
    // =========================================================

    long countByStatusIgnoreCase(String status);

    // =========================================================
    // CHECK SAME DATE + SAME TIME
    // 1 TIME SLOT = 1 APPOINTMENT
    // =========================================================

    boolean existsByAppointmentDateAndAppointmentTimeAndStatusIn(
            LocalDate appointmentDate,
            LocalTime appointmentTime,
            List<String> statuses
    );

    // =========================================================
    // FIND EXPIRED PENDING / CONFIRMED APPOINTMENTS
    // =========================================================

    @Query("""
        SELECT a
        FROM Appointment a
        WHERE
            (
                a.appointmentDate < :today
                OR (
                    a.appointmentDate = :today
                    AND a.appointmentTime < :currentTime
                )
            )
            AND UPPER(a.status) IN ('PENDING', 'CONFIRMED')
    """)
    List<Appointment> findExpiredAppointments(
            @Param("today") LocalDate today,
            @Param("currentTime") LocalTime currentTime
    );

	List<Appointment> findByAppointmentDateAndAppointmentTime(LocalDate appointmentDate, LocalTime appointmentTime);

	List<Appointment> findAllByAppointmentDate(LocalDate appointmentDate);
}