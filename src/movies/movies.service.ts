import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from '@/movies/entities/movie.entity';
import { MovieDto } from '@/movies/dtos/movie.dto';
import * as fs from 'node:fs';
import * as csv from 'csv-parser';
import { WinnersDto } from '@/movies/dtos/winners.dto';
import { resolveCsvPath } from '@/movies/helpers/csv-path.helper';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  /**
   * Inicializa o banco de dados com dados de filmes a partir de um arquivo CSV
   * Se o banco já contiver registros, o processo de seeding é ignorado
   * @throws {Error} se houver falha na leitura do arquivo CSV
   */
  async init() {
    this.logger.log('Iniciando o seeding do banco de dados com filmes...');
    const count = await this.movieRepository.count();

    if (count === 0) {
      const csvFilePath = resolveCsvPath('movielist.csv');
      const moviesToInsert: MovieDto[] = [];

      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(csvFilePath)
          .pipe(
            csv({
              separator: ';',
              mapHeaders: ({ header }) => header.trim(),
              mapValues: ({ value }) => value.trim(),
            }),
          )
          .on('data', (data) => {
            try {
              const movieDto = MovieDto.fromCsv(data);
              moviesToInsert.push(movieDto);
            } catch (err) {
              this.logger.error('Erro ao converter linha CSV:', err, data);
            }
          })
          .on('end', async () => {
            resolve();
          })
          .on('error', (error) => {
            this.logger.error('Erro ao ler o arquivo CSV:', error);
            reject(error);
          });
      });

      if (moviesToInsert.length > 0) {
        await this.movieRepository.save(moviesToInsert);
        this.logger.log(`Inseridos ${moviesToInsert.length} filmes com sucesso.`);
      }
    } else {
      this.logger.log('Banco de dados já contém filmes. Seeding ignorado.');
    }
  }

  /**
   *  Calcula os intervalos de vitórias dos produtores.
   * @returns {Promise<{min: WinnersDto[]; max: WinnersDto[];}>} retorna as informações.
   * @public
   */
  async getProducerWinnersInterfaces(): Promise<{
    min: WinnersDto[];
    max: WinnersDto[];
  }> {
    // Obtém todos os filmes vencedores
    const winners = await this.movieRepository.find({ where: { winner: true } });

    // Mapeaia os produtores => array de anos em que ganhou
    const producerWins = this.groupWinsByProducer(winners);

    // Calcula os intervalos entre vitórias de cada produtor
    const intervals = this.calculateIntervals(producerWins);

    // Filtra os intervalos com os mínimos e máximos
    const { minIntervals, maxIntervals } = this.findMinMaxIntervals(intervals);

    return {
      min: minIntervals,
      max: maxIntervals,
    };
  }

  /**
   * Função que agrupa anos de vitórias por produtor.
   * @param {MovieDto[]} winners Array de filmes vencedores.
   * @returns {Map<string, number[]>} response agrupado.
   * @private
   */
  private groupWinsByProducer(winners: MovieDto[]): Map<string, number[]> {
    const map = new Map<string, number[]>();

    for (const win of winners) {
      // Pega a string de produtores, remove o ponto e vírgula final, divide por ponto e vírgula e remove espaços extras
      const producers = win.producers
        .replace(/ and /gi, ',')
        .split(',')
        .map((p) => p.trim());

      for (const producer of producers) {
        if (!map.has(producer)) {
          map.set(producer, []);
        }
        map.get(producer)!.push(Number(win.year));
      }
    }

    return map;
  }

  /**
   * Função que calcula todos os intervalos entre vitórias para cada produtor
   * @param {WinnersDto[]} producerWins Mapa de produtores e seus anos de vitórias.
   * @returns {Map<string, number[]>} Retorna intervalos de vitórias dos produtores.
   * @private
   */
  private calculateIntervals(producerWins: Map<string, number[]>): WinnersDto[] {
    const intervals: WinnersDto[] = [];

    for (const [producer, winYears] of producerWins.entries()) {
      /**
       * Pré-requisito da proposta: Um produtor precisa ter pelo menos 2 prêmios para haver intervalo
       */
      if (winYears.length < 2) continue;

      /**
       * Aqui ordeno os anos de forma crescente para garantir a sequência correta
       */
      const sortedYears = [...winYears].sort((a, b) => a - b);

      /**
       * Então calculamos os intervalos consecutivos entre prêmios do produtor
       */
      const producerIntervals = sortedYears.slice(1).map((year, index) => {
        const previousYear = sortedYears[index];
        return {
          producer,
          interval: year - previousYear,
          previousWin: previousYear,
          followingWin: year,
        };
      });

      intervals.push(...producerIntervals);
    }

    return intervals;
  }

  /**
   * Função que retorna os intervalos mínimos e máximos dentre todos os intervalos calculados.
   * @param {WinnersDto[]} intervals Array de intervalos calculados.
   * @returns {{minIntervals: WinnersDto[];maxIntervals: WinnersDto[];}} Retorna intervalos mínimos e máximos.
   * @private
   */
  private findMinMaxIntervals(intervals: WinnersDto[]): {
    minIntervals: WinnersDto[];
    maxIntervals: WinnersDto[];
  } {
    if (intervals.length === 0) {
      return { minIntervals: [], maxIntervals: [] };
    }

    const minInterval = Math.min(...intervals.map((i) => i.interval));
    const maxInterval = Math.max(...intervals.map((i) => i.interval));

    const minIntervals = intervals.filter((i) => i.interval === minInterval);
    const maxIntervals = intervals.filter((i) => i.interval === maxInterval);

    return { minIntervals, maxIntervals };
  }
}
