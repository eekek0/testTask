import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReactionsService } from './reactions.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { GetUser } from '../../auth/get-user.decorator';
import { User } from '../../users/user.entity';

@ApiTags('Reactions')
@Controller('posts/:id')
@UseGuards(JwtAuthGuard)
export class ReactionsController {
  constructor(private readonly svc: ReactionsService) {}

  @ApiOperation({ summary: 'Поставить лайк' })
  @ApiBearerAuth()
  @Post('like')
  like(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.svc.like(id, user);
  }

  @ApiOperation({ summary: 'Убрать лайк' })
  @ApiBearerAuth()
  @Delete('like')
  unlike(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.svc.unlike(id, user);
  }

  @ApiOperation({ summary: 'Поставить дизлайк' })
  @ApiBearerAuth()
  @Post('dislike')
  dislike(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.svc.dislike(id, user);
  }

  @ApiOperation({ summary: 'Убрать дизлайк' })
  @ApiBearerAuth()
  @Delete('dislike')
  undislike(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
    return this.svc.undislike(id, user);
  }
}
