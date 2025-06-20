import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { Comment } from '../entities/comment.entity';
import { User } from '../../users/user.entity';
import { Like } from '../entities/like.entity';
import { Dislike } from '../entities/dislike.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Like)
    private likeRepo: Repository<Like>,
    @InjectRepository(Dislike)
    private dislikeRepo: Repository<Dislike>,
  ) {}

  async create(
    postData: { title: string; description: string },
    user: User,
  ): Promise<Post> {
    const author = await this.userRepository.findOne({
      where: { id: user.id },
    });
    if (!author) {
      throw new NotFoundException('Автор не найден');
    }
    const post = this.postRepository.create({ ...postData, author });
    return await this.postRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postRepository.find({
      relations: ['comments', 'author'],
    });
  }

  async findByAuthor(user: User): Promise<Post[]> {
    return await this.postRepository.find({
      where: { author: { id: user.id } },
      relations: ['comments', 'author'],
    });
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['comments', 'author'],
    });
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  async update(
    id: number,
    updateData: Partial<Post>,
    user: User,
  ): Promise<Post> {
    const post = await this.findOne(id);
    const authorId = post.author?.id;
    if (authorId === undefined || authorId !== user.id) {
      throw new ForbiddenException('You are not allowed to update this post');
    }
    await this.postRepository.update(id, updateData);
    return await this.findOne(id);
  }

  async remove(id: number, user: User): Promise<void> {
    const post = await this.findOne(id);
    const authorId = post.author?.id;
    if (authorId === undefined || authorId !== user.id) {
      throw new ForbiddenException('You are not allowed to delete this post');
    }
    await this.postRepository.delete(id);
  }

  async addComment(postId: number, text: string, user: User): Promise<Comment> {
    const post = await this.findOne(postId);
    const author = await this.userRepository.findOne({
      where: { id: user.id },
    });
    if (!author) {
      throw new NotFoundException('Автор не найден');
    }
    const comment = this.commentRepository.create({ text, post, author });
    return await this.commentRepository.save(comment);
  }

  async getComments(postId: number): Promise<Comment[]> {
    const post = await this.findOne(postId);
    return post.comments;
  }

  async updateComment(
    commentId: number,
    newText: string,
    user: User,
  ): Promise<Comment> {
    const commentRaw: unknown = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['author'],
    });
    const comment = commentRaw as Comment | null;
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    const commentAuthor = comment.author as User | null;
    if (!commentAuthor || commentAuthor.id !== user.id) {
      throw new ForbiddenException(
        'You are not allowed to update this comment',
      );
    }
    comment.text = newText;
    const updatedRaw: unknown = await this.commentRepository.save(comment);
    return updatedRaw as Comment;
  }

  async removeComment(commentId: number, user: User): Promise<void> {
    const commentRaw: unknown = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['author'],
    });
    const comment = commentRaw as Comment | null;
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    const commentAuthor = comment.author as User | null;
    if (!commentAuthor || commentAuthor.id !== user.id) {
      throw new ForbiddenException(
        'You are not allowed to delete this comment',
      );
    }
    await this.commentRepository.delete(commentId);
  }

  async like(postId: number, user: User): Promise<void> {
    await this.dislikeRepo.delete({
      post: { id: postId },
      author: { id: user.id },
    });
    const exists = await this.likeRepo.findOne({
      where: { post: { id: postId }, author: { id: user.id } },
    });
    if (!exists) {
      const like = this.likeRepo.create({
        post: { id: postId } as Post,
        author: user,
      });
      await this.likeRepo.save(like);
    }
  }

  async unlike(postId: number, user: User): Promise<void> {
    await this.likeRepo.delete({
      post: { id: postId },
      author: { id: user.id },
    });
  }

  async dislike(postId: number, user: User): Promise<void> {
    await this.likeRepo.delete({
      post: { id: postId },
      author: { id: user.id },
    });
    const exists = await this.dislikeRepo.findOne({
      where: { post: { id: postId }, author: { id: user.id } },
    });
    if (!exists) {
      const dislike = this.dislikeRepo.create({
        post: { id: postId } as Post,
        author: user,
      });
      await this.dislikeRepo.save(dislike);
    }
  }

  async undislike(postId: number, user: User): Promise<void> {
    await this.dislikeRepo.delete({
      post: { id: postId },
      author: { id: user.id },
    });
  }
}
