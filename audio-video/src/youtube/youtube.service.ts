/* eslint-disable no-control-regex */
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import ytdl from '@distube/ytdl-core';
import { Response } from 'express';
import ffmpeg from 'fluent-ffmpeg';

@Injectable()
export class YoutubeService {
  async downloadMedia(url: string, format: 'mp3' | 'mp4', res: Response) {
    if (!ytdl.validateURL(url)) {
      throw new BadRequestException('URL de YouTube no válida');
    }

    try {
      const info = await ytdl.getInfo(url);
      const rawTitle = info.videoDetails.title || 'download';

      // 1. Título seguro en ASCII puro para compatibilidad básica
      const asciiTitle =
        rawTitle
          .replace(/[^\x00-\x7F]/g, '')
          .replace(/[^\w\s-]/gi, '')
          .trim() || 'download';
      // 2. Título codificado en UTF-8 para soportar emojis/acentos en navegadores modernos (RFC 5987)
      const encodedTitle = encodeURIComponent(rawTitle);

      if (format === 'mp3') {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${asciiTitle}.mp3"; filename*=UTF-8''${encodedTitle}.mp3`,
        );

        const audioStream = ytdl(url, { quality: 'highestaudio' });

        ffmpeg(audioStream)
          .toFormat('mp3')
          .audioBitrate(192)
          .on('error', (err) => {
            console.error('Error al procesar audio con FFmpeg:', err);
            if (!res.headersSent) {
              res.status(500).json({ message: 'Error procesando el audio' });
            }
          })
          .pipe(res, { end: true });
      } else {
        res.setHeader('Content-Type', 'video/mp4');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${asciiTitle}.mp4"; filename*=UTF-8''${encodedTitle}.mp4`,
        );

        ytdl(url, { quality: 'highestvideo', filter: 'audioandvideo' }).pipe(
          res,
        );
      }
    } catch (error) {
      console.error('Error en YoutubeService:', error);
      if (!res.headersSent) {
        throw new InternalServerErrorException(
          'Ocurrió un error al procesar el video de YouTube',
        );
      }
    }
  }
}
