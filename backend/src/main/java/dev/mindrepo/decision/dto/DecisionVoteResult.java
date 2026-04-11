// src/main/java/dev/mindrepo/decision/dto/DecisionVoteResult.java
package dev.mindrepo.decision.dto;

public record DecisionVoteResult(
    int newScore,
    int userVote
) {}
