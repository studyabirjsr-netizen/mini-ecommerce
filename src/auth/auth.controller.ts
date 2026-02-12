// import { Controller, Post, Body, ValidationPipe } from '@nestjs/common';
// import { AuthService } from '../service/auth.service';
// import { RegisterDto } from '../dto/register.dto';
// import { LoginDto } from '../dto/login.dto';

// @Controller('auth')
// export class AuthController {
//   constructor(private authService: AuthService) {}

//   @Post('register')
//   async register(@Body(ValidationPipe) registerDto: RegisterDto) {
//     return this.authService.register(registerDto);
//   }

//   @Post('login')
//   async login(@Body(ValidationPipe) loginDto: LoginDto) {
//     return this.authService.login(loginDto);
//   }
// }
 import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../enum/role.enum';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  
  @Post('register')
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

   

  
  @Post('admin-register')
 @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async registerAdmin(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.registerAdmin(registerDto);
  }


  
  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

}
