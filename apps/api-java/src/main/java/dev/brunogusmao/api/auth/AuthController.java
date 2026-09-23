package dev.brunogusmao.api.auth;

import dev.brunogusmao.api.auth.dto.MeResponse;
import dev.brunogusmao.api.common.exception.NotFoundException;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Equivalente a apps/api/src/auth/auth.controller.ts, mas só para os dois endpoints que não
 * são cobertos pelos handlers padrão do Spring (login/callback do Google já são automáticos
 * via spring-boot-starter-oauth2-client, sem controller próprio).
 */
@RestController
@RequestMapping("/api/auth")
@Tag(name = "auth")
public class AuthController {

    private final UserRepository userRepository;
    private final AppSecurityProperties properties;
    private final Environment environment;

    public AuthController(UserRepository userRepository, AppSecurityProperties properties, Environment environment) {
        this.userRepository = userRepository;
        this.properties = properties;
        this.environment = environment;
    }

    @GetMapping("/me")
    public MeResponse me(@CurrentUser CurrentUserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.id())
                .orElseThrow(NotFoundException::new);
        return MeResponse.from(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        boolean secure = environment.matchesProfiles("prod");
        ResponseCookie cookie = JwtCookieFactory.build(properties, secure, "", 0);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }
}
