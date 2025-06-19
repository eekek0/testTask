import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts/posts.controller';
import { PostsService } from './posts/posts.service';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Comment, User])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class BlogModule {}
