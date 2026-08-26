package com.Website.wellborn.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder(12);
	}

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthenticationFilter filter) throws Exception {

		http.csrf(csrf -> csrf.disable()).cors(cors -> {
		}).headers(headers -> headers.contentTypeOptions(contentTypeOptions -> {
		}).frameOptions(frame -> frame.deny())
				.httpStrictTransportSecurity(
						hsts -> hsts.includeSubDomains(true).preload(true).maxAgeInSeconds(31536000))
				.referrerPolicy(referrer -> referrer.policy(
						org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
				.permissionsPolicy(permissions -> permissions.policy("camera=(), microphone=(), geolocation=()")))
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth
						// -------------------------------------------------
						// பொதுவான (Public) Auth மற்றும் Website Data
						// -------------------------------------------------
						.requestMatchers("/auth/user/signup", "/auth/user/login", "/auth/user/reset/request",
								"/auth/user/reset/confirm", "/auth/admin/signup/start", "/auth/admin/signup/verify-otp",
								"/auth/admin/signup/verify-secret", "/auth/admin/signup/resend-otp",
								"/auth/admin/signup/complete", "/auth/admin/signup/email-status", "/auth/admin/login",
								"/auth/admin/reset/request", "/auth/admin/reset/confirm",
								"/admin/forgot-password/send-otp", "/admin/forgot-password/verify-otp",
								"/admin/forgot-password/reset")
						.permitAll()

						.requestMatchers(HttpMethod.GET, "/doctor/getall", "/doctor/get/**", "/api/doctor/getall",
								"/api/doctor/get/**")
						.permitAll()
						.requestMatchers(HttpMethod.GET, "/service/getall", "/service/get/**", "/api/service/getall",
								"/api/service/get/**")
						.permitAll().requestMatchers("/uploads/**").permitAll()
						.requestMatchers(HttpMethod.POST, "/appointment/book", "/api/appointment/book").permitAll()
						
						// Permitting booked times for slot availability check
						.requestMatchers(HttpMethod.GET, "/appointment/booked-times", "/api/appointment/booked-times").permitAll()

						.requestMatchers(HttpMethod.POST, "/contact/save", "/review/save", "/api/contact/save",
								"/api/review/save")
						.permitAll().requestMatchers(HttpMethod.GET, "/review/approved", "/api/review/approved")
						.permitAll()

						// -------------------------------------------------
						// FCM & NOTIFICATIONS
						// -------------------------------------------------
						.requestMatchers(HttpMethod.POST, "/api/fcm/token").authenticated()
						.requestMatchers(HttpMethod.DELETE, "/api/fcm/token").authenticated()

						.requestMatchers(HttpMethod.POST, "/api/notifications/send").authenticated()
						.requestMatchers(HttpMethod.GET, "/api/notifications/getall").authenticated()

						// -------------------------------------------------
						// SWAGGER & ADMIN ONLY
						// -------------------------------------------------
						.requestMatchers("/swagger-ui/**", "/v3/api-docs/**").hasRole("ADMIN")
						.requestMatchers("/admin/**", "/dashboard", "/api/admin/**", "/api/dashboard", "/doctor/add",
								"/doctor/update/**", "/doctor/delete/**", "/api/doctor/add", "/api/doctor/update/**",
								"/api/doctor/delete/**", "/service/add", "/service/update/**", "/service/delete/**",
								"/api/service/add", "/api/service/update/**", "/api/service/delete/**",
								"/appointment/getall", "/appointment/get/**", "/appointment/update/**",
								"/appointment/delete/**", "/api/appointment/getall", "/api/appointment/get/**",
								"/api/appointment/update/**", "/api/appointment/delete/**", "/contact/getall",
								"/contact/get/**", "/contact/delete/**", "/api/contact/getall", "/api/contact/get/**",
								"/api/contact/delete/**", "/review/getall", "/review/update/**", "/review/delete/**",
								"/api/review/getall", "/api/review/update/**", "/api/review/delete/**")
						.hasRole("ADMIN")

						.anyRequest().authenticated())
				.addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}
}