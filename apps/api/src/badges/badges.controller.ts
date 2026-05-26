import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { BadgesService } from './badges.service';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { insertBadgeSchema, updateBadgeSchema } from '../db/schema/badges';

const BadgeSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid', example: 'a1b2c3d4-...' },
    name: { type: 'string', example: 'TypeScript' },
    slug: { type: 'string', example: 'typescript' },
    bgColor: { type: 'string', example: '#3178c6' },
    textColor: { type: 'string', example: '#ffffff' },
    createdAt: { type: 'string', format: 'date-time' },
  },
};

const InsertBadgeSchema = {
  type: 'object',
  required: ['name', 'slug'],
  properties: {
    name: { type: 'string', example: 'TypeScript' },
    slug: { type: 'string', example: 'typescript', description: 'Apenas letras minúsculas, números e hífens' },
    bgColor: { type: 'string', example: '#3178c6', description: 'Cor de fundo em hex (padrão: #1e293b)' },
    textColor: { type: 'string', example: '#ffffff', description: 'Cor do texto em hex (padrão: #e2e8f0)' },
  },
};

const UpdateBadgeSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', example: 'TypeScript' },
    slug: { type: 'string', example: 'typescript' },
    bgColor: { type: 'string', example: '#3178c6' },
    textColor: { type: 'string', example: '#ffffff' },
  },
};

@ApiTags('badges')
@Controller('badges')
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar badges', description: 'Retorna todas as badges cadastradas. Rota pública.' })
  @ApiResponse({ status: 200, description: 'Lista de badges', schema: { type: 'array', items: BadgeSchema } })
  findAll() {
    return this.badgesService.findAll();
  }

  @Post()
  @ApiBearerAuth('session')
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(insertBadgeSchema))
  @ApiOperation({ summary: 'Criar badge', description: 'Cria uma nova badge de tecnologia. Requer autenticação.' })
  @ApiBody({ schema: InsertBadgeSchema })
  @ApiResponse({ status: 201, description: 'Badge criada', schema: BadgeSchema })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  create(@Body() body: unknown) {
    return this.badgesService.create(body as Parameters<BadgesService['create']>[0]);
  }

  @Patch(':id')
  @ApiBearerAuth('session')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Atualizar badge', description: 'Atualiza parcialmente uma badge. Requer autenticação.' })
  @ApiParam({ name: 'id', description: 'UUID da badge', format: 'uuid' })
  @ApiBody({ schema: UpdateBadgeSchema })
  @ApiResponse({ status: 200, description: 'Badge atualizada', schema: BadgeSchema })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Badge não encontrada' })
  async update(@Param('id') id: string, @Body() body: unknown) {
    const data = updateBadgeSchema.parse(body);
    const result = await this.badgesService.update(id, data);
    if (!result.length) throw new NotFoundException();
    return result[0];
  }

  @Delete(':id')
  @ApiBearerAuth('session')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Excluir badge', description: 'Remove uma badge permanentemente. Requer autenticação.' })
  @ApiParam({ name: 'id', description: 'UUID da badge', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Badge removida', schema: BadgeSchema })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Badge não encontrada' })
  async remove(@Param('id') id: string) {
    const result = await this.badgesService.remove(id);
    if (!result.length) throw new NotFoundException();
    return result[0];
  }
}
