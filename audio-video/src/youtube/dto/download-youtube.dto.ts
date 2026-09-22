/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEnum, IsNotEmpty, IsUrl } from 'class-validator';

export enum DownloadFormat {
  MP3 = 'mp3',
  MP4 = 'mp4',
}

export class DownloadYoutubeDto {
  @IsUrl({}, { message: 'Debe ser un enlace válido de YouTube' })
  @IsNotEmpty()
  url!: string;

  @IsEnum(DownloadFormat, { message: 'El formato debe ser mp3 o mp4' })
  @IsNotEmpty()
  format!: DownloadFormat;
}
