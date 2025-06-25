import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
} from 'class-validator';

export class CreatePostDto {
  @ApiProperty({ example: 'Мой заголовок' })
  @IsString() @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Текст поста' })
  @IsString() @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: ['nestjs', 'typeorm'],
    description: 'Ключевые слова (теги)',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  keywords?: string[];
}