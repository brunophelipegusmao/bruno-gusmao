package dev.brunogusmao.api.projects;

import dev.brunogusmao.api.badges.Badge;
import dev.brunogusmao.api.common.AuditableEntity;
import dev.brunogusmao.api.common.KanbanStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.util.UUID;

/**
 * Projeto exibido no portfólio (tabela {@code projects}). Badge1/2/3 são três slots
 * {@code @ManyToOne} opcionais separados — denormalização intencional, não uma tabela de
 * junção (ver docs/java-migration/03-projects.md e apps/api/src/db/schema/projects.ts).
 *
 * Fonte no Nest: apps/api/src/projects/*, apps/api/src/db/schema/projects.ts
 */
@Entity
@Table(name = "projects")
public class Project extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    @Column(name = "name", nullable = false, unique = true, length = 255)
    private String name;

    @Column(name = "slug", nullable = false, unique = true, length = 255)
    private String slug;

    @Column(name = "summary", nullable = false, length = 300)
    private String summary;

    @Column(name = "image", length = 2048)
    private String image;

    @Column(name = "project_url", length = 2048)
    private String projectUrl;

    @Column(name = "repo_url", length = 2048)
    private String repoUrl;

    @ManyToOne(optional = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "badge1_id")
    private Badge badge1;

    @ManyToOne(optional = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "badge2_id")
    private Badge badge2;

    @ManyToOne(optional = true, fetch = FetchType.LAZY)
    @JoinColumn(name = "badge3_id")
    private Badge badge3;

    @Column(name = "visible", nullable = false)
    private boolean visible = true;

    @Column(name = "featured", nullable = false)
    private boolean featured = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "kanban_status", nullable = false, length = 50)
    private KanbanStatus kanbanStatus = KanbanStatus.BACKLOG;

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

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getProjectUrl() {
        return projectUrl;
    }

    public void setProjectUrl(String projectUrl) {
        this.projectUrl = projectUrl;
    }

    public String getRepoUrl() {
        return repoUrl;
    }

    public void setRepoUrl(String repoUrl) {
        this.repoUrl = repoUrl;
    }

    public Badge getBadge1() {
        return badge1;
    }

    public void setBadge1(Badge badge1) {
        this.badge1 = badge1;
    }

    public Badge getBadge2() {
        return badge2;
    }

    public void setBadge2(Badge badge2) {
        this.badge2 = badge2;
    }

    public Badge getBadge3() {
        return badge3;
    }

    public void setBadge3(Badge badge3) {
        this.badge3 = badge3;
    }

    public boolean isVisible() {
        return visible;
    }

    public void setVisible(boolean visible) {
        this.visible = visible;
    }

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }

    public KanbanStatus getKanbanStatus() {
        return kanbanStatus;
    }

    public void setKanbanStatus(KanbanStatus kanbanStatus) {
        this.kanbanStatus = kanbanStatus;
    }
}
