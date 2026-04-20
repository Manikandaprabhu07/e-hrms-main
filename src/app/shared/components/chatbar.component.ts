import {
  Component, ChangeDetectionStrategy, OnInit, OnDestroy, inject, signal, computed, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, ChatbarService, EmployeeService } from '../../core/services';
import { SocketService } from '../../core/services/socket.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-chatbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chatbar" [class.open]="open()">
      <!-- Header -->
      <div class="chatbar-header">
        <div class="title">
          <div class="name">Inbox</div>
          <div class="meta">
            <span class="pill">Notifications: {{ unreadNotifications() }}</span>
            <span class="pill">Messages: {{ overview().unreadMessages }}</span>
          </div>
        </div>
        <button class="icon-btn" (click)="toggle()">×</button>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab" [class.active]="tab() === 'notifications'" (click)="setTab('notifications')">
          Notifications
          @if (unreadNotifications() > 0) {
            <span class="tab-badge">{{ unreadNotifications() }}</span>
          }
        </button>
        <button class="tab" [class.active]="tab() === 'messages'" (click)="setTab('messages')">
          Messages
          @if (overview().unreadMessages > 0) {
            <span class="tab-badge">{{ overview().unreadMessages }}</span>
          }
        </button>
      </div>

      <!-- Notifications Panel -->
      @if (tab() === 'notifications') {
        <div class="panel">
          <div class="panel-actions">
            <button class="btn" (click)="markAllRead()">Mark all read</button>
            <button class="btn" (click)="loadNotifications()">Refresh</button>
          </div>
          @if (loading()) {
            <p class="muted">Loading...</p>
          } @else if (notifications().length === 0) {
            <p class="muted">No notifications.</p>
          } @else {
            <div class="list">
              @for (n of notifications(); track n.id) {
                <div class="item" [class.unread]="!n.isRead" (click)="openNotification(n)">
                  <div class="item-top">
                    <span class="notif-icon">{{ notifIcon(n.type) }}</span>
                    <div class="item-title">{{ n.title }}</div>
                    <div class="item-time">{{ formatTime(n.createdAt) }}</div>
                  </div>
                  <div class="item-body">{{ n.message }}</div>
                </div>
              }
            </div>
          }
        </div>
      } @else {

        <!-- Messages Panel -->
        <div class="panel">
          @if (conversationId() === null) {
            <div class="muted">
              @if (isAdmin()) {
                <p>Start a conversation with an employee.</p>
                <div class="admin-start">
                  <select [(ngModel)]="selectedEmployeeId">
                    <option value="">Select employee</option>
                    @for (emp of employees(); track emp.id) {
                      <option [value]="emp.id">{{ emp.employeeId }} - {{ emp.firstName }} {{ emp.lastName }}</option>
                    }
                  </select>
                  <button class="btn primary" (click)="startAdminConversation()" [disabled]="!selectedEmployeeId">Start</button>
                </div>
              } @else {
                <p>Open your conversation with Admin.</p>
                <button class="btn primary" (click)="startConversation()">Start Conversation</button>
              }
            </div>
          } @else {
            <div class="messages">
              @if (isAdmin() && conversations().length > 0) {
                <div class="admin-select">
                  <label>Conversation</label>
                  <select [(ngModel)]="selectedConversationId" (ngModelChange)="onSelectConversation($event)">
                    @for (c of conversations(); track c.id) {
                      <option [value]="c.id">
                        {{ c.unreadCount > 0 ? '(' + c.unreadCount + ') ' : '' }}{{ c.title || c.id }}
                      </option>
                    }
                  </select>
                </div>
              }

              <!-- Online status + typing indicator -->
              <div class="chat-status">
                <span class="status-dot" [class.online]="recipientOnline()"></span>
                <span class="status-text">
                  {{ typingIndicator() ? 'typing...' : (recipientOnline() ? 'Online' : 'Offline') }}
                </span>
              </div>

              @if (msgLoading()) {
                <p class="muted">Loading messages...</p>
              } @else {
                <div class="msg-list" #msgList>
                  @for (m of messages(); track m.id) {
                    <div class="msg" [class.mine]="m.senderUserId === myUserId()">
                      <div class="sender">{{ senderLabel(m) }}</div>
                      <div class="bubble">
                        {{ m.content }}
                        @if (m.fileUrl) {
                          <a [href]="m.fileUrl" target="_blank" class="file-link">📎 {{ m.fileName || 'Attachment' }}</a>
                        }
                      </div>
                      <div class="msg-footer">
                        <span class="msg-time">{{ formatTime(m.createdAt) }}</span>
                        @if (m.senderUserId === myUserId()) {
                          <span class="tick" [class.seen]="m.status === 'seen'" [class.delivered]="m.status === 'delivered'">
                            {{ m.status === 'seen' ? '✓✓' : (m.status === 'delivered' ? '✓✓' : '✓') }}
                          </span>
                        }
                      </div>
                    </div>
                  }
                </div>
              }

              <!-- File preview -->
              @if (filePreview()) {
                <div class="file-preview">
                  <span>📎 {{ filePreview() }}</span>
                  <button class="icon-btn small" (click)="clearFile()">×</button>
                </div>
              }

              <div class="composer">
                <label class="attach-btn" title="Attach file">
                  📎
                  <input type="file" accept="image/*,.pdf" (change)="onFileSelect($event)" hidden />
                </label>
                <input [(ngModel)]="draft" placeholder="Type a message..."
                  (keydown.enter)="send()"
                  (input)="onTyping()"
                />
                <button class="btn primary" (click)="send()" [disabled]="sending()">Send</button>
              </div>
            </div>
          }
        </div>
      }
    </div>
    <div class="backdrop" *ngIf="open()" (click)="toggle()"></div>
  `,
  styles: [`
    .chatbar {
      position: fixed; top: 0; right: -400px; width: 400px; height: 100vh;
      background: var(--surface-glass-strong); backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px); border-left: 1px solid var(--border-soft);
      box-shadow: -10px 0 40px var(--shadow-strong); z-index: 300;
      transition: right 0.25s ease; display: flex; flex-direction: column;
    }
    .chatbar.open { right: 0; }
    .backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.25); z-index: 250; }
    .chatbar-header { display: flex; justify-content: space-between; align-items: center; padding: 14px; border-bottom: 1px solid var(--border-soft); }
    .name { font-weight: 800; font-size: 16px; color: var(--text-primary); }
    .meta { margin-top: 6px; display: flex; gap: 8px; }
    .pill { font-size: 11px; font-weight: 700; color: var(--text-secondary); background: var(--surface-subtle); padding: 3px 8px; border-radius: 999px; }
    .icon-btn { border: none; background: transparent; font-size: 22px; cursor: pointer; color: var(--text-secondary); }
    .icon-btn.small { font-size: 14px; }
    .tabs { display: grid; grid-template-columns: 1fr 1fr; border-bottom: 1px solid var(--border-soft); }
    .tab { position: relative; padding: 10px 12px; background: transparent; border: none; cursor: pointer; font-weight: 800; color: var(--text-secondary); }
    .tab.active { color: var(--text-primary); background: rgba(37,99,235,0.08); }
    .tab-badge { position: absolute; top: 4px; right: 6px; min-width: 16px; height: 16px; padding: 0 4px; background: #ef4444; color: #fff; font-size: 10px; font-weight: 700; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; }
    .panel { padding: 12px; overflow: auto; flex: 1; display: flex; flex-direction: column; }
    .panel-actions { display: flex; gap: 8px; margin-bottom: 10px; }
    .btn { border: 1px solid var(--border-soft); background: var(--surface-subtle); padding: 7px 10px; border-radius: 10px; cursor: pointer; font-weight: 800; font-size: 12px; color: var(--text-primary); }
    .btn.primary { background: #2563eb; border-color: #2563eb; color: #fff; }
    .btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .muted { color: var(--text-muted); font-size: 13px; }
    .list { display: flex; flex-direction: column; gap: 10px; }
    .item { border: 1px solid var(--border-soft); background: var(--surface-subtle); border-radius: 12px; padding: 10px; cursor: pointer; transition: background 0.15s; }
    .item:hover { background: var(--surface-hover); }
    .item.unread { border-color: rgba(37,99,235,0.45); background: rgba(37,99,235,0.06); }
    .item-top { display: flex; align-items: center; gap: 6px; }
    .notif-icon { font-size: 14px; }
    .item-title { flex: 1; font-weight: 900; font-size: 13px; color: var(--text-primary); }
    .item-time { font-size: 11px; color: var(--text-muted); white-space: nowrap; }
    .item-body { margin-top: 5px; font-size: 12px; color: var(--text-secondary); }
    .messages { display: flex; flex-direction: column; flex: 1; min-height: 0; }
    .chat-status { display: flex; align-items: center; gap: 6px; padding: 6px 0; margin-bottom: 4px; }
    .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #9ca3af; }
    .status-dot.online { background: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,0.5); }
    .status-text { font-size: 12px; color: var(--text-muted); font-weight: 600; font-style: italic; }
    .msg-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 8px; padding: 4px 2px 8px; min-height: 0; max-height: calc(100vh - 340px); }
    .msg { display: flex; flex-direction: column; align-items: flex-start; }
    .msg.mine { align-items: flex-end; }
    .sender { font-size: 11px; font-weight: 700; color: var(--text-muted); margin-bottom: 2px; }
    .bubble { max-width: 90%; background: var(--surface-subtle); padding: 9px 12px; border-radius: 14px; font-size: 13px; color: var(--text-primary); border: 1px solid var(--border-soft); word-break: break-word; }
    .msg.mine .bubble { background: rgba(37,99,235,0.12); border-color: rgba(37,99,235,0.25); }
    .file-link { display: block; margin-top: 4px; color: #2563eb; font-size: 12px; text-decoration: underline; }
    .msg-footer { display: flex; align-items: center; gap: 5px; margin-top: 3px; }
    .msg-time { font-size: 11px; color: var(--text-muted); }
    .tick { font-size: 12px; color: #9ca3af; }
    .tick.delivered { color: #9ca3af; }
    .tick.seen { color: #2563eb; }
    .file-preview { display: flex; align-items: center; gap: 8px; padding: 6px 10px; background: var(--surface-subtle); border-radius: 10px; border: 1px solid var(--border-soft); margin-bottom: 6px; font-size: 12px; color: var(--text-secondary); }
    .composer { display: flex; gap: 8px; margin-top: 8px; align-items: center; }
    .attach-btn { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border-radius: 10px; cursor: pointer; background: var(--surface-subtle); border: 1px solid var(--border-soft); font-size: 14px; }
    .composer input { flex: 1; padding: 9px 12px; border-radius: 12px; border: 1px solid var(--border-soft); outline: none; background: var(--surface-glass-strong); font-size: 13px; color: var(--text-primary); }
    .admin-select { display: flex; flex-direction: column; gap: 4px; margin-bottom: 8px; padding: 8px 10px; border: 1px solid var(--border-soft); border-radius: 12px; background: var(--surface-subtle); }
    .admin-select label { font-size: 11px; font-weight: 900; color: var(--text-muted); }
    .admin-select select, .admin-start select { flex: 1; padding: 9px 10px; border-radius: 12px; border: 1px solid var(--border-soft); background: var(--surface-glass-strong); outline: none; font-size: 12px; color: var(--text-primary); }
    .admin-start { display: flex; gap: 8px; margin-top: 10px; align-items: center; }
  `],
})
export class ChatbarComponent implements OnInit, OnDestroy {
  private chatbarService = inject(ChatbarService);
  private authService = inject(AuthService);
  private employeeService = inject(EmployeeService);
  private socketService = inject(SocketService);
  private zone = inject(NgZone);
  private destroy$ = new Subject<void>();
  private typingTimeout: any;
  private selectedFile: File | null = null;

  open = this.chatbarService.isOpen;
  tab = signal<'notifications' | 'messages'>('notifications');
  overview = this.chatbarService.overview;
  loading = signal(false);
  notifications = signal<any[]>([]);
  conversationId = signal<string | null>(null);
  conversations = signal<any[]>([]);
  employees = signal<any[]>([]);
  selectedEmployeeId = '';
  selectedConversationId: string | null = null;
  msgLoading = signal(false);
  messages = signal<any[]>([]);
  draft = '';
  sending = signal(false);
  filePreview = signal<string | null>(null);
  typingIndicator = signal(false);
  recipientOnline = signal(false);

  myUserId = computed(() => this.authService.user()?.id || '');
  isAdmin = computed(() => this.authService.hasAnyRole(['SUPER_ADMIN', 'SUB_ADMIN', 'ADMIN']));
  unreadNotifications = computed(() => this.overview().unreadNotifications || 0);

  private get recipientId(): string {
    const convs = this.conversations();
    const cid = this.conversationId();
    const conv = convs.find((c: any) => c.id === cid);
    if (!conv) return '';
    return this.isAdmin() ? conv.employeeUserId : conv.adminUserId;
  }

  ngOnInit(): void {
    void this.loadNotifications();
    void this.chatbarService.loadOverview();

    // ── Real-time: new incoming messages ──────────────────────────
    this.socketService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe((msgs) => {
        const cid = this.conversationId();
        const relevant = msgs.filter((m: any) => m.conversationId === cid);
        if (!relevant.length) return;

        // Merge without duplicates
        this.zone.run(() => {
          const current = this.messages();
          const ids = new Set(current.map((m: any) => m.id));
          const fresh = relevant.filter((m: any) => !ids.has(m.id));
          if (fresh.length) {
            this.messages.set([...current, ...fresh]);
            this.scrollToBottom();
            // Auto-mark as read
            fresh.forEach((m: any) => {
              if (m.senderUserId !== this.myUserId()) {
                this.socketService.markMessageAsRead(m.id, m.conversationId, m.senderUserId);
              }
            });
          }
        });
      });

    // ── Real-time: typing indicator ───────────────────────────────
    this.socketService.typingUsers$
      .pipe(takeUntil(this.destroy$))
      .subscribe((typingSet) => {
        const rid = this.recipientId;
        this.zone.run(() => this.typingIndicator.set(typingSet.has(rid)));
      });

    // ── Real-time: online/offline status ─────────────────────────
    this.socketService.userStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe((statusMap) => {
        const rid = this.recipientId;
        if (rid) this.zone.run(() => this.recipientOnline.set(statusMap.get(rid) === true));
      });

    // ── Real-time: seen status updates ───────────────────────────
    this.socketService.messages$
      .pipe(takeUntil(this.destroy$))
      .subscribe((msgs) => {
        this.zone.run(() => {
          const cur = this.messages();
          let changed = false;
          const updated = cur.map((m: any) => {
            const fresh = msgs.find((f: any) => f.id === m.id);
            if (fresh && fresh.status !== m.status) { changed = true; return { ...m, status: fresh.status }; }
            return m;
          });
          if (changed) this.messages.set(updated);
        });
      });

    // ── Real-time: live notifications from WS ────────────────────
    this.socketService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((wsNotifs) => {
        if (!wsNotifs.length) return;
        this.zone.run(() => {
          const cur = this.notifications();
          const ids = new Set(cur.map((n: any) => n.id));
          const fresh = wsNotifs.filter((n: any) => !ids.has(n.id));
          if (fresh.length) this.notifications.set([...fresh, ...cur]);
        });
      });

    void this.ensureConversationLoaded();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggle(): void {
    this.chatbarService.toggle();
    if (this.open()) {
      void this.loadNotifications();
      void this.ensureConversationLoaded();
      void this.chatbarService.loadOverview();
    }
  }

  setTab(t: 'notifications' | 'messages'): void {
    this.tab.set(t);
    if (this.open()) {
      if (t === 'notifications') void this.loadNotifications();
      else void this.ensureConversationLoaded();
    }
  }

  async loadNotifications(): Promise<void> {
    try {
      this.loading.set(true);
      const list = await this.chatbarService.getMyNotifications();
      this.notifications.set(list || []);
    } finally {
      this.loading.set(false);
    }
  }

  async markAllRead(): Promise<void> {
    await this.chatbarService.markAllNotificationsRead();
    this.socketService.markNotificationAsRead('all'); // triggers WS
    await this.loadNotifications();
    await this.chatbarService.loadOverview();
  }

  async openNotification(n: any): Promise<void> {
    if (!n.isRead) {
      await this.chatbarService.markNotificationRead(n.id);
      this.socketService.markNotificationAsRead(n.id);
      await this.chatbarService.loadOverview();
      this.notifications.set(this.notifications().map((x) => x.id === n.id ? { ...x, isRead: true } : x));
    }
  }

  async startConversation(): Promise<void> {
    const conv = await this.chatbarService.startMyConversation();
    this.conversationId.set(conv?.id || null);
    this.selectedConversationId = conv?.id || null;
    await this.loadMessages();
  }

  private async ensureConversationLoaded(): Promise<void> {
    if (this.conversationId()) return;
    if (this.isAdmin()) {
      await this.loadAdminLists();
      const first = (this.conversations() || [])[0];
      if (first?.id) {
        this.conversationId.set(first.id);
        this.selectedConversationId = first.id;
        await this.loadMessages();
      }
      return;
    }
    const conv = await this.chatbarService.startMyConversation();
    this.conversationId.set(conv?.id || null);
    this.selectedConversationId = conv?.id || null;
    await this.loadMessages();
  }

  private async loadAdminLists(): Promise<void> {
    const convs = await this.chatbarService.getMyConversations();
    this.conversations.set(convs || []);
    if (!this.selectedConversationId && convs?.length) this.selectedConversationId = convs[0].id;
    await this.employeeService.getEmployees({ pageNumber: 1, pageSize: 1000 });
    this.employees.set(this.employeeService.employees() || []);
  }

  async startAdminConversation(): Promise<void> {
    if (!this.selectedEmployeeId) return;
    const conv = await this.chatbarService.startConversationForEmployee(this.selectedEmployeeId);
    this.conversationId.set(conv?.id || null);
    this.selectedConversationId = conv?.id || null;
    await this.loadAdminLists();
    await this.loadMessages();
  }

  onSelectConversation(id: string): void {
    if (!id) return;
    this.conversationId.set(id);
    this.selectedConversationId = id;
    void this.loadMessages();
  }

  onTyping(): void {
    const cid = this.conversationId();
    const rid = this.recipientId;
    if (cid && rid) this.socketService.startTyping(cid, rid);
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      if (cid && rid) this.socketService.stopTyping(cid, rid);
    }, 2500);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    this.selectedFile = file;
    this.filePreview.set(file.name);
  }

  clearFile(): void {
    this.selectedFile = null;
    this.filePreview.set(null);
  }

  senderLabel(m: any): string {
    if (m?.senderUserId === this.myUserId()) return 'You';
    if (this.isAdmin()) {
      const conv = (this.conversations() || []).find((c: any) => c.id === this.conversationId());
      return conv?.employee?.name || conv?.title || 'Employee';
    }
    return 'Admin';
  }

  private async loadMessages(): Promise<void> {
    const id = this.conversationId();
    if (!id) return;
    try {
      this.msgLoading.set(true);
      const msgs = await this.chatbarService.getConversationMessages(id);
      this.messages.set(msgs || []);
      await this.chatbarService.markConversationRead(id);
      await this.chatbarService.loadOverview();
      this.scrollToBottom();
    } finally {
      this.msgLoading.set(false);
    }
  }

  async send(): Promise<void> {
    const id = this.conversationId();
    const text = String(this.draft || '').trim();
    if (!id || !text) return;
    try {
      this.sending.set(true);
      const rid = this.recipientId;
      // Optimistic message
      const optimistic: any = {
        id: 'pending-' + Date.now(),
        senderUserId: this.myUserId(),
        content: text,
        conversationId: id,
        status: 'sent',
        createdAt: new Date().toISOString(),
      };
      this.messages.set([...this.messages(), optimistic]);
      this.scrollToBottom();

      if (rid && this.socketService['chatSocket']?.connected) {
        // Fast path: send via WebSocket
        this.socketService.sendMessage(id, text, rid);
      } else {
        // Fallback: REST
        await this.chatbarService.sendMessage(id, text);
      }
      this.draft = '';
      this.clearFile();
      if (rid) this.socketService.stopTyping(id, rid);
      await this.chatbarService.loadOverview();
    } finally {
      this.sending.set(false);
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = document.querySelector('.msg-list');
      if (el) el.scrollTop = el.scrollHeight;
    }, 30);
  }

  notifIcon(type: string): string {
    const icons: Record<string, string> = {
      message: '💬', approval: '✅', new_employee: '👤',
      delete_request: '🗑️', password_reset: '🔑', system: '🔔',
    };
    return icons[type] || '🔔';
  }

  formatTime(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString();
  }
}
