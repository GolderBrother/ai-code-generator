// @ts-ignore
/* eslint-disable */
import request from '@/request'

// 健康检查模块接口前缀
const HEALTH_PREFIX = '/health'

/**
 * 系统健康检查 - 公开接口
 * @returns 系统健康状态
 */
export async function healthCheck(options?: { [key: string]: any }) {
  return request<API.BaseResponseString>(`${HEALTH_PREFIX}/`, {
    method: 'GET',
    ...(options || {}),
  })
}
