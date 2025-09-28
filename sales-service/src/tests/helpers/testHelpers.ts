import { jest } from '@jest/globals';
import { Request, Response } from 'express';

export const createMockRequest = (overrides: Partial<Request> = {}): Partial<Request> => ({
  params: {},
  body: {},
  headers: {},
  query: {},
  ...overrides,
});

export const createMockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  (res as any).status = jest.fn().mockReturnValue(res);
  (res as any).json = jest.fn().mockReturnValue(res);
  (res as any).send = jest.fn().mockReturnValue(res);
  (res as any).end = jest.fn().mockReturnValue(res);
  return res;
};

export const createMockNext = (): jest.Mock => jest.fn();

