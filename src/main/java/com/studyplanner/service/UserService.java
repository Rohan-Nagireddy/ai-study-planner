package com.studyplanner.service;

import com.studyplanner.model.Role;
import com.studyplanner.model.User;
import com.studyplanner.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * General-purpose user management service.
 * Authentication (register / login / JWT) is handled by {@link AuthService}.
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Creates and persists a new USER-role account.
     *
     * @param name        display name
     * @param email       unique login email
     * @param rawPassword plain-text password — will be BCrypt-encoded
     * @return the saved {@link User} document
     */
    public User registerUser(String name, String email, String rawPassword) {
        User user = User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .role(Role.USER)
                .enabled(true)
                .build();
        return userRepository.save(user);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    /** Deletes a user by their MongoDB string ID. */
    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }
}
