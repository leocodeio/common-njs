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
