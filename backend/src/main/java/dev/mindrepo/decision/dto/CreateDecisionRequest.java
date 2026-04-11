// src/main/java/dev/mindrepo/decision/dto/CreateDecisionRequest.java
package dev.mindrepo.decision.dto;

import dev.mindrepo.decision.DecisionStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record CreateDecisionRequest(
    @NotBlank(message = "Title is required")
    @Size(max = 500, message = "Title must be less than 500 characters")
    String title,
    
    @NotBlank(message = "Body is required")
    String body,
    
    @NotBlank(message = "Repository ID is required")
    String repoId,
    
    DecisionStatus status,
    
    List<String> tags
) {
    public CreateDecisionRequest {
        if (status == null) {
            status = DecisionStatus.PROPOSED;
        }
        if (tags == null) {
            tags = List.of();
        }
    }
}
