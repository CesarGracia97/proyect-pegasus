import {
  Injectable,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ZipService } from 'src/common/services/zip/zip.service';
import 'multer';

ffmpeg.setFfmpegPath(ffmpegStatic!);

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(private readonly zipService: ZipService) {}

  async convertVideoBatchToZip(
    files: Express.Multer.File[],
    targetType: 'mp4' | 'gif' | 'mp3',
  ): Promise<{ zipPath: string; cleanup: () => void }> {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pegasus-video-'));
    const convertedFiles: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const originalName = path.parse(file.originalname).name;
        const inputFilePath = path.join(
          tempDir,
          `input_${i}_${file.originalname}`,
        );
        const outputFilePath = path.join(
          tempDir,
          `${originalName}.${targetType}`,
        );

        fs.writeFileSync(inputFilePath, file.buffer);

        await this.processSingleVideo(
          inputFilePath,
          outputFilePath,
          targetType,
        );
        convertedFiles.push(outputFilePath);
      }

      const zipPath = path.join(tempDir, `convert_video_${targetType}.zip`);
      await this.zipService.createZipArchive(convertedFiles, zipPath);

      const cleanup = () => {
        setTimeout(() => {
          try {
            fs.rmSync(tempDir, {
              recursive: true,
              force: true,
              maxRetries: 10,
              retryDelay: 200,
            });
          } catch (err) {
            this.logger.error(
              `Error limpiando temporales de video: ${(err as Error).message}`,
            );
          }
        }, 500);
      };

      return { zipPath, cleanup };
    } catch (error) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      throw new InternalServerErrorException(
        `Error procesando lote de videos: ${(error as Error).message}`,
      );
    }
  }

  private processSingleVideo(
    inputPath: string,
    outputPath: string,
    targetType: 'mp4' | 'gif' | 'mp3',
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const command = ffmpeg(inputPath);

      switch (targetType) {
        case 'mp4':
          command
            .videoCodec('libx264')
            .audioCodec('aac')
            .outputOptions(['-preset ultrafast', '-crf 28']);
          break;

        case 'gif':
          command
            .duration(8)
            .fps(12)
            .size('480x?')
            .outputOptions(['-vf flags=lanczos']);
          break;

        case 'mp3':
          command.noVideo().audioCodec('libmp3lame').audioBitrate('192k');
          break;

        default:
          return reject(new BadRequestException('Formato no soportado'));
      }

      command
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }
}
