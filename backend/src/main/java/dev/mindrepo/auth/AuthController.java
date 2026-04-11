// src/main/java/dev/mindrepo/auth/AuthController.java
package dev.mindrepo.auth;

import dev.mindrepo.common.ApiResponse;
import dev.mindrepo.user.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfile>> me(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }
        UserProfile profile = new UserProfile(
            user.getId(),
            user.getGithubUsername(),
            user.getName(),
            user.getEmail(),
            user.getAvatarUrl(),
            user.getBio(),
            user.getCreatedAt().toString()
        );
        return ResponseEntity.ok(ApiResponse.success(profile, "User profile retrieved"));
    }

    record UserProfile(
        String id,
        String githubUsername,
        String name,
        String email,
        String avatarUrl,
        String bio,
        String createdAt
    ) {}
}
