package dev.brunogusmao.api.posts;

import dev.brunogusmao.api.posts.dto.PostCreateRequest;
import dev.brunogusmao.api.posts.dto.PostResponse;
import dev.brunogusmao.api.posts.dto.PostUpdateRequest;
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
 * Posts/artigos de blog. Autorização (GET/GET {slug} públicos, GET /all e
 * POST/PATCH/DELETE autenticados) é decidida centralmente em {@code SecurityConfig} —
 * este controller só implementa a lógica normal (ver docs/java-migration/04-posts.md).
 *
 * Fonte no Nest: apps/api/src/posts/posts.controller.ts
 */
@RestController
@RequestMapping("/api/posts")
@Tag(name = "posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    @Operation(summary = "Listar posts públicos", description = "Retorna apenas posts com visible=true, ordenados por featured DESC, createdAt. Rota pública.")
    public List<PostResponse> findAll() {
        return postService.findAllPublic();
    }

    @GetMapping("/all")
    @Operation(summary = "Listar todos os posts (admin)", description = "Retorna todos os posts independente de visibilidade. Requer autenticação.")
    public List<PostResponse> findAllAdmin() {
        return postService.findAll();
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Buscar post por slug", description = "Retorna um post público pelo seu slug único. Rota pública.")
    public PostResponse findBySlug(@PathVariable String slug) {
        return postService.findBySlug(slug);
    }

    @PostMapping
    @Operation(summary = "Criar post", description = "Cria um novo post/artigo. Conteúdo em Markdown. Requer autenticação.")
    public ResponseEntity<PostResponse> create(@Valid @RequestBody PostCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.create(request));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Atualizar post", description = "Atualiza parcialmente um post, por id. Requer autenticação.")
    public PostResponse update(@PathVariable UUID id, @Valid @RequestBody PostUpdateRequest request) {
        return postService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Excluir post", description = "Remove um post permanentemente. Requer autenticação.")
    public PostResponse remove(@PathVariable UUID id) {
        return postService.remove(id);
    }
}
