// src/main/java/dev/mindrepo/decision/dto/DecisionDetailResponse.java
package dev.mindrepo.decision.dto;

import java.time.Instant;
import java.util.List;

public record DecisionDetailResponse(
    String id,
    String title,
    String body,
    String status,
    List<String> tags,
    String authorId,
    String authorName,
    String authorAvatar,
    String authorGithubUsername,
    String repoId,
    String repoName,
    String repoFullName,
    List<PrLinkResponse> prLinks,
    int commentCount,
    int voteScore,
    Integer userVote,
    int viewCount,
    Instant createdAt,
    Instant updatedAt,
    Instant lastActivityAt,
    List<CommentResponse> comments,
    List<DecisionRefResponse> references,
    List<DecisionRefResponse> referencedBy
) {}
