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
import { ChatHistory } from '../../chat-history/entities/chat-history.entity';

@Entity('app')
@Index(['userId'])
@Index(['appName'])
@Index(['deployKey'], { unique: true })
export class App {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'appName', length: 256, nullable: true })
  appName: string;


  @Column({ name: 'cover', length: 512, nullable: true })
  cover: string;

  @Column({ name: 'initPrompt', type: 'text', nullable: true })
  initPrompt: string;

  @Column({ name: 'codeGenType', length: 64, nullable: true })
  codeGenType: string;

  @Column({ name: 'deployKey', length: 64, nullable: true })
  deployKey: string;

  @Column({ name: 'deployedTime', type: 'datetime', nullable: true })
  deployedTime: Date;

  @Column({ name: 'priority', type: 'int', default: 0 })
  priority: number;

  @Column({ name: 'userId' })
  userId: number;

  @Column({ name: 'editTime', type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  editTime: Date;

  @CreateDateColumn({ name: 'createTime' })
  createTime: Date;

  @UpdateDateColumn({ name: 'updateTime' })
  updateTime: Date;

  @Column({ name: 'isDelete', type: 'tinyint', default: 0 })
  isDelete: number;

  // 关联关系
  @ManyToOne(() => User, (user) => user.apps)
  @JoinColumn({ name: 'userId' })
  user: User;

  @OneToMany(() => ChatHistory, (chatHistory) => chatHistory.app)
  chatHistories: ChatHistory[];
}
