package com.Website.wellborn.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.Website.wellborn.Dto.DoctorDto;
import com.Website.wellborn.Dto.DoctorRespDto;
import com.Website.wellborn.Service.DoctorService;

@RestController
@RequestMapping("/doctor")
@CrossOrigin("*")
public class DoctorController {

	@Autowired
	private DoctorService doctorService;

	// =========================================================
	// ADD DOCTOR
	// =========================================================

	@PostMapping(value = "/add", consumes = "multipart/form-data")
	public DoctorRespDto addDoctor(

			@RequestParam("doctorName") String doctorName,

			@RequestParam("qualification") String qualification,

			@RequestParam("specialization") String specialization,

			@RequestParam("experience") String experience,

			@RequestParam("phone") String phone,

			@RequestParam("email") String email,

			@RequestParam(value = "status", defaultValue = "true") Boolean status,

			@RequestPart(value = "image", required = false) MultipartFile image) {

		DoctorDto request = new DoctorDto();

		request.setDoctorName(doctorName);

		request.setQualification(qualification);

		request.setSpecialization(specialization);

		request.setExperience(experience);

		request.setPhone(phone);

		request.setEmail(email);

		request.setStatus(status);

		return doctorService.addDoctor(request, image);
	}

	// =========================================================
	// UPDATE DOCTOR
	// =========================================================

	@PutMapping(value = "/update/{doctorId}", consumes = "multipart/form-data")
	public DoctorRespDto updateDoctor(

			@PathVariable Long doctorId,

			@RequestParam("doctorName") String doctorName,

			@RequestParam("qualification") String qualification,

			@RequestParam("specialization") String specialization,

			@RequestParam("experience") String experience,

			@RequestParam("phone") String phone,

			@RequestParam("email") String email,

			@RequestParam(value = "status", defaultValue = "true") Boolean status,

			@RequestPart(value = "image", required = false) MultipartFile image) {

		DoctorDto request = new DoctorDto();

		request.setDoctorName(doctorName);

		request.setQualification(qualification);

		request.setSpecialization(specialization);

		request.setExperience(experience);

		request.setPhone(phone);

		request.setEmail(email);

		request.setStatus(status);

		return doctorService.updateDoctor(doctorId, request, image);
	}

	// =========================================================
	// DELETE DOCTOR
	// =========================================================

	@DeleteMapping("/delete/{doctorId}")
	public String deleteDoctor(@PathVariable Long doctorId) {

		doctorService.deleteDoctor(doctorId);

		return "Doctor Deleted Successfully";
	}

	// =========================================================
	// GET DOCTOR BY ID
	// =========================================================

	@GetMapping("/get/{doctorId}")
	public DoctorRespDto getDoctorById(@PathVariable Long doctorId) {

		return doctorService.getDoctorById(doctorId);
	}

	// =========================================================
	// GET ALL DOCTORS
	// =========================================================

	@GetMapping("/getall")
	public List<DoctorRespDto> getAllDoctors() {

		return doctorService.getAllDoctors();
	}
}