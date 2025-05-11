## how to use

```bash
git clone https://github.com/leocodeio/common-njs.git
cd common-njs
pnpm install
# install dependencies
pnpm add @nestjs/config @leocodeio-njs/njs-config helmet express-basic-auth joi class-validator class-transformer @leocodeio-njs/njs-logging @leocodeio-njs/njs-health @nestjs/typeorm typeorm
```

## things to add

- add configservice to app module

```typescript
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
```
