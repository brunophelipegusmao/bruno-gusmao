package dev.brunogusmao.api.auth.dto;

import dev.brunogusmao.api.auth.User;

import java.util.UUID;

public record MeResponse(UUID id, String name, String email) {

    public static MeResponse from(User user) {
        return new MeResponse(user.getId(), user.getName(), user.getEmail());
    }
}
