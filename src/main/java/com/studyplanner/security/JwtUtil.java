package com.studyplanner.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Stateless JWT utility service.
 *
 * <p>Responsibilities:</p>
 * <ul>
 *   <li>Generate signed JWT tokens from a {@link UserDetails} principal</li>
 *   <li>Validate tokens (signature, expiry, subject match)</li>
 *   <li>Extract individual claims from a token</li>
 * </ul>
 *
 * <p>Uses <strong>JJWT 0.12.x</strong> fluent API with HMAC-SHA256 signing.</p>
 *
 * <p>Configuration (from {@code application.yml}):</p>
 * <pre>
 * app.jwt.secret          – Base64-encoded 256-bit key
 * app.jwt.expiration-ms   – Token TTL in milliseconds (default: 24 h)
 * </pre>
 */
@Slf4j
@Component
public class JwtUtil {

    @Value("${JWT_SECRET:dGhpc2lzYXZlcnlzZWN1cmVpbnRlcm5hbGp3dHNlY3JldGtleTIwMjYwMzIw}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    @jakarta.annotation.PostConstruct
    public void init() {
        if (jwtSecret == null || jwtSecret.isEmpty()) {
            log.error("JWT Secret Key is NULL or EMPTY! Please check environment variables.");
        } else {
            log.info("JWT Secret Key loaded. Length: {}. Starts with: {}", 
                    jwtSecret.length(), jwtSecret.substring(0, Math.min(jwtSecret.length(), 4)));
        }
    }

    // =========================================================================
    // Token Generation
    // =========================================================================

    /**
     * Generates a JWT for the given user with no extra claims.
     * The token subject is set to {@link UserDetails#getUsername()} (the email).
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    /**
     * Generates a JWT with additional custom claims embedded in the payload.
     *
     * @param extraClaims additional key-value pairs to include in the JWT payload
     * @param userDetails the authenticated principal
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
                .signWith(getSigningKey())
                .compact();
    }

    // =========================================================================
    // Token Validation
    // =========================================================================

    /**
     * Returns {@code true} if the token's subject matches the user's username
     * and the token has not expired.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    /**
     * Validates the token structure, signature, and expiry without needing a
     * {@link UserDetails} object. Useful in pre-auth checks.
     *
     * @return {@code true} if the token parses and verifies successfully
     */
    public boolean isTokenWellFormed(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (SignatureException e) {
            log.warn("JWT signature invalid: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("Malformed JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.warn("JWT token expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("Unsupported JWT token: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT claims string is empty: {}", e.getMessage());
        } catch (Exception e) {
            log.error("JWT validation error: {}", e.getMessage());
        }
        return false;
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    // =========================================================================
    // Claims Extraction
    // =========================================================================

    /**
     * Extracts the username (subject claim) from a JWT token.
     * The subject is set to the user's email at token creation.
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /** Extracts the expiration date from a JWT token. */
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Generic claim extractor — applies a resolver function to the token's
     * {@link Claims} payload and returns the result.
     *
     * @param token          the JWT string
     * @param claimsResolver function that maps Claims → T
     * @param <T>            the type of the extracted claim value
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // =========================================================================
    // Internal helpers
    // =========================================================================

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Decodes the Base64 secret key and wraps it as an HMAC-SHA key.
     * The key must be at least 256 bits (32 bytes) to satisfy JJWT requirements.
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
