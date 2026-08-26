package com.Website.wellborn.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

	// =========================================================
	// JWT CONFIGURATION
	// =========================================================

	private final SecretKey key;

	/*
	 * JWT lifetime = 12 hours
	 *
	 * Browser close/reopen: Token remains valid until this expiry time, provided
	 * frontend stores the token persistently.
	 */
	private static final long EXPIRATION_TIME = 1000L * 60L * 60L * 12L;

	// =========================================================
	// CONSTRUCTOR
	// =========================================================

	public JwtService(@Value("${wellborn.jwt.secret}") String secret) {

		if (secret == null || secret.trim().isEmpty()) {
			throw new IllegalArgumentException("wellborn.jwt.secret is missing in application.properties");
		}

		String cleanSecret = secret.trim();

		/*
		 * HS256 requires minimum 256 bits = 32 bytes.
		 *
		 * Use a long random secret in production.
		 */
		byte[] secretBytes = cleanSecret.getBytes(StandardCharsets.UTF_8);

		if (secretBytes.length < 32) {
			throw new IllegalArgumentException("wellborn.jwt.secret must be at least 32 characters long");
		}

		this.key = Keys.hmacShaKeyFor(secretBytes);
	}

	// =========================================================
	// GENERATE JWT
	// =========================================================

	public String generate(Long id, String email, String role) {

		if (id == null) {
			throw new IllegalArgumentException("User/Admin ID is required");
		}

		if (email == null || email.trim().isEmpty()) {
			throw new IllegalArgumentException("Email is required");
		}

		if (role == null || role.trim().isEmpty()) {
			throw new IllegalArgumentException("Role is required");
		}

		String normalizedEmail = email.trim().toLowerCase();

		String normalizedRole = role.trim().toUpperCase();

		/*
		 * Only these two roles are allowed inside our application JWT.
		 */
		if (!normalizedRole.equals("USER") && !normalizedRole.equals("ADMIN")) {

			throw new IllegalArgumentException("Invalid JWT role");
		}

		Date issuedAt = new Date();

		Date expiration = new Date(issuedAt.getTime() + EXPIRATION_TIME);

		return Jwts.builder()

				// =================================================
				// SUBJECT
				// =================================================

				.subject(normalizedEmail)

				// =================================================
				// DATABASE ID
				// =================================================

				.claim("id", id)

				// =================================================
				// ROLE
				// =================================================

				.claim("role", normalizedRole)

				// =================================================
				// ISSUED TIME
				// =================================================

				.issuedAt(issuedAt)

				// =================================================
				// EXPIRATION
				// =================================================

				.expiration(expiration)

				// =================================================
				// SIGN TOKEN
				// =================================================

				.signWith(key)

				// =================================================
				// FINAL JWT
				// =================================================

				.compact();
	}

	// =========================================================
	// PARSE + VERIFY JWT
	// =========================================================

	public Claims parse(String token) {

		if (token == null || token.trim().isEmpty()) {

			throw new IllegalArgumentException("JWT token is empty");
		}

		/*
		 * JJWT 0.12.x
		 *
		 * verifyWith() verifies the signature.
		 *
		 * parseSignedClaims() also validates standard JWT claims such as expiration.
		 */
		return Jwts.parser()

				.verifyWith(key)

				.build()

				.parseSignedClaims(token.trim())

				.getPayload();
	}

	// =========================================================
	// GET EMAIL
	// =========================================================

	public String getEmail(String token) {

		Claims claims = parse(token);

		return claims.getSubject();
	}

	// =========================================================
	// GET DATABASE ID
	// =========================================================

	public Long getId(String token) {

		Claims claims = parse(token);

		Object id = claims.get("id");

		if (id == null) {
			return null;
		}

		if (id instanceof Number) {
			return ((Number) id).longValue();
		}

		try {

			return Long.parseLong(id.toString());

		} catch (NumberFormatException e) {

			return null;
		}
	}

	// =========================================================
	// GET ROLE
	// =========================================================

	public String getRole(String token) {

		Claims claims = parse(token);

		Object role = claims.get("role");

		if (role == null) {
			return null;
		}

		return role.toString().trim().toUpperCase();
	}

	// =========================================================
	// CHECK JWT VALIDITY
	// =========================================================

	public boolean isValid(String token) {

		try {

			Claims claims = parse(token);

			if (claims == null) {
				return false;
			}

			String email = claims.getSubject();

			Long id = getIdFromClaims(claims);

			String role = getRoleFromClaims(claims);

			if (email == null || email.trim().isEmpty()) {

				return false;
			}

			if (id == null) {
				return false;
			}

			if (role == null || (!role.equals("USER") && !role.equals("ADMIN"))) {

				return false;
			}

			return true;

		} catch (Exception e) {

			return false;
		}
	}

	// =========================================================
	// CHECK TOKEN FOR SPECIFIC EMAIL
	// =========================================================

	public boolean isValidForEmail(String token, String email) {

		try {

			if (!isValid(token) || email == null || email.trim().isEmpty()) {

				return false;
			}

			String tokenEmail = getEmail(token);

			if (tokenEmail == null) {
				return false;
			}

			return tokenEmail.equalsIgnoreCase(email.trim());

		} catch (Exception e) {

			return false;
		}
	}

	// =========================================================
	// GET EXPIRATION
	// =========================================================

	public Date getExpiration(String token) {

		Claims claims = parse(token);

		return claims.getExpiration();
	}

	// =========================================================
	// CHECK EXPIRED
	// =========================================================

	public boolean isExpired(String token) {

		try {

			Date expiration = getExpiration(token);

			if (expiration == null) {
				return true;
			}

			return expiration.before(new Date());

		} catch (Exception e) {

			return true;
		}
	}

	// =========================================================
	// REMAINING TOKEN TIME
	// =========================================================

	public long getRemainingTime(String token) {

		try {

			Date expiration = getExpiration(token);

			if (expiration == null) {
				return 0;
			}

			long remaining = expiration.getTime() - System.currentTimeMillis();

			return Math.max(remaining, 0);

		} catch (Exception e) {

			return 0;
		}
	}

	// =========================================================
	// GET ISSUED TIME
	// =========================================================

	public Date getIssuedAt(String token) {

		Claims claims = parse(token);

		return claims.getIssuedAt();
	}

	// =========================================================
	// GET ID FROM CLAIMS
	// =========================================================

	private Long getIdFromClaims(Claims claims) {

		Object id = claims.get("id");

		if (id == null) {
			return null;
		}

		if (id instanceof Number) {
			return ((Number) id).longValue();
		}

		try {

			return Long.parseLong(id.toString());

		} catch (NumberFormatException e) {

			return null;
		}
	}

	// =========================================================
	// GET ROLE FROM CLAIMS
	// =========================================================

	private String getRoleFromClaims(Claims claims) {

		Object role = claims.get("role");

		if (role == null) {
			return null;
		}

		return role.toString().trim().toUpperCase();
	}
}