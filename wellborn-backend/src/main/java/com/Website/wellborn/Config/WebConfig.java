package com.Website.wellborn.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(
            ResourceHandlerRegistry registry) {

        // =====================================================
        // UPLOADS
        // =====================================================

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}