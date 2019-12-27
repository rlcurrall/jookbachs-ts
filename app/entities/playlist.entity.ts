import {
  Entity,
  Column,
  JoinTable,
  BaseEntity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Track } from "./track.entity";

@Entity()
export class Playlist extends BaseEntity {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "text" })
  description: string;

  @ManyToMany(type => Track)
  @JoinTable()
  tracks: Promise<Track[]>;
}
