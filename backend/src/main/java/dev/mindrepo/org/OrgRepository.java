// src/main/java/dev/mindrepo/org/OrgRepository.java
package dev.mindrepo.org;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrgRepository extends JpaRepository<Org, String> {

    Optional<Org> findBySlug(String slug);

    boolean existsBySlug(String slug);

    @Query("SELECT o FROM Org o JOIN OrgMember m ON m.org = o WHERE m.user.id = :userId")
    List<Org> findAllByUserId(@Param("userId") String userId);
}
