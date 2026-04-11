// src/main/java/dev/mindrepo/org/OrgMember.java
package dev.mindrepo.org;

import com.fasterxml.jackson.annotation.JsonIgnore;
import dev.mindrepo.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "org_members")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrgMember {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id", nullable = false)
    private Org org;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, columnDefinition = "org_role")
    @Builder.Default
    private OrgRole role = OrgRole.MEMBER;

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false, columnDefinition = "TIMESTAMPTZ")
    private OffsetDateTime joinedAt;
}
