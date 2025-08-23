/* eslint-disable */
import request from '@/request'

// 用户模块接口前缀
const USER_PREFIX = '/users'

/**
 * 创建用户（仅管理员）
 * @param body 创建用户请求
 * @returns 用户ID
 */
export async function addUser(body: API.UserAddRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseLong>(`${USER_PREFIX}/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/**
 * 删除用户（仅管理员）
 * @param body 删除请求
 * @returns 删除结果
 */
export async function deleteUser(body: API.DeleteRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>(`${USER_PREFIX}/delete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/**
 * 根据id获取用户（仅管理员）
 * @param params 用户ID参数
 * @returns 用户信息
 */
export async function getUserById(
  params: API.getUserByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseUser>(`${USER_PREFIX}/get`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/**
 * 获取当前登录用户信息
 * @returns 登录用户信息
 */
export async function getLoginUser(options?: { [key: string]: any }) {
  return request<API.BaseResponseLoginUserVO>(`${USER_PREFIX}/get/login`, {
    method: 'GET',
    ...(options || {}),
  })
}

/**
 * 根据ID获取用户VO（脱敏后的用户信息）
 * @param params 用户ID参数
 * @returns 脱敏后的用户信息
 */
export async function getUserVoById(
  params: API.getUserVOByIdParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseUserVO>(`${USER_PREFIX}/get/vo`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/**
 * 分页获取用户封装列表（仅管理员）
 * @param body 查询请求参数
 * @returns 用户分页列表
 */
export async function listUserVoByPage(
  body: API.UserQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageUserVO>(`${USER_PREFIX}/list/page/vo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/**
 * 用户登录 - 公开接口
 * @param body 用户登录请求
 * @returns 脱敏后的用户登录信息
 */
export async function userLogin(body: API.UserLoginRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseLoginUserVO>(`${USER_PREFIX}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/**
 * 用户注销
 * @returns 注销结果
 */
export async function userLogout(options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>(`${USER_PREFIX}/logout`, {
    method: 'POST',
    ...(options || {}),
  })
}

/**
 * 用户注册 - 公开接口
 * @param body 用户注册请求
 * @returns 注册结果
 */
export async function userRegister(
  body: API.UserRegisterRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong>(`${USER_PREFIX}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/**
 * 更新用户（仅管理员）
 * @param body 更新用户请求
 * @returns 更新结果
 */
export async function updateUser(body: API.UserUpdateRequest, options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean>(`${USER_PREFIX}/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
