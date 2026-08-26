package com.Website.wellborn.Dto;

import lombok.Data;

@Data
public class PhysioServiceResp {

    private Long serviceId;

    private String serviceName;

    private String description;

    private String image;

    private Boolean status;

    private String message;
}