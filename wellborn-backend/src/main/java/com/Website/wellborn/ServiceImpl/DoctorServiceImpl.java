package com.Website.wellborn.ServiceImpl;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.Website.wellborn.Dto.DoctorDto;
import com.Website.wellborn.Dto.DoctorRespDto;
import com.Website.wellborn.Entity.Doctors;
import com.Website.wellborn.Repositery.DoctorRepositery;
import com.Website.wellborn.Service.DoctorService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepositery doctorRepository;
    private final Cloudinary cloudinary;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public DoctorServiceImpl(
            DoctorRepositery doctorRepository,
            Cloudinary cloudinary
    ) {
        this.doctorRepository = doctorRepository;
        this.cloudinary = cloudinary;
    }

    // =========================================================
    // ADD DOCTOR
    // =========================================================

    @Override
    public DoctorRespDto addDoctor(
            DoctorDto request,
            MultipartFile image
    ) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Doctor data cannot be null"
            );
        }

        Doctors doctor = new Doctors();

        // =====================================================
        // BASIC DETAILS
        // =====================================================

        doctor.setDoctorName(
                request.getDoctorName()
        );

        doctor.setQualification(
                request.getQualification()
        );

        doctor.setSpecialization(
                request.getSpecialization()
        );

        doctor.setExperience(
                request.getExperience()
        );

        doctor.setPhone(
                request.getPhone()
        );

        doctor.setEmail(
                request.getEmail()
        );

        // =====================================================
        // STATUS
        // =====================================================

        if (request.getStatus() != null) {

            String statusVal =
                    String.valueOf(
                            request.getStatus()
                    ).trim();

            if (
                    statusVal.equalsIgnoreCase("Active")
                    ||
                    statusVal.equalsIgnoreCase("true")
            ) {

                doctor.setStatus(true);

            } else if (
                    statusVal.equalsIgnoreCase("Inactive")
                    ||
                    statusVal.equalsIgnoreCase("false")
            ) {

                doctor.setStatus(false);

            } else {

                doctor.setStatus(true);
            }

        } else {

            doctor.setStatus(true);
        }

        // =====================================================
        // IMAGE
        // =====================================================

        if (
                image != null
                &&
                !image.isEmpty()
        ) {

            String imageUrl =
                    uploadImage(image);

            doctor.setImage(imageUrl);

        } else {

            doctor.setImage(null);
        }

        // =====================================================
        // SAVE
        // =====================================================

        Doctors savedDoctor =
                doctorRepository.save(doctor);

        return createResponse(
                savedDoctor,
                "Doctor Added Successfully"
        );
    }

    // =========================================================
    // UPDATE DOCTOR
    // =========================================================

    @Override
    public DoctorRespDto updateDoctor(
            Long doctorId,
            DoctorDto request,
            MultipartFile image
    ) {

        if (doctorId == null) {

            throw new IllegalArgumentException(
                    "Doctor ID cannot be null"
            );
        }

        if (request == null) {

            throw new IllegalArgumentException(
                    "Doctor data cannot be null"
            );
        }

        Doctors doctor =
                doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Doctor Not Found with ID: "
                                        + doctorId
                        )
                );

        // =====================================================
        // BASIC DETAILS
        // =====================================================

        if (request.getDoctorName() != null) {

            doctor.setDoctorName(
                    request.getDoctorName()
            );
        }

        if (request.getQualification() != null) {

            doctor.setQualification(
                    request.getQualification()
            );
        }

        if (request.getSpecialization() != null) {

            doctor.setSpecialization(
                    request.getSpecialization()
            );
        }

        if (request.getExperience() != null) {

            doctor.setExperience(
                    request.getExperience()
            );
        }

        if (request.getPhone() != null) {

            doctor.setPhone(
                    request.getPhone()
            );
        }

        if (request.getEmail() != null) {

            doctor.setEmail(
                    request.getEmail()
            );
        }

        // =====================================================
        // STATUS
        // =====================================================

        if (request.getStatus() != null) {

            String statusVal =
                    String.valueOf(
                            request.getStatus()
                    ).trim();

            if (
                    statusVal.equalsIgnoreCase("Active")
                    ||
                    statusVal.equalsIgnoreCase("true")
            ) {

                doctor.setStatus(true);

            } else if (
                    statusVal.equalsIgnoreCase("Inactive")
                    ||
                    statusVal.equalsIgnoreCase("false")
            ) {

                doctor.setStatus(false);
            }
        }

        // =====================================================
        // NEW IMAGE
        // =====================================================

        if (
                image != null
                &&
                !image.isEmpty()
        ) {

            String newImageUrl =
                    uploadImage(image);

            doctor.setImage(
                    newImageUrl
            );
        }

        // =====================================================
        // SAVE
        // =====================================================

        Doctors updatedDoctor =
                doctorRepository.save(doctor);

        return createResponse(
                updatedDoctor,
                "Doctor Updated Successfully"
        );
    }

    // =========================================================
    // DELETE DOCTOR
    // =========================================================

    @Override
    public void deleteDoctor(Long doctorId) {

        if (doctorId == null) {

            throw new IllegalArgumentException(
                    "Doctor ID cannot be null"
            );
        }

        Doctors doctor =
                doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Doctor Not Found with ID: "
                                        + doctorId
                        )
                );

        // Delete database record
        doctorRepository.delete(doctor);
    }

    // =========================================================
    // GET DOCTOR BY ID
    // =========================================================

    @Override
    public DoctorRespDto getDoctorById(
            Long doctorId
    ) {

        if (doctorId == null) {

            throw new IllegalArgumentException(
                    "Doctor ID cannot be null"
            );
        }

        Doctors doctor =
                doctorRepository.findById(doctorId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Doctor Not Found with ID: "
                                        + doctorId
                        )
                );

        return createResponse(
                doctor,
                null
        );
    }

    // =========================================================
    // GET ALL DOCTORS
    // =========================================================

    @Override
    public List<DoctorRespDto> getAllDoctors() {

        return doctorRepository
                .findAll()
                .stream()
                .map(doctor ->
                        createResponse(
                                doctor,
                                null
                        )
                )
                .collect(Collectors.toList());
    }

    // =========================================================
    // CLOUDINARY IMAGE UPLOAD
    // =========================================================

    private String uploadImage(
            MultipartFile image
    ) {

        try {

            // =================================================
            // VALIDATE IMAGE
            // =================================================

            if (
                    image == null
                    ||
                    image.isEmpty()
            ) {

                throw new IllegalArgumentException(
                        "Doctor image is required."
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
                                            "wellborn/doctors",
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
                    "Doctor image upload failed",
                    e
            );
        }
    }

    // =========================================================
    // COMMON RESPONSE
    // =========================================================

    private DoctorRespDto createResponse(
            Doctors doctor,
            String message
    ) {

        DoctorRespDto response =
                new DoctorRespDto();

        response.setDoctorId(
                doctor.getDoctorId()
        );

        response.setDoctorName(
                doctor.getDoctorName()
        );

        response.setQualification(
                doctor.getQualification()
        );

        response.setSpecialization(
                doctor.getSpecialization()
        );

        response.setExperience(
                doctor.getExperience()
        );

        response.setPhone(
                doctor.getPhone()
        );

        response.setEmail(
                doctor.getEmail()
        );

        response.setImage(
                doctor.getImage()
        );

        response.setStatus(
                doctor.getStatus()
        );

        response.setMessage(
                message
        );

        return response;
    }
}