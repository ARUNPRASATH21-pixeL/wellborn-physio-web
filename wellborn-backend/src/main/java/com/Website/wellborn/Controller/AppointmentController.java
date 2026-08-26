package com.Website.wellborn.Controller;

import com.Website.wellborn.Dto.AppointmentDto;
import com.Website.wellborn.Dto.AppointmentRespDto;
import com.Website.wellborn.Service.AppointmentService;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/appointment")
@CrossOrigin(origins = "*")
public class AppointmentController {

	private final AppointmentService appointmentService;

	public AppointmentController(AppointmentService appointmentService) {
		this.appointmentService = appointmentService;
	}

	@GetMapping("/booked-times")
	public ResponseEntity<List<LocalTime>> getBookedTimes(
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
		List<LocalTime> bookedTimes = appointmentService.getBookedTimes(date);
		return ResponseEntity.ok(bookedTimes);
	}
	
	// =========================================================
	// BOOK
	// =========================================================

	@PostMapping("/book")
	public ResponseEntity<AppointmentRespDto> bookAppointment(@RequestBody AppointmentDto request) {

		return ResponseEntity.ok(appointmentService.bookAppointment(request));
	}

	// =========================================================
	// UPDATE
	// =========================================================

	@PutMapping("/update/{appointmentId}")
	public ResponseEntity<AppointmentRespDto> updateAppointment(@PathVariable Long appointmentId,
			@RequestBody AppointmentDto request) {

		return ResponseEntity.ok(appointmentService.updateAppointment(appointmentId, request));
	}

	// =========================================================
	// GET ALL
	// =========================================================

	@GetMapping("/getall")
	public ResponseEntity<List<AppointmentRespDto>> getAllAppointments() {

		return ResponseEntity.ok(appointmentService.getAllAppointments());
	}

	// =========================================================
	// GET ONE
	// =========================================================

	@GetMapping("/get/{appointmentId}")
	public ResponseEntity<AppointmentRespDto> getAppointment(@PathVariable Long appointmentId) {

		return ResponseEntity.ok(appointmentService.getAppointmentById(appointmentId));
	}

	// =========================================================
	// DELETE
	// =========================================================

	@DeleteMapping("/delete/{appointmentId}")
	public ResponseEntity<String> deleteAppointment(@PathVariable Long appointmentId) {

		appointmentService.deleteAppointment(appointmentId);

		return ResponseEntity.ok("Appointment deleted successfully");
	}

	// =========================================================
	// MANUAL AUTO-COMPLETE TRIGGER
	// =========================================================

	@PutMapping("/auto-complete")
	public ResponseEntity<String> autoCompleteAppointments() {

		appointmentService.autoCompleteAppointments();

		return ResponseEntity.ok("Appointment auto-complete process executed successfully");
	}
}