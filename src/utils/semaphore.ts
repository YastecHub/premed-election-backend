export class Semaphore {
  private permits: number;
  private waiters: Array<() => void> = [];
  constructor(count: number) { this.permits = count; }
  async acquire() {
    if (this.permits > 0) { this.permits -= 1; return; }
    await new Promise<void>(res => this.waiters.push(res));
    this.permits -= 1;
  }
  release() {
    this.permits += 1;
    const next = this.waiters.shift();
    if (next) next();
  }
}
