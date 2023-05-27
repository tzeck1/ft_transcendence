import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService, private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // console.log("canActivate was called");
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromCookie(request);
    if (!token) {
      console.log('there is no token');
      throw new UnauthorizedException();
    }
    const { exp } = this.jwtService.decode(token) as {
      exp: number;
    };
    const { username } = this.jwtService.decode(token) as {
      username: string;
    };
    if (Date.now() >= (exp * 1000)) {
        console.log('token expired, creating new one');
        const refreshedToken = await this.authService.createToken(username);
        if (refreshedToken) {
          this.updateTokenInCookie(request, refreshedToken);
          request['user'] = this.jwtService.verify(refreshedToken, { secret: jwtConstants.secret });
          return true;
        } else {
          throw new UnauthorizedException();
        }
    }
    try {
      const payload = this.jwtService.verify(token, { secret: jwtConstants.secret });
      request['user'] = payload;
    } catch {
      console.log("Error during jwt authorization");
      throw new UnauthorizedException();
    }
    // console.log("returning true");
    return true;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    // console.log("extracting token from cookie");
    return request.cookies['accessToken'];
  }

  private updateTokenInCookie(request: Request, token: string): void {
    // Update the token in the client's cookie
    request.res.cookie('accessToken', token, { httpOnly: true });
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
