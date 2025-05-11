import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {
  LogEntry,
  LoggingInterceptor,
  LoggingModule,
  PerformanceInterceptor,
  ResponseInterceptor,
} from '@leocodeio-njs/njs-logging';
import { HealthModule, PrometheusService } from '@leocodeio-njs/njs-health';
import { AppConfigModule } from '@leocodeio-njs/njs-config';
import { AppConfigService } from '@leocodeio-njs/njs-config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggingModule.forRoot({
      entities: [LogEntry],
      winston: {
        console: true,
        file: {
          enabled: true,
        },
      },
    }),
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (configService: AppConfigService) => ({
        ...configService.databaseConfig,
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/**/*{.ts,.js}'],
        migrationsRun: true,
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    TypeOrmModule.forFeature([LogEntry]),
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrometheusService,
    {
      provide: 'APP_INTERCEPTOR',
      useClass: PerformanceInterceptor,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: ResponseInterceptor,
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
