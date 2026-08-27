package com.Website.wellborn.ServiceImpl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;

@Service
public class EmailServiceImpl {

    // =========================================================
    // RESEND CONFIGURATION
    // =========================================================

    private final Resend resend;

    @Value("${resend.from.email}")
    private String fromEmail;

    public EmailServiceImpl(
            @Value("${resend.api.key}") String resendApiKey) {

        if (resendApiKey == null || resendApiKey.trim().isEmpty()) {
            throw new IllegalStateException(
                    "RESEND_API_KEY is not configured"
            );
        }

        this.resend = new Resend(resendApiKey);
    }

    // =========================================================
    // ADMIN SIGNUP OTP
    // =========================================================

    public void sendAdminEmailVerificationOtp(String to, String otp) {

        sendOtpEmail(
                to,
                otp,
                "Wellborn Physio - Admin Email Verification",
                "We received a request to verify your Wellborn Physio admin email."
        );
    }

    // =========================================================
    // APPOINTMENT OTP
    // =========================================================

    public void sendAppointmentEmailVerificationOtp(
            String to,
            String otp) {

        sendOtpEmail(
                to,
                otp,
                "Wellborn Physio - Appointment Email Verification",
                "Use this OTP to verify the email address used for your appointment."
        );
    }

    // =========================================================
    // ADMIN FORGOT PASSWORD OTP
    // =========================================================

    public void sendAdminPasswordResetOtp(
            String to,
            String otp) {

        validateEmail(to);
        validateOtp(otp);

        String email = to.trim().toLowerCase();

        String text =
                "Hello,\n\n"
                + "We received a request to reset your "
                + "Wellborn Physio admin account password.\n\n"
                + "Your password reset OTP is: "
                + otp
                + "\n\n"
                + "This OTP expires in 5 minutes.\n"
                + "You have a maximum of 5 attempts.\n\n"
                + "Never share this OTP with anyone.\n\n"
                + "If you did not request a password reset, "
                + "you can safely ignore this email.\n\n"
                + "Regards,\n"
                + "Wellborn Physio Rehab & Centre";

        sendTextEmail(
                email,
                "Wellborn Physio - Password Reset OTP",
                text
        );
    }

    // =========================================================
    // ADMIN PASSWORD RESET LINK
    // =========================================================

