import { createError } from '@fastify/error';
import fastify, { FastifyErrorCodes, FastifyError, ValidationResult } from 'fastify';

class BaseError extends Error {
  constructor(public message: string, public statusCode = 500) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends BaseError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class BadRequestError extends BaseError {
  constructor(message: string) {
    super(message, 400);
  }
}
