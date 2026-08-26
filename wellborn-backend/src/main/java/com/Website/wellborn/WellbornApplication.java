package com.Website.wellborn;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class WellbornApplication {

	public static void main(String[] args) {

		SpringApplication.run(WellbornApplication.class, args);
	}
}