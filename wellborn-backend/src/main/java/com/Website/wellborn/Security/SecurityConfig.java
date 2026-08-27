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
    public SecurityFilterChain filterChain(
            HttpSecurity http,
            JwtAuthenticationFilter filter) throws Exception {

        http
            // =========================================================
            // CSRF
            // =========================================================
            .csrf(csrf -> csrf.disable())

            // =========================================================
            // CORS
            // =========================================================
            .cors(cors -> {
            })

            // =========================================================
            // SECURITY HEADERS
            // =========================================================
            .headers(headers -> headers

                .contentTypeOptions(contentTypeOptions -> {
                })

                .frameOptions(frame -> frame.deny())

                .httpStrictTransportSecurity(
                    hsts -> hsts
                        .includeSubDomains(true)
                        .preload(true)
                        .maxAgeInSeconds(31536000)
                )

                .referrerPolicy(
                    referrer -> referrer.policy(
                        org.springframework.security.web.header.writers
                            .ReferrerPolicyHeaderWriter.ReferrerPolicy
                            .STRICT_ORIGIN_WHEN_CROSS_ORIGIN
                    )
                )

                .permissionsPolicy(
                    permissions -> permissions.policy(
                        "camera=(), microphone=(), geolocation=()"
                    )
                )
            )

            // =========================================================
            // SESSION
            // =========================================================
            .sessionManagement(
                session -> session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            // =========================================================
            // AUTHORIZATION
            // =========================================================
            .authorizeHttpRequests(auth -> auth

                // -----------------------------------------------------
                // BACKEND ROOT / ERROR
                // -----------------------------------------------------
                .requestMatchers("/", "/error")
                .permitAll()

                // -----------------------------------------------------
                // PUBLIC AUTH
                // -----------------------------------------------------
                .requestMatchers(
                    "/auth/user/signup",
                    "/auth/user/login",
                    "/auth/user/reset/request",
                    "/auth/user/reset/confirm",

                    "/auth/admin/signup/start",
                    "/auth/admin/signup/verify-otp",
                    "/auth/admin/signup/verify-secret",
                    "/auth/admin/signup/resend-otp",
                    "/auth/admin/signup/complete",
                    "/auth/admin/signup/email-status",

                    "/auth/admin/login",
                    "/auth/admin/reset/request",
                    "/auth/admin/reset/confirm",

                    "/admin/forgot-password/send-otp",
                    "/admin/forgot-password/verify-otp",
                    "/admin/forgot-password/reset"
                )
                .permitAll()

                // -----------------------------------------------------
                // PUBLIC DOCTOR APIs
                // -----------------------------------------------------
                .requestMatchers(
                    HttpMethod.GET,
                    "/doctor/getall",
                    "/doctor/get/**",
                    "/api/doctor/getall",
                    "/api/doctor/get/**"
                )
                .permitAll()

                // -----------------------------------------------------
                // PUBLIC SERVICE APIs
                // -----------------------------------------------------
                .requestMatchers(
                    HttpMethod.GET,
                    "/service/getall",
                    "/service/get/**",
                    "/api/service/getall",
                    "/api/service/get/**"
                )
                .permitAll()

                // -----------------------------------------------------
                // PUBLIC UPLOADS
                // -----------------------------------------------------
                .requestMatchers("/uploads/**")
                .permitAll()

                // -----------------------------------------------------
                // PUBLIC APPOINTMENT BOOKING
                // -----------------------------------------------------
                .requestMatchers(
                    HttpMethod.POST,
                    "/appointment/book",
                    "/api/appointment/book"
                )
                .permitAll()

                // -----------------------------------------------------
                // PUBLIC BOOKED TIMES
                // -----------------------------------------------------
                .requestMatchers(
                    HttpMethod.GET,
                    "/appointment/booked-times",
                    "/api/appointment/booked-times"
                )
                .permitAll()

                // -----------------------------------------------------
                // PUBLIC CONTACT & REVIEW
                // -----------------------------------------------------
                .requestMatchers(
                    HttpMethod.POST,
                    "/contact/save",
                    "/review/save",
                    "/api/contact/save",
                    "/api/review/save"
                )
                .permitAll()

                .requestMatchers(
                    HttpMethod.GET,
                    "/review/approved",
                    "/api/review/approved"
                )
                .permitAll()

                // -----------------------------------------------------
                // FCM TOKEN
                // -----------------------------------------------------
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/fcm/token"
                )
                .authenticated()

                .requestMatchers(
                    HttpMethod.DELETE,
                    "/api/fcm/token"
                )
                .authenticated()

                // -----------------------------------------------------
                // NOTIFICATIONS
                // -----------------------------------------------------
                .requestMatchers(
                    HttpMethod.POST,
                    "/api/notifications/send"
                )
                .authenticated()

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/notifications/getall"
                )
                .authenticated()

                // -----------------------------------------------------
                // SWAGGER
                // -----------------------------------------------------
                .requestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs/**"
                )
                .hasRole("ADMIN")

                // -----------------------------------------------------
                // ADMIN ONLY
                // -----------------------------------------------------
                .requestMatchers(
                    "/admin/**",
                    "/dashboard",
                    "/api/admin/**",
                    "/api/dashboard",

                    // Doctor Admin
                    "/doctor/add",
                    "/doctor/update/**",
                    "/doctor/delete/**",

                    "/api/doctor/add",
                    "/api/doctor/update/**",
                    "/api/doctor/delete/**",

                    // Service Admin
                    "/service/add",
                    "/service/update/**",
                    "/service/delete/**",

                    "/api/service/add",
                    "/api/service/update/**",
                    "/api/service/delete/**",

                    // Appointment Admin
                    "/appointment/getall",
                    "/appointment/get/**",
                    "/appointment/update/**",
                    "/appointment/delete/**",

                    "/api/appointment/getall",
                    "/api/appointment/get/**",
                    "/api/appointment/update/**",
                    "/api/appointment/delete/**",

                    // Contact Admin
                    "/contact/getall",
                    "/contact/get/**",
                    "/contact/delete/**",

                    "/api/contact/getall",
                    "/api/contact/get/**",
                    "/api/contact/delete/**",

                    // Review Admin
                    "/review/getall",
                    "/review/update/**",
                    "/review/delete/**",

                    "/api/review/getall",
                    "/api/review/update/**",
                    "/api/review/delete/**"
                )
                .hasRole("ADMIN")

                // -----------------------------------------------------
                // EVERYTHING ELSE
                // -----------------------------------------------------
                .anyRequest()
                .authenticated()
            )

            // =========================================================
            // JWT FILTER
            // =========================================================
            .addFilterBefore(
                filter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}