package com.Website.wellborn.Config;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

@Configuration
public class FirebaseConfig {

	@Value("${firebase.service-account}")
	private Resource firebaseServiceAccount;

	@Bean
	public FirebaseApp firebaseApp() throws IOException {

		if (!FirebaseApp.getApps().isEmpty()) {
			return FirebaseApp.getInstance();
		}

		FirebaseOptions options = FirebaseOptions.builder()
				.setCredentials(GoogleCredentials.fromStream(firebaseServiceAccount.getInputStream())).build();

		return FirebaseApp.initializeApp(options);
	}
}