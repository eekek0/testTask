import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { Post } from '../entities/post.entity';
import { Comment } from '../entities/comment.entity';
import { Like } from '../entities/like.entity';
import { Dislike } from '../entities/dislike.entity';
import { UsersModule } from '../../users/users.module';
import { Tag } from '../entities/tag.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Comment, Like, Dislike, Tag]),
    UsersModule,
  ],
  providers: [PostsService],
  controllers: [PostsController],
})
export class PostsModule {}
