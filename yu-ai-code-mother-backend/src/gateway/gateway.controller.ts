import { Controller, All, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { GatewayService } from './gateway.service';

/**
 * API 网关控制器
 * 对齐Java版本的网关路由功能
 */
@Controller('gateway')
export class GatewayController {
  private readonly logger = new Logger(GatewayController.name);

  constructor(
    private readonly gatewayService: GatewayService,
  ) {}

  /**
   * 通用路由处理
   */
  @All('*')
  async handleRequest(@Req() req: Request, @Res() res: Response) {
    try {
      const path = req.path.replace('/gateway', '');
      const pathSegments = path.split('/').filter(segment => segment);
      
      if (pathSegments.length === 0) {
        return res.status(404).json({ error: '服务路径不能为空' });
      }

      const serviceName = pathSegments[0];
      const servicePath = '/' + pathSegments.slice(1).join('/');

      this.logger.log(`网关路由: ${req.method} ${serviceName}${servicePath}`);

      const response = await this.gatewayService.routeRequest(
        serviceName,
        servicePath,
        req.method,
        req.body,
        req.headers,
      );

      res.status(response.status).json(response.data);
    } catch (error) {
      this.logger.error('网关路由失败', error);
      res.status(500).json({
        error: '网关路由失败',
        message: error.message,
      });
    }
  }
}