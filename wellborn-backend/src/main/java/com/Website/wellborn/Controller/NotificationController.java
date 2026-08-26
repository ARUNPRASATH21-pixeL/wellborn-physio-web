package com.Website.wellborn.Controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Website.wellborn.Dto.NotificationDto;
import com.Website.wellborn.Service.NotificationService;

@RestController
@RequestMapping("/notifications")
@CrossOrigin("*")
public class NotificationController {

	private final NotificationService notificationService;

	public NotificationController(NotificationService notificationService) {
		this.notificationService = notificationService;
	}

	@PostMapping("/send")
	public ResponseEntity<?> sendNotification(@RequestBody NotificationDto notificationDto) {

		String response = notificationService.sendNotification(notificationDto);

		Map<String, Object> result = new HashMap<>();

		result.put("success", true);
		result.put("message", "Notification sent successfully");
		result.put("firebaseResponse", response);

		return ResponseEntity.ok(result);
	}
}