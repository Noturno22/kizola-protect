import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

const QUEUE_KEY = 'kizola_sync_queue';
const MAX_RETRIES = 3;

export type SyncOperationType = 'support_request' | 'housing_request' | 'finance_request' | 'finance_requests';

export interface QueuedOperation {
  id: string;
  type: SyncOperationType;
  data: Record<string, any>;
  createdAt: string;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
}

export interface SyncResult {
  synced: number;
  failed: number;
}

class SyncQueue {
  private queue: QueuedOperation[] = [];
  private isSyncing = false;

  async init(): Promise<void> {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    if (raw) {
      this.queue = JSON.parse(raw);
    }
  }

  async enqueue(type: SyncOperationType, data: Record<string, any>): Promise<QueuedOperation> {
    const op: QueuedOperation = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      data,
      createdAt: new Date().toISOString(),
      retryCount: 0,
      status: 'pending',
    };
    this.queue.push(op);
    await this.persist();
    return op;
  }

  async syncAll(): Promise<SyncResult> {
    if (this.isSyncing || !isSupabaseConfigured()) {
      return { synced: 0, failed: 0 };
    }
    this.isSyncing = true;
    let synced = 0;
    let failed = 0;

    const pending = this.queue.filter((o) => o.status === 'pending');

    for (const op of pending) {
      try {
        op.status = 'syncing';
        const { error } = await supabase.from(op.type).insert(op.data);
        if (error) throw error;
        op.status = 'completed';
        synced++;
      } catch {
        op.retryCount++;
        op.status = op.retryCount >= MAX_RETRIES ? 'failed' : 'pending';
        failed++;
      }
    }

    // Remove completed items
    this.queue = this.queue.filter((o) => o.status !== 'completed');
    await this.persist();
    this.isSyncing = false;
    return { synced, failed };
  }

  async getPendingCount(): Promise<number> {
    return this.queue.filter((o) => o.status === 'pending').length;
  }

  async getFailedItems(): Promise<QueuedOperation[]> {
    return this.queue.filter((o) => o.status === 'failed');
  }

  async retryFailed(id: string): Promise<void> {
    const op = this.queue.find((o) => o.id === id && o.status === 'failed');
    if (op) {
      op.status = 'pending';
      op.retryCount = 0;
      await this.persist();
    }
  }

  getQueueSnapshot(): QueuedOperation[] {
    return [...this.queue];
  }

  private async persist(): Promise<void> {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
  }
}

export const syncQueue = new SyncQueue();
