import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { WinnersDto } from '../../src/movies/dtos/winners.dto';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Readable } from 'node:stream';
import { AppModule } from '../../src/app.module';
import { MovieService } from '../../src/movies/services/movie.service';
import { MovieSeederService } from '../../src/movies/services/movie-seeder.service';

jest.mock('@/movies/helpers/csv-path.helper', () => ({
  resolveCsvPath: jest.fn(() => path.resolve('test', 'fixtures', 'movielist.csv')),
}));

describe('MoviesController (Integration)', () => {
  let app: INestApplication;
  let movieService: MovieService;
  let movieSeederService: MovieSeederService;

  describe('Real fixtures CSV file', () => {
    beforeAll(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      movieService = moduleFixture.get<MovieService>(MovieService);
      movieSeederService = moduleFixture.get<MovieSeederService>(MovieSeederService);

      await movieSeederService.onApplicationBootstrap();
    });

    afterAll(async () => {
      await app.close();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('GET /movies/intervals should return the producer with the shortest interval', async () => {

      const expectedShortestWinner: WinnersDto = {
        followingWin: 1991,
        interval: 1,
        previousWin: 1990,
        producer: 'Joel Silver',
      };

      const response = await request(app.getHttpServer())
        .get('/movies/intervals')
        .expect(200);

      expect(response.body).toHaveProperty('min');
      expect(response.body.min[0]).toEqual(expectedShortestWinner);
    });

    it('GET /movies/intervals should return the producer with the longest interval', async () => {
      const expectedLongestWinner: WinnersDto = {
        followingWin: 2015,
        interval: 13,
        previousWin: 2002,
        producer: 'Matthew Vaughn',
      };

      const response = await request(app.getHttpServer())
        .get('/movies/intervals')
        .expect(200);

      expect(response.body).toHaveProperty('max');
      expect(response.body.max[0]).toEqual(expectedLongestWinner);
    });
  });


  describe('Mocking CSV file', () => {
    beforeAll(async () => {
      jest.spyOn(fs, 'createReadStream').mockImplementation(() => {
        const mockStream = new Readable({
          read() {
            this.push('year;title;studios;producers;winner\n');
            this.push('1980;Can\'t Stop the Music;Associated Film Distribution;Allan Carr;true\n');
            this.push('1981;Mommy Dearest;Paramount;Frank Yablans;true\n');
            this.push('1998;An Alan Smithee Film;Hollywood Pictures;Ben Myron;true\n');
            this.push('1998;The Avengers;Warner Bros.;Jerry Weintraub;true\n');
            this.push('2019;Cats;Universal Pictures;"Debra Hayward; Tim Bevan; Eric Fellner; and Tom Hooper";true\n');
            this.push('2019;Rambo: Last Blood;Lionsgate;Avi Lerner and Kevin King Templeton;true\n');
            this.push('2020;Dolittle;Universal Pictures;"Joe Roth; Jeff Kirschenbaum; and Susan Downey";true\n');
            this.push('2020;Dolittle 2;Universal Pictures;"Joe Roth; Jeff Kirschenbaum; and Susan Downey";true\n');
            this.push('2021;Music;Vertical Entertainment;Sia;true\n');
            this.push('2022;Morbius;Columbia Pictures;"Avi Arad; Matt Tolmach; and Lucas Foster";true\n');
            this.push(null);
          },
        });
        (mockStream as any).path = 'mock.csv';
        (mockStream as any).close = jest.fn();

        return mockStream as unknown as fs.ReadStream;
      });

      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();

      movieService = moduleFixture.get<MovieService>(MovieService);
    });

    it('GET /movies/intervals should return the producer with the shortest interval', async () => {
      const expectedFastestWinner: WinnersDto = {
        followingWin: 2020,
        interval: 0,
        previousWin: 2020,
        producer: 'Joe Roth; Jeff Kirschenbaum;',
      };

      const response = await request(app.getHttpServer())
        .get('/movies/intervals')
        .expect(200);

      expect(response.body.min[0]).toEqual(expectedFastestWinner);
    });

    it('GET /movies/intervals should return the producer with the longest interval', async () => {
      const expectedLongestWinner: WinnersDto = {
        followingWin: 2020,
        interval: 0,
        previousWin: 2020,
        producer: 'Joe Roth; Jeff Kirschenbaum;',
      };

      const response = await request(app.getHttpServer())
        .get('/movies/intervals')
        .expect(200);

      expect(response.body.max[0]).toEqual(expectedLongestWinner);
    });
  });
});
