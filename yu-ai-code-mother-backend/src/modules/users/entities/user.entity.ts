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
import { ChatHistory } from '../../chat/entities/chat-history.entity';

@Entity('user')
@Index(['userAccount'], { unique: true })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_name', length: 256, nullable: true })
  userName: string;

  @Column({ name: 'user_account', length: 256, unique: true })
  userAccount: string;

  @Column({ name: 'user_password', length: 256 })
  userPassword: string;

  @Column({ name: 'user_avatar', length: 1024, nullable: true })
  userAvatar: string;

  @Column({ name: 'user_role', length: 256, default: 'user' })
  userRole: string;

  @CreateDateColumn({ name: 'create_time' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time' })
  updateTime: Date;

  @Column({ name: 'is_delete', default: false })
  isDelete: boolean;

  // 关联关系
  @OneToMany(() => App, (app) => app.user)
  apps: App[];

  @OneToMany(() => ChatHistory, (chatHistory) => chatHistory.user)
  chatHistories: ChatHistory[];
}
