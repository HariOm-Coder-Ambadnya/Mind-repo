// src/main/java/dev/mindrepo/repo/RepoRepository.java
package dev.mindrepo.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepoRepository extends JpaRepository<Repo, String> {

    List<Repo> findAllByOrgId(String orgId);

    Optional<Repo> findByGithubRepoId(Long githubRepoId);

    boolean existsByOrgIdAndGithubRepoId(String orgId, Long githubRepoId);
}
