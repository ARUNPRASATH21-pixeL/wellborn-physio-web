package com.Website.wellborn.ServiceImpl;

import com.Website.wellborn.Dto.AdminChangePasswordDto;
import com.Website.wellborn.Dto.AdminDto;
import com.Website.wellborn.Dto.AdminLoginRequest;
import com.Website.wellborn.Dto.AdminLoginResponse;
import com.Website.wellborn.Dto.AdminRespDto;
import com.Website.wellborn.Dto.AdminResetOtpResponse;
import com.Website.wellborn.Entity.Admin;
import com.Website.wellborn.Repositery.AdminRepository;
import com.Website.wellborn.Security.JwtService;
import com.Website.wellborn.Service.AdminService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;

@Service
@Transactional
public class AdminServiceImpl implements AdminService {

	private final AdminRepository repo;
	private final PasswordEncoder encoder;
	private final JwtService jwt;
	private final EmailServiceImpl emailService;

	private final SecureRandom secureRandom = new SecureRandom();

	private static final int OTP_EXPIRY_MINUTES = 5;
	private static final int RESET_TOKEN_EXPIRY_MINUTES = 10;
	private static final int MAX_OTP_ATTEMPTS = 5;

	// =========================================================
	// CONSTRUCTOR
	// =========================================================

	public AdminServiceImpl(AdminRepository repo, PasswordEncoder encoder, JwtService jwt,
			EmailServiceImpl emailService) {

		this.repo = repo;
		this.encoder = encoder;
		this.jwt = jwt;
		this.emailService = emailService;
	}

	// =========================================================
	// REGISTER
	// =========================================================

	@Override
	public AdminRespDto register(AdminDto request) {

		if (request == null) {
			throw new IllegalArgumentException("Admin registration data is required");
		}

		if (request.getAdminName() == null || request.getAdminName().trim().isEmpty()) {

			throw new IllegalArgumentException("Admin name is required");
		}

		if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {

			throw new IllegalArgumentException("Email is required");
		}

		if (request.getPassword() == null || request.getPassword().isBlank()) {

			throw new IllegalArgumentException("Password is required");
		}

		String email = normalizeEmail(request.getEmail());

		validateEmail(email);
		validatePassword(request.getPassword());

		if (repo.findByEmail(email).isPresent()) {
			throw new IllegalArgumentException("Email already registered");
		}

		Admin admin = new Admin();

		admin.setAdminName(request.getAdminName().trim());

		admin.setEmail(email);

		admin.setPassword(encoder.encode(request.getPassword()));

		// Never trust role from frontend
		admin.setRole("ADMIN");

		if (request.getPhone() != null) {
			admin.setPhone(request.getPhone().trim());
		}

		admin.setCreatedAt(LocalDateTime.now());

		admin.setEmailVerified(true);

		clearEmailVerificationOtp(admin);

		admin.setResetToken(null);
		admin.setResetTokenExpiry(null);

		Admin saved = repo.save(admin);

		return toResponse(saved, "Admin registered successfully");
	}

	// =========================================================
	// LOGIN
	// =========================================================

	@Override
	@Transactional(readOnly = true)
	public AdminLoginResponse login(AdminLoginRequest request) {

		if (request == null) {
			throw new IllegalArgumentException("Login data is required");
		}

		if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {

			throw new IllegalArgumentException("Email is required");
		}

		if (request.getPassword() == null || request.getPassword().isBlank()) {

			throw new IllegalArgumentException("Password is required");
		}

		String email = normalizeEmail(request.getEmail());

		Admin admin = repo.findByEmail(email)
				.orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

		if (admin.getPassword() == null || !encoder.matches(request.getPassword(), admin.getPassword())) {

			throw new IllegalArgumentException("Invalid email or password");
		}

		if (!admin.isEmailVerified()) {
			throw new IllegalArgumentException("Please verify your admin email before login");
		}

		if (admin.getRole() == null || !"ADMIN".equalsIgnoreCase(admin.getRole())) {

			throw new IllegalArgumentException("Unauthorized admin account");
		}

		AdminLoginResponse response = new AdminLoginResponse();

		response.setAdminId(admin.getAdminId());

		response.setAdminName(admin.getAdminName());

		response.setEmail(admin.getEmail());

		response.setRole("ADMIN");

		response.setStatus(true);

		response.setMessage("Login successful");

		response.setToken(jwt.generate(admin.getAdminId(), admin.getEmail(), "ADMIN"));

		return response;
	}

