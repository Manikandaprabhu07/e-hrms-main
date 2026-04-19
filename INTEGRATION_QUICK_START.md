# Quick Integration Steps

## 🔴 Backend Configuration

### Step 1: Install Socket.IO Dependencies

```bash
cd backend
npm install socket.io @nestjs/websockets @nestjs/platform-socket.io --save
```

### Step 2: Update app.module.ts

The modules are already configured. Ensure your `app.module.ts` imports these:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Import all modules including Messages and Notifications
import { MessagesModule } from './messages/messages.module';
import { NotificationsModule } from './notifications/notifications.module';
// ... other modules

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      // ... your config
    }),
    MessagesModule,      // Already includes ChatGateway
    NotificationsModule, // Already includes NotificationsGateway
    // ... other modules
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### Step 3: Configure CORS in main.ts

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for WebSocket
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(3000);
  console.log('NestJS app running on http://localhost:3000');
}

bootstrap();
```

---

## 🔵 Frontend Configuration

### Step 1: Install Socket.IO Client

```bash
npm install socket.io-client
```

### Step 2: Add Socket Service to App Config

In `src/app/app.config.ts`:

```typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { SocketService } from './core/services/socket.service';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([])),
    SocketService, // Add Socket Service
    // ... other providers
  ],
};
```

### Step 3: Update App Routes

In `src/app/app.routes.ts`:

```typescript
import { Routes } from '@angular/router';
import { ChatComponent } from './features/chat/chat.component';
import { NotificationsComponent } from './features/notifications/notifications.component';

export const appRoutes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      {
        path: 'notifications',
        component: NotificationsComponent,
      },
    ],
  },
  {
    path: 'chat/:conversationId/:recipientId',
    component: ChatComponent,
  },
  // ... other routes
];
```

### Step 4: Environment Configuration

Update `environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  wsUrl: 'http://localhost:3000', // WebSocket Server URL
};
```

Update Socket Service to use environment:

```typescript
// In socket.service.ts
import { environment } from '../../../environments/environment';

connectChat(url?: string): void {
  if (this.chatSocket?.connected) return;
  const socketUrl = url || environment.wsUrl;
  // ... rest of connection code
}
```

---

## 🎯 Usage in Dashboard Component

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { SocketService } from '@core/services/socket.service';
import { NotificationsComponent } from '../notifications/notifications.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NotificationsComponent, /* ... */],
  template: `
    <div class="dashboard">
      <header class="navbar">
        <h1>Dashboard</h1>
        <div class="navbar-right">
          <app-notifications></app-notifications>
          <!-- Other navbar items -->
        </div>
      </header>

      <main>
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  private socketService = inject(SocketService);

  ngOnInit() {
    // Connect to real-time systems
    this.socketService.connectChat();
    this.socketService.connectNotifications();
  }
}
```

---

## 🔔 Sending Notifications from Backend

### Example 1: When Employee is Added

```typescript
// In employees.service.ts
async create(employeeData: Partial<Employee>): Promise<Employee> {
  const employee = await this.employeesRepository.save(employeeData);
  
  // Notify all HR users
  const hrUsers = await this.usersService.findUsersByRoleName('HR');
  
  await this.notificationsService.createForUsers({
    userIds: hrUsers.map(u => u.id),
    type: 'new_employee',
    title: 'New Employee Added',
    message: `${employee.firstName} ${employee.lastName} has been added`,
    link: '/employees',
  });

  return employee;
}
```

### Example 2: When Delete Request is Received

```typescript
// In employees.service.ts
async requestDeletion(employeeId: string): Promise<void> {
  // ... deletion logic
  
  // Notify admins
  const admins = await this.usersService.findUsersByRoleName('ADMIN');
  
  await this.notificationsService.createForUsers({
    userIds: admins.map(u => u.id),
    type: 'delete_request',
    title: 'Delete Request',
    message: `Employee ${employeeId} requested account deletion`,
    link: '/approvals',
    meta: { employeeId },
  });
}
```

### Example 3: When Password Reset is Requested

```typescript
// In auth.service.ts
async requestPasswordReset(email: string): Promise<void> {
  // ... reset logic
  
  const user = await this.usersService.findOneByEmail(email);
  
  await this.notificationsService.createForUser({
    userId: user.id,
    type: 'password_reset',
    title: 'Password Reset',
    message: 'You requested a password reset. Check your email for instructions.',
    link: '/reset-password',
  });
}
```

---

## 🛠️ Testing WebSocket Connection

### Backend Test (NestJS)
```bash
# Open a REST client (Postman, Insomnia, etc) and test via WebSocket

# Connect with:
# URL: ws://localhost:3000/chat
# Auth Header: Bearer <JWT_TOKEN>
```

### Frontend Test
```typescript
// In browser console
const socket = io('http://localhost:3000/chat', {
  auth: { token: localStorage.getItem('token') }
});

socket.on('connect', () => console.log('Connected!'));
socket.on('disconnect', () => console.log('Disconnected!'));
socket.on('newMessage', (msg) => console.log('Message:', msg));
```

---

## ✅ Verification Checklist

- [ ] Socket.IO packages installed
- [ ] Backend running on port 3000
- [ ] Frontend running on port 4200
- [ ] CORS configured correctly
- [ ] JWT tokens generating correctly
- [ ] Chat gateway connected
- [ ] Notifications gateway connected
- [ ] Database tables created
- [ ] Components rendering correctly
- [ ] WebSocket events flowing both ways

---

## 🐛 Troubleshooting

### WebSocket Connection Fails
- Check CORS configuration
- Verify JWT token is valid
- Ensure backend is running
- Check browser console for errors

### Messages Not Appearing
- Verify recipient ID is correct
- Check message status in database
- Confirm socket is connected
- Check network tab in DevTools

### Notifications Not Showing
- Check unread count via socket event
- Verify notification data in database
- Confirm user ID is correct
- Check socket connection status

---

## 📞 Support

For issues or questions, check:
1. Backend logs: `console.log()` in gateway classes
2. Browser console: DevTools > Console tab
3. Network tab: WebSocket connections
4. Database: Check messages and notifications tables

