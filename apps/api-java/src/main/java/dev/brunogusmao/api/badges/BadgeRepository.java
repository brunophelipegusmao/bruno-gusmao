package dev.brunogusmao.api.badges;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BadgeRepository extends JpaRepository<Badge, UUID> {

    /**
     * Equivalente a {@code db.select().from(badges).orderBy(badges.name)} no Drizzle —
     * findAll sem paginação, ordenado por name.
     */
    List<Badge> findAllByOrderByNameAsc();
}
