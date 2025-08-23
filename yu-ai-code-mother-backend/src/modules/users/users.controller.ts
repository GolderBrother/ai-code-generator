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
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { RegisterDto } from '../auth/dto/register.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 公开测试接口 - 不需要认证
  @Get('test/public')
  async testPublic() {
    return {
      code: 0,
      data: {
        message: '这是一个公开的测试接口',
        timestamp: new Date().toISOString(),
        status: 'success',
        endpoint: '/api/users/test/public'
      },
      message: '公开测试接口调用成功',
    };
  }

  // 需要登录的测试接口 - 需要JWT认证
  @Get('test/auth')
  @UseGuards(JwtAuthGuard)
  async testAuth(@CurrentUser() user) {
    return {
      code: 0,
      data: {
        message: '这是一个需要认证的测试接口',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles
        },
        timestamp: new Date().toISOString(),
        status: 'authenticated',
        endpoint: '/api/users/test/auth'
      },
      message: '认证测试接口调用成功',
    };
  }

  // 需要用户权限的测试接口
  @Get('test/user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('user', 'admin')
  async testUserRole(@CurrentUser() user) {
    return {
      code: 0,
      data: {
        message: '这是一个需要用户权限的测试接口',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles
        },
        timestamp: new Date().toISOString(),
        status: 'user_authorized',
        endpoint: '/api/users/test/user'
      },
      message: '用户权限测试接口调用成功',
    };
  }

  // 需要管理员权限的测试接口
  @Get('test/admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async testAdminRole(@CurrentUser() user) {
    return {
      code: 0,
      data: {
        message: '这是一个需要管理员权限的测试接口',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles
        },
        timestamp: new Date().toISOString(),
        status: 'admin_authorized',
        endpoint: '/api/users/test/admin'
      },
      message: '管理员权限测试接口调用成功',
    };
  }

  // ========== 核心业务接口 ==========
  
  // 用户注册 - 公开接口
  @Post('register')
  async userRegister(@Body() registerDto: RegisterDto) {
    const result = await this.usersService.userRegister(registerDto);
    return {
      code: 0,
      data: result,
      message: '用户注册成功',
    };
  }

  // 用户登录 - 公开接口
  @Post('login')
  async userLogin(@Body() loginDto: LoginDto) {
    const result = await this.usersService.userLogin(loginDto);
    return {
      code: 0,
      data: result,
      message: '用户登录成功',
    };
  }

  // 获取当前登录用户信息
  @Get('get/login')
  @UseGuards(JwtAuthGuard)
  async getLoginUser(@CurrentUser() user) {
    const userInfo = await this.usersService.getLoginUserVO(user);
    return {
      code: 0,
      data: userInfo,
      message: '获取登录用户信息成功',
    };
  }

  // 用户注销
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async userLogout(@CurrentUser() user) {
    const result = await this.usersService.userLogout(user.id);
    return {
      code: 0,
      data: result,
      message: '用户注销成功',
    };
  }

  // 根据ID获取用户VO（脱敏后的用户信息）
  @Get('get/vo/:id')
  async getUserVOById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findUserById(id);
    const userVO = await this.usersService.getUserVO(user);
    return {
      code: 0,
      data: userVO,
      message: '获取用户信息成功',
    };
  }

  // 分页获取用户列表（仅管理员）
  @Post('list/page/vo')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async listUserVOByPage(@Body() userQueryDto: UserQueryDto) {
    const result = await this.usersService.listUserVOByPage(userQueryDto);
    return {
      code: 0,
      data: result,
      message: '获取用户分页列表成功',
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.createUser(createUserDto);
    return {
      code: 0,
      data: user,
      message: '用户创建成功',
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findUserById(id);
    return {
      code: 0,
      data: user,
      message: '获取用户成功',
    };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.usersService.updateUser(id, updateUserDto);
    return {
      code: 0,
      data: user,
      message: '用户更新成功',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.deleteUser(id);
    return {
      code: 0,
      message: '用户删除成功',
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllUsers(@Query() query: UserQueryDto) {
    const users = await this.usersService.findAllUsers();
    return {
      code: 0,
      data: {
        records: users,
        total: users.length,
        size: users.length,
        current: 1,
      },
      message: '获取用户列表成功',
    };
  }

  @Get('role/:role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getUsersByRole(@Param('role') role: string) {
    const users = await this.usersService.findUsersByRole(role);
    return {
      code: 0,
      data: users,
      message: '获取用户列表成功',
    };
  }
}
