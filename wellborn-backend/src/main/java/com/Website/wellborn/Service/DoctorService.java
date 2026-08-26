package com.Website.wellborn.Service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.Website.wellborn.Dto.DoctorDto;
import com.Website.wellborn.Dto.DoctorRespDto;

public interface DoctorService {

    DoctorRespDto addDoctor(
            DoctorDto request,
            MultipartFile image
    );

    DoctorRespDto updateDoctor(
            Long doctorId,
            DoctorDto request,
            MultipartFile image
    );

    void deleteDoctor(Long doctorId);

    DoctorRespDto getDoctorById(Long doctorId);

    List<DoctorRespDto> getAllDoctors();
}