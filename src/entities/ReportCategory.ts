import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsOptional } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Report } from './Report';

@Entity('report_category')
export class ReportCategory {
  @ApiProperty({
    example: 1,
    description: '신고 카테고리 고유 ID',
  })
  @IsInt()
  @PrimaryColumn({ type: 'tinyint', name: 'id', unsigned: true })
  id: number;

  @ApiProperty({
    example: '욕설',
    description: '신고 유형',
  })
  @Column({ type: 'varchar', name: 'name', length: 100 })
  name: string;

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

  @OneToMany(() => Report, (reports) => reports.reportCategory)
  reports: Report[];
}
