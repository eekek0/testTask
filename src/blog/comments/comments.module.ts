// src/blog/comments/comments.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { Comment } from '../entities/comment.entity';
import { Post } from '../entities/post.entity';
import { User } from '../../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Post, User])],
  providers: [CommentsService],
  controllers: [CommentsController],
})
export class CommentsModule {}
