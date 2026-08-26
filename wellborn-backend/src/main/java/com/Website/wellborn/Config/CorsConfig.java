package com.Website.wellborn.Config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

	// =========================================================
	// CORS CONFIGURATION
	// =========================================================

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {

		CorsConfiguration configuration = new CorsConfiguration();

	
		configuration.setAllowedOrigins(List.of(
		        "http://localhost:5173",
		        "http://localhost:5174",
		        "http://localhost:5175",
		        "http://localhost:5176",
		        "http://localhost:3000",

		        "https://wellborn-physio-admin-frontend.vercel.app",
		        "https://wellborn-physio-user-frontend.vercel.app"
		));

		// =====================================================
		// ALLOWED HTTP METHODS
		// =====================================================

		configuration.setAllowedMethods(List.of(
				"GET",
				"POST",
				"PUT",
				"DELETE",
				"OPTIONS"
		));

		// =====================================================
		// ALLOWED REQUEST HEADERS
		// =====================================================

		configuration.setAllowedHeaders(List.of(
				"Authorization",
				"Content-Type",
				"Accept",
				"Origin",
				"X-Requested-With"
		));

		// =====================================================
		// EXPOSED RESPONSE HEADERS
		// =====================================================

		configuration.setExposedHeaders(List.of(
				"Authorization"
		));

		// =====================================================
		// CREDENTIALS
		// =====================================================

		configuration.setAllowCredentials(false);

		// =====================================================
		// REGISTER CORS CONFIGURATION
		// =====================================================

		UrlBasedCorsConfigurationSource source =
				new UrlBasedCorsConfigurationSource();

		source.registerCorsConfiguration(
				"/**",
				configuration
		);

		return source;
	}
}