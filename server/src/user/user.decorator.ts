import { createParamDecorator, ExecutionContext} from '@nestjs/common';
import { Status } from '@prisma/client';

export const CurrentUser = createParamDecorator(
  async (data: unknown, ctx: ExecutionContext) => {
	
    const request = await ctx.switchToHttp().getRequest();

	request.user.status = (request.user.status == Status.OFFLINE ? Status.ONLINE : request.user.status)

    return request.user;
  },
);