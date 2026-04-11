// src/main/java/dev/mindrepo/decision/dto/CommentResponse.java
package dev.mindrepo.decision.dto;

import java.time.Instant;
import java.util.List;

public record CommentResponse(
    String id,
    String body,
    boolean resolved,
    String authorId,
    String authorName,
    String authorAvatar,
    String parentId,
    List<CommentResponse> replies,
    Instant createdAt,
    Instant updatedAt
) {}