	// =========================================================
	// GET ADMIN BY ID
	// =========================================================

	@Override
	@Transactional(readOnly = true)
	public AdminRespDto getAdmin(Long adminId) {

		validateAdminId(adminId);

		Admin admin = repo.findById(adminId).orElseThrow(() -> new IllegalArgumentException("Admin not found"));

		return toResponse(admin, "Admin fetched successfully");
	}

	// =========================================================
	// GET ADMIN BY EMAIL
	// =========================================================

	@Override
	@Transactional(readOnly = true)
	public AdminRespDto getAdminByEmail(String email) {

		String normalizedEmail = normalizeEmail(email);

		validateEmail(normalizedEmail);

		Admin admin = repo.findByEmail(normalizedEmail)
				.orElseThrow(() -> new IllegalArgumentException("Admin not found"));

		return toResponse(admin, "Admin fetched successfully");
	}

	// =========================================================
	// UPDATE ADMIN
	// =========================================================

	@Override
	public AdminRespDto updateAdmin(Long adminId, AdminDto request) {

		validateAdminId(adminId);

		if (request == null) {
			throw new IllegalArgumentException("Admin update data is required");
		}

		Admin admin = repo.findById(adminId).orElseThrow(() -> new IllegalArgumentException("Admin not found"));

		// ADMIN NAME
		if (request.getAdminName() != null && !request.getAdminName().trim().isEmpty()) {

			admin.setAdminName(request.getAdminName().trim());
		}

		// EMAIL
		if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {

			String email = normalizeEmail(request.getEmail());

			validateEmail(email);

			repo.findByEmail(email).ifPresent(existing -> {

				if (!existing.getAdminId().equals(adminId)) {

					throw new IllegalArgumentException("Email already registered");
				}
			});

			if (!email.equalsIgnoreCase(admin.getEmail())) {

				admin.setEmail(email);

				// New email needs verification
				admin.setEmailVerified(false);

				clearEmailVerificationOtp(admin);
			}
		}

		// PHONE
		if (request.getPhone() != null) {

			admin.setPhone(request.getPhone().trim());
		}

		// Never accept role from frontend
		admin.setRole("ADMIN");

		Admin saved = repo.save(admin);

		return toResponse(saved, "Profile updated successfully");
	}

	// =========================================================
	// CHANGE PASSWORD
	// =========================================================

	@Override
	public void changePassword(Long adminId, AdminChangePasswordDto request) {

		validateAdminId(adminId);

		if (request == null) {
			throw new IllegalArgumentException("Password data is required");
		}

		if (request.getOldPassword() == null || request.getOldPassword().isBlank()) {

			throw new IllegalArgumentException("Current password is required");
		}

		if (request.getNewPassword() == null || request.getNewPassword().isBlank()) {

			throw new IllegalArgumentException("New password is required");
		}

		if (request.getConfirmPassword() == null || request.getConfirmPassword().isBlank()) {

			throw new IllegalArgumentException("Confirm password is required");
		}

		validatePassword(request.getNewPassword());

		if (!request.getNewPassword().equals(request.getConfirmPassword())) {

			throw new IllegalArgumentException("New password and confirmation password must match");
		}

		// IMPORTANT:
		// This is the correct findById syntax.
		Admin admin = repo.findById(adminId).orElseThrow(() -> new IllegalArgumentException("Admin not found"));

		if (admin.getPassword() == null || !encoder.matches(request.getOldPassword(), admin.getPassword())) {

			throw new IllegalArgumentException("Current password is incorrect");
		}

		if (encoder.matches(request.getNewPassword(), admin.getPassword())) {

			throw new IllegalArgumentException("New password must be different from current password");
		}

		admin.setPassword(encoder.encode(request.getNewPassword()));

		repo.save(admin);
	}

	// =========================================================
	// DELETE ADMIN
	// =========================================================

	@Override
	public void deleteAdmin(Long adminId) {

		validateAdminId(adminId);

		if (!repo.existsById(adminId)) {

			throw new IllegalArgumentException("Admin not found");
		}

		repo.deleteById(adminId);
	}

	// =========================================================
	// SEND RESET OTP
	// =========================================================

