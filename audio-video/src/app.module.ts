import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AudioModule } from './audio/audio.module';
import { VideoService } from './video/video.service';
import { VideoModule } from './video/video.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [AudioModule, VideoModule, CommonModule],
  controllers: [AppController],
  providers: [AppService, VideoService],
})
export class AppModule {}
