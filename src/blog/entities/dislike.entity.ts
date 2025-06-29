import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { User } from '../../users/user.entity';
import { Post } from './post.entity';

@Entity()
@Unique(['post', 'author'])
export class Dislike {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Post, (post) => post.dislikes, { onDelete: 'CASCADE' })
  post: Post;

  @ManyToOne(() => User, (user) => user.dislikes, { onDelete: 'CASCADE' })
  author: User;
}
