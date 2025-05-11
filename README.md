## how to use

```bash
git clone https://github.com/leocodeio/common-njs.git
cd common-njs
pnpm install
# install dependencies
pnpm add @nestjs/config @leocodeio-njs/njs-config helmet express-basic-auth joi class-validator class-transformer @leocodeio-njs/njs-logging @leocodeio-njs/njs-health @nestjs/typeorm typeorm husky @commitlint/cli @commitlint/config-conventional @commitlint/cz-commitlint @semantic-release/commit-analyzer @semantic-release/github @semantic-release/npm @semantic-release/release-notes-generator @semantic-release/git husky semantic-release
```

## things to add

- add configservice to app module

app.module.ts

```typescript
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
```
main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { BootstrapConfig } from '@leocodeio-njs/njs-config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const bootstrapConfig = new BootstrapConfig();

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: configService.get('API_VERSION'),
    prefix: 'v',
  });

  bootstrapConfig.setupHelmet(app);
  // bootstrapConfig.setupCors(app);
  bootstrapConfig.setupSwagger(app);

  console.log('application running on port', configService.get('PORT'));
  await app.listen(configService.get('PORT') as number);
}
bootstrap();
```