import { Global, Module } from '@nestjs/common';
import { db } from './client';

export const DB = Symbol('DB');

@Global()
@Module({
  providers: [
    {
      provide: DB,
      useValue: db,
    },
  ],
  exports: [DB],
})
export class DbModule {}
