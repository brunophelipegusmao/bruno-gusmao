package dev.brunogusmao.api.auth;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.security.oauth2.jwt.BadJwtException;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

/**
 * Emissão e verificação do JWT próprio (HS256, via Nimbus) — papel equivalente ao token de
 * sessão que o BetterAuth emite hoje. A emissão acontece em {@link OAuth2LoginSuccessHandler}
 * logo após o login Google; a verificação nas requisições autenticadas normalmente acontece
 * via o bean {@code JwtDecoder} (Spring Security Resource Server, ver
 * {@code SecurityConfig#jwtDecoder}) — o método {@link #verify(String)} aqui existe como
 * utilitário reaproveitável por código que não passa pela filter chain do Spring Security,
 * como o handshake do WebSocket de Todos (módulo futuro, que depende deste).
 */
@Service
public class JwtService {

    private final AppSecurityProperties properties;

    public JwtService(AppSecurityProperties properties) {
        this.properties = properties;
    }

    public String generateToken(User user) {
        try {
            Instant now = Instant.now();
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .subject(user.getId().toString())
                    .claim("email", user.getEmail())
                    .claim("name", user.getName())
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(now.plus(properties.getJwtExpirationDays(), ChronoUnit.DAYS)))
                    .build();

            SignedJWT signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
            signedJWT.sign(new MACSigner(secretKeyBytes()));
            return signedJWT.serialize();
        } catch (JOSEException e) {
            throw new IllegalStateException("Falha ao assinar o JWT", e);
        }
    }

    public JWTClaimsSet verify(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            if (!signedJWT.verify(new MACVerifier(secretKeyBytes()))) {
                throw new BadJwtException("Assinatura do JWT inválida");
            }

            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();
            Date expiration = claims.getExpirationTime();
            if (expiration != null && expiration.before(new Date())) {
                throw new BadJwtException("JWT expirado");
            }

            return claims;
        } catch (ParseException | JOSEException e) {
            throw new BadJwtException("JWT inválido", e);
        }
    }

    private byte[] secretKeyBytes() {
        return properties.getJwtSecret().getBytes(StandardCharsets.UTF_8);
    }
}
