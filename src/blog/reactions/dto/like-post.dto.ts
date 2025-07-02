import { IsInt, Min } from 'class-validator';

export class LikePostDto {
  @IsInt()
  @Min(1)
  postId!: number;
}
