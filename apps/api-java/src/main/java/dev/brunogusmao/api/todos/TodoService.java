package dev.brunogusmao.api.todos;

import dev.brunogusmao.api.auth.User;
import dev.brunogusmao.api.auth.UserRepository;
import dev.brunogusmao.api.common.exception.ForbiddenException;
import dev.brunogusmao.api.common.exception.NotFoundException;
import dev.brunogusmao.api.kanban.TodosWebSocketHandler;
import dev.brunogusmao.api.todos.dto.TodoCreateRequest;
import dev.brunogusmao.api.todos.dto.TodoResponse;
import dev.brunogusmao.api.todos.dto.TodoUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Regras de negócio do módulo Todos — o coração do modelo de dois usuários (ver
 * docs/java-migration/06-todos.md). {@link #assertMutable(UUID, UUID)} é a regra central:
 * um todo privado só pode ser mutado pelo dono; um todo compartilhado pode ser mutado por
 * qualquer usuário autenticado.
 *
 * <p>Dispara broadcast via WebSocket ({@code todo-created}/{@code todo-updated}/
 * {@code todo-deleted}) ao final de create/update/remove, injetando
 * {@link TodosWebSocketHandler} direto por construtor — sem {@code @Lazy}, porque não há
 * ciclo de beans a evitar (ver javadoc de {@link TodosWebSocketHandler#broadcast}). Mesmo
 * padrão do Nest, onde {@code TodosGateway} é injetado direto em {@code TodosService}.</p>
 */
@Service
@Transactional
public class TodoService {

    private final TodoRepository todoRepository;
    private final UserRepository userRepository;
    private final TodosWebSocketHandler todosWebSocketHandler;

    public TodoService(TodoRepository todoRepository, UserRepository userRepository,
                        TodosWebSocketHandler todosWebSocketHandler) {
        this.todoRepository = todoRepository;
        this.userRepository = userRepository;
        this.todosWebSocketHandler = todosWebSocketHandler;
    }

    @Transactional(readOnly = true)
    public List<TodoResponse> findAllForUser(UUID userId) {
        return todoRepository.findAllForUser(userId).stream()
                .map(TodoResponse::fromEntity)
                .toList();
    }

    public TodoResponse create(TodoCreateRequest request, UUID ownerId) {
        User owner = userRepository.findById(ownerId)
                .orElseThrow(NotFoundException::new);

        Todo todo = new Todo();
        todo.setTitle(request.title());
        todo.setDescription(request.description());
        todo.setShared(request.shared() != null && request.shared());
        // owner sempre vem do usuário autenticado (@CurrentUser), nunca do DTO — o DTO de
        // criação nem tem campo ownerId, de propósito.
        todo.setOwner(owner);

        Todo saved = todoRepository.save(todo);
        TodoResponse response = TodoResponse.fromEntity(saved);
        todosWebSocketHandler.broadcast("todo-created", response);
        return response;
    }

    public TodoResponse update(UUID id, TodoUpdateRequest request, UUID userId) {
        Todo todo = assertMutable(id, userId);

        if (request.title() != null) {
            todo.setTitle(request.title());
        }
        if (request.description() != null) {
            todo.setDescription(request.description());
        }
        if (request.done() != null) {
            todo.setDone(request.done());
        }
        if (request.shared() != null) {
            todo.setShared(request.shared());
        }

        Todo saved = todoRepository.save(todo);
        TodoResponse response = TodoResponse.fromEntity(saved);
        todosWebSocketHandler.broadcast("todo-updated", response);
        return response;
    }

    public TodoResponse remove(UUID id, UUID userId) {
        Todo todo = assertMutable(id, userId);
        TodoResponse response = TodoResponse.fromEntity(todo);
        todoRepository.delete(todo);
        todosWebSocketHandler.broadcast("todo-deleted", response);
        return response;
    }

    /**
     * Regra central do módulo: 404 se o todo não existe; 403 se é privado (shared=false) e
     * o usuário atual não é o dono. Um todo compartilhado pode ser mutado por QUALQUER
     * usuário autenticado, não só o dono — replicar exatamente essa lógica (ver
     * TodosService#assertMutable no Nest).
     */
    private Todo assertMutable(UUID id, UUID userId) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(NotFoundException::new);

        if (!todo.isShared() && !todo.getOwner().getId().equals(userId)) {
            throw new ForbiddenException();
        }

        return todo;
    }
}
