import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Post } from '../entities/post.entity';
import { User } from '../../users/user.entity';
import { Comment } from '../entities/comment.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { FilterPostDto } from './dto/filter-post.dto';
import { Dislike } from '../entities/dislike.entity';
import { Like } from '../entities/like.entity';
import { Tag } from '../entities/tag.entity';

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private postsRepo: Repository<Post>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Tag) private tagsRepo: Repository<Tag>,
  ) {}

  async create(dto: CreatePostDto, user: User): Promise<Post> {
    const author = await this.findUserOrFail(user.id);

    const tags = dto.tags?.map((name) => name.trim().toLowerCase()) || [];
    const tagEntities = await Promise.all(
      tags.map(async (name) => {
        let t = await this.tagsRepo.findOneBy({ name });
        if (!t) t = this.tagsRepo.create({ name });
        return t;
      }),
    );
    const post = this.postsRepo.create({
      title: dto.title,
      description: dto.description,
      author,
      tags: tagEntities,
    });
    return this.postsRepo.save(post);
  }

  async findAllByTag(name: string): Promise<Post[]> {
    return this.postsRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.tags', 'tag')
      .leftJoinAndSelect('post.author', 'author')
      .where('tag.name = :name', { name })
      .getMany();
  }

  async findAll(filter: FilterPostDto): Promise<Paginated<Post>> {
    const { page, limit } = filter;
    const qb = this.buildFilterQuery(filter)
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    items.forEach(
      (p) =>
        (p.comments = this.sanitizeComments(
          p.comments,
        ) as unknown as Comment[]),
    );

    return { items, total, page, limit };
  }

  async findByAuthor(user: User): Promise<Post[]> {
    const posts = await this.postsRepo.find({
      where: { author: { id: user.id } },
      relations: ['author', 'comments', 'comments.author', 'likes', 'dislikes'],
    });

    posts.forEach(
      (post) =>
        (post.comments = this.sanitizeComments(
          post.comments,
        ) as unknown as Comment[]),
    );

    return posts;
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postsRepo.findOne({
      where: { id },
      relations: ['author', 'comments', 'comments.author', 'likes', 'dislikes'],
    });
    if (!post) throw new NotFoundException(`Post ${id} not found`);

    post.comments = this.sanitizeComments(
      post.comments,
    ) as unknown as Comment[];
    return post;
  }

  async update(id: number, dto: UpdatePostDto, user: User): Promise<Post> {
    const post = await this.findOne(id);
    this.ensureOwner(post.author.id, user.id, 'update this post');
    Object.assign(post, dto);
    return this.postsRepo.save(post);
  }

  async remove(id: number, user: User): Promise<void> {
    const post = await this.findOne(id);
    this.ensureOwner(post.author.id, user.id, 'delete this post');
    await this.postsRepo.delete(id);
  }

  private buildFilterQuery(filter: FilterPostDto): SelectQueryBuilder<Post> {
    const qb = this.postsRepo
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndSelect('comments.author', 'commentAuthor')
      .loadRelationCountAndMap('post.likesCount', 'post.likes')
      .loadRelationCountAndMap('post.dislikesCount', 'post.dislikes');

    if (filter.popular) {
      qb.andWhere((qb) => {
        const likes = qb
          .subQuery()
          .select('COUNT(*)')
          .from(Like, 'l')
          .where('l.postId = post.id')
          .getQuery();
        const dislikes = qb
          .subQuery()
          .select('COUNT(*)')
          .from(Dislike, 'd')
          .where('d.postId = post.id')
          .getQuery();
        return `${likes} > ${dislikes}`;
      });
    }

    return qb;
  }
  private sanitizeComments(
    comments: Comment[],
  ): { id: number; text: string; authorId: number }[] {
    return comments.map((c) => ({
      id: c.id,
      text: c.text,
      authorId: c.author.id,
    }));
  }

  private async findUserOrFail(id: number): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private ensureOwner(
    ownerId: number,
    currentId: number,
    action: string,
  ): void {
    if (ownerId !== currentId) {
      throw new ForbiddenException(`You are not allowed to ${action}`);
    }
  }
}
