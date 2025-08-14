import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '@/movies/entities/movie.entity';
import { MovieDto } from '@/movies/dtos/movie.dto';
import { MovieDataProcessor } from '@/movies/utils/movie-data.processor';
import { WinnersDto } from '@/movies/dtos/winners.dto';

@Injectable()
export class MovieService {
  private readonly logger = new Logger(MovieService.name);

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly movieDataProcessor: MovieDataProcessor,
  ) {}

  /**
   * Onbtém vencedores (maior e menor tempo) do Raspberry Awards.
   * @returns {Promise<{min: WinnersDto[], max: WinnersDto[]}>} dados manipulados.
   */
  async getProducerIntervals(): Promise<{ min: WinnersDto[]; max: WinnersDto[] }> {
    const winners = await this.movieRepository.find({
      where: { winner: true },
    });

    const grouped = this.movieDataProcessor.groupWinnersByProducer(winners);
    const intervals = this.movieDataProcessor.calculateIntervals(grouped);

    return {
      min: this.movieDataProcessor.getMinInterval(intervals),
      max: this.movieDataProcessor.getMaxInterval(intervals),
    };
  }

  /**
   * Método auxiliar Count para o seeder.
   * @returns {Promise<count>} quantidade de registros.
   */
  async count(): Promise<number> {
    return this.movieRepository.count();
  }

  /**
   * Método auxiliar Save para o seeder.
   * @param {MovieDto[]} movies lista de filmes.
   * @returns {Promise<void>} quantidade de registros.
   */
  async save(movies: MovieDto[]): Promise<void> {
    await this.movieRepository.save(movies);
  }
}
