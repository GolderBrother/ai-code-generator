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
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
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
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findUserById(id);
    return {
      code: 0,
      data: user,
      message: '获取用户成功',
    };
  }

  @Put(':id')
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
  @Roles('admin')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.deleteUser(id);
    return {
      code: 0,
      message: '用户删除成功',
    };
  }

  @Get()
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
