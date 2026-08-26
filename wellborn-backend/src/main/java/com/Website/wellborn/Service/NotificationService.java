package com.Website.wellborn.Service;

import com.Website.wellborn.Dto.NotificationDto;

public interface NotificationService {

    String sendNotification(
            NotificationDto notificationDto
    );

    String sendToToken(
            String token,
            String title,
            String message,
            String type
    );

    void sendToAllAdmins(
            String title,
            String message,
            String type
    );
}