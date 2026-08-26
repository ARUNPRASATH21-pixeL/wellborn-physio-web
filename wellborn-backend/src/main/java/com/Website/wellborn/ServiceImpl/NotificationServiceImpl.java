package com.Website.wellborn.ServiceImpl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.Website.wellborn.Dto.NotificationDto;
import com.Website.wellborn.Service.FcmTokenService;
import com.Website.wellborn.Service.NotificationService;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;

@Service
public class NotificationServiceImpl
        implements NotificationService {

    private final FcmTokenService fcmTokenService;

    public NotificationServiceImpl(
            FcmTokenService fcmTokenService
    ) {
        this.fcmTokenService = fcmTokenService;
    }

    // =========================================================
    // GENERIC NOTIFICATION
    // =========================================================

    @Override
    public String sendNotification(
            NotificationDto notificationDto
    ) {

        if (notificationDto == null) {

            throw new IllegalArgumentException(
                    "Notification data cannot be null"
            );
        }

        return sendToToken(
                notificationDto.getToken(),
                notificationDto.getTitle(),
                notificationDto.getMessage(),
                notificationDto.getType()
        );
    }

    // =========================================================
    // SEND TO ONE TOKEN
    // =========================================================

    @Override
    public String sendToToken(
            String token,
            String title,
            String message,
            String type
    ) {

        if (token == null
                || token.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "FCM token is required"
            );
        }

        try {

            String safeTitle =
                    title != null
                            ? title
                            : "Wellborn Physio";

            String safeMessage =
                    message != null
                            ? message
                            : "";

            String safeType =
                    type != null
                            ? type
                            : "GENERAL";

            Notification notification =
                    Notification.builder()
                            .setTitle(safeTitle)
                            .setBody(safeMessage)
                            .build();

            Message firebaseMessage =
                    Message.builder()
                            .setToken(token.trim())
                            .setNotification(notification)
                            .putData(
                                    "type",
                                    safeType
                            )
                            .putData(
                                    "title",
                                    safeTitle
                            )
                            .putData(
                                    "message",
                                    safeMessage
                            )
                            .build();

            String response =
                    FirebaseMessaging
                            .getInstance()
                            .send(firebaseMessage);

            System.out.println(
                    "FCM notification sent: "
                    + response
            );

            return response;

        } catch (Exception e) {

            System.err.println(
                    "FCM notification failed: "
                    + e.getMessage()
            );

            throw new RuntimeException(
                    "Unable to send Firebase notification",
                    e
            );
        }
    }

    // =========================================================
    // SEND TO ADMIN DEVICES ONLY
    // =========================================================

    @Override
    public void sendToAllAdmins(
            String title,
            String message,
            String type
    ) {

        List<String> adminTokens =
                fcmTokenService.getAdminTokens();

        if (adminTokens == null
                || adminTokens.isEmpty()) {

            System.out.println(
                    "No ADMIN FCM tokens available."
            );

            return;
        }

        for (String token : adminTokens) {

            if (token == null
                    || token.trim().isEmpty()) {

                continue;
            }

            try {

                sendToToken(
                        token,
                        title,
                        message,
                        type
                );

            } catch (Exception e) {

                System.err.println(
                        "Admin FCM failed for token: "
                        + token
                );

                System.err.println(
                        e.getMessage()
                );
            }
        }
    }
}