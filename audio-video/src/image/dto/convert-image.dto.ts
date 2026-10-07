import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumberString,
} from 'class-validator';

export class ConvertImageDto {
  @IsString()
  @IsNotEmpty()
  target!: string; // Ej: 'webp', 'jpg', 'png', 'avif', 'ico', 'pdf'

  @IsOptional()
  @IsNumberString()
  quality?: string; // Calidad opcional (1 - 100), por defecto 80
}
