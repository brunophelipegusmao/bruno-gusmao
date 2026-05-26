import { All, Controller, Req, Res } from '@nestjs/common';
import { ApiTags, ApiExcludeEndpoint } from '@nestjs/swagger';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { auth } from './auth';

const SKIP_HEADERS = new Set([
  'transfer-encoding',
  'access-control-allow-origin',
  'access-control-allow-credentials',
  'access-control-allow-methods',
  'access-control-allow-headers',
]);

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @ApiExcludeEndpoint()
  @All('*')
  async handler(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    const baseUrl = process.env.BETTER_AUTH_URL ?? 'http://localhost:3001';
    const url = new URL(req.url, baseUrl);

    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (value !== undefined) {
        headers.set(key, Array.isArray(value) ? value.join(', ') : value);
      }
    });

    const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
    const body = hasBody && req.body != null ? JSON.stringify(req.body) : undefined;

    const request = new Request(url.toString(), {
      method: req.method,
      headers,
      body,
    });

    const response = await auth.handler(request);

    response.headers.forEach((value, key) => {
      if (!SKIP_HEADERS.has(key.toLowerCase())) {
        reply.header(key, value);
      }
    });

    reply.status(response.status);

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (location) return reply.redirect(location, response.status as any);
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      return reply.send(await response.json());
    }

    return reply.send(await response.text());
  }
}
