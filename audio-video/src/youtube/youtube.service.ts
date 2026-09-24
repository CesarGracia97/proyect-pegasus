/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable no-control-regex */
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

@Injectable()
export class YoutubeService {
  /**
   * Detecta dinámicamente qué binarios utilizar según el Sistema Operativo.
   */
  private getExecutablePaths() {
    const isWindows = process.platform === 'win32';
    const localYtDlp = path.join(process.cwd(), 'yt-dlp.exe');
    const localFfmpeg = path.join(process.cwd(), 'ffmpeg.exe');

    // En Windows usa los .exe locales si existen; en Linux/Termux usa los comandos globales instalados en el sistema
    const ytDlpPath =
      isWindows && fs.existsSync(localYtDlp) ? localYtDlp : 'yt-dlp';
    const ffmpegDir =
      isWindows && fs.existsSync(localFfmpeg) ? process.cwd() : undefined;

    return { ytDlpPath, ffmpegDir };
  }

  async downloadMedia(url: string, format: 'mp3' | 'mp4', res: Response) {
    if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
      throw new BadRequestException('URL de YouTube no válida');
    }

    const { ytDlpPath, ffmpegDir } = this.getExecutablePaths();

    // 1. Obtener el título del video
    const titleProcess = spawn(ytDlpPath, ['--get-title', url]);
    let title = 'download';

    titleProcess.stdout.on('data', (data) => {
      title = data.toString().trim();
    });

    titleProcess.on('close', (code) => {
      if (code !== 0) {
        if (!res.headersSent) {
          throw new InternalServerErrorException(
            'Error al obtener información del video',
          );
        }
        return;
      }

      const asciiTitle =
        title
          .replace(/[^\x00-\x7F]/g, '')
          .replace(/[^\w\s-]/gi, '')
          .trim() || 'download';
      const encodedTitle = encodeURIComponent(title);

      if (format === 'mp3') {
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${asciiTitle}.mp3"; filename*=UTF-8''${encodedTitle}.mp3`,
        );

        const ytArgs = [
          '-o',
          '-',
          '-f',
          'ba/b',
          '--extract-audio',
          '--audio-format',
          'mp3',
          '--audio-quality',
          '192K',
        ];

        if (ffmpegDir) {
          ytArgs.push('--ffmpeg-location', ffmpegDir);
        }

        ytArgs.push(url);

        const ytProcess = spawn(ytDlpPath, ytArgs);

        ytProcess.stdout.pipe(res);

        ytProcess.stderr.on('data', (err) => {
          console.error('Log yt-dlp (mp3):', err.toString());
        });
      } else {
        const tempFileName = `yt_${Date.now()}_${Math.random().toString(36).substring(7)}.mp4`;
        const tempFilePath = path.join(os.tmpdir(), tempFileName);

        const args = [
          '-o',
          tempFilePath,
          '-f',
          'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/best',
          '--merge-output-format',
          'mp4',
        ];

        if (ffmpegDir) {
          args.push('--ffmpeg-location', ffmpegDir);
        }

        args.push(url);

        const ytProcess = spawn(ytDlpPath, args);

        let stderrLog = '';
        ytProcess.stderr.on('data', (err) => {
          stderrLog += err.toString();
        });

        ytProcess.on('close', (downloadCode) => {
          if (
            downloadCode !== 0 ||
            !fs.existsSync(tempFilePath) ||
            fs.statSync(tempFilePath).size === 0
          ) {
            console.error('--- ERROR DETALLADO DE YT-DLP ---');
            console.error(stderrLog);
            console.error('--------------------------------');

            if (fs.existsSync(tempFilePath)) {
              fs.unlinkSync(tempFilePath);
            }
            if (!res.headersSent) {
              return res
                .status(500)
                .json({ message: 'Error al procesar el video de YouTube' });
            }
            return;
          }

          res.setHeader('Content-Type', 'video/mp4');
          res.setHeader(
            'Content-Disposition',
            `attachment; filename="${asciiTitle}.mp4"; filename*=UTF-8''${encodedTitle}.mp4`,
          );

          const fileStream = fs.createReadStream(tempFilePath);
          fileStream.pipe(res);

          let isCleanedUp = false;
          const cleanup = () => {
            if (isCleanedUp) return;
            isCleanedUp = true;

            if (fs.existsSync(tempFilePath)) {
              fs.unlink(tempFilePath, (err) => {
                if (err && err.code !== 'ENOENT') {
                  console.error('Error eliminando archivo temporal:', err);
                }
              });
            }
          };

          res.on('finish', cleanup);
          res.on('close', cleanup);
          fileStream.on('error', (err) => {
            console.error('Error en el stream de envío:', err);
            cleanup();
          });
        });
      }
    });

    titleProcess.on('error', (err) => {
      console.error('Error ejecutando yt-dlp:', err);
      if (!res.headersSent) {
        throw new InternalServerErrorException('Error al iniciar la descarga');
      }
    });
  }
}
