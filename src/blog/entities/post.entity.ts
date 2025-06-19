import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  RelationId,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { Comment } from './comment.entity';
import { User } from '../../users/user.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @OneToMany(() => Comment, (comment) => comment.post, { cascade: true })
  comments: Comment[];
  @ManyToOne(() => User, (user) => user.posts)
  @Exclude()
  author: User;

  @RelationId((post: Post) => post.author)
  @Expose()
  authorId: number;
}
