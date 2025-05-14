import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { MysqlModule } from '../mysql/mysql.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [MysqlModule, UserModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
