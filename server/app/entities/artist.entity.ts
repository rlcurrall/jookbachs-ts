import {
  Entity,
  Column,
  OneToMany,
  BaseEntity,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Track } from "./track.entity";

@Entity()
export class Artist extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @Column({ type: "text" })
  name: string;

  @OneToMany(type => Track, track => track.artist)
  tracks: Promise<Track[]>;
}
