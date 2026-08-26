package com.Website.wellborn.ServiceImpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Website.wellborn.Entity.FcmToken;
import com.Website.wellborn.Repositery.FcmTokenRepository;
import com.Website.wellborn.Service.FcmTokenService;

@Service
public class FcmTokenServiceImpl
        implements FcmTokenService {

    private final FcmTokenRepository repository;

    public FcmTokenServiceImpl(
            FcmTokenRepository repository
    ) {
        this.repository = repository;
    }

    // =========================================================
    // SAVE / UPDATE TOKEN
    // =========================================================

    @Override
    @Transactional
    public void saveToken(
            String token,
            String role
    ) {

        if (token == null
                || token.trim().isEmpty()) {

            return;
        }

        token = token.trim();

        if (role == null
                || role.trim().isEmpty()) {

            role = "USER";
        }

        role = role.trim().toUpperCase();

        if (!role.equals("ADMIN")
                && !role.equals("USER")) {

            throw new IllegalArgumentException(
                    "Invalid FCM token role"
            );
        }

        // =====================================================
        // EXISTING TOKEN
        // =====================================================

        FcmToken existing =
                repository.findByToken(token)
                        .orElse(null);

        if (existing != null) {

            existing.setRole(role);

            repository.save(existing);

            return;
        }

        // =====================================================
        // NEW TOKEN
        // =====================================================

        FcmToken fcmToken =
                new FcmToken();

        fcmToken.setToken(token);
        fcmToken.setRole(role);

        repository.save(fcmToken);
    }

    // =========================================================
    // ALL TOKENS
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllTokens() {

        return repository
                .findAllByOrderByUpdatedAtDesc()
                .stream()
                .map(FcmToken::getToken)
                .collect(Collectors.toList());
    }

    // =========================================================
    // ADMIN TOKENS ONLY
    // =========================================================

    @Override
    @Transactional(readOnly = true)
    public List<String> getAdminTokens() {

        return repository
                .findByRoleIgnoreCaseOrderByUpdatedAtDesc(
                        "ADMIN"
                )
                .stream()
                .map(FcmToken::getToken)
                .collect(Collectors.toList());
    }

    // =========================================================
    // DELETE TOKEN
    // =========================================================

    @Override
    @Transactional
    public void deleteToken(String token) {

        if (token == null
                || token.trim().isEmpty()) {

            return;
        }

        repository
                .findByToken(token.trim())
                .ifPresent(repository::delete);
    }
}