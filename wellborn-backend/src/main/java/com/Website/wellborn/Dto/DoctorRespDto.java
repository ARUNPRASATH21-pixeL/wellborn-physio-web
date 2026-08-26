package com.Website.wellborn.Dto;

import lombok.Data;

@Data
public class DoctorRespDto {

    private Long doctorId;

    private String doctorName;

    private String qualification;

    private String specialization;

    private String experience;

    private String phone;

    private String email;

    private String image;

    private Boolean status;

    private String message;
}