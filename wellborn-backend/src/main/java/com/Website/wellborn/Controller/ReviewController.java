package com.Website.wellborn.Controller;

import com.Website.wellborn.Dto.*;
import com.Website.wellborn.ServiceImpl.ReviewServiceImpl;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/review")
public class ReviewController {
	private final ReviewServiceImpl s;

	public ReviewController(ReviewServiceImpl s) {
		this.s = s;
	}

	@PostMapping("/save")
	public ReviewRespDto save(@Valid @RequestBody ReviewDto r) {
		return s.save(r);
	}

	@GetMapping("/approved")
	public List<ReviewRespDto> approved() {
		return s.approved();
	}

	@GetMapping("/getall")
	public List<ReviewRespDto> all() {
		return s.all();
	}

	@PutMapping("/update/{id}")
	public ReviewRespDto update(@PathVariable Long id, @RequestParam String status) {
		return s.update(id, status);
	}

	@DeleteMapping("/delete/{id}")
	public Map<String, String> delete(@PathVariable Long id) {
		s.delete(id);
		return Map.of("message", "Review deleted");
	}
}
