import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MovieService } from './services/movie.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from '@/movies/entities/movie.entity';
import { MovieSeederService } from '@/movies/services/movie-seeder.service';
import { MovieDataProcessor } from '@/movies/utils/movie-data.processor';

@Module({
  imports: [TypeOrmModule.forFeature([Movie])],
  controllers: [MoviesController],
  providers: [MovieService, MovieSeederService, MovieDataProcessor],
  exports: [TypeOrmModule],
})
export class MoviesModule {}
