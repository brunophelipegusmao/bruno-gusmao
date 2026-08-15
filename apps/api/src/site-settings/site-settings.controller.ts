import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { SiteSettingsService } from './site-settings.service';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { updateSiteSettingsSchema } from '../db/schema/site-settings';
import type { UpdateSiteSettings } from '../db/schema/site-settings';

const SiteSettingsSchema = {
  type: 'object',
  properties: {
    eventPopupEnabled: {
      type: 'boolean',
      example: false,
      description:
        'Se o popup de divulgação do evento (gameficacao.brunogusmao.dev) está ativo',
    },
    eventName: {
      type: 'string',
      example: 'Evento',
      description: 'Nome do evento exibido no botão do header e no popup',
    },
    eventDescription: {
      type: 'string',
      nullable: true,
      description: 'Texto de divulgação exibido no popup do evento',
    },
    eventImageUrl: {
      type: 'string',
      nullable: true,
      description: 'URL da imagem exibida no popup do evento',
    },
    eventBgColor: {
      type: 'string',
      example: '#1e293b',
      description: 'Cor de fundo do botão do header e de destaque do popup',
    },
    eventTextColor: {
      type: 'string',
      example: '#e2e8f0',
      description: 'Cor do texto do botão do header',
    },
  },
};

@ApiTags('site-settings')
@Controller('site-settings')
export class SiteSettingsController {
  constructor(private readonly siteSettingsService: SiteSettingsService) {}

  @Get()
  @ApiOperation({
    summary: 'Consultar configurações públicas do site',
    description:
      'Retorna as configurações de divulgação do evento (ativo, nome, textos, imagem e cores). Rota pública.',
  })
  @ApiResponse({
    status: 200,
    description: 'Configurações atuais',
    schema: SiteSettingsSchema,
  })
  async findOne() {
    const row = await this.siteSettingsService.getOrCreate();
    return {
      eventPopupEnabled: row.eventPopupEnabled,
      eventName: row.eventName,
      eventDescription: row.eventDescription,
      eventImageUrl: row.eventImageUrl,
      eventBgColor: row.eventBgColor,
      eventTextColor: row.eventTextColor,
    };
  }

  @Patch()
  @ApiBearerAuth('session')
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(updateSiteSettingsSchema))
  @ApiOperation({
    summary: 'Atualizar configurações do site',
    description:
      'Ativa/desativa o popup de divulgação do evento. Requer autenticação.',
  })
  @ApiBody({ schema: SiteSettingsSchema })
  @ApiResponse({
    status: 200,
    description: 'Configurações atualizadas',
    schema: SiteSettingsSchema,
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async update(@Body() body: UpdateSiteSettings) {
    const row = await this.siteSettingsService.update(body);
    return {
      eventPopupEnabled: row.eventPopupEnabled,
      eventName: row.eventName,
      eventDescription: row.eventDescription,
      eventImageUrl: row.eventImageUrl,
      eventBgColor: row.eventBgColor,
      eventTextColor: row.eventTextColor,
    };
  }
}
