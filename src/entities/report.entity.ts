import { ApiProperty } from '@nestjs/swagger';
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
import { ReportType } from './report-type.entity';
import { User } from './user.entity';

@Entity('report')
export class Report {
  @ApiProperty({
    example: 1,
    description: '신고 고유 ID',
  })
  @IsInt()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 1,
    description: '신고 카테고리 ID',
  })
  @IsInt()
  @Column({
    type: 'tinyint',
    name: 'report_type_id',
    nullable: true,
  })
  reportTypeId: number;

  @ManyToOne(() => ReportType, (reportType) => reportType.reports)
  @JoinColumn({ name: 'report_type_id', referencedColumnName: 'id' })
  reportType: ReportType;

  @ApiProperty({
    example: 'OO유저가 저한테 욕설을 했습니다.',
    description: '신고 내용',
  })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({
    example: 1,
    description: '신고 유저 ID',
  })
  @IsInt()
  @Column({ type: 'bigint', name: 'user_id', nullable: true })
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
