package com.studyplanner.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Achievement — Represents a gamified reward earned by a user.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "achievements")
public class Achievement {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String badgeName;
    private String description;

    @Indexed
    @CreatedDate
    private LocalDateTime earnedAt;
}
