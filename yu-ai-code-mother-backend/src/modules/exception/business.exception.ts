import { HttpException, HttpStatus } from '@nestjs/common';

export enum ErrorCode {
  SUCCESS = 0,
  PARAMS_ERROR = 40000,
  NOT_LOGIN_ERROR = 40100,
  NO_AUTH_ERROR = 40101,
  NOT_FOUND_ERROR = 40400,
  FORBIDDEN_ERROR = 40300,
  SYSTEM_ERROR = 50000,
  OPERATION_ERROR = 50001,
}

export class BusinessException extends HttpException {
  public readonly code: ErrorCode;

  constructor(code: ErrorCode, message: string, httpStatus: HttpStatus = HttpStatus.BAD_REQUEST) {
    super({ code, message }, httpStatus);
    this.code = code;
  }

  static paramsError(message: string = '请求参数错误'): BusinessException {
    return new BusinessException(ErrorCode.PARAMS_ERROR, message, HttpStatus.BAD_REQUEST);
  }

  static notLoginError(message: string = '未登录'): BusinessException {
    return new BusinessException(ErrorCode.NOT_LOGIN_ERROR, message, HttpStatus.UNAUTHORIZED);
  }

  static noAuthError(message: string = '无权限'): BusinessException {
    return new BusinessException(ErrorCode.NO_AUTH_ERROR, message, HttpStatus.FORBIDDEN);
  }

  static notFoundError(message: string = '请求数据不存在'): BusinessException {
    return new BusinessException(ErrorCode.NOT_FOUND_ERROR, message, HttpStatus.NOT_FOUND);
  }

  static forbiddenError(message: string = '禁止访问'): BusinessException {
    return new BusinessException(ErrorCode.FORBIDDEN_ERROR, message, HttpStatus.FORBIDDEN);
  }

  static systemError(message: string = '系统内部异常'): BusinessException {
    return new BusinessException(ErrorCode.SYSTEM_ERROR, message, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  static operationError(message: string = '操作失败'): BusinessException {
    return new BusinessException(ErrorCode.OPERATION_ERROR, message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}