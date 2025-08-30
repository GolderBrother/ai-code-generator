import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * 部署记录实体
 * 对齐Java版本的部署记录表结构
 */
@Entity('deploy_record')
export class DeployRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'app_id', comment: '应用ID' })
  appId: number;

  @Column({ name: 'user_id', comment: '用户ID' })
  userId: number;

  @Column({ name: 'deploy_url', length: 500, comment: '部署URL' })
  deployUrl: string;

  @Column({ name: 'deploy_status', type: 'tinyint', default: 0, comment: '部署状态：0-部署中，1-成功，2-失败' })
  deployStatus: number;

  @Column({ name: 'deploy_log', type: 'text', nullable: true, comment: '部署日志' })
  deployLog: string;

  @Column({ name: 'deploy_path', length: 500, nullable: true, comment: '部署路径' })
  deployPath: string;

  @Column({ name: 'preview_url', length: 500, nullable: true, comment: '预览URL' })
  previewUrl: string;

  @Column({ name: 'is_delete', type: 'tinyint', default: 0, comment: '是否删除：0-未删除，1-已删除' })
  isDelete: number;

  @CreateDateColumn({ name: 'create_time', comment: '创建时间' })
  createTime: Date;

  @UpdateDateColumn({ name: 'update_time', comment: '更新时间' })
  updateTime: Date;
}