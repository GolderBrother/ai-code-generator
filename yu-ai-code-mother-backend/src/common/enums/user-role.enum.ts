/**
 * 用户角色枚举
 */
export enum UserRoleEnum {
  USER = 'user',
  ADMIN = 'admin',
}

/**
 * 用户角色常量
 */
export const USER_ROLE = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

/**
 * 默认用户名常量
 */
export const DEFAULT_USER_NAME = '无名';