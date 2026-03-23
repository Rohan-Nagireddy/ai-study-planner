package com.studyplanner.security;

import com.studyplanner.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * Spring Security {@link UserDetailsService} implementation.
 *
 * <p>Loads a {@link com.studyplanner.model.User} from MongoDB by email address.
 * Because {@code User} implements {@link UserDetails} directly, no adapter is needed —
 * the returned object is used as-is by Spring Security.</p>
 *
 * <p>Invoked automatically by:
 * <ul>
 *   <li>{@code DaoAuthenticationProvider} during login</li>
 *   <li>{@link JwtAuthenticationFilter} when validating a Bearer token</li>
 * </ul>
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Locates the user by their email address (the Spring Security username).
     *
     * @param email the login email supplied by the client
     * @return the matching {@link UserDetails} (a {@code User} document)
     * @throws UsernameNotFoundException if no document exists for that email
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "No account found for email: " + email));
    }
}
