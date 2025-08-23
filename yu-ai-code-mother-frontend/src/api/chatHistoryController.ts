// @ts-ignore
/* eslint-disable */
import request from '@/request'

// 聊天历史模块接口前缀
const CHAT_HISTORY_PREFIX = '/chatHistory'

/**
 * 分页获取所有聊天历史（仅管理员）
 * @param body 查询请求参数
 * @returns 聊天历史分页列表
 */
export async function listAllChatHistoryByPageForAdmin(
  body: API.ChatHistoryQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageChatHistory>(`${CHAT_HISTORY_PREFIX}/admin/list/page/vo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/**
 * 获取指定应用的聊天历史
 * @param params 应用ID和分页参数
 * @returns 应用聊天历史分页列表
 */
export async function listAppChatHistory(
  params: API.listAppChatHistoryParams,
  options?: { [key: string]: any }
) {
  const { appId: param0, ...queryParams } = params
  return request<API.BaseResponsePageChatHistory>(`${CHAT_HISTORY_PREFIX}/app/${param0}`, {
    method: 'GET',
    params: {
      // pageSize has a default value: 10
      pageSize: '10',
      ...queryParams,
    },
    ...(options || {}),
  })
}
