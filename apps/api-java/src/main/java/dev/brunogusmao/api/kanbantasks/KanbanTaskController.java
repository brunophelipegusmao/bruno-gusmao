package dev.brunogusmao.api.kanbantasks;

import dev.brunogusmao.api.kanbantasks.dto.KanbanTaskCreateRequest;
import dev.brunogusmao.api.kanbantasks.dto.KanbanTaskResponse;
import dev.brunogusmao.api.kanbantasks.dto.KanbanTaskUpdateRequest;
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
 * Tarefas standalone do quadro Kanban. Autorização (GET público; POST/PATCH/DELETE
 * autenticados) é decidida centralmente em {@code SecurityConfig} — este controller só
 * implementa a lógica normal (ver {@code docs/java-migration/05-kanban-tasks.md}).
 */
@RestController
@RequestMapping("/api/kanban-tasks")
@Tag(name = "kanban-tasks")
public class KanbanTaskController {

    private final KanbanTaskService kanbanTaskService;

    public KanbanTaskController(KanbanTaskService kanbanTaskService) {
        this.kanbanTaskService = kanbanTaskService;
    }

    @GetMapping
    @Operation(summary = "Listar tarefas do kanban", description = "Retorna todas as tarefas standalone do kanban, ordenadas por createdAt ascendente. Rota pública (dados não sensíveis).")
    public List<KanbanTaskResponse> findAll() {
        return kanbanTaskService.findAll();
    }

    @PostMapping
    @Operation(summary = "Criar tarefa", description = "Cria uma nova tarefa no kanban. Requer autenticação.")
    public ResponseEntity<KanbanTaskResponse> create(@Valid @RequestBody KanbanTaskCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(kanbanTaskService.create(request));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Atualizar tarefa", description = "Atualiza parcialmente uma tarefa. Também usado para mover entre colunas via kanbanStatus. Requer autenticação.")
    public KanbanTaskResponse update(@PathVariable UUID id, @Valid @RequestBody KanbanTaskUpdateRequest request) {
        return kanbanTaskService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir tarefa", description = "Remove uma tarefa permanentemente. Requer autenticação.")
    public KanbanTaskResponse remove(@PathVariable UUID id) {
        return kanbanTaskService.remove(id);
    }
}
