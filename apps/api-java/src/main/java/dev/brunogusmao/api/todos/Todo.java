package dev.brunogusmao.api.todos;

import dev.brunogusmao.api.auth.User;
import dev.brunogusmao.api.common.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.util.UUID;

/**
 * Tarefa pessoal ou compartilhada entre os usuários do painel — módulo que define o
 * modelo de dois usuários (ver docs/java-migration/06-todos.md). Equivalente à tabela
 * {@code todos} do Nest (apps/api/src/db/schema/todos.ts).
 *
 * {@code shared=false} (padrão): só o {@code owner} pode ler/editar/apagar.
 * {@code shared=true}: qualquer usuário autenticado pode ler/editar/apagar — a regra
 * central fica em {@link TodoService#assertMutable(UUID, UUID)}.
 */
@Entity
@Table(name = "todos")
public class Todo extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "done", nullable = false)
    private boolean done = false;

    @Column(name = "shared", nullable = false)
    private boolean shared = false;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User owner;

    public UUID getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isDone() {
        return done;
    }

    public void setDone(boolean done) {
        this.done = done;
    }

    public boolean isShared() {
        return shared;
    }

    public void setShared(boolean shared) {
        this.shared = shared;
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = owner;
    }
}
