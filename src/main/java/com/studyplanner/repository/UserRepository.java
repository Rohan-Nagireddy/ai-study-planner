package com.studyplanner.repository;

import com.studyplanner.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data MongoDB repository for {@link User} documents.
 *
 * <p>Inherits full CRUD + paging from {@link MongoRepository}.
 * Custom query methods below follow Spring Data naming conventions
 * and are resolved automatically — no implementation required.</p>
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {

    /**
     * Finds a user by their unique email address.
     * Used by {@code CustomUserDetailsService} during authentication.
     *
     * @param email the login email
     * @return an {@link Optional} containing the user if found
     */
    Optional<User> findByEmail(String email);

    /**
     * Checks whether a user with the given email already exists.
     * Used during registration to prevent duplicate accounts.
     *
     * @param email the email to check
     * @return {@code true} if a document with that email exists
     */
    boolean existsByEmail(String email);
}
