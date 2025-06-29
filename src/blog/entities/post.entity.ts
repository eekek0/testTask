import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  RelationId,
  RelationCount,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { Comment } from './comment.entity';
import { User } from '../../users/user.entity';
import { Like } from './like.entity';
import { Dislike } from './dislike.entity';
import { Tag } from './tag.entity';

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

  @OneToMany(() => Like, (like) => like.post, { cascade: true })
  likes: Like[];

  @RelationCount((post: Post) => post.likes)
  @Expose()
  likesCount: number;

  @OneToMany(() => Dislike, (dislike) => dislike.post, { cascade: true })
  dislikes: Dislike[];

  @RelationCount((post: Post) => post.dislikes)
  @Expose()
  dislikesCount: number;

  @ManyToOne(() => User, (user) => user.posts)
  @Exclude()
  author: User;

  @RelationId((post: Post) => post.author)
  @Expose()
  authorId: number;

  @ManyToMany(() => Tag, (tag) => tag.posts, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  @JoinTable({
    name: 'post_tags',
    joinColumn: { name: 'postId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tagId', referencedColumnName: 'id' },
  })
  tags: Tag[];
}
