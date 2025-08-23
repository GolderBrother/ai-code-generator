// @ts-ignore
/* eslint-disable */
import request from '@/request'

// 应用模块接口前缀
const APP_PREFIX = '/app'

/**
 * 创建应用
 * @param body 创建应用请求
 * @returns 应用ID
 */
export async function addApp(body: API.AppAddRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseLong>(`${APP_PREFIX}/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/**
 * 删除应用（仅管理员）
 * @param body 删除请求
 * @returns 删除结果
 */
export async function deleteAppByAdmin(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>(`${APP_PREFIX}/admin/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/**
 * 根据ID获取应用VO（仅管理员）
 * @param params 应用ID参数
 * @returns 应用信息
 */
export async function getAppVoByIdByAdmin(
  params: API.getAppVOByIdByAdminParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseAppVO>(`${APP_PREFIX}/admin/get/vo`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/**
 * 分页获取应用列表（仅管理员）
 * @param body 查询请求参数
 * @returns 应用分页列表
 */
export async function listAppVoByPageByAdmin(
  body: API.AppQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageAppVO>(`${APP_PREFIX}/admin/list/page/vo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/**
 * 更新应用（仅管理员）
 * @param body 更新应用请求
 * @returns 更新结果
 */
export async function updateAppByAdmin(
  body: API.AppAdminUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean>(`${APP_PREFIX}/admin/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/**
 * 聊天生成代码（SSE流式响应）
 * @param params 聊天生成代码参数
 * @returns 流式响应
 */
export async function chatToGenCode(
  params: API.chatToGenCodeParams,
  options?: { [key: string]: any }
) {
  return request<API.ServerSentEventString[]>(`${APP_PREFIX}/chat/gen/code`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/**
 * 删除应用
 * @param body 删除请求
 * @returns 删除结果
 */
export async function deleteApp(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>(`${APP_PREFIX}/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/**
 * 部署应用
 * @param body 部署应用请求
 * @returns 部署结果
 */
export async function deployApp(body: API.AppDeployRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseString>(`${APP_PREFIX}/deploy`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/**
 * 下载应用代码
 * @param params 下载参数
 * @returns 代码文件
 */
export async function downloadAppCode(
  params: API.downloadAppCodeParams,
  options?: { [key: string]: any }
) {
  const { appId: param0, ...queryParams } = params
  return request<any>(`${APP_PREFIX}/download/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/**
 * 根据ID获取应用VO
 * @param params 应用ID参数
 * @returns 应用信息
 */
export async function getAppVoById(
  params: API.getAppVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseAppVO>(`${APP_PREFIX}/get/vo`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/**
 * 分页获取优质应用列表
 * @param body 查询请求参数
 * @returns 优质应用分页列表
 */
export async function listGoodAppVoByPage(
  body: API.AppQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageAppVO>(`${APP_PREFIX}/good/list/page/vo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/**
 * 分页获取我的应用列表
 * @param body 查询请求参数
 * @returns 我的应用分页列表
 */
export async function listMyAppVoByPage(
  body: API.AppQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageAppVO>(`${APP_PREFIX}/my/list/page/vo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/**
 * 更新应用
 * @param body 更新应用请求
 * @returns 更新结果
 */
export async function updateApp(body: API.AppUpdateRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>(`${APP_PREFIX}/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
