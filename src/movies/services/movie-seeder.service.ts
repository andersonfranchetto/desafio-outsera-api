import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { MovieService } from '@/movies/services/movie.service';
import { resolveCsvPath } from '@/movies/helpers/csv-path.helper';
import { MovieDto } from '@/movies/dtos/movie.dto';
import * as fs from 'node:fs';
import * as csv from 'csv-parser';

@Injectable()
export class MovieSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MovieSeederService.name);

  constructor(private readonly moviesService: MovieService) {}

  /**
   * Inicializa o banco de dados com dados de filmes a partir de um arquivo CSV
   * Se o banco já contiver registros, o processo de seeding é ignorado
   * @throws {Error} se houver falha na leitura do arquivo CSV
   */
  async onApplicationBootstrap() {
    this.logger.log('Iniciando o seeding do banco de dados com filmes...');
    const count = await this.moviesService.count();

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
              reject(err);
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
        await this.moviesService.save(moviesToInsert);
        this.logger.log(`Inseridos ${moviesToInsert.length} filmes com sucesso.`);
      }
    } else {
      this.logger.log('Banco de dados já contém filmes. Seeding ignorado.');
    }
  }
}
