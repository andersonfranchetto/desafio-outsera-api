import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WinnersDto {
  @IsString()
  @ApiProperty({ example: 'Producer Name' })
  producer: string;

  @IsNumber()
  @ApiProperty({ example: 10 })
  interval: number;

  @IsNumber()
  @ApiProperty({ example: 2002 })
  previousWin: number;

  @IsNumber()
  @ApiProperty({ example: 2012 })
  followingWin: number;
}
