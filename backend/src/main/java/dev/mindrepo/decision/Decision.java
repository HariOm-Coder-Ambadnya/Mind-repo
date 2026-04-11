// src/main/java/dev/mindrepo/decision/Decision.java
package dev.mindrepo.decision;

import com.fasterxml.jackson.annotation.JsonIgnore;
import dev.mindrepo.repo.Repo;
import dev.mindrepo.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "decisions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Decision {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "title", nullable = false, length = 500)
    private String title;

    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, columnDefinition = "decision_status")
    @Builder.Default
    private DecisionStatus status = DecisionStatus.PROPOSED;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "repo_id", nullable = false)
    private Repo repo;

    @Column(name = "tags", columnDefinition = "TEXT[]")
    @Builder.Default
    private String[] tags = new String[]{};

    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private int viewCount = 0;

    @Column(name = "last_activity_at", nullable = false, columnDefinition = "TIMESTAMPTZ")
    @Builder.Default
    private Instant lastActivityAt = Instant.now();

    @JsonIgnore
    @OneToMany(mappedBy = "decision", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DecisionPrLink> prLinks = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "decision", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Comment> comments = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "from", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<DecisionRef> references = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "to", fetch = FetchType.LAZY)
    @Builder.Default
    private List<DecisionRef> referencedBy = new ArrayList<>();

    @JsonIgnore
    @OneToMany(mappedBy = "decision", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<DecisionVote> votes = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false, columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false, columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime updatedAt;
}
