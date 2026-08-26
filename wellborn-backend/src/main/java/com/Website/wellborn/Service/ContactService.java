package com.Website.wellborn.Service;

import java.util.List;

import com.Website.wellborn.Dto.ContactDto;
import com.Website.wellborn.Dto.ContactRespDto;

public interface ContactService {

    ContactRespDto saveContact(ContactDto request);

    ContactRespDto getContactById(Long contactId);

    List<ContactRespDto> getAllContacts();

    void deleteContact(Long contactId);

    ContactRespDto updateStatus(
            Long contactId,
            String status
    );

    ContactRespDto updatePriority(
            Long contactId,
            String priority
    );

    ContactRespDto updateAdminNote(
            Long contactId,
            String adminNote
    );

    ContactRespDto markAsRead(
            Long contactId
    );

    ContactRespDto markAsReplied(
            Long contactId
    );
}