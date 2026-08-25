import {
  Controller,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
  Res,
  StreamableFile,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import * as fs from 'fs';
import { VideoService } from './video.service';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('convert')
  @UseInterceptors(FilesInterceptor('files', 10))
  async convertVideo(
    @UploadedFiles() files: Express.Multer.File[],
    @Query('target') target: 'mp4' | 'gif' | 'mp3',
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se enviaron archivos.');
    }

    const { zipPath, cleanup } = await this.videoService.convertVideoBatchToZip(
      files,
      target,
    );

    const fileStream = fs.createReadStream(zipPath);

    fileStream.on('end', () => cleanup());
    fileStream.on('error', () => cleanup());

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="videos_${target}.zip"`,
    });

    return new StreamableFile(fileStream);
  }
}
