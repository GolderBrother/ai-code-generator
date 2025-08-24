/**
 * 脱敏后的登录用户信息
 */
export class LoginUserVO {
  /**
   * 用户 id
   */
  id: number;

  /**
   * 账号
   */
  userAccount: string;

  /**
   * 用户昵称
   */
  userName: string;

  /**
   * 用户头像
   */
  userAvatar: string;

  /**
   * 用户简介
   */
  userProfile: string;

  /**
   * 用户角色：user/admin
   */
  userRole: string;

  /**
   * 创建时间
   */
  createTime: Date;

  /**
   * 更新时间
   */
  updateTime: Date;
}