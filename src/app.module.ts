import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as path from 'path';
import { AuthModule } from './auth/auth.module';
import { BlogModule } from './blog/blog.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: +(process.env.DB_PORT || 5432),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || 'password',
      database: process.env.DB_NAME || 'blog_db',
      entities: [path.join(__dirname, '**', '*.entity.{js,ts}')],
      synchronize: true,
      dropSchema: true,
      logging: ['schema', 'error'],
    }),
    AuthModule,
    BlogModule,
  ],
})
export class AppModule {}
