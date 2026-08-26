package com.Website.wellborn.Config;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

@Configuration
public class FirebaseConfig {

    /*
     * Local development:
     * Uses firebase-service-account.json from classpath.
     *
     * Production (Render):
     * Uses FIREBASE_SERVICE_ACCOUNT_JSON environment variable.
     */
    @Value("${firebase.service-account:classpath:firebase-service-account.json}")
    private Resource firebaseServiceAccount;

    @Bean
    public FirebaseApp firebaseApp() throws IOException {

        // Prevent duplicate Firebase initialization
        if (!FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.getInstance();
        }

        String firebaseJson = System.getenv("FIREBASE_SERVICE_ACCOUNT_JSON");

        GoogleCredentials credentials;

        /*
         * Production:
         * FIREBASE_SERVICE_ACCOUNT_JSON exists in Render environment.
         */
        if (firebaseJson != null && !firebaseJson.isBlank()) {

            credentials = GoogleCredentials.fromStream(
                    new ByteArrayInputStream(
                            firebaseJson.getBytes(StandardCharsets.UTF_8)
                    )
            );

        } else {

            /*
             * Local:
             * Load firebase-service-account.json
             * from src/main/resources
             */
            if (!firebaseServiceAccount.exists()) {
                throw new IOException(
                        "Firebase service account not found. " +
                        "Set FIREBASE_SERVICE_ACCOUNT_JSON environment variable " +
                        "or provide firebase-service-account.json in resources."
                );
            }

            credentials = GoogleCredentials.fromStream(
                    firebaseServiceAccount.getInputStream()
            );
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(credentials)
                .build();

        return FirebaseApp.initializeApp(options);
    }
}