	@Override
	public void sendResetOtp(String email) {

		String normalizedEmail = normalizeEmail(email);

		validateEmail(normalizedEmail);

		Admin admin = repo.findByEmail(normalizedEmail)
				.orElseThrow(() -> new IllegalArgumentException("No admin account found with this email"));

		String otp = generateOtp();

		String otpHash = hashValue(otp);

		LocalDateTime now = LocalDateTime.now();

		admin.setEmailVerificationOtpHash(otpHash);

		admin.setEmailVerificationOtpCreatedAt(now);

		admin.setEmailVerificationOtpExpiry(now.plusMinutes(OTP_EXPIRY_MINUTES));

		admin.setEmailVerificationOtpAttempts(0);

		// Invalidate old reset session
		admin.setResetToken(null);
		admin.setResetTokenExpiry(null);

		repo.save(admin);

		// IMPORTANT:
		// Send OTP to registered email.
		emailService.sendAdminPasswordResetOtp(admin.getEmail(), otp);
	}

	// =========================================================
	// VERIFY RESET OTP
	// =========================================================

	@Override
	public AdminResetOtpResponse verifyResetOtp(String email, String otp) {

		String normalizedEmail = normalizeEmail(email);

		validateEmail(normalizedEmail);

		if (otp == null || otp.trim().isEmpty()) {

			throw new IllegalArgumentException("OTP is required");
		}

		String cleanOtp = otp.trim();

		if (!cleanOtp.matches("\\d{6}")) {

			throw new IllegalArgumentException("OTP must contain 6 digits");
		}

		Admin admin = repo.findByEmail(normalizedEmail)
				.orElseThrow(() -> new IllegalArgumentException("Invalid email or OTP"));

		// OTP EXISTS
		if (admin.getEmailVerificationOtpHash() == null || admin.getEmailVerificationOtpExpiry() == null) {

			throw new IllegalArgumentException("OTP is invalid or expired");
		}

		// ATTEMPT LIMIT
		if (admin.getEmailVerificationOtpAttempts() >= MAX_OTP_ATTEMPTS) {

			clearEmailVerificationOtp(admin);

			repo.save(admin);

			throw new IllegalArgumentException("Too many invalid OTP attempts. Please request a new OTP");
		}

		// EXPIRY
		if (LocalDateTime.now().isAfter(admin.getEmailVerificationOtpExpiry())) {

			clearEmailVerificationOtp(admin);

			repo.save(admin);

			throw new IllegalArgumentException("OTP has expired. Please request a new OTP");
		}

		// HASH OTP
		String submittedHash = hashValue(cleanOtp);

		boolean valid = constantTimeEquals(submittedHash, admin.getEmailVerificationOtpHash());

		if (!valid) {

			admin.setEmailVerificationOtpAttempts(admin.getEmailVerificationOtpAttempts() + 1);

			repo.save(admin);

			throw new IllegalArgumentException("Invalid OTP");
		}

		// OTP SUCCESS
		clearEmailVerificationOtp(admin);

		// Generate secure reset token
		String rawResetToken = generateSecureResetToken();

		// Only hash stored in DB
		admin.setResetToken(hashValue(rawResetToken));

		admin.setResetTokenExpiry(LocalDateTime.now().plusMinutes(RESET_TOKEN_EXPIRY_MINUTES));

		repo.save(admin);

		AdminResetOtpResponse response = new AdminResetOtpResponse();

		response.setStatus(true);

		response.setMessage("OTP verified successfully");

		// Raw token returned only once
		response.setResetToken(rawResetToken);

		return response;
	}

	// =========================================================
	// RESET PASSWORD
	// =========================================================

