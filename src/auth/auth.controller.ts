import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiBody({
    description: 'Данные для регистрации нового пользователя',
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'testuser' },
        password: { type: 'string', example: 'secret123' },
      },
      required: ['username', 'password'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован.',
  })
  @Post('register')
  async register(@Body() body: { username: string; password: string }) {
    const { username, password } = body;
    return this.authService.register(username, password);
  }

  @ApiOperation({ summary: 'Авторизация пользователя' })
  @ApiBody({
    description: 'Данные для авторизации',
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'testuser' },
        password: { type: 'string', example: 'secret123' },
      },
      required: ['username', 'password'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Пользователь успешно авторизован. Возвращается JWT токен.',
  })
  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const { username, password } = body;
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return this.authService.login(user);
  }
}
