import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  BaseEntity,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Artist } from "./artist.entity";
import { Album } from "./album.entity";

@Entity()
export class Track extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @Column({ type: "text" })
  path: string;

  @Column({ type: "text" })
  title: string;

  @Column({ type: "int", nullable: true })
  year: number;

  @Column({ type: "integer", nullable: true })
  number: number;

  @Column({ type: "double" })
  duration: number;

  @Column({ type: "text" })
  format: string;

  @Column({ type: "datetime" })
  createdAt: Date;

  @Column({ type: "datetime", nullable: true })
  updatedAt: Date;

  @Column({ type: "datetime", nullable: true })
  deletedAt: Date;

  @ManyToOne(type => Artist, artist => artist.tracks, {
    eager: true,
    nullable: true,
  })
  @JoinColumn()
  artist: Artist;

  @ManyToOne(type => Album, album => album.tracks, {
    eager: true,
    nullable: true,
  })
  @JoinColumn()
  album: Album;
}
