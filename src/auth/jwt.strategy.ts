// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { ExtractJwt, Strategy, VerifiedCallback } from 'passport-jwt';
// import { ConfigService } from '@nestjs/config';
// import { UsersService } from '../service/users.service';
// import { User } from '../entity/user.entity';

// export interface JwtPayload {
//   sub: string;
//   email: string;
//   role: string;
//   iat?: number;
//   exp?: number;
// }

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     private configService: ConfigService,
//     private usersService: UsersService,
//   ) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       secretOrKey: configService.get<string>('JWT_SECRET')!,
//       ignoreExpiration: false,
//       passReqToCallback: false,
//       issuer: configService.get<string>('JWT_ISSUER') || 'ecommerce-api',
//       audience: configService.get<string>('JWT_AUDIENCE') || 'ecommerce-client',
//     });
//   }

//   async validate(payload: any) {
//     try {
//       const { sub: id } = payload;
//       const user = await this.usersService.findbyId(id);
      
//       if (!id) {
//         throw new UnauthorizedException('Invalid JWT payload');
//       }

       

//       if (!user) {
//         throw new UnauthorizedException('User not found');
//       }

//       if (user.isSuspended) {
//         throw new UnauthorizedException('Account suspended due to fraudulent behavior');
//       }

      
//       return user;
//   }
//   catch (error) {
//     throw new UnauthorizedException(error.message);
//   }
// }
// }
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../service/users.service';
import { User } from '../entity/user.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    
  
    if (!secret) {
      throw new Error(
        'JWT_SECRET is not defined. Please add JWT_SECRET to your .env file'
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      ignoreExpiration: false,
      passReqToCallback: false,
      issuer: configService.get<string>('JWT_ISSUER', 'ecommerce-api'),
      audience: configService.get<string>('JWT_AUDIENCE', 'ecommerce-client'),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    try {
      const { sub: id } = payload;

      
      if (!id) {
        throw new UnauthorizedException('Invalid JWT payload: missing user ID');
      }

      
      const user = await this.usersService.findbyId(id);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      
      if (user.isSuspended) {
        throw new UnauthorizedException(
          'Account suspended due to fraudulent behavior'
        );
      }

      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException(`Authentication failed: ${error.message}`);
    }
  }
}
