// src/main/java/dev/mindrepo/activity/ActivityRepository.java
package dev.mindrepo.activity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, String> {
}
