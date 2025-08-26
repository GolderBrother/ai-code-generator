import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { App } from '../../apps/entities/app.entity';

@Entity('chat_history')
export class ChatHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'appId' })
  appId: number;

  @Column({ name: 'userId' })
  userId: number;

  @Column({ name: 'message', type: 'text' })
  messageContent: string; // 字段名沿用旧服务命名，列名对齐表结构

  @Column({ name: 'messageType', default: 0 })
  messageType: number;

  @CreateDateColumn({ name: 'createTime' })
  createTime: Date;

  @UpdateDateColumn({ name: 'updateTime' })
  updateTime: Date;

  @Column({ name: 'isDelete', default: 0 })
  isDelete: number;

  // 关联关系
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => App)
  @JoinColumn({ name: 'appId' })
  app: App;
}