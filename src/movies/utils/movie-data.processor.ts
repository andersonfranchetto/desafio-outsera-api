import { Injectable } from '@nestjs/common';
import { MovieDto } from '@/movies/dtos/movie.dto';
import { WinnersDto } from '@/movies/dtos/winners.dto';

@Injectable()
export class MovieDataProcessor {
  /**
   * Agrupa filmes vencedores por produtor individual.
   * @param {MovieDto[]} winners array de vencedores.
   * @returns {Record<string, WinnersDto[]>} retorno da operação.
   */
  public groupWinnersByProducer(winners: MovieDto[]): Record<string, MovieDto[]> {
    return winners.reduce(
      (acc, movie) => {
        const producers = movie.producers
          .split(/,| and /)
          .map((p) => p.trim())
          .filter(Boolean);

        producers.forEach((producer) => {
          acc[producer] ||= [];
          acc[producer].push(movie);
        });

        return acc;
      },
      {} as Record<string, any[]>,
    );
  }

  /**
   * Calcula todos os intervalos entre vitórias de cada produtor.
   * @param {Record<string, MovieDto[]>} grouped objeto com os produtores agrupados.
   * @returns {WinnersDto[]} intervalos entre vitoriosos max e min.
   */
  public calculateIntervals(grouped: Record<string, MovieDto[]>): WinnersDto[] {
    return Object.entries(grouped)
      .map(([producer, movies]) => {
        if (movies.length < 2) return null;

        const sorted = movies.sort((a, b) => a.year - b.year);

        return sorted.slice(1).map((movie, idx) => ({
          producer,
          interval: movie.year - sorted[idx].year,
          previousWin: sorted[idx].year,
          followingWin: movie.year,
        }));
      })
      .flat()
      .filter(Boolean);
  }

  public getMinInterval(intervals: WinnersDto[]): WinnersDto[] {
    const minInterval = Math.min(...intervals.map((i) => i.interval));
    return intervals.filter((i) => i.interval === minInterval);
  }

  public getMaxInterval(intervals: WinnersDto[]): WinnersDto[] {
    const maxInterval = Math.max(...intervals.map((i) => i.interval));
    return intervals.filter((i) => i.interval === maxInterval);
  }
}
