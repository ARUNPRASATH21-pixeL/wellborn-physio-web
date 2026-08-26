package com.Website.wellborn.ServiceImpl;

import com.Website.wellborn.Dto.DashboardRespDto;
import com.Website.wellborn.Repositery.*;
import com.Website.wellborn.Service.DashboardService;
import org.springframework.stereotype.Service;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final DoctorRepositery d;
    private final PhysioServiceRepositery s;
    private final AppointmentRepository a;
    private final ContactRepository c;
    private final ReviewRepository r;
    private final UserRepository u;

    public DashboardServiceImpl(
            DoctorRepositery d,
            PhysioServiceRepositery s,
            AppointmentRepository a,
            ContactRepository c,
            ReviewRepository r,
            UserRepository u
    ) {
        this.d = d;
        this.s = s;
        this.a = a;
        this.c = c;
        this.r = r;
        this.u = u;
    }

    @Override
    public DashboardRespDto getDashboard() {

        DashboardRespDto x = new DashboardRespDto();

        // =====================================================
        // BASIC TOTALS
        // =====================================================

        x.setTotalDoctors(d.count());
        x.setTotalServices(s.count());
        x.setTotalAppointments(a.count());
        x.setTotalContacts(c.count());
        x.setTotalReviews(r.count());
        x.setTotalUsers(u.count());

        // =====================================================
        // APPOINTMENT STATUS COUNTS
        // =====================================================

        long pending =
                a.countByStatusIgnoreCase("PENDING");

        long confirmed =
                a.countByStatusIgnoreCase("CONFIRMED");

        long completed =
                a.countByStatusIgnoreCase("COMPLETED");

        long cancelled =
                a.countByStatusIgnoreCase("CANCELLED");

        x.setPendingAppointments(pending);
        x.setConfirmedAppointments(confirmed);
        x.setCompletedAppointments(completed);
        x.setCancelledAppointments(cancelled);

        // =====================================================
        // REVIEW STATUS COUNTS
        // =====================================================

        x.setPendingReviews(
                r.countByStatus("PENDING")
        );

        x.setApprovedReviews(
                r.countByStatus("APPROVED")
        );

        x.setRejectedReviews(
                r.countByStatus("REJECTED")
        );

        // =====================================================
        // DEBUG
        // =====================================================

        System.out.println("======================================");
        System.out.println("APPOINTMENT STATUS COUNTS");
        System.out.println("PENDING   : " + pending);
        System.out.println("CONFIRMED : " + confirmed);
        System.out.println("COMPLETED : " + completed);
        System.out.println("CANCELLED : " + cancelled);
        System.out.println("TOTAL     : " + a.count());
        System.out.println("======================================");

        return x;
    }
}