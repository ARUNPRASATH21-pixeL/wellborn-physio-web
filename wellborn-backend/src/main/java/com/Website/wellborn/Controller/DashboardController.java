package com.Website.wellborn.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Website.wellborn.Dto.DashboardRespDto;
import com.Website.wellborn.Service.DashboardService;

@RestController
@CrossOrigin("*")
public class DashboardController {

	@Autowired
	private DashboardService dashboardService;

	@GetMapping("/dashboard")
	public DashboardRespDto getDashboard() {

		return dashboardService.getDashboard();

	}

}