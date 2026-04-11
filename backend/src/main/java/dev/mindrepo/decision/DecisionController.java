// src/main/java/dev/mindrepo/decision/DecisionController.java
package dev.mindrepo.decision;

import dev.mindrepo.common.ApiResponse;
import dev.mindrepo.decision.dto.*;
import dev.mindrepo.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/decisions")
@RequiredArgsConstructor
@Slf4j
public class DecisionController {

    private final DecisionService decisionService;

    @GetMapping
    public ResponseEntity<ApiResponse<dev.mindrepo.common.PagedResponse<DecisionResponse>>> getDecisions(
            @RequestParam(required = false) String repoId,
            @RequestParam(required = false) DecisionStatus status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) java.util.List<String> tags,
            @RequestParam(required = false) String authorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort,
            @AuthenticationPrincipal User user) {

        DecisionSearchParams params = new DecisionSearchParams(
            repoId, status, search, tags, authorId, page, size, sort
        );

        dev.mindrepo.common.PagedResponse<DecisionResponse> response = decisionService.getDecisions(params, user.getId());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DecisionDetailResponse>> getDecision(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {

        DecisionDetailResponse decision = decisionService.getDecisionById(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(decision));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DecisionResponse>> createDecision(
            @Valid @RequestBody CreateDecisionRequest request,
            @AuthenticationPrincipal User user) {

        DecisionResponse decision = decisionService.createDecision(request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(decision));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ApiResponse<DecisionResponse>> updateDecision(
            @PathVariable String id,
            @RequestBody UpdateDecisionRequest request,
            @AuthenticationPrincipal User user) {

        DecisionResponse decision = decisionService.updateDecision(id, request, user.getId());
        return ResponseEntity.ok(ApiResponse.success(decision));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDecision(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {

        decisionService.deleteDecision(id, user.getId());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/pr-links")
    public ResponseEntity<ApiResponse<PrLinkResponse>> addPrLink(
            @PathVariable String id,
            @Valid @RequestBody AddPrLinkRequest request,
            @AuthenticationPrincipal User user) {

        PrLinkResponse prLink = decisionService.addPrLink(id, request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(prLink));
    }

    @DeleteMapping("/{id}/pr-links/{linkId}")
    public ResponseEntity<Void> removePrLink(
            @PathVariable String id,
            @PathVariable String linkId,
            @AuthenticationPrincipal User user) {

        decisionService.removePrLink(id, linkId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/pr-links")
    public ResponseEntity<ApiResponse<java.util.List<PrLinkResponse>>> getPrLinks(
            @PathVariable String id,
            @AuthenticationPrincipal User user) {

        DecisionDetailResponse decision = decisionService.getDecisionById(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(decision.prLinks()));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<CommentResponse>> addComment(
            @PathVariable String id,
            @Valid @RequestBody AddCommentRequest request,
            @AuthenticationPrincipal User user) {

        CommentResponse comment = decisionService.addComment(id, request, user.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(comment));
    }

    @PatchMapping("/{id}/comments/{commentId}/resolve")
    public ResponseEntity<ApiResponse<CommentResponse>> resolveComment(
            @PathVariable String id,
            @PathVariable String commentId,
            @AuthenticationPrincipal User user) {

        CommentResponse comment = decisionService.resolveComment(commentId, user.getId());
        return ResponseEntity.ok(ApiResponse.success(comment));
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<ApiResponse<DecisionVoteResult>> vote(
            @PathVariable String id,
            @RequestBody VoteRequest request,
            @AuthenticationPrincipal User user) {

        DecisionVoteResult result = decisionService.vote(id, request.vote(), user.getId());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    private String getCurrentUserId() {
        return ((User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getId();
    }
}
