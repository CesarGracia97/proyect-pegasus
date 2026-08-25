import { Module } from '@nestjs/common';
import { AudioService } from './audio.service';
import { AudioController } from './audio.controller';

@Module({
  providers: [AudioService],
  controllers: [AudioController]
})
export class AudioModule {}
