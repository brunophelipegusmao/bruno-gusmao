package dev.brunogusmao.api.kanbantasks;

import dev.brunogusmao.api.common.AuditableEntity;
import dev.brunogusmao.api.common.KanbanStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

/**
 * Tarefa standalone do quadro Kanban do painel — módulo independente, sem FK para
 * {@code badges}/{@code projects} (ver {@code docs/java-migration/05-kanban-tasks.md}).
 * Equivalente à tabela {@code kanban_tasks} do Nest.
 */
@Entity
@Table(name = "kanban_tasks")
public class KanbanTask extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "task_type", nullable = false, length = 50)
    private TaskType taskType = TaskType.BLOG;

    @Column(name = "color", length = 50)
    private String color;

    @Enumerated(EnumType.STRING)
    @Column(name = "kanban_status", nullable = false, length = 50)
    private KanbanStatus kanbanStatus = KanbanStatus.BACKLOG;

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

    public TaskType getTaskType() {
        return taskType;
    }

    public void setTaskType(TaskType taskType) {
        this.taskType = taskType;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public KanbanStatus getKanbanStatus() {
        return kanbanStatus;
    }

    public void setKanbanStatus(KanbanStatus kanbanStatus) {
        this.kanbanStatus = kanbanStatus;
    }
}
