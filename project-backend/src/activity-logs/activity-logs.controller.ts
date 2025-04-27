// import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe } from '@nestjs/common';
// import { ActivityLogsService } from './activity-logs.service';
// import { CreateActivityLogDto } from './dto/create-activity-log.dto';
// import { UpdateActivityLogDto } from './dto/update-activity-log.dto';
// import { ActivityLog } from './entities/activity-log.entity';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { GetUser } from '../auth/get-user.decorator';
// import { User } from '../users/entities/user.entity';

// @Controller('activity-logs')
// @UseGuards(JwtAuthGuard)
// export class ActivityLogsController {
//   constructor(private readonly activityLogsService: ActivityLogsService) {}

//   @Post()
//   create(@Body() createActivityLogDto: CreateActivityLogDto, @GetUser() user: User): Promise<ActivityLog> {
//     return this.activityLogsService.create(user, createActivityLogDto);
//   }

//   @Get('me')
//   getMyLogs(@GetUser() user: User): Promise<ActivityLog[]> {
//     return this.activityLogsService.findByUser(user.id);
//   }

//   @Get()
//   getAllLogs(): Promise<ActivityLog[]> {
//     return this.activityLogsService.findAll();
//   }

//   @Get(':id')
//   findOne(@Param('id', ParseIntPipe) id: number): Promise<ActivityLog> {
//     return this.activityLogsService.findOne(id);
//   }

//   @Patch(':id')
//   update(
//     @Param('id', ParseIntPipe) id: number,
//     @Body() updateActivityLogDto: UpdateActivityLogDto,
//   ): Promise<ActivityLog> {
//     return this.activityLogsService.update(id, updateActivityLogDto);
//   }

//   @Delete(':id')
//   remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
//     return this.activityLogsService.remove(id);
//   }
// }