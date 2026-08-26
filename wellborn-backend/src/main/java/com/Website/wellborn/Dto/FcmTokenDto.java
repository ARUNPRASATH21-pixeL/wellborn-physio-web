package com.Website.wellborn.Dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FcmTokenDto {

    private String token;

    private String role;
}