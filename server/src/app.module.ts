import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './Games_db/game.module';
import { UserModule } from './Users_db/user.module';

@Module({
  imports: [UserModule, GameModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
