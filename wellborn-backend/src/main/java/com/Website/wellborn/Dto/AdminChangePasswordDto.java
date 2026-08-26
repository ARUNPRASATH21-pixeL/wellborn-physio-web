package com.Website.wellborn.Dto;

import lombok.Data;

@Data
public class AdminChangePasswordDto {

    private String oldPassword;

    private String newPassword;

    private String confirmPassword;
}