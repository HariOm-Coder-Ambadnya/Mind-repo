// src/main/java/dev/mindrepo/decision/DecisionPrLink.java
package dev.mindrepo.decision;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "decision_pr_links")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DecisionPrLink {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "decision_id", nullable = false)
    private Decision decision;

    @Column(name = "pr_number", nullable = false)
    private Integer prNumber;

    @Column(name = "pr_title", nullable = false, length = 500)
    private String prTitle;

    @Column(name = "pr_url", nullable = false, columnDefinition = "TEXT")
    private String prUrl;

    @Column(name = "pr_state", nullable = false, length = 20)
    @Builder.Default
    private String prState = "open";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false, columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime createdAt;
}
