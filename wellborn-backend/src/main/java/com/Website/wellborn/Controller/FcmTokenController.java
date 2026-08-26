package com.Website.wellborn.Controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Website.wellborn.Dto.FcmTokenDto;
import com.Website.wellborn.Service.FcmTokenService;

@RestController
@RequestMapping("/fcm")
@CrossOrigin
public class FcmTokenController {

    private final FcmTokenService fcmTokenService;

    public FcmTokenController(
            FcmTokenService fcmTokenService
    ) {
        this.fcmTokenService = fcmTokenService;
    }

    // =========================================================
    // SAVE FCM TOKEN
    // =========================================================

    @PostMapping("/token")
    public ResponseEntity<?> saveToken(
            @RequestBody FcmTokenDto dto
    ) {

        if (dto == null
                || dto.getToken() == null
                || dto.getToken().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                        Map.of(
                            "success",
                            false,
                            "message",
                            "FCM token is required"
                        )
                    );
        }

        String role = dto.getRole();

        if (role == null
                || role.trim().isEmpty()) {

            role = "USER";
        }

        role = role.trim().toUpperCase();

        if (!role.equals("ADMIN")
                && !role.equals("USER")) {

            return ResponseEntity
                    .badRequest()
                    .body(
                        Map.of(
                            "success",
                            false,
                            "message",
                            "Invalid FCM token role"
                        )
                    );
        }

        fcmTokenService.saveToken(
                dto.getToken(),
                role
        );

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "success",
                true
        );

        response.put(
                "message",
                "FCM token saved successfully"
        );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // DELETE FCM TOKEN
    // =========================================================

    @DeleteMapping("/token")
    public ResponseEntity<?> deleteToken(
            @RequestBody FcmTokenDto dto
    ) {

        if (dto == null
                || dto.getToken() == null
                || dto.getToken().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                        Map.of(
                            "success",
                            false,
                            "message",
                            "FCM token is required"
                        )
                    );
        }

        fcmTokenService.deleteToken(
                dto.getToken()
        );

        return ResponseEntity.ok(
                Map.of(
                    "success",
                    true,
                    "message",
                    "FCM token deleted successfully"
                )
        );
    }
}