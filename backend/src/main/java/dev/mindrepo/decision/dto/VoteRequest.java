// src/main/java/dev/mindrepo/decision/dto/VoteRequest.java
package dev.mindrepo.decision.dto;

public record VoteRequest(
    int vote // -1, 0, or 1
) {}
