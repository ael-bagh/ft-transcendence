import { createParamDecorator, ExecutionContext, UseGuards } from '@nestjs/common';
import { CustomSocket } from '@/auth/auth.adapter';
import { Status } from '@prisma/client';
import { PrismaService } from '@/common/services/prisma.service';

export const CurrentUser = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
	
    const request = await ctx.switchToHttp().getRequest();

	request.user.status = (request.user.status == Status.OFFLINE ? Status.ONLINE : request.user.status)

    return request.user;
  },
);