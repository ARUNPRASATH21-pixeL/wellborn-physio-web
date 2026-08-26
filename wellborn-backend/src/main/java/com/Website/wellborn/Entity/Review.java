package com.Website.wellborn.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "review")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long reviewId;
	private String patientName;
	private String email;
	@Column(nullable = false)
	private Integer rating;
	@Column(length = 2000, nullable = false)
	private String reviewText;
	@Column(nullable = false)
	private String status;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}
