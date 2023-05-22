import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Users } from '../user/user.service';

@Module({
	providers: [ChatGateway, ChatService, Users],
})
export class ChatModule {}
