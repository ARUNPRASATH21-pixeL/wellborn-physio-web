package com.Website.wellborn.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminSignupStartRequest {

    @NotBlank
    @Size(min = 2, max = 120)
    private String adminName;

    @NotBlank
    @Size(min = 7, max = 20)
    private String phone;

    @NotBlank
    @Email
    @Size(max = 320)
    private String email;
}
