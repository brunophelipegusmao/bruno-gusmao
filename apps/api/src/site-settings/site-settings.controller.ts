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
      'Retorna se o popup de divulgação do evento está ativo. Rota pública.',
  })
  @ApiResponse({
    status: 200,
    description: 'Configurações atuais',
    schema: SiteSettingsSchema,
  })
  async findOne() {
    const row = await this.siteSettingsService.getOrCreate();
    return { eventPopupEnabled: row.eventPopupEnabled };
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
    return { eventPopupEnabled: row.eventPopupEnabled };
  }
}