    public void sendAdminPasswordResetEmail(
            String to,
            String resetLink) {

        validateEmail(to);

        if (resetLink == null || resetLink.trim().isEmpty()) {
            throw new IllegalArgumentException(
                    "Reset link is required"
            );
        }

        String email = to.trim().toLowerCase();
        String safeLink = escapeHtml(resetLink);

        String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport"
                          content="width=device-width, initial-scale=1.0">

                    <title>
                        Wellborn Physio Password Reset
                    </title>
                </head>

                <body style="
                    margin:0;
                    padding:0;
                    background:#f1f5f9;
                    font-family:Arial,Helvetica,sans-serif;
                ">

                <table width="100%"
                       cellpadding="0"
                       cellspacing="0"
                       border="0"
                       style="
                           background:#f1f5f9;
                           padding:35px 15px;
                       ">

                <tr>
                <td align="center">

                <table width="100%"
                       cellpadding="0"
                       cellspacing="0"
                       border="0"
                       style="
                           max-width:600px;
                           background:#ffffff;
                           border-radius:18px;
                           overflow:hidden;
                       ">

                <!-- HEADER -->

                <tr>
                <td align="center"
                    style="
                        padding:30px 25px 25px;
                        background:#2563eb;
                    ">

                    <div style="
                        width:64px;
                        height:64px;
                        margin:0 auto 15px;
                        border-radius:50%;
                        background:#ffffff;
                        font-size:28px;
                        font-weight:700;
                        color:#2563eb;
                        line-height:64px;
                    ">
                        W
                    </div>

                    <div style="
                        color:#ffffff;
                        font-size:24px;
                        font-weight:700;
                    ">
                        Wellborn Physio
                    </div>

                    <div style="
                        margin-top:6px;
                        color:#ffffff;
                        font-size:13px;
                    ">
                        Rehab & Centre
                    </div>

                </td>
                </tr>

                <!-- CONTENT -->

                <tr>
                <td style="padding:35px;">

                    <h1 style="
                        margin:0 0 10px;
                        color:#0f172a;
                        font-size:25px;
                    ">
                        Reset Your Password
                    </h1>

                    <p style="
                        color:#475569;
                        font-size:15px;
                        line-height:1.7;
                    ">
                        Hello,
                    </p>

                    <p style="
                        color:#475569;
                        font-size:15px;
                        line-height:1.7;
                    ">
                        We received a request to reset your
                        <strong>
                            Wellborn Physio admin password
                        </strong>.
                    </p>

                    <p style="
                        color:#475569;
                        font-size:15px;
                        line-height:1.7;
                    ">
                        Click the button below to securely
                        create a new password.
                    </p>

                    <table width="100%"
                           cellpadding="0"
                           cellspacing="0"
                           border="0">

                    <tr>
                    <td align="center">

                        <a href="%s"
                           style="
                               display:inline-block;
                               padding:14px 30px;
                               background:#2563eb;
                               color:#ffffff;
                               text-decoration:none;
                               border-radius:10px;
                               font-size:15px;
                               font-weight:700;
                           ">
                            Reset Password
                        </a>

                    </td>
                    </tr>

                    </table>

                    <div style="
                        margin-top:25px;
                        padding:15px;
                        background:#eff6ff;
                        border:1px solid #bfdbfe;
                        border-radius:10px;
                        color:#1e40af;
                        font-size:13px;
                        line-height:1.6;
                    ">
                        <strong>Important:</strong>
                        This password reset link expires in
                        <strong>10 minutes</strong>
                        and can only be used once.
                    </div>

                    <p style="
                        margin-top:25px;
                        color:#64748b;
                        font-size:13px;
                    ">
                        If the button does not work,
                        copy and paste this link:
                    </p>

                    <div style="
                        padding:12px;
                        background:#f8fafc;
                        border:1px solid #e2e8f0;
                        border-radius:8px;
                        word-break:break-all;
                        color:#2563eb;
                        font-size:12px;
                    ">
                        %s
                    </div>

                    <div style="
                        margin-top:25px;
                        padding:15px;
                        background:#fefce8;
                        border:1px solid #fde68a;
                        border-radius:10px;
                        color:#854d0e;
                        font-size:13px;
                        line-height:1.6;
                    ">
                        <strong>Security notice:</strong>
                        If you did not request a password reset,
                        you can safely ignore this email.
                    </div>

                </td>
                </tr>

                <!-- FOOTER -->

                <tr>
                <td align="center"
                    style="
                        padding:22px 25px 28px;
                        border-top:1px solid #e2e8f0;
                    ">

                    <div style="
                        color:#64748b;
                        font-size:13px;
                        line-height:1.6;
                    ">
                        Regards,<br>

                        <strong style="color:#334155;">
                            Wellborn Physio
                            Rehab & Centre
                        </strong>
                    </div>

                    <div style="
                        margin-top:12px;
                        color:#94a3b8;
                        font-size:11px;
                    ">
                        This is an automated email.
                        Please do not reply.
                    </div>

                </td>
                </tr>

                </table>

                </td>
                </tr>

                </table>

                </body>
                </html>
                """.formatted(
                        safeLink,
                        safeLink
                );

        sendHtmlEmail(
                email,
                "Wellborn Physio - Reset Your Admin Password",
                html
        );
    }

    // =========================================================
    // COMMON OTP EMAIL
    // =========================================================

    private void sendOtpEmail(
            String to,
            String otp,
            String subject,
            String intro) {

        validateEmail(to);
        validateOtp(otp);

        String email = to.trim().toLowerCase();

        String text =
                "Hello,\n\n"
                + intro
                + "\n\n"
                + "Your verification OTP is: "
                + otp
                + "\n\n"
                + "This OTP expires in 5 minutes.\n"
                + "Never share this OTP with anyone.\n\n"
                + "If you did not request this, "
                + "you can safely ignore this email.\n\n"
                + "Regards,\n"
                + "Wellborn Physio Rehab & Centre";

        sendTextEmail(
                email,
                subject,
                text
        );
    }

    // =========================================================
    // SEND TEXT EMAIL
    // =========================================================

    private void sendTextEmail(
            String to,
            String subject,
            String text) {

        try {

            CreateEmailOptions email =
                    CreateEmailOptions.builder()
                            .from(fromEmail)
                            .to(to)
                            .subject(subject)
                            .text(text)
                            .build();

            CreateEmailResponse response =
                    resend.emails().send(email);

            if (response == null) {
                throw new IllegalStateException(
                        "Resend returned an empty response"
                );
            }

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Unable to send email through Resend",
                    e
            );
        }
    }

    // =========================================================
    // SEND HTML EMAIL
    // =========================================================

    private void sendHtmlEmail(
            String to,
            String subject,
            String html) {

        try {

            CreateEmailOptions email =
                    CreateEmailOptions.builder()
                            .from(fromEmail)
                            .to(to)
                            .subject(subject)
                            .html(html)
                            .build();

            CreateEmailResponse response =
                    resend.emails().send(email);

            if (response == null) {
                throw new IllegalStateException(
                        "Resend returned an empty response"
                );
            }

        } catch (Exception e) {

            throw new IllegalStateException(
                    "Unable to send email through Resend",
                    e
            );
        }
    }

    // =========================================================
    // EMAIL VALIDATION
    // =========================================================

    private void validateEmail(String email) {

        if (email == null || email.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Email address is required"
            );
        }
    }

    // =========================================================
    // OTP VALIDATION
    // =========================================================

    private void validateOtp(String otp) {

        if (otp == null || !otp.matches("\\d{6}")) {

            throw new IllegalArgumentException(
                    "Invalid verification OTP"
            );
        }
    }

    // =========================================================
    // HTML ESCAPE
    // =========================================================

    private String escapeHtml(String value) {

        if (value == null) {
            return "";
        }

        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}