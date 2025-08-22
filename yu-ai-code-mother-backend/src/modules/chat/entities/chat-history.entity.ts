import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { App } from '../../apps/entities/app.entity';

@Entity('chat_history')
@Index(['appId'])
@Index(['userId'])
export class ChatHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'app_id' })
  appId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'message_type' })
  messageType: number; // 0-用户，1-AI

  @Column({ name: 'message_content', type: 'text' })
  messageContent: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @Column({ name: 'is_delete', default: false })
  isDelete: boolean;

  // 关联关系
  @ManyToOne(() => App, (app) => app.chatHistories)
  @JoinColumn({ name: 'app_id' })
  app: App;

  @ManyToOne(() => User, (user) => user.chatHistories)
  @JoinColumn({ name: 'user_id' })
  user: User;
}

