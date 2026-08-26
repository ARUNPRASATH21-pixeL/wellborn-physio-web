package com.Website.wellborn.ServiceImpl;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Website.wellborn.Dto.ContactDto;
import com.Website.wellborn.Dto.ContactRespDto;
import com.Website.wellborn.Entity.Contact;
import com.Website.wellborn.Repositery.ContactRepository;
import com.Website.wellborn.Service.ContactService;
import com.Website.wellborn.Service.NotificationService;

@Service
@Transactional
public class ContactServiceImpl implements ContactService {

    private final ContactRepository contactRepository;
    private final NotificationService notificationService;

    // Kept in sync with the frontend's email regex intentionally.
    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    // Basic phone check: digits, spaces, +, -, () only, 7–20 chars.
    private static final Pattern PHONE_PATTERN =
            Pattern.compile("^[0-9+\\-()\\s]{7,20}$");

    private static final int NAME_MAX_LENGTH = 100;
    private static final int EMAIL_MAX_LENGTH = 150;
    private static final int SUBJECT_MAX_LENGTH = 150;
    private static final int MESSAGE_MIN_LENGTH = 10;
    private static final int MESSAGE_MAX_LENGTH = 2000;
    private static final int FCM_TOKEN_MAX_LENGTH = 4096;

    private static final List<String> VALID_STATUSES =
            List.of("NEW", "READ", "REPLIED", "RESOLVED", "ARCHIVED");

    private static final List<String> VALID_PRIORITIES =
            List.of("LOW", "NORMAL", "HIGH", "URGENT");

    public ContactServiceImpl(
            ContactRepository contactRepository,
            NotificationService notificationService) {

        this.contactRepository = contactRepository;
        this.notificationService = notificationService;
    }

    // =========================================================
    // USER → SAVE CONTACT MESSAGE
    // =========================================================

    @Override
    public ContactRespDto saveContact(ContactDto request) {

        validateContact(request);

        Contact contact = new Contact();

        contact.setName(
                request.getName().trim()
        );

        contact.setEmail(
                request.getEmail().trim()
        );

        if (request.getPhone() != null
                && !request.getPhone().trim().isEmpty()) {

            contact.setPhone(
                    request.getPhone().trim()
            );
        }

        if (request.getSubject() != null
                && !request.getSubject().trim().isEmpty()) {

            contact.setSubject(
                    request.getSubject().trim()
            );
        }

        contact.setMessage(
                request.getMessage().trim()
        );

        contact.setCreatedAt(
                LocalDateTime.now()
        );

        // Default status
        contact.setStatus("NEW");

        // Default priority
        contact.setPriority("NORMAL");

        // =====================================================
        // SAVE CONTACT
        // =====================================================

        Contact savedContact =
                contactRepository.save(contact);

        // =====================================================
        // SEND NOTIFICATIONS ON SUBMISSION
        // =====================================================

        // 1. ADMIN FCM (Notify all admins about new contact message)
        try {

            String adminMessage =
                    savedContact.getName()
                    + " submitted a new contact message";

            if (savedContact.getSubject() != null
                    && !savedContact.getSubject()
                            .trim()
                            .isEmpty()) {

                adminMessage +=
                        " regarding "
                        + savedContact.getSubject();
            }

            adminMessage += ".";

            notificationService.sendToAllAdmins(
                    "New Contact Message",
                    adminMessage,
                    "CONTACT_SUBMITTED"
            );

        } catch (Exception e) {
            System.err.println(
                    "Contact FCM admin notification failed: "
                    + e.getMessage()
            );
        }

        // 2. USER FCM (Send received confirmation push notification to user)
        sendUserContactNotification(
                savedContact,
                request.getFcmToken()
        );

        return convertToResponse(savedContact);
    }

    // =========================================================
    // SEND USER CONTACT CONFIRMATION
    // =========================================================

    private void sendUserContactNotification(
            Contact contact,
            String fcmToken) {

        try {

            if (fcmToken == null
                    || fcmToken.trim().isEmpty()) {

                System.out.println(
                        "⚠️ No FCM token provided for user contact notification"
                );

                return;
            }

            String trimmedToken = fcmToken.trim();

            if (trimmedToken.length() > FCM_TOKEN_MAX_LENGTH) {

                System.err.println(
                        "⚠️ Rejected oversized FCM token on contact submission"
                );

                return;
            }

            String message =
                    "Hi " + contact.getName()
                    + ", your message has been received. "
                    + "We'll get back to you shortly.";

            notificationService.sendToToken(
                    trimmedToken,
                    "Message Received - Wellborn Physio",
                    message,
                    "CONTACT_RECEIVED"
            );

            System.out.println(
                    "✅ User contact notification sent"
            );

        } catch (Exception e) {

            System.err.println(
                    "Contact FCM user notification failed: "
                    + e.getMessage()
            );
        }
    }

