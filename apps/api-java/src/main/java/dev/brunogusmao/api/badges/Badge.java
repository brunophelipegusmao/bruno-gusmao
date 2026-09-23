package dev.brunogusmao.api.badges;

import dev.brunogusmao.api.common.CreatedAtOnlyEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

/**
 * Badge de tecnologia (ex.: "TypeScript", "Docker") usada em projects/posts (até 3 por
 * item, via badge1Id/badge2Id/badge3Id — denormalização intencional, ver Nest). Só tem
 * createdAt (sem updatedAt), por isso estende {@link CreatedAtOnlyEntity}.
 *
 * Fonte no Nest: apps/api/src/db/schema/badges.ts
 */
@Entity
@Table(name = "badges")
public class Badge extends CreatedAtOnlyEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "slug", nullable = false, unique = true, length = 100)
    private String slug;

    @Column(name = "bg_color", nullable = false, length = 50)
    private String bgColor;

    @Column(name = "text_color", nullable = false, length = 50)
    private String textColor;

    protected Badge() {
        // exigido pelo JPA
    }

    public Badge(String name, String slug, String bgColor, String textColor) {
        this.name = name;
        this.slug = slug;
        this.bgColor = bgColor;
        this.textColor = textColor;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getBgColor() {
        return bgColor;
    }

    public void setBgColor(String bgColor) {
        this.bgColor = bgColor;
    }

    public String getTextColor() {
        return textColor;
    }

    public void setTextColor(String textColor) {
        this.textColor = textColor;
    }
}
