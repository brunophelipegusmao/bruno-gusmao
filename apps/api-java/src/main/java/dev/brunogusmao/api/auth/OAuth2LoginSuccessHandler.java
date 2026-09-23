package dev.brunogusmao.api.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.Locale;

/**
 * Equivalente ao passo final do fluxo do BetterAuth (gerar a sessão e devolver o cookie ao
 * browser). Aqui: gera o JWT próprio via {@link JwtService}, grava em cookie httpOnly e
 * redireciona pro painel — ver docs/java-migration/01-auth.md, passo 4 do fluxo de login.
 */
@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AppSecurityProperties properties;
    private final Environment environment;
    private final String webUrl;

    public OAuth2LoginSuccessHandler(UserRepository userRepository,
                                      JwtService jwtService,
                                      AppSecurityProperties properties,
                                      Environment environment,
                                      @Value("${app.web-url}") String webUrl) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.properties = properties;
        this.environment = environment;
        this.webUrl = webUrl;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                         Authentication authentication) throws IOException {
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String rawEmail = oauth2User.getAttribute("email");
        String email = rawEmail == null ? null : rawEmail.trim().toLowerCase(Locale.ROOT);

        // AllowedEmailsOAuth2UserService já validou a allowlist e fez o find-or-create antes
        // deste handler ser chamado — se o usuário não existir aqui, é inconsistência grave.
        User user = email == null ? null : userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            return;
        }

        String token = jwtService.generateToken(user);
        boolean secure = environment.matchesProfiles("prod");
        long maxAgeSeconds = Duration.ofDays(properties.getJwtExpirationDays()).toSeconds();

        ResponseCookie cookie = JwtCookieFactory.build(properties, secure, token, maxAgeSeconds);
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        response.sendRedirect(webUrl + "/ControlPanel");
    }
}
