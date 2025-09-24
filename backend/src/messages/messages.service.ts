import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message } from './schemas/message.schema';
import { RabbitMQService } from '../mq/rabbitmq.service';
import { User } from '../auth/schemas/user.schema';

@Injectable()
export class MessagesService {
    constructor(
        @InjectModel('Message') private msgModel: Model<Message>,
        @InjectModel('User') private userModel: Model<User>,
        private mq: RabbitMQService,
    ) {}

    /** helper: terima username/email atau ObjectId string -> balikin ObjectId */
    private async resolveUserId(identifier: string): Promise<Types.ObjectId> {
        // kalau sudah ObjectId valid, langsung pakai
        if (/^[0-9a-fA-F]{24}$/.test(identifier)) return new Types.ObjectId(identifier);

        const user = await this.userModel
        .findOne({ $or: [{ username: identifier }, { email: identifier }] }, { _id: 1 })
        .lean();

        if (!user) throw new NotFoundException('User not found');
        return new Types.ObjectId(user._id);
    }

    /** Kirim pesan: penerima boleh username/email atau ObjectId */
    async sendByUserIdentifier(from: Types.ObjectId, toIdentifier: string, body: string) {
        const to = await this.resolveUserId(toIdentifier);
        const msg = await this.msgModel.create({ from, to, body });
        await this.mq.publishNotification({ type: 'NEW_MESSAGE', messageId: String(msg._id), to: String(to) });
        return msg;
    }

    /** List pesan dengan lawan chat: lawan boleh username/email atau ObjectId */
    async listByUserIdentifier(a: Types.ObjectId, peerIdentifier: string, cursor?: string, limit = 50) {
        const b = await this.resolveUserId(peerIdentifier);
        const query: any = { $or: [{ from: a, to: b }, { from: b, to: a }] };
        if (cursor) query._id = { $lt: new Types.ObjectId(cursor) };
        return this.msgModel.find(query).sort({ _id: -1 }).limit(limit);
    }
}
