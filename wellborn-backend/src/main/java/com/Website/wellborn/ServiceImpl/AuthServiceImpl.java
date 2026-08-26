package com.Website.wellborn.ServiceImpl;

import com.Website.wellborn.Dto.*;
import com.Website.wellborn.Entity.*;
import com.Website.wellborn.Repositery.*;
import com.Website.wellborn.Security.JwtService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthServiceImpl {

	private static final int ADMIN_OTP_MINUTES = 5;
	private static final int PENDING_SIGNUP_MINUTES = 30;
	private static final int SIGNUP_TOKEN_MINUTES = 15;

	private static final int ADMIN_SECRET_MAX_ATTEMPTS = 5;
	private static final int ADMIN_OTP_MAX_ATTEMPTS = 5;

	private static final int ADMIN_OTP_RESEND_COOLDOWN_SECONDS = 60;

	private static final int RESET_TOKEN_MINUTES = 15;

	private final UserRepository users;
	private final AdminRepository admins;
	private final PendingAdminSignupRepository pendingAdminSignups;

	private final PasswordEncoder encoder;
	private final JwtService jwt;
	private final EmailServiceImpl emailService;

	private final SecureRandom secureRandom = new SecureRandom();

	@Value("${wellborn.frontend.url:http://localhost:5173}")
	private String frontendUrl;

	@Value("${wellborn.admin.signup.secret-code}")
	private String adminSignupSecretCode;

	public AuthServiceImpl(UserRepository u, AdminRepository a, PendingAdminSignupRepository p, PasswordEncoder e,
			JwtService j, EmailServiceImpl emailService) {

		this.users = u;
		this.admins = a;
		this.pendingAdminSignups = p;
		this.encoder = e;
		this.jwt = j;
		this.emailService = emailService;
	}

	// =========================================================
	// USER REGISTER
	// =========================================================

	public AuthResponse userRegister(UserRegisterRequest r) {

		if (r == null) {
			throw new IllegalArgumentException("Invalid registration request");
		}

		String email = normalizeEmail(r.getEmail());

		if (email.isEmpty()) {
			throw new IllegalArgumentException("Email is required");
		}

		if (users.findByEmail(email).isPresent()) {
			throw new IllegalArgumentException("Email already registered");
		}

		User u = User.builder().fullName(r.getFullName()).email(email).password(encoder.encode(r.getPassword()))
				.phone(r.getPhone()).role("USER").createdAt(LocalDateTime.now()).build();

		users.save(u);

		return response(u.getUserId(), u.getFullName(), u.getEmail(), u.getRole(), "User registered successfully");
	}

	// =========================================================
	// USER LOGIN
	// =========================================================

	public AuthResponse userLogin(UserLoginRequest r) {

		if (r == null) {
			throw new IllegalArgumentException("Invalid login request");
		}

		String email = normalizeEmail(r.getEmail());

		User u = users.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

		if (r.getPassword() == null || u.getPassword() == null || !encoder.matches(r.getPassword(), u.getPassword())) {

			throw new IllegalArgumentException("Invalid email or password");
		}

		return response(u.getUserId(), u.getFullName(), u.getEmail(), u.getRole(), "Login successful");
	}

	// =========================================================
	// COMMON AUTH RESPONSE
	// =========================================================

	private AuthResponse response(Long id, String name, String email, String role, String msg) {

		return new AuthResponse(jwt.generate(id, email, role), id, name, email, role, msg);
	}

	// =========================================================
	// USER RESET PASSWORD REQUEST
	// =========================================================

	public String userResetRequest(String email) {

		String normalizedEmail = normalizeEmail(email);

		User u = users.findByEmail(normalizedEmail).orElseThrow(() -> new IllegalArgumentException("Email not found"));

		String token = UUID.randomUUID().toString();

		u.setResetToken(token);

		u.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));

		users.save(u);

		return token;
	}

	// =========================================================
	// USER RESET PASSWORD CONFIRM
	// =========================================================

	public void userResetConfirm(String token, String pass) {

		if (token == null || token.trim().isEmpty()) {
			throw new IllegalArgumentException("Invalid reset token");
		}

		if (pass == null || pass.length() < 8) {
			throw new IllegalArgumentException("Password must contain at least 8 characters");
		}

		User u = users.findByResetToken(token.trim())
				.orElseThrow(() -> new IllegalArgumentException("Invalid reset token"));

		if (u.getResetTokenExpiry() == null || !u.getResetTokenExpiry().isAfter(LocalDateTime.now())) {

			throw new IllegalArgumentException("Reset token expired");
		}

		u.setPassword(encoder.encode(pass));

		u.setResetToken(null);
		u.setResetTokenExpiry(null);

		users.save(u);
	}

	// =========================================================
	// ADMIN SIGNUP
	//
	// EXACT FLOW:
	//
	// Name
	// ↓
	// Phone
	// ↓
	// Email
	// ↓
	// Send OTP
	// ↓
	// OTP
	// ↓
	// Verify OTP
	// ↓
	// Medical Secret Code
	// ↓
	// Create Password
	// ↓
	// Confirm Password
	// ↓
	// Create Admin Account
	//
	// NO ADDRESS
	// NO CITY
	// NO STATE
	// NO PINCODE
	// NO LOCATION
	// NO COUNTRY
	// =========================================================

	/**
	 * STEP 1
	 *
	 * Creates only a temporary PendingAdminSignup.
	 *
	 * Admin table is NOT touched here.
	 */
	@Transactional
	public Map<String, String> startAdminSignup(AdminSignupStartRequest r) {

		validateAdminSignupStartRequest(r);

		String email = normalizeEmail(r.getEmail());

		if (!isAdminEmailAvailable(email)) {
			throw new IllegalArgumentException("Email already registered");
		}

		PendingAdminSignup existing = pendingAdminSignups.findByEmail(email).orElse(null);

		LocalDateTime now = LocalDateTime.now();

		/*
		 * Always start a fresh signup session.
		 */
		if (existing != null) {

			pendingAdminSignups.delete(existing);

			pendingAdminSignups.flush();
		}

		PendingAdminSignup pending = new PendingAdminSignup();

		/*
		 * ONLY these signup details are stored.
		 *
		 * Name Phone Email
		 *
		 * NO ADDRESS RELATED DATA.
		 */
		pending.setAdminName(r.getAdminName().trim());

		pending.setPhone(r.getPhone().trim());

		pending.setEmail(email);

		/*
		 * Password is intentionally NOT stored here.
		 */
		pending.setCreatedAt(now);

		pending.setSecretCodeAttempts(0);

		pendingAdminSignups.save(pending);

		sendPendingAdminSignupOtp(pending);

		return Map.of("message", "OTP sent to your email address",

				"email", email);
	}

	// =========================================================
	// STEP 2 - VERIFY EMAIL OTP
	// =========================================================

	@Transactional
	public String verifyAdminSignupOtp(String email, String otp) {

		String normalizedEmail = normalizeEmail(email);

		if (otp == null || !otp.trim().matches("\\d{6}")) {

			throw new IllegalArgumentException("Invalid verification OTP");
		}

		PendingAdminSignup pending = pendingAdminSignups.findByEmail(normalizedEmail)
				.orElseThrow(() -> new IllegalArgumentException("Invalid or expired signup request"));

		validatePendingSignupLifetime(pending);

		if (pending.getOtpVerifiedAt() != null) {

			throw new IllegalArgumentException("Email is already verified. Continue with the medical secret code.");
		}

		if (pending.getOtpHash() == null || pending.getOtpExpiry() == null
				|| !pending.getOtpExpiry().isAfter(LocalDateTime.now())) {

			clearPendingOtp(pending);

			throw new IllegalArgumentException("Invalid or expired verification OTP");
		}

		if (pending.getOtpAttempts() >= ADMIN_OTP_MAX_ATTEMPTS) {

			clearPendingOtp(pending);

			throw new IllegalArgumentException("Too many OTP attempts. Request a new OTP.");
		}

		pending.setOtpAttempts(pending.getOtpAttempts() + 1);

		if (!constantTimeEquals(pending.getOtpHash(), sha256(otp.trim()))) {

			pendingAdminSignups.save(pending);

			throw new IllegalArgumentException("Invalid verification OTP");
		}

		/*
		 * OTP verified successfully.
		 */

		pending.setOtpHash(null);
		pending.setOtpExpiry(null);
		pending.setOtpCreatedAt(null);
		pending.setOtpAttempts(0);

		pending.setOtpVerifiedAt(LocalDateTime.now());

		/*
		 * Create temporary signup token.
		 */
		String rawSignupToken = generateSecureToken();

		pending.setSignupTokenHash(sha256(rawSignupToken));

		pending.setSignupTokenExpiry(LocalDateTime.now().plusMinutes(SIGNUP_TOKEN_MINUTES));

		pendingAdminSignups.save(pending);

		return rawSignupToken;
	}

	// =========================================================
	// RESEND ADMIN OTP
	// =========================================================

	@Transactional
	public void resendAdminSignupOtp(String email) {

		String normalizedEmail = normalizeEmail(email);

		PendingAdminSignup pending = pendingAdminSignups.findByEmail(normalizedEmail).orElse(null);

		if (pending == null) {

			throw new IllegalArgumentException("No active signup request found. Please start signup again.");
		}

		if (pending.getOtpVerifiedAt() != null) {

			throw new IllegalArgumentException("Email is already verified. Continue with the medical secret code.");
		}

		if (pending.getCreatedAt() == null
				|| !pending.getCreatedAt().plusMinutes(PENDING_SIGNUP_MINUTES).isAfter(LocalDateTime.now())) {

			pendingAdminSignups.delete(pending);

			throw new IllegalArgumentException("Signup request expired. Please start signup again.");
		}

		LocalDateTime now = LocalDateTime.now();

		if (pending.getOtpCreatedAt() != null
				&& pending.getOtpCreatedAt().plusSeconds(ADMIN_OTP_RESEND_COOLDOWN_SECONDS).isAfter(now)) {

			throw new IllegalArgumentException("Please wait before requesting another OTP");
		}

		sendPendingAdminSignupOtp(pending);
	}

	// =========================================================
	// STEP 3 - VERIFY MEDICAL SECRET CODE
	// =========================================================

	@Transactional
	public String verifyAdminSignupSecretCode(AdminSignupSecretCodeRequest r) {

		if (r == null || r.getSignupToken() == null || r.getSignupToken().trim().isEmpty()) {

			throw new IllegalArgumentException("Invalid or expired signup verification");
		}

		if (r.getSecretCode() == null || r.getSecretCode().trim().isEmpty()) {

			throw new IllegalArgumentException("Medical secret code is required");
		}

		String tokenHash = sha256(r.getSignupToken().trim());

		PendingAdminSignup pending = pendingAdminSignups.findBySignupTokenHash(tokenHash)
				.orElseThrow(() -> new IllegalArgumentException("Invalid or expired signup verification"));

		validatePendingSignupLifetime(pending);

		if (pending.getOtpVerifiedAt() == null || pending.getSignupTokenExpiry() == null
				|| !pending.getSignupTokenExpiry().isAfter(LocalDateTime.now())) {

			throw new IllegalArgumentException("Email verification has expired. Please start signup again.");
		}

		if (pending.getSecretCodeAttempts() >= ADMIN_SECRET_MAX_ATTEMPTS) {

			pendingAdminSignups.delete(pending);

			throw new IllegalArgumentException("Too many secret code attempts. Please start signup again.");
		}

		if (adminSignupSecretCode == null || adminSignupSecretCode.isBlank()) {

			throw new IllegalStateException("Admin signup secret code is not configured on the server");
		}

		if (!constantTimeEquals(sha256(r.getSecretCode().trim()), sha256(adminSignupSecretCode.trim()))) {

			pending.setSecretCodeAttempts(pending.getSecretCodeAttempts() + 1);

			if (pending.getSecretCodeAttempts() >= ADMIN_SECRET_MAX_ATTEMPTS) {

				pendingAdminSignups.delete(pending);

			} else {

				pendingAdminSignups.save(pending);
			}

			throw new IllegalArgumentException("Invalid medical secret code");
		}

		/*
		 * Secret code is correct.
		 *
		 * Rotate token.
		 *
		 * This token is now used only for password creation.
		 */
		String rawPasswordToken = generateSecureToken();

		pending.setSignupTokenHash(sha256(rawPasswordToken));

		pending.setSignupTokenExpiry(LocalDateTime.now().plusMinutes(SIGNUP_TOKEN_MINUTES));

		pending.setSecretCodeAttempts(0);

		pendingAdminSignups.save(pending);

		return rawPasswordToken;
	}

	// =========================================================
	// STEP 4 - CREATE ADMIN ACCOUNT
	// =========================================================

	@Transactional
	public AuthResponse completeAdminSignup(AdminSignupCompleteRequest r) {

		if (r == null || r.getSignupToken() == null || r.getSignupToken().trim().isEmpty()) {

			throw new IllegalArgumentException("Invalid or expired signup verification");
		}

		validateAdminPassword(r.getPassword());

		if (r.getConfirmPassword() == null || !r.getPassword().equals(r.getConfirmPassword())) {

			throw new IllegalArgumentException("Passwords do not match");
		}

		String tokenHash = sha256(r.getSignupToken().trim());

		PendingAdminSignup pending = pendingAdminSignups.findBySignupTokenHash(tokenHash)
				.orElseThrow(() -> new IllegalArgumentException("Invalid or expired signup verification"));

		validatePendingSignupLifetime(pending);

		if (pending.getOtpVerifiedAt() == null || pending.getSignupTokenExpiry() == null
				|| !pending.getSignupTokenExpiry().isAfter(LocalDateTime.now())) {

			throw new IllegalArgumentException(
					"Password creation verification has expired. Please start signup again.");
		}

		String email = normalizeEmail(pending.getEmail());

		/*
		 * Final email availability check.
		 */
		if (!isAdminEmailAvailable(email)) {

			pendingAdminSignups.delete(pending);

			throw new IllegalArgumentException("Email already registered");
		}

		String passwordHash = encoder.encode(r.getPassword());

		/*
		 * Create REAL Admin account.
		 *
		 * IMPORTANT:
		 *
		 * No address. No city. No state. No pincode. No location. No country.
		 */
		Admin a = new Admin();

		a.setAdminName(pending.getAdminName());

		a.setEmail(email);

		a.setPassword(passwordHash);

		a.setRole("ADMIN");

		a.setPhone(pending.getPhone());

		a.setEmailVerified(true);

		Admin saved = admins.save(a);

		/*
		 * Delete temporary signup data.
		 */
		pendingAdminSignups.delete(pending);

		return new AuthResponse(null, saved.getAdminId(), saved.getAdminName(), saved.getEmail(), "ADMIN",
				"Admin account created successfully. You can now login.");
	}

	// =========================================================
	// ADMIN EMAIL AVAILABLE
	// =========================================================

	@Transactional(readOnly = true)
	public boolean isAdminEmailAvailable(String email) {

		String normalizedEmail = normalizeEmail(email);

		if (normalizedEmail.isEmpty()) {
			return false;
		}

		return admins.findByEmail(normalizedEmail).isEmpty()

				&& users.findByEmail(normalizedEmail).isEmpty();
	}

	// =========================================================
	// ADMIN LOGIN
	// =========================================================

	public AuthResponse adminLogin(AdminLoginRequest r) {

		if (r == null) {
			throw new IllegalArgumentException("Invalid login request");
		}

		String email = normalizeEmail(r.getEmail());

		Admin a = admins.findByEmail(email)
				.orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

		if (a.getPassword() == null || r.getPassword() == null || !encoder.matches(r.getPassword(), a.getPassword())) {

			throw new IllegalArgumentException("Invalid email or password");
		}

		if (!a.isEmailVerified()) {

			throw new IllegalArgumentException("Please verify your admin email before login");
		}

		return new AuthResponse(jwt.generate(a.getAdminId(), a.getEmail(), "ADMIN"), a.getAdminId(), a.getAdminName(),
				a.getEmail(), "ADMIN", "Login successful");
	}

	// =========================================================
	// ADMIN FORGOT PASSWORD
	// =========================================================

	@Transactional
	public void adminResetRequest(String email) {

		String normalizedEmail = normalizeEmail(email);

		Admin a = admins.findByEmail(normalizedEmail).orElse(null);

		/*
		 * Do not reveal whether account exists.
		 */
		if (a == null || !a.isEmailVerified()) {

			return;
		}

		String rawToken = generateSecureToken();

		String tokenHash = sha256(rawToken);

		a.setResetToken(tokenHash);

		a.setResetTokenExpiry(LocalDateTime.now().plusMinutes(RESET_TOKEN_MINUTES));

		admins.save(a);

		String link = cleanFrontendUrl() + "/admin/reset-password?token="
				+ java.net.URLEncoder.encode(rawToken, StandardCharsets.UTF_8);

		emailService.sendAdminPasswordResetOtp(a.getEmail(), link);
	}

	// =========================================================
	// ADMIN RESET PASSWORD CONFIRM
	// =========================================================

	@Transactional
	public void adminResetConfirm(String token, String pass) {

		if (token == null || token.trim().isEmpty()) {

			throw new IllegalArgumentException("Invalid or expired reset token");
		}

		if (pass == null || pass.length() < 8) {

			throw new IllegalArgumentException("Password must contain at least 8 characters");
		}

		String tokenHash = sha256(token.trim());

		Admin a = admins.findByResetToken(tokenHash)
				.orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

		if (a.getResetTokenExpiry() == null || !a.getResetTokenExpiry().isAfter(LocalDateTime.now())) {

			clearAdminResetToken(a);

			admins.save(a);

			throw new IllegalArgumentException("Invalid or expired reset token");
		}

		a.setPassword(encoder.encode(pass));

		clearAdminResetToken(a);

		admins.save(a);
	}

	// =========================================================
	// SEND ADMIN SIGNUP OTP
	// =========================================================

	private void sendPendingAdminSignupOtp(PendingAdminSignup pending) {

		String otp = String.format("%06d", secureRandom.nextInt(1_000_000));

		LocalDateTime now = LocalDateTime.now();

		pending.setOtpHash(sha256(otp));

		pending.setOtpExpiry(now.plusMinutes(ADMIN_OTP_MINUTES));

		pending.setOtpCreatedAt(now);

		pending.setOtpAttempts(0);

		pendingAdminSignups.save(pending);

		emailService.sendAdminEmailVerificationOtp(pending.getEmail(), otp);
	}

	// =========================================================
	// CLEAR OTP
	// =========================================================

	private void clearPendingOtp(PendingAdminSignup pending) {

		pending.setOtpHash(null);
		pending.setOtpExpiry(null);
		pending.setOtpCreatedAt(null);
		pending.setOtpAttempts(0);

		/*
		 * Expired OTP must invalidate the signup verification token.
		 */
		pending.setOtpVerifiedAt(null);
		pending.setSignupTokenHash(null);
		pending.setSignupTokenExpiry(null);

		pendingAdminSignups.save(pending);
	}

	// =========================================================
	// VALIDATE PENDING SIGNUP
	// =========================================================

	private void validatePendingSignupLifetime(PendingAdminSignup pending) {

		if (pending.getCreatedAt() == null
				|| !pending.getCreatedAt().plusMinutes(PENDING_SIGNUP_MINUTES).isAfter(LocalDateTime.now())) {

			pendingAdminSignups.delete(pending);

			throw new IllegalArgumentException("Signup request expired. Please start signup again.");
		}
	}

	// =========================================================
	// CLEAR ADMIN RESET TOKEN
	// =========================================================

	private void clearAdminResetToken(Admin a) {

		a.setResetToken(null);
		a.setResetTokenExpiry(null);
	}

	// =========================================================
	// ADMIN SIGNUP VALIDATION
	// =========================================================

	private void validateAdminSignupStartRequest(AdminSignupStartRequest r) {

		if (r == null) {

			throw new IllegalArgumentException("Invalid registration request");
		}

		/*
		 * ADMIN NAME
		 */
		if (r.getAdminName() == null || r.getAdminName().trim().isEmpty() || r.getAdminName().trim().length() > 120) {

			throw new IllegalArgumentException("Please enter a valid admin name");
		}

		/*
		 * PHONE
		 */
		if (r.getPhone() == null || r.getPhone().trim().isEmpty()
				|| !r.getPhone().trim().matches("^[0-9+()\\- ]{7,20}$")) {

			throw new IllegalArgumentException("Please enter a valid phone number");
		}

		/*
		 * EMAIL
		 */
		String email = normalizeEmail(r.getEmail());

		if (email.isEmpty() || email.length() > 320
				|| !email.matches("^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@" + "[A-Za-z0-9]" + "(?:[A-Za-z0-9-]{0,61}"
						+ "[A-Za-z0-9])?" + "(?:\\.[A-Za-z0-9]" + "(?:[A-Za-z0-9-]{0,61}" + "[A-Za-z0-9])?)+$")) {

			throw new IllegalArgumentException("Please enter a valid email address");
		}
	}

	// =========================================================
	// ADMIN PASSWORD VALIDATION
	// =========================================================

	private void validateAdminPassword(String password) {

		if (password == null || password.length() < 8 || password.length() > 72 || !password.matches(".*[A-Z].*")
				|| !password.matches(".*[a-z].*") || !password.matches(".*\\d.*")) {

			throw new IllegalArgumentException(
					"Password must contain at least 8 characters, an uppercase letter, a lowercase letter and a number");
		}
	}

	// =========================================================
	// NORMALIZE EMAIL
	// =========================================================

	private String normalizeEmail(String email) {

		return email == null ? "" : email.trim().toLowerCase();
	}

	// =========================================================
	// SECURE TOKEN
	// =========================================================

	private String generateSecureToken() {

		byte[] bytes = new byte[32];

		secureRandom.nextBytes(bytes);

		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}

	// =========================================================
	// SHA-256
	// =========================================================

	private String sha256(String value) {

		try {

			MessageDigest digest = MessageDigest.getInstance("SHA-256");

			return java.util.HexFormat.of().formatHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));

		} catch (Exception e) {

			throw new IllegalStateException("Unable to secure token", e);
		}
	}

	// =========================================================
	// CONSTANT TIME COMPARISON
	// =========================================================

	private boolean constantTimeEquals(String first, String second) {

		if (first == null || second == null) {

			return false;
		}

		return MessageDigest.isEqual(first.getBytes(StandardCharsets.UTF_8), second.getBytes(StandardCharsets.UTF_8));
	}

	// =========================================================
	// FRONTEND URL
	// =========================================================

	private String cleanFrontendUrl() {

		if (frontendUrl == null || frontendUrl.trim().isEmpty()) {

			throw new IllegalStateException("Frontend URL is not configured");
		}

		String base = frontendUrl.trim();

		while (base.endsWith("/")) {

			base = base.substring(0, base.length() - 1);
		}

		return base;
	}
}