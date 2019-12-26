import {
  Entity,
  Column,
  OneToMany,
  BaseEntity,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Track } from "./track.entity";

@Entity()
export class Album extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "int" })
  year: number;

  @Column({ type: "blob" })
  picture: string;

  @OneToMany(type => Track, track => track.album)
  tracks: Promise<Track[]>;
}
