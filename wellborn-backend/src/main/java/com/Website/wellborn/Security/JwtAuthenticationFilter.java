package com.Website.wellborn.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        /*
         * ============================================================
         * 1. GET AUTHORIZATION HEADER
         * ============================================================
         */

        String authorization =
                request.getHeader("Authorization");


        /*
         * ============================================================
         * 2. NO AUTHORIZATION HEADER
         *
         * Public endpoints such as:
         *
         * /auth/admin/login
         * /auth/admin/signup/...
         * /admin/forgot-password/...
         *
         * can continue without JWT.
         * SecurityConfig decides whether the endpoint is public.
         * ============================================================
         */

        if (authorization == null
                || authorization.trim().isEmpty()) {

            filterChain.doFilter(request, response);
            return;
        }


        /*
         * ============================================================
         * 3. CHECK BEARER TOKEN
         * ============================================================
         */

        if (!authorization.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }


        /*
         * ============================================================
         * 4. EXTRACT JWT TOKEN
         * ============================================================
         */

        String token =
                authorization.substring(7).trim();


        if (token.isEmpty()) {

            filterChain.doFilter(request, response);
            return;
        }


        /*
         * ============================================================
         * 5. VALIDATE JWT
         * ============================================================
         */

        try {

            if (!jwtService.isValid(token)) {

                SecurityContextHolder.clearContext();

                filterChain.doFilter(request, response);
                return;
            }


            /*
             * ========================================================
             * 6. READ JWT DATA
             * ========================================================
             */

            String email =
                    jwtService.getEmail(token);

            String role =
                    jwtService.getRole(token);

            Long id =
                    jwtService.getId(token);


            /*
             * ========================================================
             * 7. VALIDATE JWT DATA
             * ========================================================
             */

            if (email == null
                    || email.trim().isEmpty()
                    || role == null
                    || role.trim().isEmpty()
                    || id == null) {

                SecurityContextHolder.clearContext();

                filterChain.doFilter(request, response);
                return;
            }


            /*
             * ========================================================
             * 8. NORMALIZE ROLE
             *
             * ADMIN -> ROLE_ADMIN
             * USER  -> ROLE_USER
             * ========================================================
             */

            String normalizedRole =
                    role.trim().toUpperCase();


            /*
             * ========================================================
             * 9. ONLY ALLOW KNOWN ROLES
             * ========================================================
             */

            if (!normalizedRole.equals("ADMIN")
                    && !normalizedRole.equals("USER")) {

                SecurityContextHolder.clearContext();

                filterChain.doFilter(request, response);
                return;
            }


            /*
             * ========================================================
             * 10. CREATE AUTHENTICATION
             *
             * Don't overwrite an authentication that may already
             * have been created by another authentication mechanism.
             * ========================================================
             */

            if (SecurityContextHolder
                    .getContext()
                    .getAuthentication() == null) {

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                Collections.singletonList(
                                        new SimpleGrantedAuthority(
                                                "ROLE_" + normalizedRole
                                        )
                                )
                        );


                /*
                 * ====================================================
                 * 11. SET REQUEST DETAILS
                 * ====================================================
                 */

                authentication.setDetails(
                        new WebAuthenticationDetailsSource()
                                .buildDetails(request)
                );


                /*
                 * ====================================================
                 * 12. SET SECURITY CONTEXT
                 * ====================================================
                 */

                SecurityContextHolder
                        .getContext()
                        .setAuthentication(authentication);
            }

        } catch (Exception e) {

            /*
             * ========================================================
             * INVALID / EXPIRED / MALFORMED JWT
             *
             * Do NOT directly return 403 here.
             *
             * Continue the chain.
             *
             * SecurityConfig will decide whether the endpoint
             * requires authentication or is public.
             * ========================================================
             */

            SecurityContextHolder.clearContext();

            System.err.println(
                    "JWT Authentication Error: "
                            + e.getMessage()
            );
        }


        /*
         * ============================================================
         * 13. CONTINUE REQUEST
         * ============================================================
         */

        filterChain.doFilter(request, response);
    }
}