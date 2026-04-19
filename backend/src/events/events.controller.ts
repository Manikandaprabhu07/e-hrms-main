import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { EventsService } from './events.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  @Roles('EMPLOYEE', 'SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR')
  @Permissions('events.read')
  getUpcomingEvents() {
    return this.eventsService.findUpcoming();
  }

  @Post()
  @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR')
  @Permissions('events.write')
  createEvent(@Body() eventData: { title: string; description?: string; date: string }) {
    return this.eventsService.create(eventData);
  }

  @Put(':id')
  @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR')
  @Permissions('events.write')
  updateEvent(
    @Param('id') id: string,
    @Body() eventData: { title?: string; description?: string; date?: string },
  ) {
    return this.eventsService.update(id, eventData);
  }

  @Delete(':id')
  @Roles('SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN', 'HR')
  @Permissions('events.delete')
  deleteEvent(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
