package com.studyplanner.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;
import org.springframework.data.mongodb.core.convert.DefaultMongoTypeMapper;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;

/**
 * MongoDB configuration.
 *
 * <ul>
 *   <li>Enables Spring Data auditing ({@code @CreatedDate}, {@code @LastModifiedDate})</li>
 *   <li>Suppresses the {@code _class} type-hint field from stored BSON documents</li>
 * </ul>
 *
 * <p>Connection settings (URI, database name, pool sizes) are read from
 * {@code application.yml} by Spring Boot's MongoDB auto-configuration —
 * no manual {@code MongoClient} bean is needed here.</p>
 */
@Configuration
@EnableMongoAuditing
public class MongoConfig {

    /**
     * Removes the {@code _class} discriminator field that Spring Data MongoDB
     * writes by default. Documents stored by this app will not contain {@code _class}.
     */
    @Bean
    public MappingMongoConverter mappingMongoConverter(
            org.springframework.data.mongodb.MongoDatabaseFactory factory,
            org.springframework.data.mongodb.core.mapping.MongoMappingContext context,
            org.springframework.data.convert.CustomConversions conversions) {

        MappingMongoConverter converter = new MappingMongoConverter(
                new org.springframework.data.mongodb.core.convert.DefaultDbRefResolver(factory),
                context);
        converter.setCustomConversions(conversions);
        converter.setCodecRegistryProvider(factory);
        // Remove _class field
        converter.setTypeMapper(new DefaultMongoTypeMapper(null));
        return converter;
    }
}
