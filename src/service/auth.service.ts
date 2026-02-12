// import {
//   Injectable,
//   UnauthorizedException,
//   ConflictException,
// } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { UsersService } from '../service/users.service';
// import { RegisterDto } from '../dto/register.dto';
// import { LoginDto } from '../dto/login.dto';
// import * as bcrypt from 'bcrypt';

// @Injectable()
// export class AuthService {
//   constructor(
//     private usersService: UsersService,
//     private jwtService: JwtService,
//   ) {}

//   async register(registerDto: RegisterDto) {
//     const existingUser = await this.usersService.findbyEmail(registerDto.email);
//     if (existingUser) {
//       throw new ConflictException('Email already exists');
//     }

//     const hashedPassword = await bcrypt.hash(registerDto.password, 10);
//     const user = await this.usersService.create({
//       ...registerDto,
//       password: hashedPassword,
//     });

//     const token = this.generateToken(user);
//     return {
//       user: {
//         id: user.id,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         role: user.role,
//       },
//       token,
//     };
//   }

//   async login(loginDto: LoginDto) {
//     const user = await this.usersService.findbyEmail(loginDto.email);
//     if (!user) {
//       throw new UnauthorizedException('Invalid credentials');
//     }

//     const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
//     if (!isPasswordValid) {
//       throw new UnauthorizedException('Invalid credentials');
//     }

//     if (user.isSuspended) {
//       throw new UnauthorizedException('Account suspended due to fraudulent behavior');
//     }

//     const token = this.generateToken(user);
//     return {
//       user: {
//         id: user.id,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         role: user.role,
//       },
//       token,
//     };
//   }

//   private generateToken(user: any) {
//     const payload = { email: user.email, sub: user.id, role: user.role };
//     return this.jwtService.sign(payload);
//   }
// }
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../service/users.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { Role } from '../enum/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  
  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findbyEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      role: Role.CUSTOMER, 
    });

    const token = this.generateToken(user);
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    };
  }

  
  async registerAdmin(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findbyEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
      role: Role.ADMIN, 
    });

    const token = this.generateToken(user);
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    };
  }

  
  async login(loginDto: LoginDto) {
    const user = await this.usersService.findbyEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isSuspended) {
      throw new UnauthorizedException(
        'Account suspended due to fraudulent behavior',
      );
    }

    const token = this.generateToken(user);
    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    };
  }

  private generateToken(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return this.jwtService.sign(payload);
  }

   

}
