import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { GetUser } from '../../auth/get-user.decorator';
import { User } from '../../users/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from '../entities/comment.entity';

@ApiTags('Comments')
@Controller()
export class CommentsController {
  constructor(private svc: CommentsService) {}

  @ApiBearerAuth()
  @ApiParam({ name: 'postId', type: Number })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 201, type: Comment })
  @UseGuards(JwtAuthGuard)
  @Post('posts/:postId/comments')
  add(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() dto: CreateCommentDto,
    @GetUser() user: User,
  ) {
    return this.svc.add(postId, dto, user);
  }

  @ApiParam({ name: 'postId', type: Number })
  @ApiResponse({ status: 200, type: [Comment] })
  @Get('posts/:postId/comments')
  findByPost(@Param('postId', ParseIntPipe) postId: number) {
    return this.svc.findByPost(postId);
  }

  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: UpdateCommentDto })
  @ApiResponse({ status: 200, type: Comment })
  @UseGuards(JwtAuthGuard)
  @Patch('comments/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
    @GetUser() user: User,
  ) {
    return this.svc.update(id, dto, user);
  }

  @ApiBearerAuth()
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200 })
  @UseGuards(JwtAuthGuard)
  @Delete('comments/:id')
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.svc.remove(id, user);
  }
}
