package com.Website.wellborn.ServiceImpl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.Website.wellborn.Dto.PhysioServiceDto;
import com.Website.wellborn.Dto.PhysioServiceResp;
import com.Website.wellborn.Entity.PhysioService;
import com.Website.wellborn.Repositery.PhysioServiceRepositery;
import com.Website.wellborn.Service.PhysioServicesManagementService;


@Service
public class ServiceManagementServiceImpl implements PhysioServicesManagementService {

	@Autowired
	private PhysioServiceRepositery serviceRepository;

	// =========================================================
	// UPLOAD DIRECTORY
	// =========================================================

	private final Path uploadDirectory = Paths.get("uploads/services");

	// =========================================================
	// ADD SERVICE
	// =========================================================

	@Override
	public PhysioServiceResp addService(PhysioServiceDto request, MultipartFile image) {

		if (request == null) {
			throw new IllegalArgumentException("Service data cannot be null");
		}

		PhysioService service = new PhysioService();

		service.setServiceName(request.getServiceName());

		service.setDescription(request.getDescription());

		// =====================================================
		// IMAGE UPLOAD
		// =====================================================

		if (image != null && !image.isEmpty()) {

			String imagePath = saveImage(image);

			service.setImage(imagePath);

		} else {

			service.setImage(null);
		}

		// =====================================================
		// STATUS
		// =====================================================

		if (request.getStatus() != null) {

			service.setStatus(request.getStatus());

		} else {

			service.setStatus(true);
		}

		// =====================================================
		// SAVE DATABASE
		// =====================================================

		PhysioService savedService = serviceRepository.save(service);

		return createResponse(savedService, "Service Added Successfully");
	}

	// =========================================================
	// UPDATE SERVICE
	// =========================================================

	@Override
	public PhysioServiceResp updateService(Long serviceId, PhysioServiceDto request, MultipartFile image) {

		if (serviceId == null) {

			throw new IllegalArgumentException("Service ID cannot be null");
		}

		if (request == null) {

			throw new IllegalArgumentException("Service data cannot be null");
		}

		PhysioService service = serviceRepository.findById(serviceId)
				.orElseThrow(() -> new RuntimeException("Service Not Found with ID: " + serviceId));

		// =====================================================
		// SERVICE NAME
		// =====================================================

		if (request.getServiceName() != null) {

			service.setServiceName(request.getServiceName());
		}

		// =====================================================
		// DESCRIPTION
		// =====================================================

		if (request.getDescription() != null) {

			service.setDescription(request.getDescription());
		}

		// =====================================================
		// STATUS
		// =====================================================

		if (request.getStatus() != null) {

			service.setStatus(request.getStatus());
		}

		// =====================================================
		// NEW IMAGE
		// =====================================================

		if (image != null && !image.isEmpty()) {

			// Delete old image
			deleteOldImage(service.getImage());

			// Save new image
			String newImagePath = saveImage(image);

			service.setImage(newImagePath);
		}

		// =====================================================
		// SAVE
		// =====================================================

		PhysioService updatedService = serviceRepository.save(service);

		return createResponse(updatedService, "Service Updated Successfully");
	}

	// =========================================================
	// DELETE SERVICE
	// =========================================================

	@Override
	public void deleteService(Long serviceId) {

		if (serviceId == null) {

			throw new IllegalArgumentException("Service ID cannot be null");
		}

		PhysioService service = serviceRepository.findById(serviceId)
				.orElseThrow(() -> new RuntimeException("Service Not Found with ID: " + serviceId));

		// Delete image
		deleteOldImage(service.getImage());

		// Delete database record
		serviceRepository.delete(service);
	}

	// =========================================================
	// GET SERVICE BY ID
	// =========================================================

	@Override
	public PhysioServiceResp getServiceById(Long serviceId) {

		if (serviceId == null) {

			throw new IllegalArgumentException("Service ID cannot be null");
		}

		PhysioService service = serviceRepository.findById(serviceId)
				.orElseThrow(() -> new RuntimeException("Service Not Found with ID: " + serviceId));

		return createResponse(service, null);
	}

	// =========================================================
	// GET ALL SERVICES
	// =========================================================

	@Override
	public List<PhysioServiceResp> getAllServices() {

		List<PhysioService> services = serviceRepository.findAll();

		List<PhysioServiceResp> responseList = new ArrayList<>();

		for (PhysioService service : services) {

			responseList.add(createResponse(service, null));
		}

		return responseList;
	}

	// =========================================================
	// SAVE IMAGE
	// =========================================================

	private String saveImage(MultipartFile image) {

		try {

			// Create folder
			if (!Files.exists(uploadDirectory)) {

				Files.createDirectories(uploadDirectory);
			}

			// =================================================
			// ORIGINAL FILE NAME
			// =================================================

			String originalFileName = image.getOriginalFilename();

			// =================================================
			// EXTENSION
			// =================================================

			String extension = "";

			if (originalFileName != null && originalFileName.contains(".")) {

				extension = originalFileName.substring(originalFileName.lastIndexOf("."));
			}

			// =================================================
			// UNIQUE FILE NAME
			// =================================================

			String fileName = UUID.randomUUID() + extension;

			// =================================================
			// FILE PATH
			// =================================================

			Path filePath = uploadDirectory.resolve(fileName);

			// =================================================
			// SAVE
			// =================================================

			Files.copy(image.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

			// =================================================
			// DATABASE PATH
			// =================================================

			return "/uploads/services/" + fileName;

		} catch (IOException e) {

			throw new RuntimeException("Image upload failed", e);
		}
	}

	// =========================================================
	// DELETE OLD IMAGE
	// =========================================================

	private void deleteOldImage(String imagePath) {

		if (imagePath == null || imagePath.trim().isEmpty()) {

			return;
		}

		try {

			String fileName = imagePath.substring(imagePath.lastIndexOf("/") + 1);

			Path filePath = uploadDirectory.resolve(fileName);

			Files.deleteIfExists(filePath);

		} catch (Exception e) {

			System.out.println("Old image delete failed: " + e.getMessage());
		}
	}

	// =========================================================
	// COMMON RESPONSE
	// =========================================================

	private PhysioServiceResp createResponse(PhysioService service, String message) {

		PhysioServiceResp response = new PhysioServiceResp();

		response.setServiceId(service.getServiceId());

		response.setServiceName(service.getServiceName());

		response.setDescription(service.getDescription());

		response.setImage(service.getImage());

		response.setStatus(service.getStatus());

		response.setMessage(message);

		return response;
	}
}