package com.studyplanner.utils;

/**
 * Application-wide constants.
 * Add shared string literals, regex patterns, and numeric limits here
 * to avoid magic values scattered across the codebase.
 */
public final class AppConstants {

    private AppConstants() { /* utility class - no instantiation */ }

    // API prefix
    public static final String API_BASE = "/api/v1";

    // Pagination defaults
    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final int MAX_PAGE_SIZE = 100;

    // JWT header
    public static final String AUTH_HEADER  = "Authorization";
    public static final String TOKEN_PREFIX = "Bearer ";
}
