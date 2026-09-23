package dev.brunogusmao.api.common;

import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

/**
 * Superclasse para entidades com createdAt + updatedAt (a maioria). Substitui o
 * {@code updatedAt: new Date()} manual espalhado nos services do Nest — ver
 * {@link dev.brunogusmao.api.config.JpaAuditingConfig}.
 *
 * Para entidades que só têm createdAt (ex.: Badge), usar {@link CreatedAtOnlyEntity}.
 */
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class AuditableEntity {

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
