import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { App } from '../../apps/entities/app.entity';
import { ChatHistory } from '../../chat-history/entities/chat-history.entity';

@Entity('user')
@Index(['userAccount'], { unique: true })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 256, unique: true })
  userAccount: string;

  @Column({ length: 512 })
  userPassword: string;

  @Column({ length: 256, nullable: true })
  userName: string;

  @Column({ length: 1024, nullable: true })
  userAvatar: string;

  @Column({ length: 512, nullable: true })
  userProfile: string;

  @Column({ length: 256, default: 'user' })
  userRole: string;

  @Column({ type: 'datetime', nullable: true })
  editTime: Date;

  @CreateDateColumn({ type: 'datetime' })
  createTime: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updateTime: Date;

  @Column({ type: 'tinyint', default: 0 })
  isDelete: number;

  // 关联关系
  @OneToMany(() => App, (app) => app.user)
  apps: App[];

  @OneToMany(() => ChatHistory, (chatHistory) => chatHistory.user)
  chatHistories: ChatHistory[];
}
