import axios from 'axios'
import { message } from 'ant-design-vue'
import { API_BASE_URL } from '@/config/env'

// 创建 Axios 实例
const myAxios = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  withCredentials: true,
})

// 全局请求拦截器
myAxios.interceptors.request.use(
  function (config) {
    // JWT token现在通过cookie自动发送，无需手动添加
    return config
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error)
  },
)

// 全局响应拦截器
myAxios.interceptors.response.use(
  function (response) {
    handleUnauthorizedResponse(response)
    return response
  },
  function (error) {
    handleErrorResponse(error)
    return Promise.reject(error)
  },
)

export default myAxios

/**
 * 处理未授权响应
 */
function handleUnauthorizedResponse(response: any) {
  const { data } = response
  // 未登录
  if (data.code === 40100) {
    // 不是获取用户信息的请求，并且用户目前不是已经在用户登录页面，则跳转到登录页面
    if (
      !response.request.responseURL.includes('users/get/login') &&
      !window.location.pathname.includes('/user/login')
    ) {
      message.warning('请先登录')
      window.location.href = `/user/login?redirect=${window.location.href}`
    }
  }
}

/**
 * 处理错误响应
 */
function handleErrorResponse(error: any) {
  let errorMessage = '请求失败，请稍后重试'

  if (error.response) {
    // 服务器返回了错误状态码
    const { status, data } = error.response

    switch (status) {
      case 400:
        errorMessage = data?.message || '请求参数错误'
        break
      case 401:
        errorMessage = '未登录或登录已过期，请重新登录'
        // 跳转到登录页面
        if (!window.location.pathname.includes('/user/login')) {
          setTimeout(() => {
            window.location.href = `/user/login?redirect=${window.location.href}`
          }, 1500)
        }
        break
      case 403:
        errorMessage = '没有权限访问该资源'
        break
      case 404:
        errorMessage = '请求的资源不存在'
        break
      case 409:
        errorMessage = data?.message || '数据冲突'
        break
      case 500:
        errorMessage = data?.message || '服务器内部错误'
        break
      case 502:
        errorMessage = '网关错误'
        break
      case 503:
        errorMessage = '服务暂时不可用'
        break
      default:
        errorMessage = data?.message || `请求失败 (${status})`
    }
  } else if (error.request) {
    // 请求已发出但没有收到响应
    errorMessage = '网络连接失败，请检查网络设置'
  } else {
    // 其他错误
    errorMessage = error.message || '未知错误'
  }

  // 显示错误提示
  message.error(errorMessage)
}
