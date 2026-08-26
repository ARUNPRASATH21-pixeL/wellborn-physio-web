package com.Website.wellborn.ServiceImpl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Website.wellborn.Dto.AppointmentDto;
import com.Website.wellborn.Dto.AppointmentRespDto;
import com.Website.wellborn.Entity.Appointment;
import com.Website.wellborn.Entity.PhysioService;
import com.Website.wellborn.Repositery.AppointmentRepository;
import com.Website.wellborn.Repositery.PhysioServiceRepositery;
import com.Website.wellborn.Service.AppointmentService;
import com.Website.wellborn.Service.NotificationService;

@Service
@Transactional
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PhysioServiceRepositery physioServiceRepository;
    private final NotificationService notificationService;

    private static final Logger logger =
            LoggerFactory.getLogger(AppointmentServiceImpl.class);

    // =========================================================
    // INDIA TIMEZONE
    // =========================================================

    private static final ZoneId INDIA_ZONE =
            ZoneId.of("Asia/Kolkata");

    // =========================================================
    // CLINIC TIMINGS
    // =========================================================

    private static final LocalTime CLINIC_OPEN_TIME =
            LocalTime.of(9, 0);

    private static final LocalTime CLINIC_CLOSE_TIME =
            LocalTime.of(20, 0);

    private static final LocalTime SAME_DAY_BOOKING_CUTOFF =
            LocalTime.of(19, 30);

    // =========================================================
    // ACTIVE STATUSES
    // =========================================================

    private static final List<String> ACTIVE_STATUSES =
            List.of(
                    "PENDING",
                    "CONFIRMED",
                    "COMPLETED"
            );

    // =========================================================
    // FIELD VALIDATION
    // =========================================================

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile(
                    "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
            );

    private static final Pattern PHONE_PATTERN =
            Pattern.compile(
                    "^[0-9+\\-()\\s]{7,20}$"
            );

    private static final int NAME_MAX_LENGTH = 100;
    private static final int EMAIL_MAX_LENGTH = 150;
    private static final int MESSAGE_MAX_LENGTH = 1000;
    private static final int FCM_TOKEN_MAX_LENGTH = 4096;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public AppointmentServiceImpl(
            AppointmentRepository appointmentRepository,
            PhysioServiceRepositery physioServiceRepository,
            NotificationService notificationService) {

        this.appointmentRepository = appointmentRepository;
        this.physioServiceRepository = physioServiceRepository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // BOOK APPOINTMENT
    // =========================================================

    @Override
    public AppointmentRespDto bookAppointment(
            AppointmentDto request) {

        if (request == null) {
            throw new RuntimeException(
                    "Appointment request cannot be null"
            );
        }

        // =====================================================
        // BASIC VALIDATION
        // =====================================================

        if (request.getPatientName() == null
                || request.getPatientName().trim().isEmpty()) {

            throw new RuntimeException(
                    "Patient name is required"
            );
        }

        String patientName =
                request.getPatientName().trim();

        if (patientName.length() < 2) {

            throw new RuntimeException(
                    "Please enter a valid name"
            );
        }

        if (patientName.length() > NAME_MAX_LENGTH) {

            throw new RuntimeException(
                    "Patient name must be under "
                            + NAME_MAX_LENGTH
                            + " characters"
            );
        }

        // =====================================================
        // PHONE
        // =====================================================

        if (request.getPhone() == null
                || request.getPhone().trim().isEmpty()) {

            throw new RuntimeException(
                    "Phone number is required"
            );
        }

        String phone =
                request.getPhone().trim();

        if (!PHONE_PATTERN.matcher(phone).matches()) {

            throw new RuntimeException(
                    "Please enter a valid phone number"
            );
        }

        // =====================================================
        // EMAIL
        // =====================================================

        if (request.getEmail() == null
                || request.getEmail().trim().isEmpty()) {

            throw new RuntimeException(
                    "Email is required"
            );
        }

        String email =
                request.getEmail().trim();

        if (email.length() > EMAIL_MAX_LENGTH) {

            throw new RuntimeException(
                    "Email must be under "
                            + EMAIL_MAX_LENGTH
                            + " characters"
            );
        }

        if (!EMAIL_PATTERN.matcher(email).matches()) {

            throw new RuntimeException(
                    "Please enter a valid email address"
            );
        }

        // =====================================================
        // MESSAGE
        // =====================================================

        if (request.getMessage() != null
                && request.getMessage().trim().length()
                > MESSAGE_MAX_LENGTH) {

            throw new RuntimeException(
                    "Message must be under "
                            + MESSAGE_MAX_LENGTH
                            + " characters"
            );
        }

        // =====================================================
        // DATE
        // =====================================================

        if (request.getAppointmentDate() == null) {

            throw new RuntimeException(
                    "Appointment date is required"
            );
        }

        // =====================================================
        // TIME
        // =====================================================

        if (request.getAppointmentTime() == null) {

            throw new RuntimeException(
                    "Appointment time is required"
            );
        }

        // =====================================================
        // SERVICE VALIDATION
        // =====================================================

        boolean isOther =
                (request.getServiceName() != null
                        && request.getServiceName()
                        .trim()
                        .equalsIgnoreCase("Other"))
                || request.getServiceId() == null;

        PhysioService service = null;

        if (!isOther) {

            if (request.getServiceId() == null) {

                throw new RuntimeException(
                        "Service is required"
                );
            }

            service =
                    physioServiceRepository
                            .findById(request.getServiceId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Service not found"
                                    )
                            );
        }

        // =====================================================
        // DATE + TIME VALIDATION
        // =====================================================

        validateAppointmentDateTime(
                request.getAppointmentDate(),
                request.getAppointmentTime()
        );

        // =====================================================
        // DOUBLE BOOKING CHECK
        // =====================================================

        if (isSlotTaken(
                request.getAppointmentDate(),
                request.getAppointmentTime(),
                null)) {

            throw new RuntimeException(
                    "This time slot is already booked. Please choose another time."
            );
        }

        // =====================================================
        // CURRENT INDIA TIME
        // =====================================================

        LocalDateTime indiaNow =
                LocalDateTime.now(INDIA_ZONE);

        // =====================================================
        // CREATE APPOINTMENT
        // =====================================================

        Appointment appointment =
                Appointment.builder()
                        .patientName(patientName)
                        .ageCategory(request.getAgeCategory())
                        .phone(phone)
                        .email(email.toLowerCase())
                        .appointmentDate(
                                request.getAppointmentDate()
                        )
                        .appointmentTime(
                                request.getAppointmentTime()
                        )
                        .message(
                                request.getMessage() != null
                                        ? request.getMessage().trim()
                                        : null
                        )
                        .status("PENDING")
                        .createdAt(indiaNow)
                        .updatedAt(indiaNow)
                        .service(service)
                        .build();

        Appointment saved =
                appointmentRepository.save(appointment);

        // =====================================================
        // SEND NOTIFICATIONS
        // =====================================================

        String serviceName =
                saved.getService() != null
                        ? saved.getService().getServiceName()
                        : "Other";

        // 1. ADMIN FCM (Notify all admins)
        sendAdminBookingNotification(
                saved,
                serviceName
        );

        // 2. USER FCM (Send confirmation notification to the user)
        sendUserBookingNotification(
                saved,
                serviceName,
                request.getFcmToken()
        );

        logger.info(
                "Appointment booked successfully - ID: {}",
                saved.getAppointmentId()
        );

        return convertToResponse(saved);
    }

    // =========================================================
    // UPDATE APPOINTMENT
    // =========================================================

    @Override
    public AppointmentRespDto updateAppointment(
            Long appointmentId,
            AppointmentDto request) {

        if (appointmentId == null) {

            throw new RuntimeException(
                    "Appointment ID is required"
            );
        }

        if (request == null) {

            throw new RuntimeException(
                    "Appointment request cannot be null"
            );
        }

        Appointment appointment =
                appointmentRepository
                        .findById(appointmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Appointment not found with ID: "
                                                + appointmentId
                                )
                        );

        // =====================================================
        // OLD VALUES
        // =====================================================

        String oldStatus =
                appointment.getStatus();

        String oldDate =
                appointment.getAppointmentDate().toString();

        String oldTime =
                appointment.getAppointmentTime().toString();

        // =====================================================
        // PATIENT NAME
        // =====================================================

        String patientName =
                request.getPatientName() != null
                        && !request.getPatientName()
                        .trim()
                        .isEmpty()
                        ? request.getPatientName().trim()
                        : appointment.getPatientName();

        if (patientName.length() < 2
                || patientName.length() > NAME_MAX_LENGTH) {

            throw new RuntimeException(
                    "Patient name must be between 2 and "
                            + NAME_MAX_LENGTH
                            + " characters"
            );
        }

        // =====================================================
        // PHONE
        // =====================================================

        String phone =
                request.getPhone() != null
                        && !request.getPhone()
                        .trim()
                        .isEmpty()
                        ? request.getPhone().trim()
                        : appointment.getPhone();

        if (!PHONE_PATTERN.matcher(phone).matches()) {

            throw new RuntimeException(
                    "Please enter a valid phone number"
            );
        }

        // =====================================================
        // EMAIL
        // =====================================================

        String email =
                request.getEmail() != null
                        && !request.getEmail()
                        .trim()
                        .isEmpty()
                        ? request.getEmail()
                        .trim()
                        .toLowerCase()
                        : appointment.getEmail();

        if (email.length() > EMAIL_MAX_LENGTH
                || !EMAIL_PATTERN.matcher(email).matches()) {

            throw new RuntimeException(
                    "Please enter a valid email address"
            );
        }

        // =====================================================
        // MESSAGE
        // =====================================================

        if (request.getMessage() != null
                && request.getMessage()
                .trim()
                .length() > MESSAGE_MAX_LENGTH) {

            throw new RuntimeException(
                    "Message must be under "
                            + MESSAGE_MAX_LENGTH
                            + " characters"
            );
        }

        // =====================================================
        // DATE + TIME
        // =====================================================

        LocalDate appointmentDate =
                request.getAppointmentDate() != null
                        ? request.getAppointmentDate()
                        : appointment.getAppointmentDate();

        LocalTime appointmentTime =
                request.getAppointmentTime() != null
                        ? request.getAppointmentTime()
                        : appointment.getAppointmentTime();

        // =====================================================
        // SERVICE
        // =====================================================

        boolean isOther =
                (request.getServiceName() != null
                        && request.getServiceName()
                        .trim()
                        .equalsIgnoreCase("Other"))
                || request.getServiceId() == null;

        PhysioService service =
                appointment.getService();

        if (!isOther
                && request.getServiceId() != null) {

            service =
                    physioServiceRepository
                            .findById(request.getServiceId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Service not found"
                                    )
                            );
        }

        // =====================================================
        // STATUS
        // =====================================================

        String requestedStatus =
                request.getStatus();

        boolean statusRequested =
                requestedStatus != null
                        && !requestedStatus
                        .trim()
                        .isEmpty();

        if (statusRequested) {

            requestedStatus =
                    requestedStatus
                            .trim()
                            .toUpperCase();

            if (!isValidStatus(requestedStatus)) {

                throw new RuntimeException(
                        "Invalid appointment status: "
                                + requestedStatus
                );
            }
        }

        // =====================================================
        // CHECK WHETHER ONLY STATUS CHANGED
        // =====================================================

        boolean isOnlyStatusChange =
                patientName.equals(
                        appointment.getPatientName()
                )
                && phone.equals(
                        appointment.getPhone()
                )
                && email.equals(
                        appointment.getEmail()
                )
                && appointmentDate.equals(
                        appointment.getAppointmentDate()
                )
                && appointmentTime.equals(
                        appointment.getAppointmentTime()
                );

        if (!isOnlyStatusChange) {

            validateAppointmentDateTime(
                    appointmentDate,
                    appointmentTime
            );
        }

        // =====================================================
        // RESCHEDULE CHECK
        // =====================================================

        boolean isRescheduled =
                !oldDate.equals(
                        appointmentDate.toString()
                )
                || !oldTime.equals(
                        appointmentTime.toString()
                );

        if (isRescheduled
                && isSlotTaken(
                        appointmentDate,
                        appointmentTime,
                        appointmentId)) {

            throw new RuntimeException(
                    "This time slot is already booked. Please choose another time."
            );
        }

        // =====================================================
        // UPDATE FIELDS
        // =====================================================

        appointment.setPatientName(
                patientName
        );

        if (request.getAgeCategory() != null) {

            appointment.setAgeCategory(
                    request.getAgeCategory()
            );
        }

        appointment.setPhone(phone);
        appointment.setEmail(email);

        appointment.setAppointmentDate(
                appointmentDate
        );

        appointment.setAppointmentTime(
                appointmentTime
        );

        if (request.getMessage() != null) {

            appointment.setMessage(
                    request.getMessage().trim()
            );
        }

        appointment.setService(service);

        // =====================================================
        // STATUS UPDATE
        // =====================================================

        if (statusRequested) {

            appointment.setStatus(
                    requestedStatus
            );
        }

        // =====================================================
        // UPDATED TIME
        // =====================================================

        appointment.setUpdatedAt(
                LocalDateTime.now(INDIA_ZONE)
        );

        // =====================================================
        // SAVE
        // =====================================================

        Appointment updated =
                appointmentRepository.save(
                        appointment
                );

        // =====================================================
        // STATUS CHANGE NOTIFICATIONS (Admin gets notified, User does NOT get notified for status changes)
        // =====================================================

        if (statusRequested
                && !oldStatus.equals(requestedStatus)) {

            sendAdminStatusChangeNotification(
                    updated,
                    oldStatus,
                    requestedStatus
            );
        }

        // =====================================================
        // RESCHEDULE NOTIFICATIONS (Both Admin and User get notified for reschedules)
        // =====================================================

        if (isRescheduled
                && !statusRequested) {

            sendRescheduleNotifications(
                    updated,
                    oldDate,
                    oldTime,
                    request.getFcmToken()
            );
        }

        logger.info(
                "Appointment updated - ID: {} | Status: {} -> {}",
                updated.getAppointmentId(),
                oldStatus,
                updated.getStatus()
        );

        return convertToResponse(updated);
    }

    // =========================================================
    // GET ALL APPOINTMENTS
    // =========================================================

    @Override
    public List<AppointmentRespDto> getAllAppointments() {

        List<Appointment> appointments =
                appointmentRepository
                        .findAllByOrderByAppointmentDateDesc();

        return appointments
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET APPOINTMENT BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public AppointmentRespDto getAppointmentById(
            Long appointmentId) {

        if (appointmentId == null) {

            throw new RuntimeException(
                    "Appointment ID is required"
            );
        }

        Appointment appointment =
                appointmentRepository
                        .findById(appointmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Appointment not found with ID: "
                                                + appointmentId
                                )
                        );

        return convertToResponse(appointment);
    }

    // =========================================================
    // DELETE APPOINTMENT
    // =========================================================

    @Override
    public void deleteAppointment(
            Long appointmentId) {

        if (appointmentId == null) {

            throw new RuntimeException(
                    "Appointment ID is required"
            );
        }

        Appointment appointment =
                appointmentRepository
                        .findById(appointmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Appointment not found with ID: "
                                                + appointmentId
                                )
                        );

        try {

            notificationService.sendToAllAdmins(
                    "Appointment Cancelled",
                    "Appointment for "
                            + appointment.getPatientName()
                            + " on "
                            + appointment.getAppointmentDate()
                            + " has been deleted.",
                    "APPOINTMENT_DELETED"
            );

            logger.info(
                    "Cancellation notification sent to admins"
            );

        } catch (Exception e) {

            logger.error(
                    "Failed to send cancellation notification: {}",
                    e.getMessage()
            );
        }

        appointmentRepository.delete(
                appointment
        );

        logger.info(
                "Appointment deleted - ID: {}",
                appointmentId
        );
    }

    // =========================================================
    // AUTO COMPLETE APPOINTMENTS
    // =========================================================

    @Override
    public void autoCompleteAppointments() {

        // Disabled automated background execution
    }

    // =========================================================
    // GET BOOKED TIMES FOR A DATE
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<LocalTime> getBookedTimes(
            LocalDate appointmentDate) {

        if (appointmentDate == null) {

            throw new RuntimeException(
                    "Appointment date is required"
            );
        }

        List<Appointment> appointments =
                appointmentRepository
                        .findAllByAppointmentDate(
                                appointmentDate
                        );

        return appointments
                .stream()
                .filter(a -> a.getStatus() != null)
                .filter(a ->
                        ACTIVE_STATUSES.contains(
                                a.getStatus().trim().toUpperCase()
                        )
                )
                .map(Appointment::getAppointmentTime)
                .filter(time -> time != null)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    // =========================================================
    // DOUBLE BOOKING CHECK
    // =========================================================

    private boolean isSlotTaken(
            LocalDate appointmentDate,
            LocalTime appointmentTime,
            Long excludeAppointmentId) {

        List<Appointment> existing =
                appointmentRepository
                        .findByAppointmentDateAndAppointmentTime(
                                appointmentDate,
                                appointmentTime
                        );

        return existing
                .stream()
                .filter(a ->
                        excludeAppointmentId == null
                                || !a.getAppointmentId()
                                .equals(excludeAppointmentId)
                )
                .anyMatch(a -> {

                    if (a.getStatus() == null) {
                        return false;
                    }

                    return ACTIVE_STATUSES.contains(
                            a.getStatus()
                                    .trim()
                                    .toUpperCase()
                    );
                });
    }

    // =========================================================
    // ADMIN BOOKING NOTIFICATION
    // =========================================================

    private void sendAdminBookingNotification(
            Appointment appointment,
            String serviceName) {

        try {

            String message =
                    appointment.getPatientName()
                            + " booked an appointment for "
                            + appointment.getAppointmentDate()
                            + " at "
                            + appointment.getAppointmentTime()
                            + " for "
                            + serviceName
                            + ".";

            notificationService.sendToAllAdmins(
                    "New Appointment Booking",
                    message,
                    "APPOINTMENT_BOOKED"
            );

            logger.info(
                    "Admin booking notification sent"
            );

        } catch (Exception e) {

            logger.error(
                    "Failed to send admin booking notification: {}",
                    e.getMessage()
            );
        }
    }

    // =========================================================
    // USER BOOKING NOTIFICATION
    // =========================================================

    private void sendUserBookingNotification(
            Appointment appointment,
            String serviceName,
            String fcmToken) {

        try {

            if (fcmToken == null
                    || fcmToken.trim().isEmpty()) {

                logger.warn(
                        "No FCM token provided for user booking notification"
                );

                return;
            }

            String trimmedToken =
                    fcmToken.trim();

            if (trimmedToken.length()
                    > FCM_TOKEN_MAX_LENGTH) {

                logger.warn(
                        "Rejected oversized FCM token on appointment booking"
                );

                return;
            }

            String message =
                    "Your appointment has been booked successfully for "
                            + appointment.getAppointmentDate()
                            + " at "
                            + appointment.getAppointmentTime()
                            + " for "
                            + serviceName
                            + ". Please arrive 10 minutes early.";

            notificationService.sendToToken(
                    trimmedToken,
                    "Appointment Confirmed",
                    message,
                    "APPOINTMENT_BOOKED"
            );

            logger.info(
                    "User booking notification sent"
            );

        } catch (Exception e) {

            logger.error(
                    "Failed to send user booking notification: {}",
                    e.getMessage()
            );
        }
    }

    // =========================================================
    // ADMIN STATUS CHANGE NOTIFICATION (Only Admin gets notified, User does NOT)
    // =========================================================

    private void sendAdminStatusChangeNotification(
            Appointment appointment,
            String oldStatus,
            String newStatus) {

        try {

            String serviceName =
                    appointment.getService() != null
                            ? appointment.getService()
                            .getServiceName()
                            : "Other";

            String adminMessage =
                    appointment.getPatientName()
                            + "'s appointment for "
                            + serviceName
                            + " on "
                            + appointment.getAppointmentDate()
                            + " status changed from "
                            + oldStatus
                            + " to "
                            + newStatus
                            + ".";

            notificationService.sendToAllAdmins(
                    "Appointment Status Updated",
                    adminMessage,
                    "APPOINTMENT_STATUS_" + newStatus
            );

            logger.info(
                    "Admin status change notification sent"
            );

        } catch (Exception e) {

            logger.error(
                    "Failed to send admin status change notification: {}",
                    e.getMessage()
            );
        }
    }

    // =========================================================
    // RESCHEDULE NOTIFICATIONS (Both Admin and User get notified)
    // =========================================================

    private void sendRescheduleNotifications(
            Appointment appointment,
            String oldDate,
            String oldTime,
            String fcmToken) {

        try {

            String serviceName =
                    appointment.getService() != null
                            ? appointment.getService()
                            .getServiceName()
                            : "Other";

            // =================================================
            // ADMIN NOTIFICATION
            // =================================================

            String adminMessage =
                    appointment.getPatientName()
                            + "'s appointment for "
                            + serviceName
                            + " has been rescheduled from "
                            + oldDate
                            + " "
                            + oldTime
                            + " to "
                            + appointment.getAppointmentDate()
                            + " "
                            + appointment.getAppointmentTime()
                            + ".";

            notificationService.sendToAllAdmins(
                    "Appointment Rescheduled",
                    adminMessage,
                    "APPOINTMENT_RESCHEDULED"
            );

            logger.info(
                    "Admin reschedule notification sent"
            );

            // =================================================
            // USER NOTIFICATION
            // =================================================

            if (fcmToken != null
                    && !fcmToken.trim().isEmpty()
                    && fcmToken.trim().length()
                    <= FCM_TOKEN_MAX_LENGTH) {

                String userMessage =
                        "Your appointment has been rescheduled to "
                                + appointment.getAppointmentDate()
                                + " at "
                                + appointment.getAppointmentTime()
                                + ".";

                notificationService.sendToToken(
                        fcmToken.trim(),
                        "Appointment Rescheduled",
                        userMessage,
                        "APPOINTMENT_RESCHEDULED"
                );

                logger.info(
                        "User reschedule notification sent"
                );
            }

        } catch (Exception e) {

            logger.error(
                    "Failed to send reschedule notifications: {}",
                    e.getMessage()
            );
        }
    }

    // =========================================================
    // VALIDATE APPOINTMENT DATE + TIME
    // =========================================================

    private void validateAppointmentDateTime(
            LocalDate appointmentDate,
            LocalTime appointmentTime) {

        if (appointmentDate == null) {

            throw new RuntimeException(
                    "Appointment date is required"
            );
        }

        if (appointmentTime == null) {

            throw new RuntimeException(
                    "Appointment time is required"
            );
        }

        LocalDateTime indiaNow =
                LocalDateTime.now(INDIA_ZONE);

        LocalDate today =
                indiaNow.toLocalDate();

        LocalTime now =
                indiaNow.toLocalTime();

        // =====================================================
        // PAST DATE
        // =====================================================

        if (appointmentDate.isBefore(today)) {

            throw new RuntimeException(
                    "Past appointment date is not allowed"
            );
        }

        // =====================================================
        // 30 MINUTE SLOT
        // =====================================================

        if (appointmentTime.getMinute() != 0
                && appointmentTime.getMinute() != 30) {

            throw new RuntimeException(
                    "Appointment time must be selected in 30-minute slots"
            );
        }

        // =====================================================
        // SECOND / NANO
        // =====================================================

        if (appointmentTime.getSecond() != 0
                || appointmentTime.getNano() != 0) {

            throw new RuntimeException(
                    "Invalid appointment time"
            );
        }

        // =====================================================
        // CLINIC TIME
        // =====================================================

        if (appointmentTime.isBefore(
                CLINIC_OPEN_TIME)
                || appointmentTime.isAfter(
                CLINIC_CLOSE_TIME)) {

            throw new RuntimeException(
                    "Appointment time must be between 9:00 AM and 8:00 PM"
            );
        }

        // =====================================================
        // SAME DAY
        // =====================================================

        if (appointmentDate.isEqual(today)) {

            if (!now.isBefore(
                    SAME_DAY_BOOKING_CUTOFF)) {

                throw new RuntimeException(
                        "Today's appointment booking is closed after 7:30 PM"
                );
            }

            if (!appointmentTime.isAfter(now)) {

                throw new RuntimeException(
                        "Today's appointment time must be in the future"
                );
            }
        }
    }

    // =========================================================
    // VALID STATUS
    // =========================================================

    private boolean isValidStatus(
            String status) {

        return status.equals("PENDING")
                || status.equals("CONFIRMED")
                || status.equals("COMPLETED")
                || status.equals("CANCELLED");
    }

    // =========================================================
    // ENTITY -> RESPONSE DTO
    // =========================================================

    private AppointmentRespDto convertToResponse(
            Appointment appointment) {

        AppointmentRespDto response =
                new AppointmentRespDto();

        response.setAppointmentId(
                appointment.getAppointmentId()
        );

        response.setPatientName(
                appointment.getPatientName()
        );

        response.setAgeCategory(
                appointment.getAgeCategory()
        );

        response.setPhone(
                appointment.getPhone()
        );

        response.setEmail(
                appointment.getEmail()
        );

        response.setAppointmentDate(
                appointment.getAppointmentDate()
        );

        response.setAppointmentTime(
                appointment.getAppointmentTime()
        );

        response.setMessage(
                appointment.getMessage()
        );

        response.setStatus(
                appointment.getStatus()
        );

        response.setCreatedAt(
                appointment.getCreatedAt()
        );

        if (appointment.getService() != null) {

            response.setServiceName(
                    appointment.getService()
                            .getServiceName()
            );

        } else {

            response.setServiceName("Other");
        }

        return response;
    }
}