import {
  Controller,
  Get,
  Post as HttpPost,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Post as PostEntity } from '../entities/post.entity';
import { Comment } from '../entities/comment.entity';
import { GetUser } from '../../auth/get-user.decorator';
import { User } from '../../users/user.entity';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @ApiOperation({ summary: 'Получение списка всех постов' })
  @ApiResponse({
    status: 200,
    description: 'Список постов',
    type: [PostEntity],
  })
  @Get()
  async getAll(): Promise<PostEntity[]> {
    return this.postsService.findAll();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получение списка постов текущего пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Список постов текущего пользователя',
    type: [PostEntity],
  })
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyPosts(@GetUser() user: User): Promise<PostEntity[]> {
    return this.postsService.findByAuthor(user);
  }

  @ApiOperation({ summary: 'Получение поста по ID' })
  @ApiParam({ name: 'id', type: Number, description: 'ID поста', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Пост найден',
    type: PostEntity,
  })
  @ApiResponse({ status: 404, description: 'Пост не найден.' })
  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number): Promise<PostEntity> {
    return this.postsService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Создание нового поста (автоматическое указание автора)',
  })
  @ApiBody({
    description: 'Данные для создания поста',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Новый пост' },
        description: { type: 'string', example: 'Описание поста' },
      },
      required: ['title', 'description'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Пост успешно создан',
    type: PostEntity,
  })
  @UseGuards(JwtAuthGuard)
  @HttpPost()
  async create(
    @Body() body: { title: string; description: string },
    @GetUser() user: User,
  ): Promise<PostEntity> {
    return this.postsService.create(body, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновление поста (только своим автором)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID поста', example: 1 })
  @ApiBody({
    description: 'Данные для обновления поста',
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Обновлённый заголовок' },
        description: { type: 'string', example: 'Обновлённое описание' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Пост обновлён',
    type: PostEntity,
  })
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: { title?: string; description?: string },
    @GetUser() user: User,
  ): Promise<PostEntity> {
    return this.postsService.update(id, updateData, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удаление поста (только своим автором)' })
  @ApiParam({ name: 'id', type: Number, description: 'ID поста', example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Пост успешно удалён',
  })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<void> {
    return this.postsService.remove(id, user);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Добавление комментария к посту (автоматическое указание автора)',
  })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID поста, к которому добавляется комментарий',
    example: 1,
  })
  @ApiBody({
    description: 'Данные нового комментария',
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', example: 'Комментарий к посту' },
      },
      required: ['text'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Комментарий успешно добавлен',
    type: Comment,
  })
  @UseGuards(JwtAuthGuard)
  @HttpPost(':id/comments')
  async addComment(
    @Param('id', ParseIntPipe) postId: number,
    @Body() body: { text: string },
    @GetUser() user: User,
  ): Promise<Comment> {
    return this.postsService.addComment(postId, body.text, user);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Редактирование комментария (только своим автором)',
  })
  @ApiParam({
    name: 'commentId',
    type: Number,
    description: 'ID комментария для редактирования',
    example: 1,
  })
  @ApiBody({
    description: 'Новый текст комментария',
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string', example: 'Обновлённый комментарий' },
      },
      required: ['text'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Комментарий успешно обновлён',
    type: Comment,
  })
  @UseGuards(JwtAuthGuard)
  @Put('comments/:commentId')
  async updateComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @Body() body: { text: string },
    @GetUser() user: User,
  ): Promise<Comment> {
    return this.postsService.updateComment(commentId, body.text, user);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удаление комментария (только своим автором)' })
  @ApiParam({
    name: 'commentId',
    type: Number,
    description: 'ID комментария для удаления',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Комментарий успешно удалён',
  })
  @UseGuards(JwtAuthGuard)
  @Delete('comments/:commentId')
  async removeComment(
    @Param('commentId', ParseIntPipe) commentId: number,
    @GetUser() user: User,
  ): Promise<void> {
    return this.postsService.removeComment(commentId, user);
  }

  @ApiOperation({ summary: 'Получение комментариев поста' })
  @ApiParam({
    name: 'id',
    type: Number,
    description: 'ID поста для получения его комментариев',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Список комментариев',
    type: [Comment],
  })
  @Get(':id/comments')
  async getComments(
    @Param('id', ParseIntPipe) postId: number,
  ): Promise<Comment[]> {
    return this.postsService.getComments(postId);
  }
}
