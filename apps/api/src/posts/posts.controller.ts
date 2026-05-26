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
import { PostsService } from './posts.service';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { insertPostSchema, updatePostSchema } from '../db/schema/posts';

const PostSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    name: { type: 'string', example: 'Meu Artigo' },
    slug: { type: 'string', example: 'meu-artigo' },
    summary: { type: 'string', example: 'Descrição curta do artigo' },
    imageUrl: { type: 'string', nullable: true, example: 'https://example.com/capa.png' },
    content: { type: 'string', example: '# Título\n\nConteúdo em **Markdown**...' },
    badge1Id: { type: 'string', format: 'uuid', nullable: true },
    badge2Id: { type: 'string', format: 'uuid', nullable: true },
    badge3Id: { type: 'string', format: 'uuid', nullable: true },
    visible: { type: 'boolean', example: true },
    kanbanStatus: { type: 'string', enum: ['backlog', 'todo', 'in-progress', 'done'], example: 'done' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

const InsertPostSchema = {
  type: 'object',
  required: ['name', 'slug', 'summary', 'content'],
  properties: {
    name: { type: 'string', example: 'Meu Artigo' },
    slug: { type: 'string', example: 'meu-artigo', description: 'Apenas letras minúsculas, números e hífens' },
    summary: { type: 'string', example: 'Descrição curta', maxLength: 300 },
    imageUrl: { type: 'string', nullable: true, example: 'https://example.com/capa.png' },
    content: { type: 'string', example: '# Título\n\nConteúdo em Markdown...' },
    badge1Id: { type: 'string', format: 'uuid', nullable: true },
    badge2Id: { type: 'string', format: 'uuid', nullable: true },
    badge3Id: { type: 'string', format: 'uuid', nullable: true },
    visible: { type: 'boolean', default: true },
    kanbanStatus: { type: 'string', enum: ['backlog', 'todo', 'in-progress', 'done'], default: 'backlog' },
  },
};

const UpdatePostSchema = {
  type: 'object',
  description: 'Todos os campos são opcionais (PATCH parcial)',
  properties: InsertPostSchema.properties,
};

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar posts públicos', description: 'Retorna apenas posts com `visible: true`. Rota pública.' })
  @ApiResponse({ status: 200, description: 'Lista de posts visíveis', schema: { type: 'array', items: PostSchema } })
  findAll() {
    return this.postsService.findAllPublic();
  }

  @Get('all')
  @ApiBearerAuth('session')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Listar todos os posts (admin)', description: 'Retorna todos os posts independente de visibilidade. Requer autenticação.' })
  @ApiResponse({ status: 200, description: 'Lista completa de posts', schema: { type: 'array', items: PostSchema } })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  findAllAdmin() {
    return this.postsService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Buscar post por slug', description: 'Retorna um post público pelo seu slug único. Rota pública.' })
  @ApiParam({ name: 'slug', description: 'Slug do post', example: 'meu-artigo' })
  @ApiResponse({ status: 200, description: 'Post encontrado', schema: PostSchema })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  async findOne(@Param('slug') slug: string) {
    const result = await this.postsService.findBySlug(slug);
    if (!result.length) throw new NotFoundException();
    return result[0];
  }

  @Post()
  @ApiBearerAuth('session')
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(insertPostSchema))
  @ApiOperation({ summary: 'Criar post', description: 'Cria um novo post/artigo. Conteúdo em Markdown. Requer autenticação.' })
  @ApiBody({ schema: InsertPostSchema })
  @ApiResponse({ status: 201, description: 'Post criado', schema: PostSchema })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  create(@Body() body: unknown) {
    return this.postsService.create(body as Parameters<PostsService['create']>[0]);
  }

  @Patch(':id')
  @ApiBearerAuth('session')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Atualizar post', description: 'Atualiza parcialmente um post. Requer autenticação.' })
  @ApiParam({ name: 'id', description: 'UUID do post', format: 'uuid' })
  @ApiBody({ schema: UpdatePostSchema })
  @ApiResponse({ status: 200, description: 'Post atualizado', schema: PostSchema })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  async update(@Param('id') id: string, @Body() body: unknown) {
    const data = updatePostSchema.parse(body);
    const result = await this.postsService.update(id, data);
    if (!result.length) throw new NotFoundException();
    return result[0];
  }

  @Delete(':id')
  @ApiBearerAuth('session')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Excluir post', description: 'Remove um post permanentemente. Requer autenticação.' })
  @ApiParam({ name: 'id', description: 'UUID do post', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Post removido', schema: PostSchema })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  @ApiResponse({ status: 404, description: 'Post não encontrado' })
  async remove(@Param('id') id: string) {
    const result = await this.postsService.remove(id);
    if (!result.length) throw new NotFoundException();
    return result[0];
  }
}
