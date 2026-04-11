// src/main/java/dev/mindrepo/user/UserRepository.java
package dev.mindrepo.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByGithubId(Long githubId);

    Optional<User> findByGithubUsername(String githubUsername);

    Optional<User> findByEmail(String email);
}
