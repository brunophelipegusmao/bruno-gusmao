package dev.brunogusmao.api.kanbantasks;

import dev.brunogusmao.api.common.KanbanStatus;
import dev.brunogusmao.api.common.exception.NotFoundException;
import dev.brunogusmao.api.kanbantasks.dto.KanbanTaskCreateRequest;
import dev.brunogusmao.api.kanbantasks.dto.KanbanTaskResponse;
import dev.brunogusmao.api.kanbantasks.dto.KanbanTaskUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class KanbanTaskService {

    private final KanbanTaskRepository kanbanTaskRepository;

    public KanbanTaskService(KanbanTaskRepository kanbanTaskRepository) {
        this.kanbanTaskRepository = kanbanTaskRepository;
    }

    @Transactional(readOnly = true)
    public List<KanbanTaskResponse> findAll() {
        return kanbanTaskRepository.findAllByOrderByCreatedAtAsc().stream()
                .map(KanbanTaskResponse::fromEntity)
                .toList();
    }

    public KanbanTaskResponse create(KanbanTaskCreateRequest request) {
        KanbanTask task = new KanbanTask();
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setTaskType(request.taskType() != null ? request.taskType() : TaskType.BLOG);
        task.setColor(request.color());
        task.setKanbanStatus(request.kanbanStatus() != null ? request.kanbanStatus() : KanbanStatus.BACKLOG);

        KanbanTask saved = kanbanTaskRepository.save(task);
        return KanbanTaskResponse.fromEntity(saved);
    }

    public KanbanTaskResponse update(UUID id, KanbanTaskUpdateRequest request) {
        KanbanTask task = kanbanTaskRepository.findById(id)
                .orElseThrow(NotFoundException::new);

        if (request.title() != null) {
            task.setTitle(request.title());
        }
        if (request.description() != null) {
            task.setDescription(request.description());
        }
        if (request.taskType() != null) {
            task.setTaskType(request.taskType());
        }
        if (request.color() != null) {
            task.setColor(request.color());
        }
        if (request.kanbanStatus() != null) {
            task.setKanbanStatus(request.kanbanStatus());
        }

        KanbanTask saved = kanbanTaskRepository.save(task);
        return KanbanTaskResponse.fromEntity(saved);
    }

    public KanbanTaskResponse remove(UUID id) {
        KanbanTask task = kanbanTaskRepository.findById(id)
                .orElseThrow(NotFoundException::new);

        kanbanTaskRepository.delete(task);
        return KanbanTaskResponse.fromEntity(task);
    }
}
