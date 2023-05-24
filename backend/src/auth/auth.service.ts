import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Users } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: Users,
    private jwtService: JwtService
  ) {}

  async createToken(intra) {
    const payload = { username: intra };
    return await this.jwtService.signAsync(payload);
  }
}