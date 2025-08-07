import { IsBoolean, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MovieDto {
  @IsNumber()
  year: number;

  @IsString()
  title: string;

  @IsString()
  studios: string;

  @IsString()
  producers: string;

  @IsBoolean()
  winner: boolean = false;

  public static fromCsv(data: any): MovieDto {
    const dto = new MovieDto();
    dto.year = parseInt(data.year, 10);
    dto.title = data.title;
    dto.studios = data.studios;
    dto.producers = data.producers;
    const winnerValue = String(data.winner).toLowerCase();
    dto.winner = winnerValue === 'true' || winnerValue === 'yes';

    return dto;
  }
}
