package com.Website.wellborn.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.time.LocalDateTime;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<?> notFound(ResourceNotFoundException e) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(Map.of("timestamp", LocalDateTime.now(), "message", e.getMessage()));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<?> bad(IllegalArgumentException e) {
		return ResponseEntity.badRequest().body(Map.of("timestamp", LocalDateTime.now(), "message", e.getMessage()));
	}

	// Ignore NoResourceFoundException for static uploads so it doesn't try to wrap images in JSON error maps
	@ExceptionHandler(NoResourceFoundException.class)
	public ResponseEntity<?> handleNoResourceFound(NoResourceFoundException e) {
		return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<?> error(Exception e) {
		// Log the error for your debugging
		e.printStackTrace();
		
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(Map.of("timestamp", LocalDateTime.now(), "message", "Something went wrong"));
	}
}