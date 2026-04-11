// src/main/java/dev/mindrepo/decision/dto/AddCommentRequest.java
package dev.mindrepo.decision.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AddCommentRequest(
    @NotBlank(message = "Comment body is required")
    @Size(max = 10000, message = "Comment must be less than 10000 characters")
    String body,
    
    String parentId
) {}
