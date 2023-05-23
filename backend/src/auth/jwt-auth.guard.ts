import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    console.log("canActivate was called");
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);
    console.log(token);
    if (!token) {
      console.log('there is no token');
      throw new UnauthorizedException();
    }
    try {
      const payload = this.jwtService.verify(token, { secret: jwtConstants.secret });
      request['user'] = payload;
    } catch {
      console.log("Error during jwt authorization");
      throw new UnauthorizedException();
    }
    console.log("returning true");
    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    console.log("extracting token from cookie");
    return request.cookies['accessToken'];
  }
}


// import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
// import { AuthGuard } from '@nestjs/passport';

// @Injectable()
// export class JwtAuthGuard extends AuthGuard('jwt') {
//   canActivate(context: ExecutionContext) {
//     return super.canActivate(context);
//   }

//   handleRequest(err, user, info) {
//     if (err || !user) {
//       throw err || new UnauthorizedException();
//     }
//     return user;
//   }
// }
