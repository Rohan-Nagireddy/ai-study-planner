package com.studyplanner.security;

import com.studyplanner.model.Role;
import com.studyplanner.model.User;
import com.studyplanner.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Custom service for loading and syncing OAuth2 user data.
 * 
 * <p>Extends the default service to perform "find or create" logic 
 * whenever a user logs in via Google or GitHub.</p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        
        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (Exception ex) {
            log.error("Error processing OAuth2 user", ex);
            throw new OAuth2AuthenticationException(ex.getMessage());
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest request, OAuth2User oAuth2User) {
        Map<String, Object> attributes = oAuth2User.getAttributes();
        
        String email = (String) attributes.get("email");
        String name  = (String) attributes.get("name");
        
        // GitHub fallback if name is not set
        if (name == null) {
            name = (String) attributes.get("login");
        }

        if (email == null) {
            throw new RuntimeException("Email not found from OAuth2 provider");
        }

        log.info("Processing OAuth2 login for email: {}", email);

        // Find or create user
        final String finalName = (name != null) ? name : email.split("@")[0];
        
        return userRepository.findByEmail(email)
                .map(existing -> updateExistingUser(existing, finalName))
                .orElseGet(() -> createNewUser(email, finalName));
    }

    private User createNewUser(String email, String name) {
        User user = User.builder()
                .email(email)
                .name(name)
                .role(Role.USER)
                .enabled(true)
                .build();
        
        log.info("Creating new user from OAuth2: {}", email);
        return userRepository.save(user);
    }

    private User updateExistingUser(User existing, String name) {
        // Optionally update the name if it changed
        if (existing.getName() == null || existing.getName().isEmpty()) {
            existing.setName(name);
            return userRepository.save(existing);
        }
        return existing;
    }
}
