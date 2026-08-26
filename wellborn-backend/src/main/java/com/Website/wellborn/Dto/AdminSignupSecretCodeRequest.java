package com.Website.wellborn.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AdminSignupSecretCodeRequest {

    @NotBlank
    private String signupToken;

    @NotBlank
    private String secretCode;
}
