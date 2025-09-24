import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';
import { env } from '../common/env';

@Injectable()
export class RabbitMQService implements OnModuleInit {
  private readonly log = new Logger(RabbitMQService.name);
  private channel?: amqp.Channel;

  async onModuleInit() {
    // robust retry supaya gak crash walau broker belum siap
    const maxAttempts = 30;
    let attempt = 0;

    while (!this.channel && attempt < maxAttempts) {
      attempt++;
      try {
        const conn = await amqp.connect(env.mqUrl);
        const ch = await conn.createChannel();
        await ch.assertExchange(env.notifyExchange, 'topic', { durable: true });
        await ch.assertQueue(env.notifyQueue, { durable: true });
        await ch.bindQueue(env.notifyQueue, env.notifyExchange, env.notifyRouting);

        this.channel = ch;
        this.log.log(`RabbitMQ ready ${env.mqUrl}`);
        break;
      } catch (err: any) {
        const msg = err?.message ?? String(err);
        this.log.error(`RabbitMQ connect fail (attempt ${attempt}): ${msg}`);
        // backoff 1s -> 2s -> 3s ...
        await new Promise((r) => setTimeout(r, attempt * 1000));
      }
    }

    if (!this.channel) {
      this.log.error('RabbitMQ channel not ready after retries. Will keep app running.');
    }
  }

  async publishNotification(payload: unknown) {
    if (!this.channel) {
      this.log.warn('publishNotification skipped: channel not ready');
      return;
    }
    const buf = Buffer.from(JSON.stringify(payload));
    this.channel.publish(env.notifyExchange, env.notifyRouting, buf, {
      contentType: 'application/json',
      persistent: true,
    });
  }
}
