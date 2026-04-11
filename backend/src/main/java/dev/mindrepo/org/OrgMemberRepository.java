// src/main/java/dev/mindrepo/org/OrgMemberRepository.java
package dev.mindrepo.org;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrgMemberRepository extends JpaRepository<OrgMember, String> {

    List<OrgMember> findAllByOrgId(String orgId);

    List<OrgMember> findAllByUserId(String userId);

    Optional<OrgMember> findByOrgIdAndUserId(String orgId, String userId);

    boolean existsByOrgIdAndUserId(String orgId, String userId);

    long countByUserId(String userId);
}
