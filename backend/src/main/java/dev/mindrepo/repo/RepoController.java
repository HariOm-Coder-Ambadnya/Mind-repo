// src/main/java/dev/mindrepo/repo/RepoController.java
package dev.mindrepo.repo;

import dev.mindrepo.common.ApiResponse;
import dev.mindrepo.common.ForbiddenException;
import dev.mindrepo.common.ResourceNotFoundException;
import dev.mindrepo.org.Org;
import dev.mindrepo.org.OrgMemberRepository;
import dev.mindrepo.org.OrgRepository;
import dev.mindrepo.user.User;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/repos")
@RequiredArgsConstructor
@Slf4j
public class RepoController {

    private final RepoRepository repoRepository;
    private final OrgMemberRepository orgMemberRepository;
    private final OrgRepository orgRepository;
    private final RestClient restClient;

    @Value("${GITHUB_TOKEN:#{null}}")
    private String githubToken;

    @GetMapping
    public ResponseEntity<ApiResponse<List<RepoResponse>>> getUserRepos(
            @AuthenticationPrincipal User user) {
        // Get all orgs the user is a member of
        List<dev.mindrepo.org.OrgMember> memberships = orgMemberRepository.findAllByUserId(user.getId());
        
        // Get all repos from those orgs
        List<Repo> repos = memberships.stream()
            .flatMap(membership -> repoRepository.findAllByOrgId(membership.getOrg().getId()).stream())
            .toList();
        
        List<RepoResponse> response = repos.stream()
            .map(this::mapToRepoResponse)
            .toList();
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RepoResponse>> getRepo(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {
        Repo repo = repoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Repository", id));
        
        // Verify user has access
        if (!orgMemberRepository.existsByOrgIdAndUserId(repo.getOrg().getId(), user.getId())) {
            throw new ForbiddenException("You are not a member of this organization");
        }
        
        return ResponseEntity.ok(ApiResponse.success(mapToRepoResponse(repo)));
    }

    @GetMapping("/github/available")
    public ResponseEntity<ApiResponse<List<GitHubRepoDTO>>> getAvailableGitHubRepos(
            @AuthenticationPrincipal User user) {
        // Verify user has access to at least one org
        List<dev.mindrepo.org.OrgMember> memberships = orgMemberRepository.findAllByUserId(user.getId());
        if (memberships.isEmpty()) {
            throw new ForbiddenException("You are not a member of any organization");
        }

        // Call GitHub API to get user's repos
        List<Map<String, Object>> githubRepos = fetchGitHubRepos();
        
        // Get already imported repo IDs
        List<Long> importedGithubIds = repoRepository.findAll().stream()
            .map(Repo::getGithubRepoId)
            .collect(Collectors.toList());
        
        List<GitHubRepoDTO> response = githubRepos.stream()
            .map(repo -> new GitHubRepoDTO(
                ((Number) repo.get("id")).longValue(),
                (String) repo.get("name"),
                (String) repo.get("full_name"),
                (String) repo.get("description"),
                (Boolean) repo.getOrDefault("private", false),
                (String) repo.getOrDefault("default_branch", "main"),
                importedGithubIds.contains(((Number) repo.get("id")).longValue())
            ))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/import")
    public ResponseEntity<ApiResponse<RepoResponse>> importRepo(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ImportRepoRequest request) {
        // Verify org exists and user has access
        Org org = orgRepository.findById(request.orgId())
            .orElseThrow(() -> new ResourceNotFoundException("Organization", request.orgId()));
        
        if (!orgMemberRepository.existsByOrgIdAndUserId(request.orgId(), user.getId())) {
            throw new ForbiddenException("You are not a member of this organization");
        }
        
        // Check if already imported
        repoRepository.findByGithubRepoId(request.githubRepoId()).ifPresent(existing -> {
            throw new IllegalArgumentException("Repository already imported: " + existing.getFullName());
        });
        
        // Fetch repo details from GitHub
        Map<String, Object> githubRepo = fetchGitHubRepo(request.githubRepoId());
        
        // Create and save repo
        Repo repo = Repo.builder()
            .id(UUID.randomUUID().toString())
            .org(org)
            .name((String) githubRepo.get("name"))
            .fullName((String) githubRepo.get("full_name"))
            .githubRepoId(request.githubRepoId())
            .description((String) githubRepo.get("description"))
            .privateRepo((Boolean) githubRepo.getOrDefault("private", false))
            .defaultBranch((String) githubRepo.getOrDefault("default_branch", "main"))
            .build();
        
        Repo saved = repoRepository.save(repo);
        log.info("Imported GitHub repo '{}' (id: {}) to org '{}' by user '{}'",
            saved.getFullName(), saved.getGithubRepoId(), org.getSlug(), user.getGithubUsername());
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(mapToRepoResponse(saved), "Repository imported successfully"));
    }

    private List<Map<String, Object>> fetchGitHubRepos() {
        String token = getGitHubToken();
        try {
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> response = restClient.get()
                .uri("https://api.github.com/user/repos?sort=updated&per_page=50&type=all")
                .header("Accept", "application/vnd.github+json")
                .header("Authorization", "Bearer " + token)
                .header("X-GitHub-Api-Version", "2022-11-28")
                .retrieve()
                .body(List.class);
            return response != null ? response : List.of();
        } catch (Exception e) {
            log.error("Failed to fetch GitHub repos: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch GitHub repositories: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> fetchGitHubRepo(long githubRepoId) {
        String token = getGitHubToken();
        try {
            return restClient.get()
                .uri("https://api.github.com/repositories/{id}", githubRepoId)
                .header("Accept", "application/vnd.github+json")
                .header("Authorization", "Bearer " + token)
                .header("X-GitHub-Api-Version", "2022-11-28")
                .retrieve()
                .body(Map.class);
        } catch (Exception e) {
            log.error("Failed to fetch GitHub repo {}: {}", githubRepoId, e.getMessage());
            throw new ResourceNotFoundException("GitHub Repository", String.valueOf(githubRepoId));
        }
    }

    private String getGitHubToken() {
        // Use GITHUB_TOKEN env var as fallback
        if (githubToken != null && !githubToken.isBlank()) {
            return githubToken;
        }
        String envToken = System.getenv("GITHUB_TOKEN");
        if (envToken != null && !envToken.isBlank()) {
            return envToken;
        }
        throw new IllegalStateException("GitHub token not configured");
    }

    private RepoResponse mapToRepoResponse(Repo repo) {
        return new RepoResponse(
            repo.getId(),
            repo.getName(),
            repo.getFullName(),
            repo.getDescription(),
            repo.isPrivateRepo(),
            repo.getDefaultBranch(),
            repo.getOrg().getId(),
            repo.getOrg().getName(),
            repo.getCreatedAt().toString()
        );
    }

    // --- DTOs ---

    public record RepoResponse(
        String id,
        String name,
        String fullName,
        String description,
        boolean isPrivate,
        String defaultBranch,
        String orgId,
        String orgName,
        String createdAt
    ) {}

    public record GitHubRepoDTO(
        long githubRepoId,
        String name,
        String fullName,
        String description,
        boolean isPrivate,
        String defaultBranch,
        boolean alreadyImported
    ) {}

    public record ImportRepoRequest(
        @NotNull(message = "GitHub repo ID is required")
        Long githubRepoId,
        
        @NotBlank(message = "Organization ID is required")
        String orgId
    ) {}
}
