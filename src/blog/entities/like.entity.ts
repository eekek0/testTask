import { Entity, PrimaryGeneratedColumn, ManyToOne, Unique } from 'typeorm';
import { User } from '../../users/user.entity';
import { Post } from './post.entity';

@Entity()
@Unique(['post', 'author'])
export class Like {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE' })
  post!: Post;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  author!: User;
}
