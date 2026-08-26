package com.Website.wellborn.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DoctorDto {

    @NotBlank
    private String doctorName;

    @NotBlank
    private String qualification;

    @NotBlank
    private String specialization;

    @NotBlank
    private String experience;

    @NotBlank
    private String phone;

    @Email
    private String email;

    private String image;

    private Boolean status;
}