package dev.brunogusmao.api.todos;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TodoRepository extends JpaRepository<Todo, UUID> {

    /**
     * Escopo de leitura do modelo de dois usuários: tudo que é compartilhado + o que é
     * privado do próprio usuário, ordenado por createdAt (ver 06-todos.md). Expresso como
     * @Query porque o OR entre duas condições diferentes ("shared = true" x "owner.id = :id")
     * não é limpo de derivar via method-query-derivation.
     */
    @Query("SELECT t FROM Todo t WHERE t.shared = true OR t.owner.id = :userId ORDER BY t.createdAt")
    List<Todo> findAllForUser(@Param("userId") UUID userId);
}
