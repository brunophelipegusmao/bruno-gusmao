import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { auth } from './auth';

declare module 'fastify' {
  interface FastifyRequest {
    user?: { id: string; email: string };
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<FastifyRequest>();

    const session = await auth.api.getSession({
      headers: new Headers(req.headers as Record<string, string>),
    });

    if (!session?.user) {
      throw new UnauthorizedException();
    }

    req.user = { id: session.user.id, email: session.user.email };

    return true;
  }
}
