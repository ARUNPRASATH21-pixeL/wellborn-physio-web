package com.Website.wellborn.Repositery;

import com.Website.wellborn.Entity.PendingAdminSignup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PendingAdminSignupRepository extends JpaRepository<PendingAdminSignup, Long> {

    Optional<PendingAdminSignup> findByEmail(String email);

    Optional<PendingAdminSignup> findBySignupTokenHash(String signupTokenHash);
}
