// src/main/java/dev/mindrepo/decision/DecisionPrLinkRepository.java
package dev.mindrepo.decision;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DecisionPrLinkRepository extends JpaRepository<DecisionPrLink, String> {

    List<DecisionPrLink> findByDecisionId(String decisionId);

    @Query("SELECT pr FROM DecisionPrLink pr WHERE pr.decision.id = :decisionId AND pr.prNumber = :prNumber")
    Optional<DecisionPrLink> findByDecisionIdAndPrNumber(@Param("decisionId") String decisionId, @Param("prNumber") int prNumber);
}
