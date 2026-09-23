package dev.brunogusmao.api.common;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Status de uma coluna do quadro Kanban. Compartilhado entre o módulo
 * {@code kanbantasks} e os futuros módulos {@code projects}/{@code posts} (que usam
 * {@code kanbanStatus} apenas para organização interna no painel — ver
 * {@code docs/java-migration/03-projects.md}). Equivalente ao {@code KANBAN_STATUSES}
 * do Nest ({@code apps/api/src/db/schema/projects.ts}).
 *
 * Vive em {@code common} (não em {@code kanbantasks}) justamente para que os outros
 * módulos possam importá-lo sem duplicação nem dependência cruzada entre pacotes de
 * feature.
 *
 * Serializado em JSON como kebab-case ("in-progress") para manter paridade de contrato
 * com o Nest — o frontend (apps/web) compara essas strings direto. O nome do enum em si
 * (BACKLOG, IN_PROGRESS, ...) continua sendo o que é persistido no banco via
 * {@code @Enumerated(EnumType.STRING)}, então essa anotação afeta só a camada HTTP.
 */
public enum KanbanStatus {
    BACKLOG,
    TODO,
    IN_PROGRESS,
    DONE;

    @JsonValue
    public String toJson() {
        return name().toLowerCase().replace('_', '-');
    }

    @JsonCreator
    public static KanbanStatus fromJson(String value) {
        return valueOf(value.toUpperCase().replace('-', '_'));
    }
}
