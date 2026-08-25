import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ZipService } from 'src/common/services/zip/zip.service';

ffmpeg.setFfmpegPath(ffmpegStatic!);

@Injectable()
export class AudioService {
  private readonly logger = new Logger(AudioService.name);

  constructor(private readonly zipService: ZipService) {}

  private convertSingleAudioToMp3(
    inputPath: string,
    outputPath: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .toFormat('mp3')
        .audioBitrate('320k')
        .audioChannels(2)
        .audioFrequency(44100)
        .outputOptions(['-q:a 0'])
        .on('end', () => resolve(outputPath))
        .on('error', (err) => reject(err))
        .save(outputPath);
    });
  }

  async convertAudioBatchToMp3Zip(
    files: Express.Multer.File[],
  ): Promise<{ zipPath: string; cleanup: () => void }> {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pegasus-audio-'));
    const convertedFiles: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const originalName = path.parse(file.originalname).name;
        const inputFilePath = path.join(
          tempDir,
          `input_${i}_${file.originalname}`,
        );
        const outputFilePath = path.join(tempDir, `${originalName}.mp3`);

        fs.writeFileSync(inputFilePath, file.buffer);
        await this.convertSingleAudioToMp3(inputFilePath, outputFilePath);
        convertedFiles.push(outputFilePath);
      }

      const zipPath = path.join(tempDir, 'convert_audio.zip');

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
              `Error al limpiar carpeta temporal: ${(err as Error).message}`,
            );
          }
        }, 500);
      };

      return { zipPath, cleanup };
    } catch (error) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      throw new InternalServerErrorException(
        `Error durante la conversión de audio: ${(error as Error).message}`,
      );
    }
  }
}
