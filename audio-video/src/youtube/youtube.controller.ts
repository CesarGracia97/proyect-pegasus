import { Controller, Post, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { YoutubeService } from './youtube.service';
import { DownloadYoutubeDto } from './dto/download-youtube.dto';

@Controller('youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  @Post('download')
  async download(@Body() dto: DownloadYoutubeDto, @Res() res: Response) {
    return this.youtubeService.downloadMedia(dto.url, dto.format, res);
  }
}
