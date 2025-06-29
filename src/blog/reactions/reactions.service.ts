import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from '../entities/like.entity';
import { Dislike } from '../entities/dislike.entity';
import { User } from '../../users/user.entity';
import { Post } from '../entities/post.entity';

@Injectable()
export class ReactionsService {
  constructor(
    @InjectRepository(Like) private likesRepo: Repository<Like>,
    @InjectRepository(Dislike) private dislikesRepo: Repository<Dislike>,
  ) {}

  async like(postId: number, user: User): Promise<void> {
    await this.toggle(postId, user.id, 'like');
  }

  async unlike(postId: number, user: User): Promise<void> {
    await this.likesRepo.delete({
      post: { id: postId },
      author: { id: user.id },
    });
  }

  async dislike(postId: number, user: User): Promise<void> {
    await this.toggle(postId, user.id, 'dislike');
  }

  async undislike(postId: number, user: User): Promise<void> {
    await this.dislikesRepo.delete({
      post: { id: postId },
      author: { id: user.id },
    });
  }

  private async toggle(
    postId: number,
    userId: number,
    type: 'like' | 'dislike',
  ) {
    if (type === 'like') {
      await this.dislikesRepo.delete({
        post: { id: postId },
        author: { id: userId },
      });
      const exists = await this.likesRepo.findOne({
        where: { post: { id: postId }, author: { id: userId } },
      });
      if (!exists) {
        await this.likesRepo.save(
          this.likesRepo.create({
            post: { id: postId } as Post,
            author: { id: userId } as User,
          }),
        );
      }
    } else {
      await this.likesRepo.delete({
        post: { id: postId },
        author: { id: userId },
      });
      const exists = await this.dislikesRepo.findOne({
        where: { post: { id: postId }, author: { id: userId } },
      });
      if (!exists) {
        await this.dislikesRepo.save(
          this.dislikesRepo.create({
            post: { id: postId } as Post,
            author: { id: userId } as User,
          }),
        );
      }
    }
  }
}
