package com.Website.wellborn.ServiceImpl;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.Website.wellborn.Dto.PhysioServiceDto;
import com.Website.wellborn.Dto.PhysioServiceResp;
import com.Website.wellborn.Entity.PhysioService;
import com.Website.wellborn.Repositery.PhysioServiceRepositery;
import com.Website.wellborn.Service.PhysioServicesManagementService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
public class ServiceManagementServiceImpl
        implements PhysioServicesManagementService {

    @Autowired
    private PhysioServiceRepositery serviceRepository;

    @Autowired
    private Cloudinary cloudinary;

    // =========================================================
    // ADD SERVICE
    // =========================================================

    @Override
    public PhysioServiceResp addService(
            PhysioServiceDto request,
            MultipartFile image) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Service data cannot be null"
            );
        }

        PhysioService service =
                new PhysioService();

        service.setServiceName(
                request.getServiceName()
        );

        service.setDescription(
                request.getDescription()
        );

        // =====================================================
        // IMAGE UPLOAD
        // =====================================================

        if (image != null && !image.isEmpty()) {

            String imageUrl =
                    saveImage(image);

            service.setImage(imageUrl);

        } else {

            service.setImage(null);
        }

        // =====================================================
        // STATUS
        // =====================================================

        if (request.getStatus() != null) {

            service.setStatus(
                    request.getStatus()
            );

        } else {

            service.setStatus(true);
        }

        // =====================================================
        // SAVE DATABASE
        // =====================================================

        PhysioService savedService =
                serviceRepository.save(service);

        return createResponse(
                savedService,
                "Service Added Successfully"
        );
    }

    // =========================================================
    // UPDATE SERVICE
    // =========================================================

    @Override
    public PhysioServiceResp updateService(
            Long serviceId,
            PhysioServiceDto request,
            MultipartFile image) {

        if (serviceId == null) {

            throw new IllegalArgumentException(
                    "Service ID cannot be null"
            );
        }

        if (request == null) {

            throw new IllegalArgumentException(
                    "Service data cannot be null"
            );
        }

        PhysioService service =
                serviceRepository.findById(serviceId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Service Not Found with ID: "
                                        + serviceId
                        )
                );

        // =====================================================
        // SERVICE NAME
        // =====================================================

        if (request.getServiceName() != null) {

            service.setServiceName(
                    request.getServiceName()
            );
        }

        // =====================================================
        // DESCRIPTION
        // =====================================================

        if (request.getDescription() != null) {

            service.setDescription(
                    request.getDescription()
            );
        }

        // =====================================================
        // STATUS
        // =====================================================

        if (request.getStatus() != null) {

            service.setStatus(
                    request.getStatus()
            );
        }

        // =====================================================
        // NEW IMAGE
        // =====================================================

        if (image != null && !image.isEmpty()) {

            String newImageUrl =
                    saveImage(image);

            service.setImage(
                    newImageUrl
            );
        }

        // =====================================================
        // SAVE
        // =====================================================

        PhysioService updatedService =
                serviceRepository.save(service);

        return createResponse(
                updatedService,
                "Service Updated Successfully"
        );
    }

    // =========================================================
    // DELETE SERVICE
    // =========================================================

    @Override
    public void deleteService(
            Long serviceId) {

        if (serviceId == null) {

            throw new IllegalArgumentException(
                    "Service ID cannot be null"
            );
        }

        PhysioService service =
                serviceRepository.findById(serviceId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Service Not Found with ID: "
                                        + serviceId
                        )
                );

        // =====================================================
        // DELETE DATABASE RECORD
        // =====================================================

        serviceRepository.delete(service);
    }

    // =========================================================
    // GET SERVICE BY ID
    // =========================================================

    @Override
    public PhysioServiceResp getServiceById(
            Long serviceId) {

        if (serviceId == null) {

            throw new IllegalArgumentException(
                    "Service ID cannot be null"
            );
        }

        PhysioService service =
                serviceRepository.findById(serviceId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Service Not Found with ID: "
                                        + serviceId
                        )
                );

        return createResponse(
                service,
                null
        );
    }

    // =========================================================
    // GET ALL SERVICES
    // =========================================================

    @Override
    public List<PhysioServiceResp> getAllServices() {

        List<PhysioService> services =
                serviceRepository.findAll();

        List<PhysioServiceResp> responseList =
                new ArrayList<>();

        for (PhysioService service : services) {

            responseList.add(
                    createResponse(
                            service,
                            null
                    )
            );
        }

        return responseList;
    }

    // =========================================================
    // CLOUDINARY IMAGE UPLOAD
    // =========================================================

    private String saveImage(
            MultipartFile image) {

        try {

            // =================================================
            // VALIDATE IMAGE
            // =================================================

            if (image == null || image.isEmpty()) {

                throw new IllegalArgumentException(
                        "Service image is required."
                );
            }

            String originalFileName =
                    image.getOriginalFilename();

            String extension = "";

            if (
                    originalFileName != null
                    &&
                    originalFileName.contains(".")
            ) {

                extension =
                        originalFileName
                                .substring(
                                        originalFileName
                                                .lastIndexOf(".")
                                )
                                .toLowerCase();
            }

            // =================================================
            // ALLOWED EXTENSIONS
            // =================================================

            if (
                    !extension.equals(".jpg")
                    &&
                    !extension.equals(".jpeg")
                    &&
                    !extension.equals(".png")
                    &&
                    !extension.equals(".webp")
            ) {

                throw new IllegalArgumentException(
                        "Only JPG, JPEG, PNG and WEBP images are allowed."
                );
            }

            // =================================================
            // CLOUDINARY UPLOAD
            // =================================================

            Map<?, ?> uploadResult =
                    cloudinary
                            .uploader()
                            .upload(
                                    image.getBytes(),
                                    ObjectUtils.asMap(
                                            "folder",
                                            "wellborn/services",
                                            "resource_type",
                                            "image"
                                    )
                            );

            // =================================================
            // SECURE URL
            // =================================================

            Object secureUrl =
                    uploadResult.get(
                            "secure_url"
                    );

            if (secureUrl == null) {

                throw new RuntimeException(
                        "Cloudinary did not return an image URL."
                );
            }

            return secureUrl.toString();

        } catch (IllegalArgumentException e) {

            throw e;

        } catch (Exception e) {

            throw new RuntimeException(
                    "Service image upload failed",
                    e
            );
        }
    }

    // =========================================================
    // COMMON RESPONSE
    // =========================================================

    private PhysioServiceResp createResponse(
            PhysioService service,
            String message) {

        PhysioServiceResp response =
                new PhysioServiceResp();

        response.setServiceId(
                service.getServiceId()
        );

        response.setServiceName(
                service.getServiceName()
        );

        response.setDescription(
                service.getDescription()
        );

        response.setImage(
                service.getImage()
        );

        response.setStatus(
                service.getStatus()
        );

        response.setMessage(
                message
        );

        return response;
    }
}