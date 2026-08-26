package com.Website.wellborn.Dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserRegisterRequest {
	@NotBlank
	private String fullName;
	@Email
	@NotBlank
	private String email;
	@NotBlank
	private String password;
	private String phone;
}
