package dev.brunogusmao.api.badges;

import dev.brunogusmao.api.badges.dto.BadgeCreateRequest;
import dev.brunogusmao.api.badges.dto.BadgeResponse;
import dev.brunogusmao.api.badges.dto.BadgeUpdateRequest;
import dev.brunogusmao.api.common.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Fonte no Nest: apps/api/src/badges/badges.service.ts — módulo de referência, CRUD puro
 * sem regras de negócio extras (sem ownership, sem filtros, sem singleton).
 */
@Service
@Transactional(readOnly = true)
public class BadgeService {

    private static final String DEFAULT_BG_COLOR = "#1e293b";
    private static final String DEFAULT_TEXT_COLOR = "#e2e8f0";

    private final BadgeRepository badgeRepository;

    public BadgeService(BadgeRepository badgeRepository) {
        this.badgeRepository = badgeRepository;
    }

    public List<BadgeResponse> findAll() {
        return badgeRepository.findAllByOrderByNameAsc().stream()
                .map(BadgeResponse::from)
                .toList();
    }

    @Transactional
    public BadgeResponse create(BadgeCreateRequest request) {
        String bgColor = request.bgColor() != null ? request.bgColor() : DEFAULT_BG_COLOR;
        String textColor = request.textColor() != null ? request.textColor() : DEFAULT_TEXT_COLOR;

        Badge badge = new Badge(request.name(), request.slug(), bgColor, textColor);
        return BadgeResponse.from(badgeRepository.save(badge));
    }

    @Transactional
    public BadgeResponse update(UUID id, BadgeUpdateRequest request) {
        Badge badge = findBadgeOrThrow(id);

        if (request.name() != null) {
            badge.setName(request.name());
        }
        if (request.slug() != null) {
            badge.setSlug(request.slug());
        }
        if (request.bgColor() != null) {
            badge.setBgColor(request.bgColor());
        }
        if (request.textColor() != null) {
            badge.setTextColor(request.textColor());
        }

        return BadgeResponse.from(badge);
    }

    @Transactional
    public BadgeResponse remove(UUID id) {
        Badge badge = findBadgeOrThrow(id);
        BadgeResponse response = BadgeResponse.from(badge);
        badgeRepository.delete(badge);
        return response;
    }

    private Badge findBadgeOrThrow(UUID id) {
        return badgeRepository.findById(id).orElseThrow(NotFoundException::new);
    }
}
