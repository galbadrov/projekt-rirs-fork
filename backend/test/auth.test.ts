import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextFunction, Request, Response } from 'express';

vi.mock('../src/db.js', () => ({ prisma: { user: { findUnique: vi.fn() } } }));

import { prisma } from '../src/db.js';
import { requireAuth, requireRole } from '../src/middleware/auth.middleware.js';
import { createToken, verifyToken } from '../src/utils/jwt.js';

function context(token?: unknown, user?: { id: number; role: string }) {
  const req = { cookies: { token } } as Request;
  const res = { locals: { user }, status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe('JWT avtentikacija', () => {
  beforeEach(() => vi.clearAllMocks());
  it('vsebuje ID in vlogo uporabnika', () => {
    expect(verifyToken(createToken(42, 'EMPLOYEE'))).toMatchObject({ sub: '42', role: 'EMPLOYEE' });
  });
  it('zavrne spremenjen žeton', () => {
    expect(() => verifyToken(`${createToken(1, 'ADMIN')}x`)).toThrow();
  });
  it('zavrne manjkajoč žeton', async () => {
    const c = context(); await requireAuth(c.req, c.res, c.next);
    expect(c.res.status).toHaveBeenCalledWith(401);
  });
  it('zavrne neveljaven žeton', async () => {
    const c = context('bad'); await requireAuth(c.req, c.res, c.next);
    expect(c.res.status).toHaveBeenCalledWith(401);
  });
  it('zavrne neobstoječega uporabnika', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
    const c = context(createToken(1, 'EMPLOYEE')); await requireAuth(c.req, c.res, c.next);
    expect(c.res.status).toHaveBeenCalledWith(401);
  });
  it('zavrne neaktivnega uporabnika', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 1, isActive: false } as never);
    const c = context(createToken(1, 'EMPLOYEE')); await requireAuth(c.req, c.res, c.next);
    expect(c.res.status).toHaveBeenCalledWith(401);
  });
  it('sprejme aktivnega uporabnika', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 1, role: 'EMPLOYEE', isActive: true } as never);
    const c = context(createToken(1, 'EMPLOYEE')); await requireAuth(c.req, c.res, c.next);
    expect(c.next).toHaveBeenCalledOnce();
  });
});

describe('preverjanje vlog', () => {
  it('zavrne neprijavljenega uporabnika', () => {
    const c = context(); requireRole('ADMIN')(c.req, c.res, c.next);
    expect(c.res.status).toHaveBeenCalledWith(401);
  });
  it('zavrne neustrezno vlogo', () => {
    const c = context(undefined, { id: 1, role: 'EMPLOYEE' }); requireRole('ADMIN')(c.req, c.res, c.next);
    expect(c.res.status).toHaveBeenCalledWith(403);
  });
  it('dovoli ustrezno vlogo', () => {
    const c = context(undefined, { id: 1, role: 'ADMIN' }); requireRole('ADMIN')(c.req, c.res, c.next);
    expect(c.next).toHaveBeenCalledOnce();
  });
});
