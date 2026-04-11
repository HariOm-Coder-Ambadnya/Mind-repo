// src/main/java/dev/mindrepo/decision/dto/DecisionRefResponse.java
package dev.mindrepo.decision.dto;

public record DecisionRefResponse(
    String id,
    String description,
    String targetId,
    String targetTitle,
    String targetStatus
) {}
