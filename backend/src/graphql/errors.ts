import { GraphQLError } from "graphql";

// Error codes mapping to HTTP status codes
export enum ErrorCode {
    // 400 Bad Request
    BAD_REQUEST = "BAD_REQUEST",
    VALIDATION_ERROR = "VALIDATION_ERROR",

    // 401 Unauthorized
    UNAUTHENTICATED = "UNAUTHENTICATED",
    INVALID_TOKEN = "INVALID_TOKEN",
    TOKEN_EXPIRED = "TOKEN_EXPIRED",

    // 403 Forbidden
    FORBIDDEN = "FORBIDDEN",
    ACCESS_DENIED = "ACCESS_DENIED",

    // 404 Not Found
    NOT_FOUND = "NOT_FOUND",
    USER_NOT_FOUND = "USER_NOT_FOUND",
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",

    // 409 Conflict
    CONFLICT = "CONFLICT",
    ALREADY_EXISTS = "ALREADY_EXISTS",

    // 500 Internal Server Error
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

// Map error codes to HTTP status codes
export const errorCodeToHttpStatus: Record<ErrorCode, number> = {
    [ErrorCode.BAD_REQUEST]: 400,
    [ErrorCode.VALIDATION_ERROR]: 400,
    [ErrorCode.UNAUTHENTICATED]: 401,
    [ErrorCode.INVALID_TOKEN]: 401,
    [ErrorCode.TOKEN_EXPIRED]: 401,
    [ErrorCode.FORBIDDEN]: 403,
    [ErrorCode.ACCESS_DENIED]: 403,
    [ErrorCode.NOT_FOUND]: 404,
    [ErrorCode.USER_NOT_FOUND]: 404,
    [ErrorCode.RESOURCE_NOT_FOUND]: 404,
    [ErrorCode.CONFLICT]: 409,
    [ErrorCode.ALREADY_EXISTS]: 409,
    [ErrorCode.INTERNAL_SERVER_ERROR]: 500,
};

// Custom error class for application errors
export class AppError extends GraphQLError {
    constructor(
        message: string,
        code: ErrorCode,
        extensions?: Record<string, unknown>
    ) {
        super(message, {
            extensions: {
                code,
                http: {
                    status: errorCodeToHttpStatus[code],
                },
                ...extensions,
            },
        });
    }
}

// Helper functions to throw common errors
export const Errors = {
    // Authentication errors
    unauthenticated: (message = "You must be logged in to perform this action") =>
        new AppError(message, ErrorCode.UNAUTHENTICATED),

    invalidToken: (message = "Invalid token") =>
        new AppError(message, ErrorCode.INVALID_TOKEN),

    tokenExpired: (message = "Token has expired") =>
        new AppError(message, ErrorCode.TOKEN_EXPIRED),

    // Authorization errors
    forbidden: (message = "You do not have permission to perform this action") =>
        new AppError(message, ErrorCode.FORBIDDEN),

    accessDenied: (message = "Access denied") =>
        new AppError(message, ErrorCode.ACCESS_DENIED),

    // Not found errors
    notFound: (resource = "Resource") =>
        new AppError(`${resource} not found`, ErrorCode.NOT_FOUND),

    userNotFound: (message = "User not found") =>
        new AppError(message, ErrorCode.USER_NOT_FOUND),

    // Validation errors
    badRequest: (message: string) =>
        new AppError(message, ErrorCode.BAD_REQUEST),

    validationError: (message: string, field?: string) =>
        new AppError(message, ErrorCode.VALIDATION_ERROR, field ? { field } : {}),

    // Conflict errors
    conflict: (message: string) =>
        new AppError(message, ErrorCode.CONFLICT),

    alreadyExists: (resource = "Resource") =>
        new AppError(`${resource} already exists`, ErrorCode.ALREADY_EXISTS),

    // Server errors
    internalError: (message = "An unexpected error occurred") =>
        new AppError(message, ErrorCode.INTERNAL_SERVER_ERROR),
};
