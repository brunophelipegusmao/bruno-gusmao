package dev.brunogusmao.api.auth;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Locale;

/**
 * Equivalente ao hook {@code databaseHooks.user.create.before} de apps/api/src/auth/auth.ts:
 * depois que o {@link DefaultOAuth2UserService} padrão busca o perfil no Google, valida o
 * e-mail contra a allowlist ({@code app.security.allowed-emails}) e faz find-or-create do
 * {@link User}. Fora da allowlist → {@link OAuth2AuthenticationException} (login negado,
 * equivalente ao {@code throw new Error('Acesso negado.')} do Nest).
 *
 * Nota de implementação: o client registration do Google (application.yml) usa escopo
 * {@code email,profile} (sem {@code openid}) exatamente para manter este ponto de extensão
 * como OAuth2 "puro" — com {@code openid} no escopo, o Spring Security trocaria para o fluxo
 * OIDC e o ponto de extensão correto passaria a ser {@code OidcUserService}, não mais
 * {@link DefaultOAuth2UserService} (ver nota de divergência no relatório do módulo).
 */
@Service
public class AllowedEmailsOAuth2UserService extends DefaultOAuth2UserService {

    private final AppSecurityProperties properties;
    private final UserRepository userRepository;

    public AllowedEmailsOAuth2UserService(AppSecurityProperties properties, UserRepository userRepository) {
        this.properties = properties;
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);

        authorizeAndPersist(
                oauth2User.getAttribute("email"),
                oauth2User.getAttribute("name"),
                oauth2User.getAttribute("picture"));

        return oauth2User;
    }

    /**
     * Extraído de {@link #loadUser} para ser testável sem precisar simular a chamada HTTP ao
     * userinfo endpoint do Google — cobre a regra de negócio (allowlist + find-or-create)
     * isoladamente.
     */
    User authorizeAndPersist(String rawEmail, String name, String picture) {
        String email = normalize(rawEmail);

        if (email == null || !isAllowed(email)) {
            throw new OAuth2AuthenticationException(new OAuth2Error("access_denied", "Acesso negado.", null));
        }

        return userRepository.findByEmail(email)
                .orElseGet(() -> userRepository.save(new User(name != null ? name : email, email, picture)));
    }

    private boolean isAllowed(String normalizedEmail) {
        return properties.getAllowedEmails().stream()
                .filter(candidate -> candidate != null && !candidate.isBlank())
                .map(AllowedEmailsOAuth2UserService::normalize)
                .anyMatch(normalizedEmail::equals);
    }

    private static String normalize(String value) {
        return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
    }
}
