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
import { PostsService } from './posts.service';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { insertPostSchema, updatePostSchema } from '../db/schema/posts';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  findAll() {
    return this.postsService.findAllPublic();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('all')
  findAllAdmin() {
    return this.postsService.findAll();
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string) {
    const result = await this.postsService.findBySlug(slug);
    if (!result.length) throw new NotFoundException();
    return result[0];
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  @UsePipes(new ZodValidationPipe(insertPostSchema))
  create(@Body() body: unknown) {
    return this.postsService.create(body as Parameters<PostsService['create']>[0]);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: unknown) {
    const data = updatePostSchema.parse(body);
    const result = await this.postsService.update(id, data);
    if (!result.length) throw new NotFoundException();
    return result[0];
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.postsService.remove(id);
    if (!result.length) throw new NotFoundException();
    return result[0];
  }
}
