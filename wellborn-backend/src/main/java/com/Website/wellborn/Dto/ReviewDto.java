package com.Website.wellborn.Dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ReviewDto {
	private String patientName;
	private String email;
	@Min(1)
	@Max(5)
	private Integer rating;
	@NotBlank
	private String reviewText;
	

    // FCM token of the user who is booking
    private String fcmToken;
}
