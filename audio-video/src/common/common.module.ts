import { Module, Global } from '@nestjs/common';
import { ZipService } from './services/zip/zip.service';

@Global()
@Module({
  providers: [ZipService],
  exports: [ZipService],
})
export class CommonModule {}
