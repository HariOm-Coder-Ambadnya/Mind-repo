// src/main/java/dev/mindrepo/auth/OAuth2SuccessHandler.java
package dev.mindrepo.auth;

import dev.mindrepo.org.Org;
import dev.mindrepo.org.OrgMember;
import dev.mindrepo.org.OrgMemberRepository;
import dev.mindrepo.org.OrgRepository;
import dev.mindrepo.org.OrgRole;
import dev.mindrepo.user.User;
import dev.mindrepo.user.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final UserService userService;
    private final JwtService jwtService;
    private final OrgRepository orgRepository;
    private final OrgMemberRepository orgMemberRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        Map<String, Object> attributes = oAuth2User.getAttributes();

        log.info("OAuth2 login success for GitHub user: {}", attributes.get("login"));

        log.info("Attempting to upsert user from GitHub attributes: {}", attributes);
        User user = userService.upsertFromGithub(attributes);
        if (user == null) {
            log.error("UserService.upsertFromGithub returned null for attributes: {}", attributes);
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Failed to create/update user");
            return;
        }

        // Auto-create personal org for new users
        ensurePersonalOrg(user);

        log.info("Generating token for user ID: {}", user.getId());
        String token = jwtService.generateToken(user);

        String redirectUrl = frontendUrl + "/auth/callback?token=" + token;
        log.info("Redirecting to frontend: {}", redirectUrl);
        response.sendRedirect(redirectUrl);
    }

    private void ensurePersonalOrg(User user) {
        long membershipCount = orgMemberRepository.countByUserId(user.getId());
        
        if (membershipCount == 0) {
            String slug = user.getGithubUsername().toLowerCase()
                .replaceAll("[^a-z0-9-]", "-");
            
            // Check if org with this slug already exists (idempotent)
            Optional<Org> existingOrg = orgRepository.findBySlug(slug);
            
            if (existingOrg.isPresent()) {
                Org org = existingOrg.get();
                // Check if user is already a member
                if (!orgMemberRepository.existsByOrgIdAndUserId(org.getId(), user.getId())) {
                    OrgMember membership = OrgMember.builder()
                        .id(UUID.randomUUID().toString())
                        .org(org)
                        .user(user)
                        .role(OrgRole.OWNER)
                        .build();
                    orgMemberRepository.save(membership);
                    log.info("Added user '{}' to existing org '{}'", user.getGithubUsername(), slug);
                }
            } else {
                // Create new personal org
                Org personalOrg = Org.builder()
                    .id(UUID.randomUUID().toString())
                    .name(user.getGithubUsername() + "'s workspace")
                    .slug(slug)
                    .description("Personal workspace for " + user.getGithubUsername())
                    .build();
                personalOrg = orgRepository.save(personalOrg);
                
                OrgMember membership = OrgMember.builder()
                    .id(UUID.randomUUID().toString())
                    .org(personalOrg)
                    .user(user)
                    .role(OrgRole.OWNER)
                    .build();
                orgMemberRepository.save(membership);
                
                log.info("Created personal org '{}' for user '{}'", slug, user.getGithubUsername());
            }
        }
    }
}
