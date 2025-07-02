import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Текст комментария',
    example: 'Отличный пост! Спасибо.',
    default: 'Отличный пост! Спасибо.',
  })
  @IsString()
  @Length(1, 500)
  text!: string;
}
