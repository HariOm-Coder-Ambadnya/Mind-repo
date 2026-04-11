// src/main/java/dev/mindrepo/org/OrgController.java
package dev.mindrepo.org;

import dev.mindrepo.common.ApiResponse;
import dev.mindrepo.user.User;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orgs")
@RequiredArgsConstructor
@Slf4j
public class OrgController {

    private final OrgRepository orgRepository;
    private final OrgMemberRepository orgMemberRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<OrgSummary>>> listOrgs(
            @AuthenticationPrincipal User user) {
        List<Org> orgs = orgRepository.findAllByUserId(user.getId());
        List<OrgSummary> summaries = orgs.stream()
            .map(o -> new OrgSummary(o.getId(), o.getName(), o.getSlug(),
                o.getDescription(), o.getAvatarUrl(), o.getCreatedAt().toString()))
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(summaries, "Organizations retrieved"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<OrgDetail>> createOrg(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateOrgRequest request) {

        if (orgRepository.existsBySlug(request.slug())) {
            throw new IllegalArgumentException("Slug '" + request.slug() + "' is already taken");
        }

        Org org = Org.builder()
            .id(UUID.randomUUID().toString())
            .name(request.name())
            .slug(request.slug())
            .description(request.description())
            .build();
        org = orgRepository.save(org);

        OrgMember ownerMembership = OrgMember.builder()
            .id(UUID.randomUUID().toString())
            .org(org)
            .user(user)
            .role(OrgRole.OWNER)
            .build();
        orgMemberRepository.save(ownerMembership);

        log.info("Created org '{}' by user '{}'", org.getSlug(), user.getGithubUsername());

        List<OrgMember> members = orgMemberRepository.findAllByOrgId(org.getId());
        OrgDetail detail = buildOrgDetail(org, members);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(detail, "Organization created"));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<ApiResponse<OrgDetail>> getOrg(
            @PathVariable String slug,
            @AuthenticationPrincipal User user) {
        Org org = orgRepository.findBySlug(slug)
            .orElseThrow(() -> new EntityNotFoundException("Organization not found: " + slug));

        boolean isMember = orgMemberRepository.existsByOrgIdAndUserId(org.getId(), user.getId());
        if (!isMember) {
            throw new org.springframework.security.access.AccessDeniedException(
                "You are not a member of this organization");
        }

        List<OrgMember> members = orgMemberRepository.findAllByOrgId(org.getId());
        return ResponseEntity.ok(ApiResponse.success(buildOrgDetail(org, members),
            "Organization retrieved"));
    }

    private OrgDetail buildOrgDetail(Org org, List<OrgMember> members) {
        List<MemberSummary> memberSummaries = members.stream()
            .map(m -> new MemberSummary(
                m.getUser().getId(),
                m.getUser().getGithubUsername(),
                m.getUser().getName(),
                m.getUser().getAvatarUrl(),
                m.getRole().name(),
                m.getJoinedAt().toString()
            ))
            .collect(Collectors.toList());

        return new OrgDetail(
            org.getId(), org.getName(), org.getSlug(),
            org.getDescription(), org.getAvatarUrl(),
            org.getCreatedAt().toString(), memberSummaries
        );
    }

    // ── DTOs ──────────────────────────────────────────────────────────────────

    record CreateOrgRequest(
        @NotBlank(message = "Name is required")
        @Size(max = 200, message = "Name must be at most 200 characters")
        String name,

        @NotBlank(message = "Slug is required")
        @Size(max = 100, message = "Slug must be at most 100 characters")
        @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug may only contain lowercase letters, numbers, and hyphens")
        String slug,

        String description
    ) {}

    record OrgSummary(
        String id,
        String name,
        String slug,
        String description,
        String avatarUrl,
        String createdAt
    ) {}

    record MemberSummary(
        String userId,
        String githubUsername,
        String name,
        String avatarUrl,
        String role,
        String joinedAt
    ) {}

    record OrgDetail(
        String id,
        String name,
        String slug,
        String description,
        String avatarUrl,
        String createdAt,
        List<MemberSummary> members
    ) {}
}
