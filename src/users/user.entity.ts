import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Post } from '../blog/entities/post.entity';
import { Comment } from '../blog/entities/comment.entity';
import { Like } from '../blog/entities/like.entity';
import { Dislike } from '../blog/entities/dislike.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @OneToMany(() => Post, (post) => post.author)
  posts!: Post[];

  @OneToMany(() => Comment, (comment) => comment.author)
  comments!: Comment[];
  @OneToMany(() => Like, (like) => like.author, { cascade: true })
  likes!: Like[];

  @OneToMany(() => Dislike, (dislike) => dislike.author, { cascade: true })
  dislikes!: Dislike[];
}
