package com.Website.wellborn.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.Website.wellborn.Dto.ContactDto;
import com.Website.wellborn.Dto.ContactRespDto;
import com.Website.wellborn.Service.ContactService;

@RestController
@RequestMapping("/contact")
@CrossOrigin("*")
public class ContactController {

	@Autowired
	private ContactService contactService;

	// =========================================================
	// USER → SAVE
	// =========================================================

	@PostMapping("/save")
	public ContactRespDto saveContact(@RequestBody ContactDto request) {

		return contactService.saveContact(request);
	}

	// =========================================================
	// GET ONE
	// =========================================================

	@GetMapping("/get/{contactId}")
	public ContactRespDto getContactById(@PathVariable Long contactId) {

		return contactService.getContactById(contactId);
	}

	// =========================================================
	// ADMIN → GET ALL
	// =========================================================

	@GetMapping("/getall")
	public List<ContactRespDto> getAllContacts() {

		return contactService.getAllContacts();
	}

	// =========================================================
	// ADMIN → DELETE
	// =========================================================

	@DeleteMapping("/delete/{contactId}")
	public String deleteContact(@PathVariable Long contactId) {

		contactService.deleteContact(contactId);

		return "Contact Deleted Successfully";
	}

	// =========================================================
	// ADMIN → UPDATE STATUS
	// =========================================================

	@PutMapping("/status/{contactId}")
	public ContactRespDto updateStatus(@PathVariable Long contactId, @RequestParam String status) {

		return contactService.updateStatus(contactId, status);
	}

	// =========================================================
	// ADMIN → UPDATE PRIORITY
	// =========================================================

	@PutMapping("/priority/{contactId}")
	public ContactRespDto updatePriority(@PathVariable Long contactId, @RequestParam String priority) {

		return contactService.updatePriority(contactId, priority);
	}

	// =========================================================
	// ADMIN → SAVE NOTE
	// =========================================================

	@PutMapping("/note/{contactId}")
	public ContactRespDto updateAdminNote(@PathVariable Long contactId, @RequestBody String adminNote) {

		return contactService.updateAdminNote(contactId, adminNote);
	}

	// =========================================================
	// ADMIN → MARK READ
	// =========================================================

	@PutMapping("/read/{contactId}")
	public ContactRespDto markAsRead(@PathVariable Long contactId) {

		return contactService.markAsRead(contactId);
	}

	// =========================================================
	// ADMIN → MARK REPLIED
	// =========================================================

	@PutMapping("/replied/{contactId}")
	public ContactRespDto markAsReplied(@PathVariable Long contactId) {

		return contactService.markAsReplied(contactId);
	}
}