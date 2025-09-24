import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Profile {
    @Prop({ type: Types.ObjectId, ref: 'User', unique: true, required: true })
    userId!: Types.ObjectId;

    @Prop() displayName?: string;
    @Prop() gender?: 'Male' | 'Female' | 'Other';
    @Prop() birthday?: Date;
    @Prop() horoscope?: string;    // auto
    @Prop() zodiac?: string;       // auto
    @Prop() height?: number;       // cm
    @Prop() weight?: number;       // kg
    @Prop({ type: [String], default: [] }) interests: string[] = [];
    @Prop() bio?: string;
    @Prop() avatarUrl?: string;
}
export type ProfileDocument = HydratedDocument<Profile>;
export const ProfileSchema = SchemaFactory.createForClass(Profile);
