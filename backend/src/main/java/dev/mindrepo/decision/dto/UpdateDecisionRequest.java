// src/main/java/dev/mindrepo/decision/dto/UpdateDecisionRequest.java
package dev.mindrepo.decision.dto;

import dev.mindrepo.decision.DecisionStatus;
import jakarta.validation.constraints.Size;

import java.util.List;

public record UpdateDecisionRequest(
    @Size(max = 500, message = "Title must be less than 500 characters")
    String title,
    
    String body,
    
    DecisionStatus status,
    
    List<String> tags
) {}
