package com.Website.wellborn.Dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewRespDto {
	private Long reviewId;
	private String patientName;
	private String email;
	private Integer rating;
	private String reviewText;
	private String status;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
