import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from './services/movie.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Movie } from '@/movies/entities/movie.entity';
import { Repository } from 'typeorm';
import { MovieDataProcessor } from './utils/movie-data.processor';

describe('MoviesService', () => {
  let service: MovieService;
  let processor: MovieDataProcessor;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: getRepositoryToken(Movie),
          useValue: {
            count: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          } as Partial<Repository<Movie>>,
        },
        {
          provide: MovieDataProcessor,
          useValue: processor,
        }
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
    processor = module.get<MovieDataProcessor>(MovieDataProcessor);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
