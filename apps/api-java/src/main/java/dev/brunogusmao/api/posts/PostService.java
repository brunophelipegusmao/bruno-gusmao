package dev.brunogusmao.api.posts;

import dev.brunogusmao.api.badges.Badge;
import dev.brunogusmao.api.badges.BadgeRepository;
import dev.brunogusmao.api.common.KanbanStatus;
import dev.brunogusmao.api.common.exception.NotFoundException;
import dev.brunogusmao.api.posts.dto.PostCreateRequest;
import dev.brunogusmao.api.posts.dto.PostResponse;
import dev.brunogusmao.api.posts.dto.PostUpdateRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Fonte no Nest: apps/api/src/posts/posts.service.ts — estruturalmente idêntico a
 * ProjectService, trocando os campos específicos de imagem/URL por imageUrl/content e
 * adicionando findBySlug (rota pública usada pelo blog).
 */
@Service
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository postRepository;
    private final BadgeRepository badgeRepository;

    public PostService(PostRepository postRepository, BadgeRepository badgeRepository) {
        this.postRepository = postRepository;
        this.badgeRepository = badgeRepository;
    }

    public List<PostResponse> findAllPublic() {
        return postRepository.findAllByVisibleTrueOrderByFeaturedDescCreatedAtAsc().stream()
                .map(PostResponse::from)
                .toList();
    }

    public List<PostResponse> findAll() {
        return postRepository.findAllByOrderByFeaturedDescCreatedAtAsc().stream()
                .map(PostResponse::from)
                .toList();
    }

    public PostResponse findBySlug(String slug) {
        Post post = postRepository.findBySlug(slug).orElseThrow(NotFoundException::new);
        return PostResponse.from(post);
    }

    @Transactional
    public PostResponse create(PostCreateRequest request) {
        Post post = new Post();
        post.setName(request.name());
        post.setSlug(request.slug());
        post.setSummary(request.summary());
        post.setImageUrl(request.imageUrl());
        post.setContent(request.content());
        post.setBadge1(resolveBadge(request.badge1Id()));
        post.setBadge2(resolveBadge(request.badge2Id()));
        post.setBadge3(resolveBadge(request.badge3Id()));
        post.setVisible(request.visible() != null ? request.visible() : true);
        post.setFeatured(request.featured() != null ? request.featured() : false);
        post.setKanbanStatus(request.kanbanStatus() != null ? request.kanbanStatus() : KanbanStatus.BACKLOG);

        return PostResponse.from(postRepository.save(post));
    }

    @Transactional
    public PostResponse update(UUID id, PostUpdateRequest request) {
        Post post = findPostOrThrow(id);

        if (request.name() != null) {
            post.setName(request.name());
        }
        if (request.slug() != null) {
            post.setSlug(request.slug());
        }
        if (request.summary() != null) {
            post.setSummary(request.summary());
        }
        if (request.imageUrl() != null) {
            post.setImageUrl(request.imageUrl());
        }
        if (request.content() != null) {
            post.setContent(request.content());
        }
        if (request.badge1Id() != null) {
            post.setBadge1(resolveBadge(request.badge1Id()));
        }
        if (request.badge2Id() != null) {
            post.setBadge2(resolveBadge(request.badge2Id()));
        }
        if (request.badge3Id() != null) {
            post.setBadge3(resolveBadge(request.badge3Id()));
        }
        if (request.visible() != null) {
            post.setVisible(request.visible());
        }
        if (request.featured() != null) {
            post.setFeatured(request.featured());
        }
        if (request.kanbanStatus() != null) {
            post.setKanbanStatus(request.kanbanStatus());
        }

        return PostResponse.from(post);
    }

    @Transactional
    public PostResponse remove(UUID id) {
        Post post = findPostOrThrow(id);
        PostResponse response = PostResponse.from(post);
        postRepository.delete(post);
        return response;
    }

    private Post findPostOrThrow(UUID id) {
        return postRepository.findById(id).orElseThrow(NotFoundException::new);
    }

    private Badge resolveBadge(UUID badgeId) {
        if (badgeId == null) {
            return null;
        }
        return badgeRepository.findById(badgeId).orElseThrow(NotFoundException::new);
    }
}
