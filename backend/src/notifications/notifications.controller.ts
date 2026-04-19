import { Body, Controller, Get, Patch, Param, Request, Post, BadRequestException, Sse, MessageEvent } from '@nestjs/common';
import { fromEvent, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Roles } from '../auth/decorators/roles.decorator';
import { NotificationsService } from './notifications.service';
import { UsersService } from '../users/users.service';

@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly usersService: UsersService,
  ) { }

  @Get('my')
  @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'EMPLOYEE')
  my(@Request() req: any) {
    return this.notificationsService.getMy(req.user.id);
  }

  @Get('my/unread-count')
  @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'EMPLOYEE')
  async unreadCount(@Request() req: any) {
    return { count: await this.notificationsService.unreadCount(req.user.id) };
  }
 
  @Sse('stream')
  @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'EMPLOYEE')
  stream(@Request() req: any): Observable<MessageEvent> {
    return fromEvent<any>(this.notificationsService.events, 'notification').pipe(
      filter((payload) => payload?.userId === req.user.id),
      map((payload) => ({ data: payload }))
    );
  }

  @Patch('my/read-all')
  @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'EMPLOYEE')
  async readAll(@Request() req: any) {
    await this.notificationsService.markAllRead(req.user.id);
    return { ok: true };
  }

  @Patch(':id/read')
  @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'EMPLOYEE')
  async readOne(@Request() req: any, @Param('id') id: string) {
    await this.notificationsService.markRead(req.user.id, id);
    return { ok: true };
  }

  @Post()
  @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN')
  async create(@Body() body: any) {
    // Support:
    // 1) { userId, title, message, type?, link? }
    // 2) { email, title, message, ... } (resolve userId)
    // 3) { userIds: [...], title, message, ... }
    if (body.userIds?.length) {
      await this.notificationsService.createForUsers({
        userIds: body.userIds,
        type: body.type,
        title: body.title,
        message: body.message,
        link: body.link,
        meta: body.meta,
      });
      return { ok: true };
    }

    let userId = body.userId;
    if (!userId && body.email) {
      const u = await this.usersService.findOneByEmail(String(body.email));
      userId = u?.id;
    }
    if (!userId) {
      throw new BadRequestException('userId (or userIds/email) is required');
    }

    return this.notificationsService.createForUser({
      userId,
      type: body.type,
      title: body.title,
      message: body.message,
      link: body.link,
      meta: body.meta,
    });
  }
}
