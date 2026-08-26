package com.Website.wellborn.Dto;

import lombok.Data;

@Data
public class AdminLoginResponse {
	private Long adminId;
	private String adminName;
	private String email;
	private String role;
	private String message;
	private Boolean status;
	private String token;
}
