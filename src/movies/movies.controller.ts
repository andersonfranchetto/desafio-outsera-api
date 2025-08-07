import { Controller, Get } from '@nestjs/common';
import { MoviesService } from '@/movies/movies.service';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { WinnersDto } from '@/movies/dtos/winners.dto';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('intervals')
  @ApiOkResponse({ type: [WinnersDto] })
  @ApiOperation({ summary: 'Route that show winners "Golden Raspberry Awards' })
  async show() {
    return this.moviesService.getProducerWinnersInterfaces();
  }
}
