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
import { ProjectsService } from './projects.service';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { insertProjectSchema, updateProjectSchema } from '../db/schema/projects';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  findAll() {
    return this.projectsService.findAllPublic();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('all')
  findAllAdmin() {
    return this.projectsService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  @UsePipes(new ZodValidationPipe(insertProjectSchema))
  create(@Body() body: unknown) {
    return this.projectsService.create(body as Parameters<ProjectsService['create']>[0]);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: unknown) {
    const data = updateProjectSchema.parse(body);
    const result = await this.projectsService.update(id, data);
    if (!result.length) throw new NotFoundException();
    return result[0];
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.projectsService.remove(id);
    if (!result.length) throw new NotFoundException();
    return result[0];
  }
}
