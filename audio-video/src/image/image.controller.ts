import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
  Body,
  Res,
  StreamableFile,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import express from 'express';
import * as fs from 'fs';
import { ImageService } from './image.service';
import { ConvertImageDto } from './dto/convert-image.dto';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get('allowed-conversions')
  getAllowedConversions(@Query('ext') ext: string) {
    if (!ext) {
      throw new BadRequestException('Se requiere el parámetro "ext".');
    }
    return this.imageService.getWhitelistForExtension(ext);
  }

  @Post('convert')
  @UseInterceptors(FilesInterceptor('files', 10))
  async convertImage(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: ConvertImageDto,
    @Res({ passthrough: true }) res: express.Response,
  ): Promise<StreamableFile> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No se enviaron archivos para convertir.');
    }

    if (!dto.target) {
      throw new BadRequestException('El campo "target" es requerido.');
    }

    const qualityParsed = dto.quality ? parseInt(dto.quality, 10) : 80;

    const { zipPath, cleanup } = await this.imageService.convertImageBatchToZip(
      files,
      dto.target,
      qualityParsed,
    );

    const fileStream = fs.createReadStream(zipPath);

    fileStream.on('end', () => cleanup());
    fileStream.on('error', () => cleanup());

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="images_${dto.target}.zip"`,
    });

    return new StreamableFile(fileStream);
  }
}
