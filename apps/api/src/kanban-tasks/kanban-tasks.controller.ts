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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { KanbanTasksService } from './kanban-tasks.service';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { insertKanbanTaskSchema, updateKanbanTaskSchema } from '../db/schema/kanban-tasks';

@ApiTags('kanban-tasks')
@Controller('kanban-tasks')
export class KanbanTasksController {
  constructor(private readonly kanbanTasksService: KanbanTasksService) {}

  @Get()
  findAll() {
    return this.kanbanTasksService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  @UsePipes(new ZodValidationPipe(insertKanbanTaskSchema))
  create(@Body() body: unknown) {
    return this.kanbanTasksService.create(
      body as Parameters<KanbanTasksService['create']>[0],
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: unknown) {
    const data = updateKanbanTaskSchema.parse(body);
    const result = await this.kanbanTasksService.update(id, data);
    if (!result.length) throw new NotFoundException();
    return result[0];
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.kanbanTasksService.remove(id);
    if (!result.length) throw new NotFoundException();
    return result[0];
  }
}
