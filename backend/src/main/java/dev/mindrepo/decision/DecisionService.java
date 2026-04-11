// src/main/java/dev/mindrepo/decision/DecisionService.java
package dev.mindrepo.decision;

import dev.mindrepo.activity.Activity;
import dev.mindrepo.activity.ActivityRepository;
import dev.mindrepo.decision.dto.*;
import dev.mindrepo.org.OrgMember;
import dev.mindrepo.org.OrgMemberRepository;
import dev.mindrepo.org.OrgRole;
import dev.mindrepo.repo.Repo;
import dev.mindrepo.repo.RepoRepository;
import dev.mindrepo.user.User;
import dev.mindrepo.common.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DecisionService {

    private final DecisionRepository decisionRepository;
    private final DecisionPrLinkRepository prLinkRepository;
    private final CommentRepository commentRepository;
    private final DecisionVoteRepository voteRepository;
    private final RepoRepository repoRepository;
    private final OrgMemberRepository orgMemberRepository;
    private final ActivityRepository activityRepository;
    private final RestClient restClient;

    @Transactional(readOnly = true)
    public PagedResponse<DecisionResponse> getDecisions(DecisionSearchParams params, String currentUserId) {
        Page<Decision> decisions;
        Pageable pageable = PageRequest.of(params.page(), params.size(), 
            Sort.by(Sort.Direction.DESC, getSortField(params.sort())));

        if (StringUtils.hasText(params.search())) {
            // Full-text search
            List<Decision> searchResults = decisionRepository.fullTextSearch(
                params.search(), params.repoId(), params.size(), params.page() * params.size());
            
            // Convert to Page manually
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), searchResults.size());
            List<Decision> pageContent = searchResults.subList(start, end);
            
            decisions = new org.springframework.data.domain.PageImpl<>(pageContent, pageable, searchResults.size());
        } else if (params.tags() != null && !params.tags().isEmpty()) {
            // Tag filtering
            decisions = decisionRepository.findWithFilters(
                params.repoId(), params.status() != null ? params.status().name() : null, params.authorId(), pageable);
            
            // Filter by tags in memory for multiple tags
            if (params.tags().size() > 1) {
                List<Decision> filtered = decisions.getContent().stream()
                    .filter(d -> {
                        List<String> decisionTags = List.of(d.getTags());
                        return decisionTags.containsAll(params.tags());
                    })
                    .collect(Collectors.toList());
                decisions = new org.springframework.data.domain.PageImpl<>(filtered, pageable, filtered.size());
            }
        } else {
            // Regular filtered query
            decisions = decisionRepository.findWithFilters(
                params.repoId(), params.status() != null ? params.status().name() : null, params.authorId(), pageable);
        }

        List<DecisionResponse> content = decisions.getContent().stream()
            .map(decision -> mapToDecisionResponse(decision, currentUserId))
            .collect(Collectors.toList());

        return new PagedResponse<>(
            content,
            decisions.getNumber(),
            decisions.getSize(),
            decisions.getTotalElements(),
            decisions.getTotalPages(),
            decisions.isLast()
        );
    }

    @Transactional(readOnly = true)
    public DecisionDetailResponse getDecisionById(String id, String currentUserId) {
        Decision decision = decisionRepository.findByIdWithAuthorRepoOrg(id)
            .orElseThrow(() -> new ResourceNotFoundException("Decision", id));

        assertOrgMember(decision.getRepo().getOrg().getId(), currentUserId);

        // Increment view count asynchronously
        incrementViewCountAsync(id);

        // Load comments with replies
        List<Comment> topLevelComments = commentRepository.findByDecisionIdAndParentIdIsNull(
            id, Sort.by(Sort.Direction.ASC, "createdAt"));
        
        List<CommentResponse> comments = topLevelComments.stream()
            .map(comment -> mapToCommentResponse(comment, currentUserId))
            .collect(Collectors.toList());

        // Load PR links
        List<PrLinkResponse> prLinks = prLinkRepository.findByDecisionId(id).stream()
            .map(this::mapToPrLinkResponse)
            .collect(Collectors.toList());

        // Load references
        List<DecisionRefResponse> references = decision.getReferences().stream()
            .map(ref -> new DecisionRefResponse(
                ref.getId(),
                ref.getDescription(),
                ref.getTo().getId(),
                ref.getTo().getTitle(),
                ref.getTo().getStatus().name()
            ))
            .collect(Collectors.toList());

        List<DecisionRefResponse> referencedBy = decision.getReferencedBy().stream()
            .map(ref -> new DecisionRefResponse(
                ref.getId(),
                ref.getDescription(),
                ref.getFrom().getId(),
                ref.getFrom().getTitle(),
                ref.getFrom().getStatus().name()
            ))
            .collect(Collectors.toList());

        DecisionResponse baseResponse = mapToDecisionResponse(decision, currentUserId);

        return new DecisionDetailResponse(
            baseResponse.id(),
            baseResponse.title(),
            baseResponse.body(),
            baseResponse.status(),
            baseResponse.tags(),
            baseResponse.authorId(),
            baseResponse.authorName(),
            baseResponse.authorAvatar(),
            baseResponse.authorGithubUsername(),
            baseResponse.repoId(),
            baseResponse.repoName(),
            baseResponse.repoFullName(),
            baseResponse.prLinks(),
            baseResponse.commentCount(),
            baseResponse.voteScore(),
            baseResponse.userVote(),
            baseResponse.viewCount(),
            baseResponse.createdAt(),
            baseResponse.updatedAt(),
            baseResponse.lastActivityAt(),
            comments,
            references,
            referencedBy
        );
    }

    @Transactional
    public DecisionResponse createDecision(CreateDecisionRequest req, String currentUserId) {
        Repo repo = repoRepository.findById(req.repoId())
            .orElseThrow(() -> new ResourceNotFoundException("Repository", req.repoId()));

        assertOrgMember(repo.getOrg().getId(), currentUserId);

        Decision decision = Decision.builder()
            .id(UUID.randomUUID().toString())
            .title(req.title())
            .body(req.body())
            .status(req.status())
            .author(User.builder().id(currentUserId).build())
            .repo(repo)
            .tags(req.tags().toArray(new String[0]))
            .viewCount(0)
            .lastActivityAt(Instant.now())
            .build();

        Decision saved = decisionRepository.save(decision);
        log.info("Created decision '{}' in repo '{}' by user '{}'", 
            saved.getId(), repo.getFullName(), currentUserId);

        // Log activity: action="decision.created"
        Activity activity = Activity.builder()
            .id(UUID.randomUUID().toString())
            .org(repo.getOrg())
            .user(User.builder().id(currentUserId).build())
            .decision(saved)
            .action("decision.created")
            .meta(Map.of(
                "decisionId", saved.getId(),
                "decisionTitle", saved.getTitle(),
                "repoId", repo.getId(),
                "repoName", repo.getFullName()
            ))
            .build();
        activityRepository.save(activity);

        return mapToDecisionResponse(saved, currentUserId);
    }

    @Transactional
    public DecisionResponse updateDecision(String id, UpdateDecisionRequest req, String currentUserId) {
        Decision decision = decisionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Decision", id));

        if (!decision.getAuthor().getId().equals(currentUserId)) {
            throw new ForbiddenException("Only the author can edit this decision");
        }

        if (req.title() != null) decision.setTitle(req.title());
        if (req.body() != null) decision.setBody(req.body());
        if (req.status() != null) decision.setStatus(req.status());
        if (req.tags() != null) decision.setTags(req.tags().toArray(new String[0]));

        decision.setLastActivityAt(Instant.now());

        Decision saved = decisionRepository.save(decision);
        log.info("Updated decision '{}' by user '{}'", id, currentUserId);

        return mapToDecisionResponse(saved, currentUserId);
    }

    @Transactional
    public void deleteDecision(String id, String currentUserId) {
        Decision decision = decisionRepository.findByIdWithAuthorRepoOrg(id)
            .orElseThrow(() -> new ResourceNotFoundException("Decision", id));

        if (!decision.getAuthor().getId().equals(currentUserId)) {
            // Check if user is ADMIN/OWNER of org
            OrgMember member = orgMemberRepository.findByOrgIdAndUserId(
                decision.getRepo().getOrg().getId(), currentUserId)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this organization"));
            
            if (!member.getRole().equals(OrgRole.OWNER) && 
                !member.getRole().equals(OrgRole.ADMIN)) {
                throw new ForbiddenException("Only the author or an org admin/owner can delete this decision");
            }
        }

        decisionRepository.delete(decision);
        log.info("Deleted decision '{}' by user '{}'", id, currentUserId);
    }

    @Transactional
    public PrLinkResponse addPrLink(String decisionId, AddPrLinkRequest req, String currentUserId) {
        Decision decision = decisionRepository.findById(decisionId)
            .orElseThrow(() -> new ResourceNotFoundException("Decision", decisionId));

        assertOrgMember(decision.getRepo().getOrg().getId(), currentUserId);

        // Check if PR link already exists
        Optional<DecisionPrLink> existing = prLinkRepository.findByDecisionIdAndPrNumber(
            decisionId, req.prNumber());
        if (existing.isPresent()) {
            throw new IllegalArgumentException("PR #" + req.prNumber() + " is already linked to this decision");
        }

        // Call GitHub API to verify PR
        GitHubPrInfo prInfo = fetchGitHubPrInfo(req.prRepoFullName(), req.prNumber());

        DecisionPrLink link = DecisionPrLink.builder()
            .id(UUID.randomUUID().toString())
            .decision(decision)
            .prNumber(req.prNumber())
            .prTitle(prInfo.title())
            .prUrl(prInfo.htmlUrl())
            .prState(prInfo.state())
            .build();

        DecisionPrLink saved = prLinkRepository.save(link);
        
        // Update decision activity
        decision.setLastActivityAt(Instant.now());
        decisionRepository.save(decision);

        log.info("Linked PR #{} to decision '{}' by user '{}'", 
            req.prNumber(), decisionId, currentUserId);

        return mapToPrLinkResponse(saved);
    }

    @Transactional
    public void removePrLink(String decisionId, String linkId, String currentUserId) {
        DecisionPrLink link = prLinkRepository.findById(linkId)
            .orElseThrow(() -> new ResourceNotFoundException("PR Link", linkId));

        if (!link.getDecision().getId().equals(decisionId)) {
            throw new IllegalArgumentException("PR link does not belong to this decision");
        }

        assertOrgMember(link.getDecision().getRepo().getOrg().getId(), currentUserId);

        prLinkRepository.delete(link);

        // Update decision activity
        Decision decision = link.getDecision();
        decision.setLastActivityAt(Instant.now());
        decisionRepository.save(decision);

        log.info("Removed PR link '{}' from decision '{}' by user '{}'", 
            linkId, decisionId, currentUserId);
    }

    @Transactional
    public CommentResponse addComment(String decisionId, AddCommentRequest req, String currentUserId) {
        Decision decision = decisionRepository.findById(decisionId)
            .orElseThrow(() -> new ResourceNotFoundException("Decision", decisionId));

        assertOrgMember(decision.getRepo().getOrg().getId(), currentUserId);

        if (req.parentId() != null) {
            // Verify parent comment exists and belongs to same decision
            Optional<Comment> parent = commentRepository.findByDecisionIdAndId(decisionId, req.parentId());
            if (parent.isEmpty()) {
                throw new ResourceNotFoundException("Parent comment", req.parentId());
            }
        }

        Comment comment = Comment.builder()
            .id(UUID.randomUUID().toString())
            .decision(decision)
            .author(User.builder().id(currentUserId).build())
            .body(req.body())
            .parentId(req.parentId())
            .resolved(false)
            .build();

        Comment saved = commentRepository.save(comment);

        // Update decision activity
        decision.setLastActivityAt(Instant.now());
        decisionRepository.save(decision);

        log.info("Added comment '{}' to decision '{}' by user '{}'", 
            saved.getId(), decisionId, currentUserId);

        // Log activity: action="comment.added"
        Activity activity = Activity.builder()
            .id(UUID.randomUUID().toString())
            .org(decision.getRepo().getOrg())
            .user(User.builder().id(currentUserId).build())
            .decision(decision)
            .action("comment.added")
            .meta(Map.of(
                "commentId", saved.getId(),
                "decisionId", decisionId,
                "hasParent", saved.getParentId() != null
            ))
            .build();
        activityRepository.save(activity);

        return mapToCommentResponse(saved, currentUserId);
    }

    @Transactional
    public CommentResponse resolveComment(String commentId, String currentUserId) {
        Comment comment = commentRepository.findById(commentId)
            .orElseThrow(() -> new ResourceNotFoundException("Comment", commentId));

        assertOrgMember(comment.getDecision().getRepo().getOrg().getId(), currentUserId);

        comment.setResolved(true);
        Comment saved = commentRepository.save(comment);

        // Update decision activity
        Decision decision = comment.getDecision();
        decision.setLastActivityAt(Instant.now());
        decisionRepository.save(decision);

        log.info("Resolved comment '{}' by user '{}'", commentId, currentUserId);

        return mapToCommentResponse(saved, currentUserId);
    }

    @Transactional
    public DecisionVoteResult vote(String decisionId, int vote, String currentUserId) {
        if (vote < -1 || vote > 1) {
            throw new IllegalArgumentException("Vote must be -1, 0, or 1");
        }

        Decision decision = decisionRepository.findById(decisionId)
            .orElseThrow(() -> new ResourceNotFoundException("Decision", decisionId));

        assertOrgMember(decision.getRepo().getOrg().getId(), currentUserId);

        Optional<DecisionVote> existingVote = voteRepository.findByDecisionIdAndUserId(decisionId, currentUserId);

        if (vote == 0) {
            // Remove vote if exists
            existingVote.ifPresent(v -> voteRepository.delete(v));
        } else {
            // Upsert vote
            DecisionVote newVote = DecisionVote.builder()
                .id(existingVote.map(DecisionVote::getId).orElse(UUID.randomUUID().toString()))
                .decision(decision)
                .user(User.builder().id(currentUserId).build())
                .vote((short) vote)
                .build();

            voteRepository.save(newVote);
        }

        int newScore = voteRepository.sumVotesByDecisionId(decisionId);

        // Update decision activity
        decision.setLastActivityAt(Instant.now());
        decisionRepository.save(decision);

        log.info("User '{}' voted {} on decision '{}', new score: {}", 
            currentUserId, vote, decisionId, newScore);

        return new DecisionVoteResult(newScore, vote);
    }

    @Async
    public CompletableFuture<Void> incrementViewCountAsync(String decisionId) {
        decisionRepository.incrementViewCount(decisionId);
        return CompletableFuture.completedFuture(null);
    }

    private DecisionResponse mapToDecisionResponse(Decision decision, String currentUserId) {
        int voteScore = voteRepository.sumVotesByDecisionId(decision.getId());
        Integer userVote = voteRepository.findByDecisionIdAndUserId(decision.getId(), currentUserId)
            .map(v -> (int) v.getVote())
            .orElse(null);

        int commentCount = (int) commentRepository.countByDecisionId(decision.getId());

        return new DecisionResponse(
            decision.getId(),
            decision.getTitle(),
            decision.getBody(),
            decision.getStatus().name(),
            List.of(decision.getTags()),
            decision.getAuthor().getId(),
            decision.getAuthor().getName(),
            decision.getAuthor().getAvatarUrl(),
            decision.getAuthor().getGithubUsername(),
            decision.getRepo().getId(),
            decision.getRepo().getName(),
            decision.getRepo().getFullName(),
            decision.getPrLinks().stream()
                .map(this::mapToPrLinkResponse)
                .collect(Collectors.toList()),
            commentCount,
            voteScore,
            userVote,
            decision.getViewCount(),
            decision.getCreatedAt().toInstant(),
            decision.getUpdatedAt().toInstant(),
            decision.getLastActivityAt()
        );
    }

    private PrLinkResponse mapToPrLinkResponse(DecisionPrLink link) {
        return new PrLinkResponse(
            link.getId(),
            link.getPrNumber(),
            link.getPrTitle(),
            link.getPrUrl(),
            link.getPrState(),
            link.getCreatedAt().toInstant()
        );
    }

    private CommentResponse mapToCommentResponse(Comment comment, String currentUserId) {
        List<CommentResponse> replies = commentRepository.findByParentId(comment.getId()).stream()
            .map(reply -> mapToCommentResponse(reply, currentUserId))
            .collect(Collectors.toList());

        return new CommentResponse(
            comment.getId(),
            comment.getBody(),
            comment.isResolved(),
            comment.getAuthor().getId(),
            comment.getAuthor().getName(),
            comment.getAuthor().getAvatarUrl(),
            comment.getParentId(),
            replies,
            comment.getCreatedAt().toInstant(),
            comment.getUpdatedAt().toInstant()
        );
    }

    private GitHubPrInfo fetchGitHubPrInfo(String repoFullName, int prNumber) {
        try {
            String url = String.format("https://api.github.com/repos/%s/pulls/%d", repoFullName, prNumber);
            
            Map<String, Object> response = restClient.get()
                .uri(url)
                .header("Accept", "application/vnd.github+json")
                .header("Authorization", "Bearer " + System.getenv("GITHUB_TOKEN"))
                .retrieve()
                .body(Map.class);

            return new GitHubPrInfo(
                (String) response.get("title"),
                (String) response.get("html_url"),
                (String) response.get("state")
            );
        } catch (Exception e) {
            throw new GitHubApiException("Failed to fetch PR info: " + e.getMessage());
        }
    }

    private String getSortField(String sort) {
        if (sort == null) return "createdAt";
        return switch (sort) {
            case "oldest" -> "createdAt";
            case "mostViewed" -> "viewCount";
            case "mostDiscussed" -> "comments.size";
            default -> "createdAt";
        };
    }

    private void assertOrgMember(String orgId, String userId) {
        User user = User.builder().id(userId).build();
        if (!orgMemberRepository.existsByOrgIdAndUserId(orgId, userId)) {
            throw new AccessDeniedException("You are not a member of this organization");
        }
    }

    private record GitHubPrInfo(String title, String htmlUrl, String state) {}
}
