package dev.brunogusmao.api.kanbantasks;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface KanbanTaskRepository extends JpaRepository<KanbanTask, UUID> {

    List<KanbanTask> findAllByOrderByCreatedAtAsc();
}
