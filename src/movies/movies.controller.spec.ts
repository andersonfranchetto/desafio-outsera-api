import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MovieService } from './services/movie.service';

describe('MoviesController', () => {
  let controller: MoviesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MovieService,
          useValue: {
            getProducerWinnersInterfaces: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
