package dev.brunogusmao.api.posts;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PostRepository extends JpaRepository<Post, UUID> {

    Optional<Post> findBySlug(String slug);

    /**
     * Equivalente a {@code .where(eq(posts.visible, true)).orderBy(desc(posts.featured), posts.createdAt)}
     * no Drizzle — usado por findAllPublic().
     */
    List<Post> findAllByVisibleTrueOrderByFeaturedDescCreatedAtAsc();

    /**
     * Equivalente a {@code .orderBy(desc(posts.featured), posts.createdAt)} sem filtro de
     * visibilidade — usado por findAll() (rota /all, admin).
     */
    List<Post> findAllByOrderByFeaturedDescCreatedAtAsc();
}
