package dev.brunogusmao.api.projects;

import dev.brunogusmao.api.projects.dto.ProjectCreateRequest;
import dev.brunogusmao.api.projects.dto.ProjectResponse;
import dev.brunogusmao.api.projects.dto.ProjectUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * Projetos do portfólio. Autorização (GET público; GET /all e POST/PATCH/DELETE
 * autenticados) é decidida centralmente em {@code SecurityConfig} — este controller só
 * implementa a lógica normal (ver docs/java-migration/03-projects.md).
 *
 * Fonte no Nest: apps/api/src/projects/projects.controller.ts
 */
@RestController
@RequestMapping("/api/projects")
@Tag(name = "projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    @Operation(summary = "Listar projetos públicos", description = "Retorna apenas projetos com visible=true, ordenados por featured DESC, createdAt. Rota pública.")
    public List<ProjectResponse> findAllPublic() {
        return projectService.findAllPublic();
    }

    @GetMapping("/all")
    @Operation(summary = "Listar todos os projetos (admin)", description = "Retorna todos os projetos independente de visibilidade. Requer autenticação.")
    public List<ProjectResponse> findAll() {
        return projectService.findAll();
    }

    @PostMapping
    @Operation(summary = "Criar projeto", description = "Cadastra um novo projeto. Requer autenticação.")
    public ResponseEntity<ProjectResponse> create(@Valid @RequestBody ProjectCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.create(request));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Atualizar projeto", description = "Atualiza parcialmente um projeto. Útil para alternar visibilidade ou status kanban. Requer autenticação.")
    public ProjectResponse update(@PathVariable UUID id, @Valid @RequestBody ProjectUpdateRequest request) {
        return projectService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir projeto", description = "Remove um projeto permanentemente. Requer autenticação.")
    public ProjectResponse remove(@PathVariable UUID id) {
        return projectService.remove(id);
    }
}
