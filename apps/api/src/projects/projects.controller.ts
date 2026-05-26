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
import { ProjectsService } from './projects.service';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { insertProjectSchema, updateProjectSchema } from '../db/schema/projects';

const ProjectSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string', example: 'Meu Projeto' },
    slug: { type: 'string', example: 'meu-projeto' },
    summary: { type: 'string', example: 'Descrição curta do projeto' },
    image: { type: 'string', nullable: true, example: 'https://example.com/img.png' },
    projectUrl: { type: 'string', nullable: true, example: 'https://meu-projeto.com' },
    repoUrl: { type: 'string', nullable: true, example: 'https://github.com/user/repo' },
    badge1Id: { type: 'string', format: 'uuid', nullable: true },
    badge2Id: { type: 'string', format: 'uuid', nullable: true },
    badge3Id: { type: 'string', format: 'uuid', nullable: true },
    visible: { type: 'boolean', example: true, description: 'Se aparece nas rotas públicas' },
    kanbanStatus: { type: 'string', enum: ['backlog', 'todo', 'in-progress', 'done'], example: 'backlog' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const InsertProjectSchema = {
  type: 'object',
  required: ['name', 'slug', 'summary'],
  properties: {
    name: { type: 'string', example: 'Meu Projeto' },
    slug: { type: 'string', example: 'meu-projeto', description: 'Apenas letras minúsculas, números e hífens' },
    summary: { type: 'string', example: 'Descrição curta', maxLength: 300 },
    image: { type: 'string', nullable: true, example: 'https://example.com/img.png' },
    projectUrl: { type: 'string', nullable: true, example: 'https://meu-projeto.com' },
    repoUrl: { type: 'string', nullable: true, example: 'https://github.com/user/repo' },
    badge1Id: { type: 'string', format: 'uuid', nullable: true },
    badge2Id: { type: 'string', format: 'uuid', nullable: true },
    badge3Id: { type: 'string', format: 'uuid', nullable: true },
    visible: { type: 'boolean', default: true },
    kanbanStatus: { type: 'string', enum: ['backlog', 'todo', 'in-progress', 'done'], default: 'backlog' },
  },
};

const UpdateProjectSchema = {
  type: 'object',
  description: 'Todos os campos são opcionais (PATCH parcial)',
  properties: InsertProjectSchema.properties,
};

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar projetos públicos', description: 'Retorna apenas projetos com `visible: true`. Rota pública.' })
  @ApiResponse({ status: 200, description: 'Lista de projetos visíveis', schema: { type: 'array', items: ProjectSchema } })
  findAll() {
    return this.projectsService.findAllPublic();
  }

  @Get('all')
  @ApiBearerAuth('session')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Listar todos os projetos (admin)', description: 'Retorna todos os projetos independente de visibilidade. Requer autenticação.' })
  @ApiResponse({ status: 200, description: 'Lista completa de projetos', schema: { type: 'array', items: ProjectSchema } })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  findAllAdmin() {
    return this.projectsService.findAll();
  }

  @Post()
  @ApiBearerAuth('session')
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(insertProjectSchema))
  @ApiOperation({ summary: 'Criar projeto', description: 'Cadastra um novo projeto. Requer autenticação.' })
  @ApiBody({ schema: InsertProjectSchema })
  @ApiResponse({ status: 201, description: 'Projeto criado', schema: ProjectSchema })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  create(@Body() body: unknown) {
    return this.projectsService.create(body as Parameters<ProjectsService['create']>[0]);
  }

  @Patch(':id')
  @ApiBearerAuth('session')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Atualizar projeto', description: 'Atualiza parcialmente um projeto. Útil para alternar visibilidade ou status kanban. Requer autenticação.' })
  @ApiParam({ name: 'id', description: 'UUID do projeto', format: 'uuid' })
  @ApiBody({ schema: UpdateProjectSchema })
  @ApiResponse({ status: 200, description: 'Projeto atualizado', schema: ProjectSchema })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  async update(@Param('id') id: string, @Body() body: unknown) {
    const data = updateProjectSchema.parse(body);
    const result = await this.projectsService.update(id, data);
    if (!result.length) throw new NotFoundException();
    return result[0];
  }

  @Delete(':id')
  @ApiBearerAuth('session')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Excluir projeto', description: 'Remove um projeto permanentemente. Requer autenticação.' })
  @ApiParam({ name: 'id', description: 'UUID do projeto', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Projeto removido', schema: ProjectSchema })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado' })
  async remove(@Param('id') id: string) {
    const result = await this.projectsService.remove(id);
    if (!result.length) throw new NotFoundException();
    return result[0];
  }
}
