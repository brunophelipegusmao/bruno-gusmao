package dev.brunogusmao.api.projects;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {

    /**
     * Equivalente a {@code .orderBy(desc(projects.featured), projects.createdAt)} no
     * Drizzle (apps/api/src/projects/projects.service.ts) — destaque primeiro, depois
     * mais antigos primeiro.
     */
    List<Project> findByVisibleTrueOrderByFeaturedDescCreatedAtAsc();

    List<Project> findAllByOrderByFeaturedDescCreatedAtAsc();
}
