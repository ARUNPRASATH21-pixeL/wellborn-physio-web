package com.Website.wellborn.Service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.Website.wellborn.Dto.PhysioServiceDto;
import com.Website.wellborn.Dto.PhysioServiceResp;

public interface PhysioServicesManagementService {

    PhysioServiceResp addService(PhysioServiceDto request, MultipartFile image);

    PhysioServiceResp updateService(Long serviceId, PhysioServiceDto request, MultipartFile image);

    void deleteService(Long serviceId);

    PhysioServiceResp getServiceById(Long serviceId);

    List<PhysioServiceResp> getAllServices();

}