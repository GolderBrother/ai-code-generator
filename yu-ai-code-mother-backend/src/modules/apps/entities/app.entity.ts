import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ChatHistory } from '../../chat/entities/chat-history.entity';

@Entity('app')
@Index(['userId'])
export class App {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'app_name', length: 128 })
  appName: string;

  @Column({ name: 'app_desc', type: 'text', nullable: true })
  appDesc: string;

  @Column({ name: 'app_icon', length: 1024, nullable: true })
  appIcon: string;

  @Column({ name: 'app_type', default: 0 })
  appType: number;

  @Column({ name: 'app_status', default: 0 })
  appStatus: number;

  @Column({ name: 'app_version', length: 128, default: '1.0.0' })
  appVersion: string;

  @Column({ name: 'app_size', default: 0 })
  appSize: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'code_gen_type', length: 128 })
  codeGenType: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @Column({ name: 'is_delete', default: false })
  isDelete: boolean;

  // 关联关系
  @ManyToOne(() => User, (user) => user.apps)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => ChatHistory, (chatHistory) => chatHistory.app)
  chatHistories: ChatHistory[];
}
