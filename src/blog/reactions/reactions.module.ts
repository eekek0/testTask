import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReactionsService } from './reactions.service';
import { ReactionsController } from './reactions.controller';
import { Like } from '../entities/like.entity';
import { Dislike } from '../entities/dislike.entity';
import { Post } from '../entities/post.entity';
import { User } from '../../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Dislike, Post, User])],
  providers: [ReactionsService],
  controllers: [ReactionsController],
})
export class ReactionsModule {}
