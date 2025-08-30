import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import axios, { AxiosResponse } from 'axios';

/**
 * API 网关服务
 * 对齐Java版本的网关功能
 */
@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);
  private readonly services = new Map<string, string[]>();

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.initializeServices();
  }

  /**
   * 路由请求到对应的微服务
   */
  async routeRequest(serviceName: string, path: string, method: string, data?: any, headers?: any): Promise<AxiosResponse> {
    try {
      const serviceUrl = await this.getServiceUrl(serviceName);
      if (!serviceUrl) {
        throw new Error(`服务 ${serviceName} 不可用`);
      }

      const url = `${serviceUrl}${path}`;
      this.logger.log(`路由请求: ${method} ${url}`);

      const config = {
        method: method.toLowerCase(),
        url,
        data,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        timeout: this.configService.get('gateway.timeout', 30000),
      };

      const response = await axios(config);
      return response;
    } catch (error) {
      this.logger.error(`请求路由失败: ${serviceName}${path}`, error);
      throw error;
    }
  }

  /**
   * 获取服务URL（负载均衡）
   */
  private async getServiceUrl(serviceName: string): Promise<string | null> {
    const instances = this.services.get(serviceName);
    if (!instances || instances.length === 0) {
      return null;
    }

    // 简单的轮询负载均衡
    const instance = instances[Math.floor(Math.random() * instances.length)];
    return instance;
  }

  /**
   * 注册服务实例
   */
  registerService(serviceName: string, url: string): void {
    if (!this.services.has(serviceName)) {
      this.services.set(serviceName, []);
    }
    
    const instances = this.services.get(serviceName)!;
    if (!instances.includes(url)) {
      instances.push(url);
      this.logger.log(`服务注册成功: ${serviceName} -> ${url}`);
    }
  }

  /**
   * 注销服务实例
   */
  unregisterService(serviceName: string, url: string): void {
    const instances = this.services.get(serviceName);
    if (instances) {
      const index = instances.indexOf(url);
      if (index > -1) {
        instances.splice(index, 1);
        this.logger.log(`服务注销成功: ${serviceName} -> ${url}`);
      }
    }
  }

  /**
   * 获取所有服务状态
   */
  getServicesStatus(): Record<string, string[]> {
    const status: Record<string, string[]> = {};
    for (const [serviceName, instances] of this.services.entries()) {
      status[serviceName] = [...instances];
    }
    return status;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<{
    status: string;
    services: Record<string, { available: number; total: number }>;
  }> {
    const servicesHealth: Record<string, { available: number; total: number }> = {};
    
    for (const [serviceName, instances] of this.services.entries()) {
      let available = 0;
      
      for (const instance of instances) {
        try {
          await axios.get(`${instance}/health`, { timeout: 5000 });
          available++;
        } catch (error) {
          // 健康检查失败
        }
      }
      
      servicesHealth[serviceName] = {
        available,
        total: instances.length,
      };
    }

    return {
      status: 'ok',
      services: servicesHealth,
    };
  }

  /**
   * 初始化服务列表
   */
  private initializeServices(): void {
    // 注册默认服务
    this.registerService('ai-service', 'http://localhost:3001');
    this.registerService('user-service', 'http://localhost:3002');
    this.registerService('file-service', 'http://localhost:3003');
  }
}