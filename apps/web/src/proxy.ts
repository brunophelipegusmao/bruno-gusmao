import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PRIVATE_PATHS = ['/ControlPanel'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('access_token');

  const isPrivate = PRIVATE_PATHS.some((p) => pathname.startsWith(p));

  if (isPrivate && !sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Não fazemos bounce de /login -> /ControlPanel aqui: isso só checaria a
  // PRESENÇA do cookie, não a validade. Quem valida de verdade é
  // (private)/layout.tsx via GET /api/auth/me. Se essa checagem aqui achasse
  // "cookie existe" com um token inválido/expirado, criaria um loop: layout
  // manda de volta pro /login (Server Component não consegue limpar o
  // cookie) e este middleware mandaria de nascer pro /ControlPanel de novo —
  // ERR_TOO_MANY_REDIRECTS. /login sempre renderiza; se a sessão for válida,
  // o botão de login nem aparece necessário de novo (o usuário pode navegar
  // manualmente pro painel), mas nunca trava em loop.
  return NextResponse.next();
}

export const config = {
  matcher: ['/ControlPanel/:path*'],
};
