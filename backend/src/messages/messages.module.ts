import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from './schemas/message.schema';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { AuthModule } from '../auth/auth.module';
import { User, UserSchema } from '../auth/schemas/user.schema';

@Module({
    imports: [
        AuthModule,
        MongooseModule.forFeature([
        { name: Message.name, schema: MessageSchema },
        { name: User.name, schema: UserSchema }, // untuk lookup username/email
        ]),
    ],
    controllers: [MessagesController],
    providers: [MessagesService],
})
export class MessagesModule {}
