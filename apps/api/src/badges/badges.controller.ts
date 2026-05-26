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
import { BadgesService } from './badges.service';
import { AuthGuard } from '../auth/auth.guard';
import { ZodValidationPipe } from '../common/zod-validation.pipe';
import { insertBadgeSchema, updateBadgeSchema } from '../db/schema/badges';

@ApiTags('badges')
@Controller('badges')
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get()
  findAll() {
    return this.badgesService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  @UsePipes(new ZodValidationPipe(insertBadgeSchema))
  create(@Body() body: unknown) {
    return this.badgesService.create(body as Parameters<BadgesService['create']>[0]);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: unknown) {
    const data = updateBadgeSchema.parse(body);
    const result = await this.badgesService.update(id, data);
    if (!result.length) throw new NotFoundException();
    return result[0];
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.badgesService.remove(id);
    if (!result.length) throw new NotFoundException();
    return result[0];
  }
}
