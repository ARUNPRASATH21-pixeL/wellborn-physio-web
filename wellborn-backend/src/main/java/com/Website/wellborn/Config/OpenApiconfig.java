package com.Website.wellborn.Config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiconfig {

    @Bean
    public OpenAPI customOpenAPI() {

        Info info = new Info()
                .title("Wellborn physio")
                .version("1.0.0")
                .description("This is the API documentation for the User Application")

                .contact(new Contact()
                        .name("Arun")
                        .email("arun@example.com")
                        .url("https://google.com/"))

                .license(new License()
                        .name("Apache 2.0")
                        .url("https://springdoc.org"));

        return new OpenAPI().info(info);
    }
}