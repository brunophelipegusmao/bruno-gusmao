package dev.brunogusmao.api.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI apiInfo() {
        return new OpenAPI()
                .info(new Info()
                        .title("Bruno Gusmão — API (Java)")
                        .description("""
                                Porta de aprendizado em Spring Boot da API do portfólio pessoal,
                                espelhando apps/api (NestJS). Autenticação via Google OAuth2 +
                                JWT próprio entregue em cookie httpOnly (ver /docs/java-migration/01-auth.md).
                                """)
                        .version("0.1.0"))
                .components(new Components()
                        .addSecuritySchemes("cookieAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.COOKIE)
                                .name("access_token")
                                .description("JWT emitido após login Google, entregue como cookie httpOnly")));
    }
}
