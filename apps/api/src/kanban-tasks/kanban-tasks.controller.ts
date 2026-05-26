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
import { KanbanTasksService } from './kanban-tasks.service';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { insertKanbanTaskSchema, updateKanbanTaskSchema } from '../db/schema/kanban-tasks';

const KanbanTaskSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string', example: 'Escrever post sobre Next.js 15' },
    description: { type: 'string', nullable: true, example: 'Cobrir os novos recursos de cache e server actions' },
    taskType: { type: 'string', enum: ['blog', 'project', 'custom'], example: 'blog' },
    color: { type: 'string', nullable: true, example: '#e11d48', description: 'Usado apenas quando taskType é "custom"' },
    kanbanStatus: { type: 'string', enum: ['backlog', 'todo', 'in-progress', 'done'], example: 'todo' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const InsertKanbanTaskSchema = {
  type: 'object',
  required: ['title'],
  properties: {
    title: { type: 'string', example: 'Escrever post sobre Next.js 15', maxLength: 255 },
    description: { type: 'string', nullable: true, example: 'Cobrir os novos recursos', maxLength: 1000 },
    taskType: {
      type: 'string',
      enum: ['blog', 'project', 'custom'],
      default: 'blog',
      description: '`blog` → azul (#3C71C8) | `project` → lilás (#4c1d95) | `custom` → cor livre via `color`',
    },
    color: {
      type: 'string',
      nullable: true,
      example: '#e11d48',
      description: 'Cor em hex. Usada apenas quando `taskType` é `custom`',
    },
    kanbanStatus: { type: 'string', enum: ['backlog', 'todo', 'in-progress', 'done'], default: 'backlog' },
  },
};

const UpdateKanbanTaskSchema = {
  type: 'object',
  description: 'Todos os campos são opcionais (PATCH parcial)',
  properties: InsertKanbanTaskSchema.properties,
};

@ApiTags('kanban-tasks')
@Controller('kanban-tasks')
export class KanbanTasksController {
  constructor(private readonly kanbanTasksService: KanbanTasksService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar tarefas do kanban',
    description: 'Retorna todas as tarefas standalone do kanban. Rota pública (dados não sensíveis).',
  })
  @ApiResponse({ status: 200, description: 'Lista de tarefas', schema: { type: 'array', items: KanbanTaskSchema } })
  findAll() {
    return this.kanbanTasksService.findAll();
  }

  @Post()
  @ApiBearerAuth('session')
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(insertKanbanTaskSchema))
  @ApiOperation({ summary: 'Criar tarefa', description: 'Cria uma nova tarefa no kanban. Requer autenticação.' })
  @ApiBody({ schema: InsertKanbanTaskSchema })
  @ApiResponse({ status: 201, description: 'Tarefa criada', schema: KanbanTaskSchema })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  create(@Body() body: unknown) {
    return this.kanbanTasksService.create(
      body as Parameters<KanbanTasksService['create']>[0],
    );
  }

  @Patch(':id')
  @ApiBearerAuth('session')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Atualizar tarefa', description: 'Atualiza parcialmente uma tarefa. Também usado para mover entre colunas via `kanbanStatus`. Requer autenticação.' })
  @ApiParam({ name: 'id', description: 'UUID da tarefa', format: 'uuid' })
  @ApiBody({ schema: UpdateKanbanTaskSchema })
  @ApiResponse({ status: 200, description: 'Tarefa atualizada', schema: KanbanTaskSchema })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async update(@Param('id') id: string, @Body() body: unknown) {
    const data = updateKanbanTaskSchema.parse(body);
    const result = await this.kanbanTasksService.update(id, data);
    if (!result.length) throw new NotFoundException();
    return result[0];
  }

  @Delete(':id')
  @ApiBearerAuth('session')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Excluir tarefa', description: 'Remove uma tarefa permanentemente. Requer autenticação.' })
  @ApiParam({ name: 'id', description: 'UUID da tarefa', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Tarefa removida', schema: KanbanTaskSchema })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Tarefa não encontrada' })
  async remove(@Param('id') id: string) {
    const result = await this.kanbanTasksService.remove(id);
    if (!result.length) throw new NotFoundException();
    return result[0];
  }
}
