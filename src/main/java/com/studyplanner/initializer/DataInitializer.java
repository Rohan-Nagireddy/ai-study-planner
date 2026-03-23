package com.studyplanner.initializer;

import com.studyplanner.model.Role;
import com.studyplanner.model.StudyTask;
import com.studyplanner.model.User;
import com.studyplanner.repository.StudyTaskRepository;
import com.studyplanner.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Seeds demo / admin data on startup when the database is empty.
 * Safe to run repeatedly — guarded by count checks.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final StudyTaskRepository taskRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedTasks();
        seedAdminUser();
    }

    private void seedTasks() {
        if (taskRepository.count() == 0) {
            List<StudyTask> tasks = List.of(
                    StudyTask.builder().subject("Math").description("Calculus - Integrals and Series").estimatedTime(120).build(),
                    StudyTask.builder().subject("Physics").description("Mechanics - Kinematics").estimatedTime(60).build(),
                    StudyTask.builder().subject("Chemistry").description("Organic - Functional Groups").estimatedTime(60).build(),
                    StudyTask.builder().subject("CS").description("Data Structures - Trees").estimatedTime(120).build()
            );
            taskRepository.saveAll(tasks);
            log.info("[DataInitializer] Seeded {} demo study tasks.", tasks.size());
        }
    }

    private void seedAdminUser() {
        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .name("Admin")
                    .email("admin@local")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            log.info("[DataInitializer] Admin user seeded → admin@local / admin123");
        }
    }
}
