import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Res,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { AudioService } from './audio.service';
import * as path from 'path';

// Extensiones y MIME types autorizados en la whitelist
const ALLOWED_EXTENSIONS = ['.ogg', '.wav', '.m4a', '.aac', '.webm', '.flac'];
const ALLOWED_MIMES = [
  'audio/ogg',
  'audio/wav',
  'audio/x-wav',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
  'audio/aac',
  'audio/webm',
  'audio/flac',
  'audio/x-flac',
];

@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Post('convert-to-mp3')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      limits: {
        fileSize: 50 * 1024 * 1024, // Limite de 50 MB por archivo
      },
      fileFilter: (req, file, callback) => {
        const fileExt = path.extname(file.originalname).toLowerCase();
        const isValidExt = ALLOWED_EXTENSIONS.includes(fileExt);
        const isValidMime =
          ALLOWED_MIMES.includes(file.mimetype) ||
          file.mimetype.startsWith('audio/');

        if (!isValidExt && !isValidMime) {
          return callback(
            new BadRequestException(
              `El archivo "${file.originalname}" no pertenece a un formato soportado (${ALLOWED_EXTENSIONS.join(', ')}).`,
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  async convertAudioToMp3(
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException(
        'Debes enviar al menos un archivo de audio válido para convertir.',
      );
    }

    if (files.length > 10) {
      throw new BadRequestException(
        'Se permite un máximo de 10 archivos por petición.',
      );
    }

    const { zipPath, cleanup } =
      await this.audioService.convertAudioBatchToMp3Zip(files);

    res.download(zipPath, 'audios_mp3_convertidos.zip', (err) => {
      cleanup();
      if (err && !res.headersSent) {
        throw new BadRequestException(
          'Error al transmitir el archivo ZIP de respuesta.',
        );
      }
    });
  }
}
