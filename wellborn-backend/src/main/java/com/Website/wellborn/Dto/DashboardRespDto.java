package com.Website.wellborn.Dto;

import lombok.Data;

@Data
public class DashboardRespDto {
	private Long totalDoctors;
	private Long totalServices;
	private Long totalAppointments;
	private Long totalContacts;
	private Long totalReviews;
	private Long totalUsers;
	private Long pendingAppointments;
	private Long confirmedAppointments;
	private Long completedAppointments;
	private Long cancelledAppointments;
	private Long pendingReviews;
	private Long approvedReviews;
	private Long rejectedReviews;
}
