// src/main/java/dev/mindrepo/user/UserService.java
package dev.mindrepo.user;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public User upsertFromGithub(Map<String, Object> attributes) {
        Long githubId = Long.valueOf(attributes.get("id").toString());
        String githubUsername = (String) attributes.get("login");
        String name = (String) attributes.getOrDefault("name", githubUsername);
        String email = (String) attributes.get("email");
        String avatarUrl = (String) attributes.get("avatar_url");
        String bio = (String) attributes.get("bio");

        return userRepository.findByGithubId(githubId)
            .map(existing -> {
                log.info("Found existing user for githubId: {}", githubId);
                existing.setGithubUsername(githubUsername);
                existing.setName(name);
                if (email != null) existing.setEmail(email);
                if (avatarUrl != null) existing.setAvatarUrl(avatarUrl);
                if (bio != null) existing.setBio(bio);
                User saved = userRepository.save(existing);
                log.info("Updated user: {} (id: {})", saved.getGithubUsername(), saved.getId());
                return saved;
            })
            .orElseGet(() -> {
                log.info("Creating new user for githubId: {}", githubId);
                User newUser = User.builder()
                    .id(UUID.randomUUID().toString())
                    .githubId(githubId)
                    .githubUsername(githubUsername)
                    .name(name)
                    .email(email)
                    .avatarUrl(avatarUrl)
                    .bio(bio)
                    .build();
                User saved = userRepository.save(newUser);
                log.info("Created new user: {} (id: {})", saved.getGithubUsername(), saved.getId());
                return saved;
            });
    }

    public User findById(String id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }
}
