// src/main/java/dev/mindrepo/decision/DecisionRepository.java
package dev.mindrepo.decision;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DecisionRepository extends JpaRepository<Decision, String> {

    @Query(value = """
      SELECT * FROM decisions
      WHERE (:repoId IS NULL OR repo_id = :repoId)
        AND (:status IS NULL OR CAST(status AS VARCHAR) = :status)
        AND (:authorId IS NULL OR author_id = :authorId)
      ORDER BY created_at DESC
    """, nativeQuery = true)
    Page<Decision> findWithFilters(
      @Param("repoId") String repoId,
      @Param("status") String status,
      @Param("authorId") String authorId,
      Pageable pageable
    );

    @Query(value = """
      SELECT * FROM decisions
      WHERE (:repoId IS NULL OR repo_id = :repoId)
        AND search_vector @@ plainto_tsquery('english', :search)
      ORDER BY ts_rank(search_vector, 
        plainto_tsquery('english', :search)) DESC
      LIMIT :limit OFFSET :offset
    """, nativeQuery = true)
    List<Decision> fullTextSearch(
      @Param("search") String search,
      @Param("repoId") String repoId,
      @Param("limit") int limit,
      @Param("offset") int offset
    );

    @Query(value = """
      SELECT * FROM decisions
      WHERE repo_id = :repoId
        AND :tag = ANY(tags)
    """, nativeQuery = true)
    List<Decision> findByTag(
      @Param("repoId") String repoId,
      @Param("tag") String tag
    );

    @Modifying
    @Query("UPDATE Decision d SET d.viewCount = d.viewCount + 1 WHERE d.id = :id")
    void incrementViewCount(@Param("id") String id);

    @Query("""
      SELECT d FROM Decision d
      LEFT JOIN FETCH d.author
      LEFT JOIN FETCH d.repo r
      LEFT JOIN FETCH r.org
      WHERE d.id = :id
    """)
    Optional<Decision> findByIdWithAuthorRepoOrg(@Param("id") String id);
}
