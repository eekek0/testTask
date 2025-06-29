import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { Post } from '../entities/post.entity';
import { User } from '../../users/user.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private commentsRepo: Repository<Comment>,
    @InjectRepository(Post) private postsRepo: Repository<Post>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async add(
    postId: number,
    dto: CreateCommentDto,
    user: User,
  ): Promise<Comment> {
    const post = await this.postsRepo.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    const author = await this.usersRepo.findOne({ where: { id: user.id } });
    if (!author) throw new NotFoundException('User not found');
    const comment = this.commentsRepo.create({ ...dto, post, author });
    return this.commentsRepo.save(comment);
  }

  async findByPost(postId: number): Promise<Comment[]> {
    const post = await this.postsRepo.findOne({
      where: { id: postId },
      relations: ['comments', 'comments.author'],
    });
    if (!post) throw new NotFoundException('Post not found');
    return post.comments;
  }

  async update(
    id: number,
    dto: UpdateCommentDto,
    user: User,
  ): Promise<Comment> {
    const comment = await this.commentsRepo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author.id !== user.id)
      throw new ForbiddenException('Forbidden');
    Object.assign(comment, dto);
    return this.commentsRepo.save(comment);
  }

  async remove(id: number, user: User): Promise<void> {
    const comment = await this.commentsRepo.findOne({
      where: { id },
      relations: ['author'],
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.author.id !== user.id)
      throw new ForbiddenException('Forbidden');
    await this.commentsRepo.delete(id);
  }
}
