package dev.brunogusmao.api.auth;

import dev.brunogusmao.api.common.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

/**
 * Equivalente à tabela {@code user} do BetterAuth (apps/api/src/db/schema/user.ts), mas sem
 * os campos internos da lib (emailVerified etc.) — aqui só o necessário para o resto da API.
 * {@code session}/{@code account}/{@code verification} não são portadas: são detalhe de
 * implementação do BetterAuth, sem sentido fora dele (ver docs/java-migration/01-auth.md).
 */
@Entity
@Table(name = "users")
public class User extends AuditableEntity {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "image_url")
    private String imageUrl;

    protected User() {
        // JPA
    }

    public User(String name, String email, String imageUrl) {
        this.name = name;
        this.email = email;
        this.imageUrl = imageUrl;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getImageUrl() {
        return imageUrl;
    }
}
