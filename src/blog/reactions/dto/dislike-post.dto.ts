import { IsInt, Min } from 'class-validator';

export class DislikePostDto {
  @IsInt()
  @Min(1)
  postId: number;
}
