package com.Website.wellborn.Dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AdminRespDto {
	private Long adminId;
	private String adminName;
	private String email;
	private String role;
	private String phone;
	
	private LocalDateTime createdAt;
	private String message;
}
