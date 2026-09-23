package dev.brunogusmao.api.badges;

import dev.brunogusmao.api.badges.dto.BadgeCreateRequest;
import dev.brunogusmao.api.badges.dto.BadgeResponse;
import dev.brunogusmao.api.badges.dto.BadgeUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

/**
 * CRUD de badges — módulo mais simples, fixa o padrão Controller/Service/Repository/DTO
 * dos demais módulos de recurso. GET é público (Next.js Server Components não enviam
 * cookies); POST/PATCH/DELETE exigem sessão. A autorização em si é decidida centralmente
 * em {@code dev.brunogusmao.api.config.SecurityConfig} — este controller não usa guards
 * nem sabe se a rota está protegida.
 *
 * Fonte no Nest: apps/api/src/badges/badges.controller.ts
 */
@RestController
@RequestMapping("/api/badges")
public class BadgeController {

    private final BadgeService badgeService;

    public BadgeController(BadgeService badgeService) {
        this.badgeService = badgeService;
    }

    @GetMapping
    public List<BadgeResponse> findAll() {
        return badgeService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BadgeResponse create(@Valid @RequestBody BadgeCreateRequest request) {
        return badgeService.create(request);
    }

    @PatchMapping("/{id}")
    public BadgeResponse update(@PathVariable UUID id, @Valid @RequestBody BadgeUpdateRequest request) {
        return badgeService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public BadgeResponse remove(@PathVariable UUID id) {
        return badgeService.remove(id);
    }
}
