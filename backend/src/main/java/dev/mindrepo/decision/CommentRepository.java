// src/main/java/dev/mindrepo/decision/CommentRepository.java
package dev.mindrepo.decision;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, String> {

    List<Comment> findByDecisionIdAndParentIdIsNull(String decisionId, Sort sort);

    List<Comment> findByParentId(String parentId);

    long countByDecisionId(String decisionId);

    @Query("SELECT c FROM Comment c WHERE c.decision.id = :decisionId AND c.id = :commentId")
    Optional<Comment> findByDecisionIdAndId(String decisionId, String commentId);
}
