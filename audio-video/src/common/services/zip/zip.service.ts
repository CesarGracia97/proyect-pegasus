/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ZipService {
  private readonly logger = new Logger(ZipService.name);

  /**
   * Recibe un arreglo de rutas de archivos en disco y los empaqueta en zipPath
   */
  async createZipArchive(files: string[], zipPath: string): Promise<string> {
    const archiverModule = await (eval('import("archiver")') as Promise<any>);
    const archiver = archiverModule.default || archiverModule;

    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(zipPath);
      const archive =
        typeof archiver.create === 'function'
          ? archiver.create('zip', { zlib: { level: 9 } })
          : archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        this.logger.log(`ZIP generado con éxito: ${zipPath}`);
        resolve(zipPath);
      });

      archive.on('error', (err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : String(err);
        this.logger.error(`Error al empaquetar ZIP: ${errorMessage}`);
        reject(
          new InternalServerErrorException(
            `Error al generar ZIP: ${errorMessage}`,
          ),
        );
      });

      archive.pipe(output);

      files.forEach((file) => {
        archive.file(file, { name: path.basename(file) });
      });

      archive.finalize();
    });
  }
}
