package com.Website.wellborn.Service;

import java.util.List;

public interface FcmTokenService {

    void saveToken(
            String token,
            String role
    );

    List<String> getAllTokens();

    List<String> getAdminTokens();

    void deleteToken(String token);
}