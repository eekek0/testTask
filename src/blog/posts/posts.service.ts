import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, Repository } from 'typeorm';
import { Post } from '../entities/post.entity';
import { Comment } from '../entities/comment.entity';
import { User } from '../../users/user.entity';
import { Like } from '../entities/like.entity';
import { Dislike } from '../entities/dislike.entity';
import { GetPostsFilterDto } from './dto/get-posts-filter.dto';
import { GetPostsByKeywordsDto } from './dto/get-posts-by-keywords.dto';
import { Keyword } from '../entities/keyword.entity';

export interface PaginatedPosts {
  data: Post[];
  total: number;
  page: number;
  limit: number;
}

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
    @InjectRepository(Keyword)
    private readonly keywordRepo: Repository<Keyword>,
  ) {}

  async create(
    postData: { title: string; description: string; keywords?: string[] },
    user: User,
  ): Promise<Post> {
    const author = await this.userRepository.findOne({
      where: { id: user.id },
    });
    if (!author) {
      throw new NotFoundException('Автор не найден');
    }

    let keywordsEntities: Keyword[] = [];
    if (postData.keywords?.length) {
      const names = Array.from(new Set(postData.keywords.map((s) => s.trim())));
      const existing = await this.keywordRepo.find({
        where: { name: In(names) },
      });
      const existingNames = existing.map((k) => k.name);
      const toCreate = names.filter((n) => !existingNames.includes(n));
      const newEntities = this.keywordRepo.create(
        toCreate.map((n) => ({ name: n })),
      );
      await this.keywordRepo.save(newEntities);
      keywordsEntities = [...existing, ...newEntities];
    }

    const post = this.postRepository.create({
      title: postData.title,
      description: postData.description,
      author,
      keywords: keywordsEntities,
    });
    return this.postRepository.save(post);
  }

  async findAll(filterDto: GetPostsFilterDto): Promise<PaginatedPosts> {
    const { search, page = 1 } = filterDto;
    const limit = 1;
    const skip = (page - 1) * limit;

    const where = search ? { title: ILike(`%${search}%`) } : {};

    const [data, total] = await this.postRepository.findAndCount({
      where,
      skip,
      take: limit,
      relations: ['author', 'comments'],
    });

    return { data, total, page, limit };
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

  async findAllWithFilter(
    filterDto: GetPostsFilterDto,
  ): Promise<PaginatedPosts> {
    const { search, page = 1 } = filterDto;
    const limit = 1;
    const skip = (page - 1) * limit;

    const where = search ? { title: ILike(`%${search}%`) } : {};

    const [data, total] = await this.postRepository.findAndCount({
      where,
      skip,
      take: limit,
      relations: ['author', 'comments'],
    });

    return { data, total, page, limit };
  }

  async findByKeywords(
    dto: GetPostsByKeywordsDto,
  ): Promise<{ data: Post[]; total: number; page: number; limit: number }> {
    const { keywords, page = 1 } = dto;
    const limit = 1;
    const skip = (page - 1) * limit;

    const tags = keywords
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (!tags.length) {
      throw new NotFoundException('Нет ключевых слов для поиска');
    }

    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.keywords', 'kw')
      .loadRelationCountAndMap('post.likesCount', 'post.likes')
      .loadRelationCountAndMap('post.dislikesCount', 'post.dislikes')
      .where('kw.name IN (:...tags)', { tags })
      .orderBy('post.id', 'DESC')
      .skip(skip)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }
}
