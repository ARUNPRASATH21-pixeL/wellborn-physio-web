package com.Website.wellborn.Config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cloudinary.Cloudinary;

@Configuration
public class CloudinaryConfig {

    @Value("${CLOUDINARY_URL:}")
    private String cloudinaryUrl;

    @Bean
    public Cloudinary cloudinary() {

        if (cloudinaryUrl == null ||
            cloudinaryUrl.trim().isEmpty()) {

            throw new IllegalStateException(
                    "CLOUDINARY_URL environment variable is missing."
            );
        }

        return new Cloudinary(cloudinaryUrl);
    }
}