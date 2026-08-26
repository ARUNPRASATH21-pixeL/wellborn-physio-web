package com.Website.wellborn.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AdminSignupCompleteRequest {

    @NotBlank
    private String signupToken;

    @NotBlank
    @Size(min = 8, max = 72)
    private String password;

    @NotBlank
    @Size(min = 8, max = 72)
    private String confirmPassword;
}
