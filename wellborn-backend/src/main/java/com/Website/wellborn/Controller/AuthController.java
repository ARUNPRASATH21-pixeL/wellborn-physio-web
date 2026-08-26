package com.Website.wellborn.Controller;

import com.Website.wellborn.Dto.*;
import com.Website.wellborn.ServiceImpl.AuthServiceImpl;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

	private final AuthServiceImpl auth;

	public AuthController(AuthServiceImpl a) {
		auth = a;
	}

	// =========================================================
	// USER - EXISTING FLOW LEFT INTACT
	// =========================================================

	@PostMapping("/user/signup")
	public AuthResponse userSignup(@Valid @RequestBody UserRegisterRequest r) {
		return auth.userRegister(r);
	}

	@PostMapping("/user/login")
	public AuthResponse userLogin(@Valid @RequestBody UserLoginRequest r) {
		return auth.userLogin(r);
	}

	@PostMapping("/user/reset/request")
	public Map<String, String> userReset(@Valid @RequestBody ResetPasswordRequest r) {

		return Map.of("message", "Reset token generated", "token", auth.userResetRequest(r.getEmail()));
	}

	@PostMapping("/user/reset/confirm")
	public Map<String, String> userResetConfirm(@Valid @RequestBody ConfirmResetRequest r) {

		auth.userResetConfirm(r.getToken(), r.getNewPassword());

		return Map.of("message", "Password reset successfully");
	}

	// =========================================================
	// ADMIN SIGNUP - SECURE MULTI-STEP FLOW
	//
	// Name + Phone + Email
	// -> Email availability
	// -> OTP
	// -> OTP verification
	// -> Medical secret code verification
	// -> Create Password + Confirm Password
	// -> Final admin account creation
	//
	// Address is intentionally NOT part of this signup flow.
	// =========================================================

	@GetMapping("/admin/signup/email-status")
	public Map<String, Object> adminSignupEmailStatus(@RequestParam String email) {

		boolean available = auth.isAdminEmailAvailable(email);

		return Map.of("available", available, "showSendOtp", available);
	}

	/**
	 * Starts a temporary signup. No Admin row is created here.
	 */
	@PostMapping("/admin/signup/start")
	public Map<String, String> adminSignupStart(@Valid @RequestBody AdminSignupStartRequest r) {

		return auth.startAdminSignup(r);
	}

	/**
	 * Verifies the OTP sent to the signup email. Returns a short-lived one-time
	 * signup completion token.
	 */
	@PostMapping("/admin/signup/verify-otp")
	public Map<String, String> adminSignupVerifyOtp(@Valid @RequestBody AdminSignupOtpRequest r) {

		return Map.of("message", "Email verified successfully. Enter the medical secret code.", "signupToken",
				auth.verifyAdminSignupOtp(r.getEmail(), r.getOtp()));
	}

	/**
	 * Resends the signup OTP. Still no Admin row is created.
	 */
	@PostMapping("/admin/signup/resend-otp")
	public Map<String, String> adminSignupResendOtp(@RequestParam String email) {

		auth.resendAdminSignupOtp(email);

		return Map.of("message", "If the signup is still active, a new OTP has been sent.");
	}

	/**
	 * Verifies the medical secret code after email OTP verification. Returns a
	 * short-lived one-time token for password creation.
	 */
	@PostMapping("/admin/signup/verify-secret")
	public Map<String, String> adminSignupVerifySecret(@Valid @RequestBody AdminSignupSecretCodeRequest r) {

		return Map.of("message", "Medical secret code verified. Create your password.", "signupToken",
				auth.verifyAdminSignupSecretCode(r));
	}

	/**
	 * Final step: creates the Admin row using the one-time password-creation token.
	 */
	@PostMapping("/admin/signup/complete")
	public AuthResponse adminSignupComplete(@Valid @RequestBody AdminSignupCompleteRequest r) {

		return auth.completeAdminSignup(r);
	}

	// =========================================================
	// ADMIN LOGIN
	// =========================================================

	@PostMapping("/admin/login")
	public AuthResponse adminLogin(@Valid @RequestBody AdminLoginRequest r) {

		return auth.adminLogin(r);
	}

	// =========================================================
	// ADMIN FORGOT PASSWORD
	// =========================================================

	@PostMapping("/admin/reset/request")
	public Map<String, String> adminReset(@Valid @RequestBody ResetPasswordRequest r) {

		auth.adminResetRequest(r.getEmail());

		return Map.of("message", "If the email is registered and verified, a password reset link has been sent.");
	}

	@PostMapping("/admin/reset/confirm")
	public Map<String, String> adminResetConfirm(@Valid @RequestBody ConfirmResetRequest r) {

		auth.adminResetConfirm(r.getToken(), r.getNewPassword());

		return Map.of("message", "Password reset successfully");
	}

}
