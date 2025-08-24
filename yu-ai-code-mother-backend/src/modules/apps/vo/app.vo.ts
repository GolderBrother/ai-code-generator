import { UserVO } from '../../users/vo/user.vo';

/**
 * 应用封装类
 */
export class AppVO {
  /**
   * id
   */
  id: number;

  /**
   * 应用名称
   */
  appName: string;

  /**
   * 应用封面
   */
  cover: string;

  /**
   * 应用初始化的 prompt
   */
  initPrompt: string;

  /**
   * 代码生成类型（枚举）
   */
  codeGenType: string;

  /**
   * 部署标识
   */
  deployKey: string;

  /**
   * 部署时间
   */
  deployedTime: Date;

  /**
   * 优先级
   */
  priority: number;

  /**
   * 创建用户id
   */
  userId: number;

  /**
   * 创建时间
   */
  createTime: Date;

  /**
   * 更新时间
   */
  updateTime: Date;

  /**
   * 创建用户信息
   */
  user: UserVO;
}
