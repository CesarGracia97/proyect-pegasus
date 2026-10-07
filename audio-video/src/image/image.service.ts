import {
  Injectable,
  InternalServerErrorException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { ZipService } from 'src/common/services/zip/zip.service';

export interface AllowedConversionsResponse {
  source_extension: string;
  allowed_targets: string[];
  recommended_quality: number;
}

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  // Whitelist de formatos soportados por Sharp
  private readonly whitelist: Record<string, string[]> = {
    jpg: ['webp', 'png', 'avif', 'ico', 'pdf'],
    jpeg: ['webp', 'png', 'avif', 'ico', 'pdf'],
    png: ['webp', 'jpg', 'avif', 'ico', 'pdf'],
    webp: ['jpg', 'png', 'avif', 'ico', 'pdf'],
    avif: ['webp', 'jpg', 'png', 'ico', 'pdf'],
    heic: ['jpg', 'png', 'webp', 'avif', 'pdf'],
    heif: ['jpg', 'png', 'webp', 'avif', 'pdf'],
    gif: ['webp', 'jpg', 'png'],
    bmp: ['webp', 'jpg', 'png'],
    tiff: ['webp', 'jpg', 'png'],
    svg: ['png', 'jpg', 'webp'],
  };

  constructor(private readonly zipService: ZipService) {
    // Desactiva la caché en memoria/disco de Sharp para liberar handles en Windows
    sharp.cache(false);
  }

  /**
   * Retorna las extensiones de destino permitidas según el archivo subido.
   */
  getWhitelistForExtension(ext: string): AllowedConversionsResponse {
    const cleanExt = ext.toLowerCase().replace('.', '');
    const allowed = this.whitelist[cleanExt] || ['webp', 'jpg', 'png'];

    return {
      source_extension: cleanExt,
      allowed_targets: allowed,
      recommended_quality: 80,
    };
  }

  /**
   * Procesa un lote de imágenes en un directorio temporal y retorna el ZIP empaquetado.
   */
  async convertImageBatchToZip(
    files: Express.Multer.File[],
    target: string,
    quality: number = 80,
  ): Promise<{ zipPath: string; cleanup: () => void }> {
    const normalizedTarget = target.toLowerCase();
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pegasus-image-'));
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
          `${originalName}.${normalizedTarget}`,
        );

        fs.writeFileSync(inputFilePath, file.buffer);

        await this.processSingleImage(
          inputFilePath,
          outputFilePath,
          normalizedTarget,
          quality,
        );

        convertedFiles.push(outputFilePath);
      }

      const zipPath = path.join(
        tempDir,
        `convert_images_${normalizedTarget}.zip`,
      );
      await this.zipService.createZipArchive(convertedFiles, zipPath);

      // Limpieza con retardo y reintentos automáticos para Windows
      const cleanup = () => {
        setTimeout(() => {
          try {
            fs.rmSync(tempDir, {
              recursive: true,
              force: true,
              maxRetries: 10, // Reintenta hasta 10 veces si Windows aún retiene el archivo
              retryDelay: 200, // Espera 200ms entre reintentos
            });
            this.logger.log(`Carpeta temporal limpiada: ${tempDir}`);
          } catch (err) {
            this.logger.error(
              `Error al limpiar carpeta temporal de imágenes: ${(err as Error).message}`,
            );
          }
        }, 500);
      };

      return { zipPath, cleanup };
    } catch (error) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      throw new InternalServerErrorException(
        `Error procesando lote de imágenes: ${(error as Error).message}`,
      );
    }
  }

  /**
   * Ejecuta la transformación individual usando Sharp
   */
  private async processSingleImage(
    inputPath: string,
    outputPath: string,
    target: string,
    quality: number,
  ): Promise<void> {
    try {
      const pipeline = sharp(inputPath, { failOn: 'none' });

      switch (target) {
        case 'webp':
          await pipeline.webp({ quality }).toFile(outputPath);
          break;
        case 'jpg':
        case 'jpeg':
          await pipeline.jpeg({ quality, mozjpeg: true }).toFile(outputPath);
          break;
        case 'png':
          await pipeline.png({ compressionLevel: 8 }).toFile(outputPath);
          break;
        case 'avif':
          await pipeline.avif({ quality }).toFile(outputPath);
          break;
        case 'ico':
          await pipeline
            .resize(256, 256, { fit: 'contain' })
            .png()
            .toFile(outputPath);
          break;
        default:
          throw new BadRequestException(
            `Formato de destino no soportado: ${target}`,
          );
      }
    } catch (err) {
      this.logger.error(
        `Error al procesar la imagen ${inputPath}: ${(err as Error).message}`,
      );
      throw new BadRequestException(
        `No se pudo convertir la imagen al formato ${target}. Archivo posiblemente corrupto.`,
      );
    }
  }
}
