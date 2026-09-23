import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { TodosService } from './todos.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { CurrentUser as CurrentUserType } from '../auth/current-user.decorator';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { insertTodoSchema, updateTodoSchema } from '../db/schema/todos';

const TodoSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    title: { type: 'string', example: 'Revisar textos do site' },
    description: { type: 'string', nullable: true, example: 'Conferir português do about' },
    done: { type: 'boolean', example: false },
    shared: { type: 'boolean', example: false, description: 'true = visível/editável pelos dois usuários' },
    ownerId: { type: 'string', description: 'Id de quem criou o todo' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const InsertTodoSchema = {
  type: 'object',
  required: ['title'],
  properties: {
    title: { type: 'string', example: 'Revisar textos do site', maxLength: 255 },
    description: { type: 'string', nullable: true, maxLength: 1000 },
    done: { type: 'boolean', default: false },
    shared: { type: 'boolean', default: false, description: 'true = cria na lista compartilhada' },
  },
};

const UpdateTodoSchema = {
  type: 'object',
  description: 'Todos os campos são opcionais (PATCH parcial)',
  properties: InsertTodoSchema.properties,
};

@ApiTags('todos')
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  @ApiBearerAuth('session')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Listar todos',
    description:
      'Retorna os todos privados do usuário autenticado + os todos compartilhados. Rota protegida — diferente da convenção de GETs públicos deste repo, pois o resultado depende de quem pergunta.',
  })
  @ApiResponse({ status: 200, description: 'Lista de todos', schema: { type: 'array', items: TodoSchema } })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  findAll(@CurrentUser() user: CurrentUserType) {
    return this.todosService.findAllForUser(user.id);
  }

  @Post()
  @ApiBearerAuth('session')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Criar todo', description: 'Cria um todo privado (padrão) ou compartilhado. Requer autenticação.' })
  @ApiBody({ schema: InsertTodoSchema })
  @ApiResponse({ status: 201, description: 'Todo criado', schema: TodoSchema })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  create(
    @Body(new ZodValidationPipe(insertTodoSchema)) body: Parameters<TodosService['create']>[0],
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.todosService.create(body, user.id);
  }

  @Patch(':id')
  @ApiBearerAuth('session')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Atualizar todo',
    description: 'Atualiza parcialmente um todo (título, descrição, concluído, compartilhado). Só o dono pode editar um todo privado; um todo compartilhado pode ser editado por qualquer usuário autenticado.',
  })
  @ApiParam({ name: 'id', description: 'UUID do todo', format: 'uuid' })
  @ApiBody({ schema: UpdateTodoSchema })
  @ApiResponse({ status: 200, description: 'Todo atualizado', schema: TodoSchema })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para editar este todo' })
  @ApiResponse({ status: 404, description: 'Todo não encontrado' })
  update(@Param('id') id: string, @Body() body: unknown, @CurrentUser() user: CurrentUserType) {
    const data = updateTodoSchema.parse(body);
    return this.todosService.update(id, data, user.id);
  }

  @Delete(':id')
  @ApiBearerAuth('session')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Excluir todo',
    description: 'Remove um todo permanentemente. Só o dono pode excluir um todo privado; um todo compartilhado pode ser excluído por qualquer usuário autenticado.',
  })
  @ApiParam({ name: 'id', description: 'UUID do todo', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Todo removido', schema: TodoSchema })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 403, description: 'Sem permissão para excluir este todo' })
  @ApiResponse({ status: 404, description: 'Todo não encontrado' })
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserType) {
    return this.todosService.remove(id, user.id);
  }
}
