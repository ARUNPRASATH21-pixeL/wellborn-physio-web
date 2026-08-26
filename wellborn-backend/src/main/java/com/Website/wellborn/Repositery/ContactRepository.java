package com.Website.wellborn.Repositery;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Website.wellborn.Entity.Contact;

public interface ContactRepository extends JpaRepository<Contact, Long> {

}