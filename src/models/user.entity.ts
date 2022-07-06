import { Entity, BaseEntity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
    id: number;

  @Column({ type: 'varchar', length: 60, unique: true })
    email: string;

  @Column({ type: 'varchar', length: 60 })
    username: string;

  @Column({ type: 'varchar', length: 255 })
    password: string;

  @CreateDateColumn()
    createdAt: Date;

  @UpdateDateColumn()
    updatedAt: Date;
}
