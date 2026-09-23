package dev.brunogusmao.api.sitesettings;

import dev.brunogusmao.api.sitesettings.dto.SiteSettingsResponse;
import dev.brunogusmao.api.sitesettings.dto.SiteSettingsUpdateRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Diferente de todos os outros módulos de recurso: é um singleton, então o {@code PATCH}
 * não leva {@code {id}} na URL. Autorização (GET público / PATCH autenticado) é decidida
 * centralmente em {@code SecurityConfig} — este controller não usa nenhuma anotação de guard.
 */
@RestController
@RequestMapping("/api/site-settings")
@Tag(name = "site-settings")
public class SiteSettingsController {

    private final SiteSettingsService siteSettingsService;

    public SiteSettingsController(SiteSettingsService siteSettingsService) {
        this.siteSettingsService = siteSettingsService;
    }

    @GetMapping
    @Operation(
            summary = "Consultar configurações públicas do site",
            description = "Retorna as configurações de divulgação do evento (ativo, nome, textos, "
                    + "imagem e cores), criando a linha singleton com defaults se ainda não existir. Rota pública."
    )
    public SiteSettingsResponse findOne() {
        return SiteSettingsResponse.from(siteSettingsService.getOrCreate());
    }

    @PatchMapping
    @Operation(
            summary = "Atualizar configurações do site",
            description = "Ativa/desativa o popup de divulgação do evento e demais campos. Requer autenticação."
    )
    public SiteSettingsResponse update(@Valid @RequestBody SiteSettingsUpdateRequest request) {
        return SiteSettingsResponse.from(siteSettingsService.update(request));
    }
}
