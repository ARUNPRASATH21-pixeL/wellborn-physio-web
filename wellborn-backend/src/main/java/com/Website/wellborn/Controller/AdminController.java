package com.Website.wellborn.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.Website.wellborn.Dto.AdminChangePasswordDto;
import com.Website.wellborn.Dto.AdminDto;
import com.Website.wellborn.Dto.AdminLoginRequest;
import com.Website.wellborn.Dto.AdminLoginResponse;
import com.Website.wellborn.Dto.AdminRespDto;
import com.Website.wellborn.Dto.AdminResetOtpResponse;
import com.Website.wellborn.Service.AdminService;

@RestController
@RequestMapping("/admin")
@CrossOrigin("*")
public class AdminController {

	@Autowired
	private AdminService adminService;

	// =========================================================
	// LOGIN
	// =========================================================

	@PostMapping("/login")
	public AdminLoginResponse login(@RequestBody AdminLoginRequest request) {

		return adminService.login(request);
	}

	// =========================================================
	// REGISTER
	// =========================================================

	@PostMapping("/register")
	public AdminRespDto register(@RequestBody AdminDto request) {

		return adminService.register(request);
	}

	// =========================================================
	// GET ADMIN
	// =========================================================

	@GetMapping("/get/{adminId}")
	public AdminRespDto getAdmin(@PathVariable Long adminId, Authentication authentication) {

		verifyAdminAccess(adminId, authentication);

		return adminService.getAdmin(adminId);
	}

	// =========================================================
	// UPDATE PROFILE
	// =========================================================

	@PutMapping("/update/{adminId}")
	public AdminRespDto updateAdmin(@PathVariable Long adminId, @RequestBody AdminDto request,
			Authentication authentication) {

		verifyAdminAccess(adminId, authentication);

		return adminService.updateAdmin(adminId, request);
	}

	// =========================================================
	// CHANGE PASSWORD
	// =========================================================

	@PutMapping("/change-password/{adminId}")
	public String changePassword(@PathVariable Long adminId, @RequestBody AdminChangePasswordDto request,
			Authentication authentication) {

		verifyAdminAccess(adminId, authentication);

		adminService.changePassword(adminId, request);

		return "Password changed successfully";
	}

	// =========================================================
	// DELETE ADMIN
	// =========================================================

	@DeleteMapping("/delete/{adminId}")
	public String deleteAdmin(@PathVariable Long adminId, Authentication authentication) {

		verifyAdminAccess(adminId, authentication);

		adminService.deleteAdmin(adminId);

		return "Admin Deleted Successfully";
	}

	// =========================================================
	// FORGOT PASSWORD
	// SEND OTP
	//
	// POST:
	// /admin/forgot-password/send-otp?email=...
	//
	// PUBLIC ENDPOINT
	// =========================================================

	@PostMapping("/forgot-password/send-otp")
	public String sendResetOtp(@RequestParam String email) {

		adminService.sendResetOtp(email);

		return "OTP sent successfully to your registered email";
	}

	// =========================================================
	// FORGOT PASSWORD
	// VERIFY OTP
	//
	// POST:
	// /admin/forgot-password/verify-otp
	//
	// ?email=...
	// &otp=...
	//
	// PUBLIC ENDPOINT
	// =========================================================

	@PostMapping("/forgot-password/verify-otp")
	public AdminResetOtpResponse verifyResetOtp(@RequestParam String email, @RequestParam String otp) {

		return adminService.verifyResetOtp(email, otp);
	}

	// =========================================================
	// FORGOT PASSWORD
	// RESET PASSWORD
	//
	// POST:
	// /admin/forgot-password/reset
	//
	// ?email=...
	// &resetToken=...
	// &newPassword=...
	// &confirmPassword=...
	//
	// PUBLIC ENDPOINT
	// =========================================================

	@PostMapping("/forgot-password/reset")
	public String resetPassword(@RequestParam String email, @RequestParam String resetToken,
			@RequestParam String newPassword, @RequestParam String confirmPassword) {

		adminService.resetPassword(email, resetToken, newPassword, confirmPassword);

		return "Password reset successfully";
	}

	// =========================================================
	// SECURITY CHECK
	// =========================================================

	private void verifyAdminAccess(Long requestedAdminId, Authentication authentication) {

		// -----------------------------------------------------
		// AUTHENTICATION CHECK
		// -----------------------------------------------------

		if (authentication == null || !authentication.isAuthenticated()) {

			throw new AccessDeniedException("Authentication required");
		}

		// -----------------------------------------------------
		// ADMIN ROLE CHECK
		// -----------------------------------------------------

		boolean isAdmin = authentication.getAuthorities().stream()
				.anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

		if (!isAdmin) {

			throw new AccessDeniedException("Admin access required");
		}

		// -----------------------------------------------------
		// AUTHENTICATED EMAIL
		// -----------------------------------------------------

		String authenticatedEmail = authentication.getName();

		if (authenticatedEmail == null || authenticatedEmail.trim().isEmpty()) {

			throw new AccessDeniedException("Invalid authentication");
		}

		// -----------------------------------------------------
		// FIND ADMIN BY EMAIL
		// -----------------------------------------------------

		AdminRespDto authenticatedAdmin = adminService.getAdminByEmail(authenticatedEmail);

		// -----------------------------------------------------
		// ADMIN ID OWNERSHIP CHECK
		// -----------------------------------------------------

		if (authenticatedAdmin == null || authenticatedAdmin.getAdminId() == null
				|| !authenticatedAdmin.getAdminId().equals(requestedAdminId)) {

			throw new AccessDeniedException("You are not authorized to access this admin account");
		}
	}
}