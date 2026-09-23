package dev.brunogusmao.api.projects;

import dev.brunogusmao.api.badges.Badge;
import dev.brunogusmao.api.badges.BadgeRepository;
import dev.brunogusmao.api.common.KanbanStatus;
import dev.brunogusmao.api.common.exception.NotFoundException;
import dev.brunogusmao.api.projects.dto.ProjectCreateRequest;
import dev.brunogusmao.api.projects.dto.ProjectResponse;
import dev.brunogusmao.api.projects.dto.ProjectUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Fonte no Nest: apps/api/src/projects/projects.service.ts. Único filtro de negócio:
 * findAllPublic() só retorna visible=true; findAll() (rota /all) retorna tudo — mesmo
 * padrão de Posts. Ordenação featured DESC, createdAt ASC em ambas as listagens.
 */
@Service
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final BadgeRepository badgeRepository;

    public ProjectService(ProjectRepository projectRepository, BadgeRepository badgeRepository) {
        this.projectRepository = projectRepository;
        this.badgeRepository = badgeRepository;
    }

    public List<ProjectResponse> findAllPublic() {
        return projectRepository.findByVisibleTrueOrderByFeaturedDescCreatedAtAsc().stream()
                .map(ProjectResponse::from)
                .toList();
    }

    public List<ProjectResponse> findAll() {
        return projectRepository.findAllByOrderByFeaturedDescCreatedAtAsc().stream()
                .map(ProjectResponse::from)
                .toList();
    }

    @Transactional
    public ProjectResponse create(ProjectCreateRequest request) {
        Project project = new Project();
        project.setName(request.name());
        project.setSlug(request.slug());
        project.setSummary(request.summary());
        project.setImage(request.image());
        project.setProjectUrl(request.projectUrl());
        project.setRepoUrl(request.repoUrl());
        project.setBadge1(resolveBadge(request.badge1Id()));
        project.setBadge2(resolveBadge(request.badge2Id()));
        project.setBadge3(resolveBadge(request.badge3Id()));
        project.setVisible(request.visible() != null ? request.visible() : true);
        project.setFeatured(request.featured() != null ? request.featured() : false);
        project.setKanbanStatus(request.kanbanStatus() != null ? request.kanbanStatus() : KanbanStatus.BACKLOG);

        return ProjectResponse.from(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse update(UUID id, ProjectUpdateRequest request) {
        Project project = findProjectOrThrow(id);

        if (request.name() != null) {
            project.setName(request.name());
        }
        if (request.slug() != null) {
            project.setSlug(request.slug());
        }
        if (request.summary() != null) {
            project.setSummary(request.summary());
        }
        if (request.image() != null) {
            project.setImage(request.image());
        }
        if (request.projectUrl() != null) {
            project.setProjectUrl(request.projectUrl());
        }
        if (request.repoUrl() != null) {
            project.setRepoUrl(request.repoUrl());
        }
        if (request.badge1Id() != null) {
            project.setBadge1(resolveBadge(request.badge1Id()));
        }
        if (request.badge2Id() != null) {
            project.setBadge2(resolveBadge(request.badge2Id()));
        }
        if (request.badge3Id() != null) {
            project.setBadge3(resolveBadge(request.badge3Id()));
        }
        if (request.visible() != null) {
            project.setVisible(request.visible());
        }
        if (request.featured() != null) {
            project.setFeatured(request.featured());
        }
        if (request.kanbanStatus() != null) {
            project.setKanbanStatus(request.kanbanStatus());
        }

        return ProjectResponse.from(project);
    }

    @Transactional
    public ProjectResponse remove(UUID id) {
        Project project = findProjectOrThrow(id);
        ProjectResponse response = ProjectResponse.from(project);
        projectRepository.delete(project);
        return response;
    }

    private Project findProjectOrThrow(UUID id) {
        return projectRepository.findById(id).orElseThrow(NotFoundException::new);
    }

    private Badge resolveBadge(UUID badgeId) {
        if (badgeId == null) {
            return null;
        }
        return badgeRepository.findById(badgeId).orElseThrow(NotFoundException::new);
    }
}
