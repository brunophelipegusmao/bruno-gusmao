package dev.brunogusmao.api.kanbantasks;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Tipo visual de uma tarefa do kanban standalone — só metadado de exibição
 * (cor/ícone no painel), sem relação com FK para {@code badges}/{@code projects}.
 * Equivalente ao {@code TASK_TYPES} do Nest ({@code apps/api/src/db/schema/kanban-tasks.ts}).
 *
 * Serializado em JSON como lowercase ("blog") para manter paridade com o Nest — ver
 * {@link dev.brunogusmao.api.common.KanbanStatus} para o mesmo padrão.
 */
public enum TaskType {
    BLOG,
    PROJECT,
    CUSTOM;

    @JsonValue
    public String toJson() {
        return name().toLowerCase();
    }

    @JsonCreator
    public static TaskType fromJson(String value) {
        return valueOf(value.toUpperCase());
    }
}
