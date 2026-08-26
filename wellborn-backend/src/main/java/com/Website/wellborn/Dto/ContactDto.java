package com.Website.wellborn.Dto;

import lombok.Data;

@Data
public class ContactDto {

    private String name;

    private String email;

    private String phone;

    private String subject;

    private String message;
    

    // FCM token of the user who is booking
    private String fcmToken;
}