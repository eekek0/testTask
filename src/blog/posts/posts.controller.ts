import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { GetUser } from '../../auth/get-user.decorator';
import { User } from '../../users/user.entity';
import { Post as PostEntity } from '../entities/post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterPostDto } from './dto/filter-post.dto';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: 'Список постов (или only popular)' })
  @ApiQuery({
    name: 'popular',
    type: Boolean,
    required: false,
    description: 'true — только posts, где likes>dislikes',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get()
  findAll(@Query() filter: FilterPostDto) {
    return this.postsService.findAll(filter);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Посты текущего пользователя' })
  @ApiResponse({ status: 200, type: [PostEntity] })
  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMy(@GetUser() user: User) {
    return this.postsService.findByAuthor(user);
  }

  @ApiOperation({ summary: 'Получить пост по ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, type: PostEntity })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать новый пост' })
  @ApiBody({ type: CreatePostDto })
  @ApiResponse({ status: 201, type: PostEntity })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreatePostDto, @GetUser() user: User) {
    return this.postsService.create(dto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить пост' })
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdatePostDto })
  @ApiResponse({ status: 200, type: PostEntity })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
    @GetUser() user: User,
  ) {
    return this.postsService.update(id, dto, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить пост' })
  @ApiParam({ name: 'id', type: Number })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.postsService.remove(id, user);
  }

  @Get('by-tag/:name')
  @ApiOperation({ summary: 'Посты по тегу' })
  @ApiParam({ name: 'name', description: 'Имя тега без #' })
  async findByTag(@Param('name') name: string): Promise<PostEntity[]> {
    return this.postsService.findAllByTag(name.toLowerCase());
  }
}
