import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: Partial<Repository<User>>;
  let jwtService: Partial<JwtService>;

  beforeEach(async () => {
    userRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('hashes password, creates и сохраняет пользователя', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPwd');
      const fakeUser = { username: 'alice', password: 'hashedPwd' } as User;
      (userRepo.create as jest.Mock).mockReturnValue(fakeUser);
      const savedUser = {
        id: 1,
        username: 'alice',
        password: 'hashedPwd',
      } as User;
      (userRepo.save as jest.Mock).mockResolvedValue(savedUser);

      const result = await service.register('alice', 'plainPwd');

      expect(bcrypt.hash).toHaveBeenCalledWith('plainPwd', 10);
      expect(userRepo.create).toHaveBeenCalledWith({
        username: 'alice',
        password: 'hashedPwd',
      });
      expect(userRepo.save).toHaveBeenCalledWith(fakeUser);
      expect(result).toBe(savedUser);
    });
  });

  describe('validateUser', () => {
    it('возвращает пользователя при верных данных', async () => {
      const found = { id: 2, username: 'bob', password: 'hashed' } as User;
      (userRepo.findOne as jest.Mock).mockResolvedValue(found);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('bob', 'pwd');

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where: { username: 'bob' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('pwd', 'hashed');
      expect(result).toBe(found);
    });

    it('возвращает null, если пользователь не найден', async () => {
      (userRepo.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.validateUser('nope', 'pwd');
      expect(result).toBeNull();
    });

    it('возвращает null, если пароль неверный', async () => {
      const found = { id: 3, username: 'carol', password: 'hashed' } as User;
      (userRepo.findOne as jest.Mock).mockResolvedValue(found);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser('carol', 'wrong');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('выдаёт JWT-токен', () => {
      const user = { id: 5, username: 'dan' } as User;
      (jwtService.sign as jest.Mock).mockReturnValue('the-token');

      const result = service.login(user);

      expect(jwtService.sign).toHaveBeenCalledWith({ username: 'dan', id: 5 });
      expect(result).toEqual({ token: 'the-token' });
    });
  });
});
