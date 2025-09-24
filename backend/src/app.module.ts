import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { MessagesModule } from './messages/messages.module';
import { MongooseRootModule } from './database/mongoose.module';
import { RabbitMQModule } from './mq/rabbitmq.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MongooseRootModule,
        RabbitMQModule,
        AuthModule,
        ProfilesModule,
        MessagesModule,
    ],
})
export class AppModule {}
