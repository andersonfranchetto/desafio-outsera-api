import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  year: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  studios: string;

  @Column({ type: 'varchar' })
  producers: string;

  @Column({ type: 'boolean' })
  winner: boolean;
}