	@Override
	public void resetPassword(String email, String resetToken, String newPassword, String confirmPassword) {

		String normalizedEmail = normalizeEmail(email);

		validateEmail(normalizedEmail);

		if (resetToken == null || resetToken.isBlank()) {

			throw new IllegalArgumentException("Reset authorization token is required");
		}

		if (newPassword == null || newPassword.isBlank()) {

			throw new IllegalArgumentException("New password is required");
		}

		if (confirmPassword == null || confirmPassword.isBlank()) {

			throw new IllegalArgumentException("Confirm password is required");
		}

		validatePassword(newPassword);

		if (!newPassword.equals(confirmPassword)) {

			throw new IllegalArgumentException("New password and confirmation password must match");
		}

		Admin admin = repo.findByEmail(normalizedEmail)
				.orElseThrow(() -> new IllegalArgumentException("Admin not found"));

		// RESET TOKEN EXISTS
		if (admin.getResetToken() == null || admin.getResetTokenExpiry() == null) {

			throw new IllegalArgumentException("Please verify OTP before resetting password");
		}

		// TOKEN EXPIRY
		if (LocalDateTime.now().isAfter(admin.getResetTokenExpiry())) {

			admin.setResetToken(null);
			admin.setResetTokenExpiry(null);

			repo.save(admin);

			throw new IllegalArgumentException("Reset session expired. Please request a new OTP");
		}

		// VERIFY TOKEN
		String submittedTokenHash = hashValue(resetToken);

		if (!constantTimeEquals(submittedTokenHash, admin.getResetToken())) {

			throw new IllegalArgumentException("Invalid reset authorization token");
		}

		// SAME PASSWORD
		if (admin.getPassword() != null && encoder.matches(newPassword, admin.getPassword())) {

			throw new IllegalArgumentException("New password must be different from current password");
		}

		// SAVE PASSWORD
		admin.setPassword(encoder.encode(newPassword));

		// ONE-TIME TOKEN
		admin.setResetToken(null);
		admin.setResetTokenExpiry(null);

		repo.save(admin);
	}

	// =========================================================
	// RESPONSE MAPPER
	// =========================================================

	private AdminRespDto toResponse(Admin admin, String message) {

		AdminRespDto response = new AdminRespDto();

		response.setAdminId(admin.getAdminId());

		response.setAdminName(admin.getAdminName());

		response.setEmail(admin.getEmail());

		response.setRole(admin.getRole());

		response.setPhone(admin.getPhone());

		response.setCreatedAt(admin.getCreatedAt());

		response.setMessage(message);

		return response;
	}

	// =========================================================
	// GENERATE OTP
	// =========================================================

	private String generateOtp() {

		int number = secureRandom.nextInt(1_000_000);

		return String.format("%06d", number);
	}

	// =========================================================
	// SECURE RESET TOKEN
	// =========================================================

	private String generateSecureResetToken() {

		byte[] bytes = new byte[32];

		secureRandom.nextBytes(bytes);

		return HexFormat.of().formatHex(bytes);
	}

	// =========================================================
	// SHA-256
	// =========================================================

	private String hashValue(String value) {

		try {

			MessageDigest digest = MessageDigest.getInstance("SHA-256");

			byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));

			return HexFormat.of().formatHex(hash);

		} catch (NoSuchAlgorithmException e) {

			throw new IllegalStateException("SHA-256 algorithm is unavailable", e);
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
	// CLEAR OTP
	// =========================================================

	private void clearEmailVerificationOtp(Admin admin) {

		admin.setEmailVerificationOtpHash(null);

		admin.setEmailVerificationOtpExpiry(null);

		admin.setEmailVerificationOtpCreatedAt(null);

		admin.setEmailVerificationOtpAttempts(0);
	}

	// =========================================================
	// NORMALIZE EMAIL
	// =========================================================

	private String normalizeEmail(String email) {

		if (email == null) {
			return "";
		}

		return email.trim().toLowerCase();
	}

	// =========================================================
	// EMAIL VALIDATION
	// =========================================================

	private void validateEmail(String email) {

		if (email == null || email.isBlank()) {

			throw new IllegalArgumentException("Email is required");
		}

		if (email.length() > 150) {

			throw new IllegalArgumentException("Email is too long");
		}

		if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {

			throw new IllegalArgumentException("Invalid email format");
		}
	}

	// =========================================================
	// PASSWORD VALIDATION
	// =========================================================

	private void validatePassword(String password) {

		if (password == null || password.isBlank()) {

			throw new IllegalArgumentException("Password is required");
		}

		if (password.length() < 8) {

			throw new IllegalArgumentException("Password must contain at least 8 characters");
		}

		if (password.length() > 72) {

			throw new IllegalArgumentException("Password must not exceed 72 characters");
		}

		if (!password.matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,72}$")) {

			throw new IllegalArgumentException(
					"Password must contain uppercase, lowercase, number and special character");
		}
	}

	// =========================================================
	// ADMIN ID VALIDATION
	// =========================================================

	private void validateAdminId(Long adminId) {

		if (adminId == null || adminId <= 0) {

			throw new IllegalArgumentException("Valid Admin ID is required");
		}
	}
}