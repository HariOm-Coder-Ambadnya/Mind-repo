// src/main/java/dev/mindrepo/decision/dto/AddPrLinkRequest.java
package dev.mindrepo.decision.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AddPrLinkRequest(
    @NotNull(message = "PR number is required")
    Integer prNumber,
    
    @NotBlank(message = "PR repository full name is required")
    String prRepoFullName
) {}
