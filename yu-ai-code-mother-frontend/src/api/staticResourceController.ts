// @ts-ignore
/* eslint-disable */
import request from '@/request'

// 静态资源模块接口前缀
const STATIC_PREFIX = '/static'

/**
 * 获取静态资源文件 - 公开接口
 * @param params 部署密钥和文件路径参数
 * @returns 静态资源文件内容
 */
export async function serveStaticResource(
  params: API.serveStaticResourceParams,
  options?: { [key: string]: any }
) {
  const { deployKey: param0, ...queryParams } = params
  return request<string>(`${STATIC_PREFIX}/${param0}/**`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}
