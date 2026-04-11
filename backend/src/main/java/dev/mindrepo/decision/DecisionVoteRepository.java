// src/main/java/dev/mindrepo/decision/DecisionVoteRepository.java
package dev.mindrepo.decision;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DecisionVoteRepository extends JpaRepository<DecisionVote, String> {

    Optional<DecisionVote> findByDecisionIdAndUserId(String decisionId, String userId);

    @Query("SELECT COALESCE(SUM(v.vote),0) FROM DecisionVote v WHERE v.decision.id = :decisionId")
    int sumVotesByDecisionId(@Param("decisionId") String decisionId);
}
