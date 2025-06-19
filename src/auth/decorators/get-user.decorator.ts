import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract the user from the request object
 * Usage: @GetUser() user: User
 * Or to get a specific field: @GetUser('email') email: string
 */
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    if (data) {
      return request.user[data];
    }

    return request.user;
  },
);
