package com.Website.wellborn.Repositery;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Website.wellborn.Entity.FcmToken;

public interface FcmTokenRepository
        extends JpaRepository<FcmToken, Long> {

    Optional<FcmToken> findByToken(String token);

    List<FcmToken> findByRoleIgnoreCaseOrderByUpdatedAtDesc(
            String role
    );

    List<FcmToken> findAllByOrderByUpdatedAtDesc();
}