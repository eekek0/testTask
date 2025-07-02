import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  Length,
  IsOptional,
  ArrayNotEmpty,
  ArrayUnique,
} from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'Новый пост' })
  @IsString()
  @Length(3, 100)
  title!: string;

  @ApiProperty({ example: 'Описание поста' })
  @IsString()
  description!: string;

  @ApiPropertyOptional({
    description: 'Список тегов (без #) для поста',
    example: ['nestjs', 'typeorm'],
  })
  @IsOptional()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  tags?: string[];
}
