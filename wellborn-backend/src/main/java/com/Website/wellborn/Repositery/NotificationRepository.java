package com.Website.wellborn.Repositery;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Website.wellborn.Entity.Notification;

@Repository
public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

}