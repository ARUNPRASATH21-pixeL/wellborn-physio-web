package com.Website.wellborn.Service;

import com.Website.wellborn.Dto.AdminChangePasswordDto;
import com.Website.wellborn.Dto.AdminDto;
import com.Website.wellborn.Dto.AdminLoginRequest;
import com.Website.wellborn.Dto.AdminLoginResponse;
import com.Website.wellborn.Dto.AdminRespDto;
import com.Website.wellborn.Dto.AdminResetOtpResponse;

public interface AdminService {

	AdminRespDto register(AdminDto request);

	AdminLoginResponse login(AdminLoginRequest request);

	AdminRespDto getAdmin(Long adminId);

	AdminRespDto getAdminByEmail(String email);

	AdminRespDto updateAdmin(Long adminId, AdminDto request);

	void changePassword(Long adminId, AdminChangePasswordDto request);

	void deleteAdmin(Long adminId);

	void sendResetOtp(String email);

	AdminResetOtpResponse verifyResetOtp(String email, String otp);

	void resetPassword(String email, String resetToken, String newPassword, String confirmPassword);
}