import { IsDate, IsInt, IsOptional } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReportCategory } from './ReportCategory';
import { User } from './User';

@Entity('report')
export class Report {
  @IsInt()
  @PrimaryGeneratedColumn({ type: 'bigint', name: 'id', unsigned: true })
  id: number;

  @IsInt()
  @Column({
    type: 'bigint',
    name: 'report_category_id',
    nullable: true,
    unsigned: true,
  })
  reportCategoryId: number;

  @ManyToOne(() => ReportCategory, (category) => category.reports)
  @JoinColumn({ name: 'report_category_id', referencedColumnName: 'id' })
  reportCategory: ReportCategory;

  @Column({ type: 'text' })
  content: string;

  @IsInt()
  @Column({ type: 'bigint', name: 'user_id', nullable: true, unsigned: true })
  userId: number;

  @ManyToOne(() => User, (user) => user.reports)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @IsDate()
  @CreateDateColumn()
  createdAt: Date;

  @IsDate()
  @UpdateDateColumn()
  updatedAt: Date;

  @IsDate()
  @IsOptional()
  @DeleteDateColumn()
  deletedAt: Date | null;
}
