package com.Website.wellborn.Dto;

import lombok.Data;

@Data
public class AdminResetOtpResponse {

    private boolean status;

    private String message;

    private String resetToken;
}