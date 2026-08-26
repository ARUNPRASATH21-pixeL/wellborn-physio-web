package com.Website.wellborn.Repositery;

import com.Website.wellborn.Entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
	long countByStatus(String status);

	List<Review> findAllByOrderByCreatedAtDesc();

	List<Review> findByStatusOrderByCreatedAtDesc(String status);
}
