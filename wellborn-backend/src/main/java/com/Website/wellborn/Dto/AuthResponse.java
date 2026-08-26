package com.Website.wellborn.Dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
	private String token;
	private Long id;
	private String name;
	private String email;
	private String role;
	private String message;
}
