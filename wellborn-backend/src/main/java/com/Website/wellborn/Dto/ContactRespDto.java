package com.Website.wellborn.Dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ContactRespDto {

    private Long contactId;

    private String name;

    private String email;

    private String phone;

    private String subject;

    private String message;

    private LocalDateTime createdAt;

    private String status;

    private String priority;

    private LocalDateTime readAt;

    private LocalDateTime repliedAt;

    private String adminNote;
}