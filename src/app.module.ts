 import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './module/auth.module';
import { UsersModule } from './module/users.module';
import { ProductsModule } from './module/products.module';
import { CartModule } from './module/cart.module';
import { OrdersModule } from './module/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: process.env.NODE_ENV === 'production', // Ignore .env in production (Railway uses env vars)
      validate: (config) => {
        // Validate required environment variables on startup
        const required = ['JWT_SECRET', 'DATABASE_URL'];
        const missing = required.filter(key => !config[key]);
        
        if (missing.length > 0) {
          throw new Error(
            `Missing required environment variables: ${missing.join(', ')}`
          );
        }
        
        return config;
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        const databaseUrl = configService.get<string>('DATABASE_URL');

        return {
          type: 'postgres',
          url: databaseUrl,
          autoLoadEntities: true,
          synchronize: !isProduction, // false in production, true in development
          logging: !isProduction, // Enable logging in development only
          ssl: isProduction ? {
            rejectUnauthorized: false, // Required for Supabase in production
          } : false,
        };
      },
    }),
    AuthModule,
    UsersModule,
    ProductsModule,
    CartModule,
    OrdersModule,
  ],
})
export class AppModule {}
