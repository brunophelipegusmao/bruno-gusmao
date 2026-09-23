package dev.brunogusmao.api.todos;

import dev.brunogusmao.api.auth.CurrentUser;
import dev.brunogusmao.api.auth.CurrentUserPrincipal;
import dev.brunogusmao.api.todos.dto.TodoCreateRequest;
import dev.brunogusmao.api.todos.dto.TodoResponse;
import dev.brunogusmao.api.todos.dto.TodoUpdateRequest;
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
 * Módulo que define o modelo de dois usuários (ver docs/java-migration/06-todos.md).
 * Toda rota exige autenticação, inclusive o GET — diferente do padrão público/admin dos
 * outros módulos, porque a resposta do GET depende de quem pergunta. A matriz de
 * autorização já está centralizada em {@code SecurityConfig} (``/api/todos/**``
 * autenticado) — este controller só injeta o usuário atual via {@code @CurrentUser} em
 * cada handler.
 */
@RestController
@RequestMapping("/api/todos")
@Tag(name = "todos")
public class TodoController {

    private final TodoService todoService;

    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    @GetMapping
    @Operation(summary = "Listar todos", description = "Retorna os todos privados do usuário autenticado + os todos compartilhados. Rota protegida — o resultado depende de quem pergunta.")
    public List<TodoResponse> findAll(@CurrentUser CurrentUserPrincipal user) {
        return todoService.findAllForUser(user.id());
    }

    @PostMapping
    @Operation(summary = "Criar todo", description = "Cria um todo privado (padrão) ou compartilhado. O dono é sempre o usuário autenticado.")
    public ResponseEntity<TodoResponse> create(@Valid @RequestBody TodoCreateRequest request,
                                                @CurrentUser CurrentUserPrincipal user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(todoService.create(request, user.id()));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Atualizar todo", description = "Atualiza parcialmente um todo. Só o dono pode editar um todo privado; um todo compartilhado pode ser editado por qualquer usuário autenticado.")
    public TodoResponse update(@PathVariable UUID id, @Valid @RequestBody TodoUpdateRequest request,
                                @CurrentUser CurrentUserPrincipal user) {
        return todoService.update(id, request, user.id());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir todo", description = "Remove um todo permanentemente. Só o dono pode excluir um todo privado; um todo compartilhado pode ser excluído por qualquer usuário autenticado.")
    public TodoResponse remove(@PathVariable UUID id, @CurrentUser CurrentUserPrincipal user) {
        return todoService.remove(id, user.id());
    }
}
