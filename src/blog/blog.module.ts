import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { ReactionsModule } from './reactions/reactions.module';
import { Post } from './entities/post.entity';
import { Comment } from './entities/comment.entity';
import { Like } from './entities/like.entity';
import { Dislike } from './entities/dislike.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, Comment, Like, Dislike]),
    PostsModule,
    CommentsModule,
    ReactionsModule,
  ],
})
export class BlogModule {}
