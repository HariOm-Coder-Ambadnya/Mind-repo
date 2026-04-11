// src/main/java/dev/mindrepo/repo/Repo.java
package dev.mindrepo.repo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import dev.mindrepo.org.Org;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "repos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Repo {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id", nullable = false)
    private Org org;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "full_name", nullable = false, length = 300)
    private String fullName;

    @Column(name = "github_repo_id", unique = true, nullable = false)
    private Long githubRepoId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "private", nullable = false)
    @Builder.Default
    private boolean privateRepo = false;

    @Column(name = "default_branch", nullable = false, length = 100)
    @Builder.Default
    private String defaultBranch = "main";

    @Column(name = "webhook_id")
    private Long webhookId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false, columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false, columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime updatedAt;
}
