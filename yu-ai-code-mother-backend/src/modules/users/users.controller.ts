import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Res,
  Req,
  Session,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { Public } from "../../common/decorators/public.decorator";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UserQueryDto } from "./dto/user-query.dto";
import { LoginDto } from "../auth/dto/login.dto";
import { RegisterDto } from "./dto/create-user.dto";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 公开测试接口 - 不需要认证
  @Get("test/public")
  async testPublic() {
    return {
      code: 0,
      data: {
        message: "这是一个公开的测试接口",
        timestamp: new Date().toISOString(),
        status: "success",
        endpoint: "/api/users/test/public",
      },
      message: "公开测试接口调用成功",
    };
  }

  // 需要登录的测试接口 - 需要JWT认证
  @Get("test/auth")
  @UseGuards(JwtAuthGuard)
  async testAuth(@CurrentUser() user) {
    return {
      code: 0,
      data: {
        message: "这是一个需要认证的测试接口",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles,
        },
        timestamp: new Date().toISOString(),
        status: "authenticated",
        endpoint: "/api/users/test/auth",
      },
      message: "认证测试接口调用成功",
    };
  }

  // 需要用户权限的测试接口
  @Get("test/user")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("user", "admin")
  async testUserRole(@CurrentUser() user) {
    return {
      code: 0,
      data: {
        message: "这是一个需要用户权限的测试接口",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles,
        },
        timestamp: new Date().toISOString(),
        status: "user_authorized",
        endpoint: "/api/users/test/user",
      },
      message: "用户权限测试接口调用成功",
    };
  }

  // 需要管理员权限的测试接口
  @Get("test/admin")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async testAdminRole(@CurrentUser() user) {
    return {
      code: 0,
      data: {
        message: "这是一个需要管理员权限的测试接口",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles,
        },
        timestamp: new Date().toISOString(),
        status: "admin_authorized",
        endpoint: "/api/users/test/admin",
      },
      message: "管理员权限测试接口调用成功",
    };
  }

  // ========== 核心业务接口 ==========
  
  /**
   * 用户注册 - 公开接口
   * @param registerDto 用户注册请求
   * @returns 注册结果
   */
  @Post('register')
  @Public() // 标记不需要认证的路由
  async userRegister(@Body() registerDto: RegisterDto) {
    const result = await this.usersService.userRegister(registerDto);
    return {
      code: 0,
      data: result,
      message: '用户注册成功',
    };
  }

  /**
   * 用户登录 - 公开接口
   * @param loginDto 用户登录请求
   * @param req 请求对象，用于获取session
   * @returns 脱敏后的用户登录信息
   */
  @Post("login")
  @Public() // 标记不需要认证的路由
  async userLogin(@Body() loginDto: LoginDto, @Req() req) {
    const result = await this.usersService.userLogin(loginDto, req);
    return {
      code: 0,
      data: result,
      message: "用户登录成功",
    };
  }

  /**
   * 获取当前登录用户信息 - 公开接口（用于检查登录状态）
   * @param req 请求对象，用于获取session
   * @returns 登录用户信息或null
   */
  @Get("get/login")
  @Public()
  async getLoginUser(@Req() req) {
    const result = await this.usersService.getLoginUser(req);
    return {
      code: 0,
      data: result,
      message: result ? "获取登录用户信息成功" : "用户未登录",
    };
  }

  /**
   * 用户注销
   * @param req 请求对象，用于获取session
   * @returns 注销结果
   */
  @Post("logout")
  @Public()
  async userLogout(@Req() req) {
    const result = await this.usersService.userLogout(req);
    return {
      code: 0,
      data: result,
      message: "用户注销成功",
    };
  }

  /**
   * 创建用户（仅管理员）
   * @param createUserDto 创建用户请求
   * @returns 用户ID
   */
  @Post('add')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async addUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createUser(createUserDto);
    return {
      code: 0,
      data: user.id,
      message: '用户创建成功',
    };
  }

  /**
   * 根据id获取用户（仅管理员）
   * @param id 用户ID
   * @returns 用户信息
   */
  @Get('get')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getUserById(@Query('id', ParseIntPipe) id: number) {
    if (id <= 0) {
      throw new Error('用户ID参数错误');
    }
    const user = await this.usersService.findUserById(id);
    return {
      code: 0,
      data: user,
      message: '获取用户成功',
    };
  }

  /**
   * 根据ID获取用户VO（脱敏后的用户信息）
   * @param id 用户ID
   * @returns 脱敏后的用户信息
   */
  @Get("get/vo/:id")
  async getUserVOById(@Param("id", ParseIntPipe) id: number) {
    if (id <= 0) {
      throw new Error('用户ID参数错误');
    }
    const user = await this.usersService.findUserById(id);
    const userVO = await this.usersService.getUserVO(user);
    return {
      code: 0,
      data: userVO,
      message: "获取用户信息成功",
    };
  }

  /**
   * 更新用户（仅管理员）
   * @param updateUserDto 更新用户请求
   * @returns 更新结果
   */
  @Post('update')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateUser(@Body() updateUserDto: UpdateUserDto & { id: number }) {
    if (!updateUserDto.id || updateUserDto.id <= 0) {
      throw new Error('用户ID不能为空或无效');
    }
    const user = await this.usersService.updateUser(updateUserDto.id, updateUserDto);
    return {
      code: 0,
      data: true,
      message: '用户更新成功',
    };
  }

  /**
   * 删除用户（仅管理员）
   * @param deleteRequest 删除请求
   * @returns 删除结果
   */
  @Post("delete")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async deleteUser(@Body() deleteRequest: { id: number }) {
    if (!deleteRequest || !deleteRequest.id || deleteRequest.id <= 0) {
      throw new Error("参数错误：用户ID不能为空或无效");
    }
    await this.usersService.deleteUser(deleteRequest.id);
    return {
      code: 0,
      data: true,
      message: "用户删除成功",
    };
  }

  /**
   * 分页获取用户封装列表（仅管理员）
   * @param userQueryDto 查询请求参数
   * @returns 用户分页列表
   */
  @Post("list/page/vo")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  async listUserVOByPage(@Body() userQueryDto: UserQueryDto) {
    if (!userQueryDto) {
      throw new Error('查询参数不能为空');
    }
    const result = await this.usersService.listUserVOByPage(userQueryDto);
    return {
      code: 0,
      data: result,
      message: "获取用户分页列表成功",
    };
  }
}
