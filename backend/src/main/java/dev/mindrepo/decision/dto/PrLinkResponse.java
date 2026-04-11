// src/main/java/dev/mindrepo/decision/dto/PrLinkResponse.java
package dev.mindrepo.decision.dto;

import java.time.Instant;

public record PrLinkResponse(
    String id,
    int prNumber,
    String prTitle,
    String prUrl,
    String prState,
    Instant createdAt
) {}
