import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true })
export class User {
    @Prop({ unique: true, required: true })
    email: string;

    @Prop({ unique: true, required: true })
    username: string;

    @Prop({ required: true })
    passwordHash: string;
}
export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
