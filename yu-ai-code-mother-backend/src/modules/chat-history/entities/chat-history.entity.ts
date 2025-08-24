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

  @Column({ name: 'app_id' })
  appId: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'message_content', type: 'text' })
  messageContent: string;

  @Column({ name: 'message_type', default: 0 })
  messageType: number;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @Column({ name: 'is_delete', default: 0 })
  isDelete: number;

  // 关联关系
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => App)
  @JoinColumn({ name: 'app_id' })
  app: App;
}