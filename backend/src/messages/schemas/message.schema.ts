import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Message {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true }) from: Types.ObjectId;
    @Prop({ type: Types.ObjectId, ref: 'User', required: true }) to: Types.ObjectId;
    @Prop({ required: true }) body: string;
    @Prop({ default: 'sent' }) status: 'sent' | 'delivered' | 'read';
}
export type MessageDocument = HydratedDocument<Message>;
export const MessageSchema = SchemaFactory.createForClass(Message);
