package com.Website.wellborn.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.Website.wellborn.Dto.PhysioServiceDto;
import com.Website.wellborn.Dto.PhysioServiceResp;
import com.Website.wellborn.Service.PhysioServicesManagementService;

@RestController
@RequestMapping("/service")
@CrossOrigin("*")
public class PhysioServiceController {

	@Autowired
	private PhysioServicesManagementService service;

	// ================================
	// ADD SERVICE
	// ================================

	@PostMapping(value = "/add", consumes = "multipart/form-data")
	public PhysioServiceResp addService(

			@RequestParam("serviceName") String serviceName,

			@RequestParam("description") String description,

			@RequestParam(value = "status", defaultValue = "true") Boolean status,

			@RequestPart(value = "image", required = false) MultipartFile image) {

		PhysioServiceDto request = new PhysioServiceDto();

		request.setServiceName(serviceName);
		request.setDescription(description);
		request.setStatus(status);

		return service.addService(request, image);
	}

	// ================================
	// UPDATE SERVICE
	// ================================

	@PutMapping(value = "/update/{serviceId}", consumes = "multipart/form-data")
	public PhysioServiceResp updateService(

			@PathVariable Long serviceId,

			@RequestParam("serviceName") String serviceName,

			@RequestParam("description") String description,

			@RequestParam(value = "status", defaultValue = "true") Boolean status,

			@RequestPart(value = "image", required = false) MultipartFile image) {

		PhysioServiceDto request = new PhysioServiceDto();

		request.setServiceName(serviceName);
		request.setDescription(description);
		request.setStatus(status);

		return service.updateService(serviceId, request, image);
	}

	// ================================
	// DELETE SERVICE
	// ================================

	@DeleteMapping("/delete/{serviceId}")
	public String deleteService(@PathVariable Long serviceId) {

		service.deleteService(serviceId);

		return "Service Deleted Successfully";
	}

	// ================================
	// GET BY ID
	// ================================

	@GetMapping("/get/{serviceId}")
	public PhysioServiceResp getServiceById(@PathVariable Long serviceId) {

		return service.getServiceById(serviceId);
	}

	// ================================
	// GET ALL
	// ================================

	@GetMapping("/getall")
	public List<PhysioServiceResp> getAllServices() {

		return service.getAllServices();
	}
}