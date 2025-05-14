// nest-config.d.ts
declare module '@nestjs/config' {
  import { DynamicModule } from '@nestjs/common';

  export interface ConfigModuleOptions {
    isGlobal?: boolean;
    // add other options as needed
  }

  export class ConfigModule {
    static forRoot(options?: ConfigModuleOptions): DynamicModule;
  }
}