    // =========================================================
    // GET CONTACT BY ID
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public ContactRespDto getContactById(Long contactId) {

        if (contactId == null) {

            throw new IllegalArgumentException(
                    "Contact ID is required"
            );
        }

        Contact contact =
                contactRepository.findById(contactId)
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "Contact not found with ID: "
                                        + contactId
                                )
                        );

        return convertToResponse(contact);
    }

    // =========================================================
    // GET ALL CONTACTS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<ContactRespDto> getAllContacts() {

        return contactRepository.findAll()
                .stream()
                .sorted(
                        Comparator.comparing(
                                Contact::getCreatedAt,
                                Comparator.nullsLast(
                                        Comparator.reverseOrder()
                                )
                        )
                )
                .map(this::convertToResponse)
                .toList();
    }

    // =========================================================
    // DELETE CONTACT
    // =========================================================

    @Override
    public void deleteContact(Long contactId) {

        if (contactId == null) {

            throw new IllegalArgumentException(
                    "Contact ID is required"
            );
        }

        if (!contactRepository.existsById(contactId)) {

            throw new IllegalArgumentException(
                    "Contact not found with ID: "
                    + contactId
            );
        }

        contactRepository.deleteById(contactId);
    }

    // =========================================================
    // UPDATE STATUS (NO USER FCM NOTIFICATION FOR STATUS UPDATES)
    // =========================================================

    public ContactRespDto updateStatus(
            Long contactId,
            String status) {

        if (status == null
                || status.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Status is required"
            );
        }

        String normalizedStatus = status.trim().toUpperCase();

        if (!VALID_STATUSES.contains(normalizedStatus)) {

            throw new IllegalArgumentException(
                    "Invalid status. Allowed values: " + VALID_STATUSES
            );
        }

        Contact contact =
                findContact(contactId);

        contact.setStatus(normalizedStatus);

        if ("READ".equals(normalizedStatus)
                && contact.getReadAt() == null) {

            contact.setReadAt(
                    LocalDateTime.now()
            );
        }

        if ("REPLIED".equals(normalizedStatus)
                && contact.getRepliedAt() == null) {

            contact.setRepliedAt(
                    LocalDateTime.now()
            );
        }

        Contact updated =
                contactRepository.save(contact);

        // Notify Admin only about status change (No user push sent here)
        try {
            notificationService.sendToAllAdmins(
                    "Contact Status Updated",
                    "Contact message from " + updated.getName() + " updated to " + normalizedStatus,
                    "CONTACT_STATUS_UPDATED"
            );
        } catch (Exception e) {
            System.err.println("Admin notification failed: " + e.getMessage());
        }

        return convertToResponse(updated);
    }

    // =========================================================
    // UPDATE PRIORITY
    // =========================================================

    public ContactRespDto updatePriority(
            Long contactId,
            String priority) {

        if (priority == null
                || priority.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Priority is required"
            );
        }

        String normalizedPriority = priority.trim().toUpperCase();

        if (!VALID_PRIORITIES.contains(normalizedPriority)) {

            throw new IllegalArgumentException(
                    "Invalid priority. Allowed values: " + VALID_PRIORITIES
            );
        }

        Contact contact =
                findContact(contactId);

        contact.setPriority(normalizedPriority);

        Contact updated =
                contactRepository.save(contact);

        return convertToResponse(updated);
    }

    // =========================================================
    // UPDATE ADMIN NOTE
    // =========================================================

    public ContactRespDto updateAdminNote(
            Long contactId,
            String adminNote) {

        Contact contact =
                findContact(contactId);

        if (adminNote != null
                && !adminNote.trim().isEmpty()) {

            contact.setAdminNote(
                    adminNote.trim()
            );

        } else {

            contact.setAdminNote(null);
        }

        Contact updated =
                contactRepository.save(contact);

        return convertToResponse(updated);
    }

    // =========================================================
    // MARK AS READ
    // =========================================================

    public ContactRespDto markAsRead(
            Long contactId) {

        Contact contact =
                findContact(contactId);

        contact.setStatus("READ");

        if (contact.getReadAt() == null) {

            contact.setReadAt(
                    LocalDateTime.now()
            );
        }

        Contact updated =
                contactRepository.save(contact);

        return convertToResponse(updated);
    }

    // =========================================================
    // MARK AS REPLIED
    // =========================================================

    public ContactRespDto markAsReplied(
            Long contactId) {

        Contact contact =
                findContact(contactId);

        contact.setStatus("REPLIED");

        if (contact.getRepliedAt() == null) {

            contact.setRepliedAt(
                    LocalDateTime.now()
            );
        }

        Contact updated =
                contactRepository.save(contact);

        return convertToResponse(updated);
    }

    // =========================================================
    // FIND CONTACT
    // =========================================================

    private Contact findContact(Long contactId) {

        if (contactId == null) {

            throw new IllegalArgumentException(
                    "Contact ID is required"
            );
        }

        return contactRepository.findById(contactId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Contact not found with ID: "
                                + contactId
                        )
                );
    }

    // =========================================================
    // VALIDATE
    // =========================================================

    private void validateContact(
            ContactDto request) {

        if (request == null) {

            throw new IllegalArgumentException(
                    "Contact data is required"
            );
        }

        // ---------- Name ----------

        if (request.getName() == null
                || request.getName()
                        .trim()
                        .isEmpty()) {

            throw new IllegalArgumentException(
                    "Name is required"
            );
        }

        String name = request.getName().trim();

        if (name.length() < 2) {

            throw new IllegalArgumentException(
                    "Please enter a valid name"
            );
        }

        if (name.length() > NAME_MAX_LENGTH) {

            throw new IllegalArgumentException(
                    "Name must be under " + NAME_MAX_LENGTH + " characters"
            );
        }

        // ---------- Email ----------

        if (request.getEmail() == null
                || request.getEmail()
                        .trim()
                        .isEmpty()) {

            throw new IllegalArgumentException(
                    "Email is required"
            );
        }

        String email = request.getEmail().trim();

        if (email.length() > EMAIL_MAX_LENGTH) {

            throw new IllegalArgumentException(
                    "Email must be under " + EMAIL_MAX_LENGTH + " characters"
            );
        }

        if (!EMAIL_PATTERN.matcher(email).matches()) {

            throw new IllegalArgumentException(
                    "Please enter a valid email address"
            );
        }

        // ---------- Phone (optional) ----------

        if (request.getPhone() != null
                && !request.getPhone().trim().isEmpty()) {

            String phone = request.getPhone().trim();

            if (!PHONE_PATTERN.matcher(phone).matches()) {

                throw new IllegalArgumentException(
                        "Please enter a valid phone number"
                );
            }
        }

        // ---------- Subject (optional) ----------

        if (request.getSubject() != null
                && request.getSubject().trim().length() > SUBJECT_MAX_LENGTH) {

            throw new IllegalArgumentException(
                    "Subject must be under " + SUBJECT_MAX_LENGTH + " characters"
            );
        }

        // ---------- Message ----------

        if (request.getMessage() == null
                || request.getMessage()
                        .trim()
                        .isEmpty()) {

            throw new IllegalArgumentException(
                    "Message is required"
            );
        }

        String message = request.getMessage().trim();

        if (message.length() < MESSAGE_MIN_LENGTH) {

            throw new IllegalArgumentException(
                    "Message must be at least " + MESSAGE_MIN_LENGTH + " characters"
            );
        }

        if (message.length() > MESSAGE_MAX_LENGTH) {

            throw new IllegalArgumentException(
                    "Message must be under " + MESSAGE_MAX_LENGTH + " characters"
            );
        }
    }

    // =========================================================
    // ENTITY → RESPONSE DTO
    // =========================================================

    private ContactRespDto convertToResponse(
            Contact contact) {

        ContactRespDto response =
                new ContactRespDto();

        response.setContactId(
                contact.getContactId()
        );

        response.setName(
                contact.getName()
        );

        response.setEmail(
                contact.getEmail()
        );

        response.setPhone(
                contact.getPhone()
        );

        response.setSubject(
                contact.getSubject()
        );

        response.setMessage(
                contact.getMessage()
        );

        response.setCreatedAt(
                contact.getCreatedAt()
        );

        response.setStatus(
                contact.getStatus()
        );

        response.setPriority(
                contact.getPriority()
        );

        response.setReadAt(
                contact.getReadAt()
        );

        response.setRepliedAt(
                contact.getRepliedAt()
        );

        response.setAdminNote(
                contact.getAdminNote()
        );

        return response;
    }
}