import { All, Controller, Req, Res } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { auth } from './auth';

@Controller('auth')
export class AuthController {
  @All('*')
  async handler(@Req() req: FastifyRequest, @Res() reply: FastifyReply) {
    const url = new URL(req.url, `${req.protocol}://${req.hostname}`);

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

    reply.status(response.status);
    response.headers.forEach((value, key) => reply.header(key, value));

    reply.send(await response.text());
  }
}
