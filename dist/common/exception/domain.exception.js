"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForbiddenException = exports.UnauthorizedException = exports.NotFoundException = exports.ConflictException = exports.TooManyRequestException = exports.BadRequestException = void 0;
const main_exception_1 = require("./main.exception");
class BadRequestException extends main_exception_1.ApplicationException {
    constructor(message = "Bad request.", cause) {
        super(message, 400, cause);
    }
}
exports.BadRequestException = BadRequestException;
class TooManyRequestException extends main_exception_1.ApplicationException {
    constructor(message = "too Many Request.", cause) {
        super(message, 429, cause);
    }
}
exports.TooManyRequestException = TooManyRequestException;
class ConflictException extends main_exception_1.ApplicationException {
    constructor(message = "Conflict.", cause) {
        super(message, 409, cause);
    }
}
exports.ConflictException = ConflictException;
class NotFoundException extends main_exception_1.ApplicationException {
    constructor(message = "Not found.", cause) {
        super(message, 404, cause);
    }
}
exports.NotFoundException = NotFoundException;
class UnauthorizedException extends main_exception_1.ApplicationException {
    constructor(message = "Unauthorized.", cause) {
        super(message, 401, cause);
    }
}
exports.UnauthorizedException = UnauthorizedException;
class ForbiddenException extends main_exception_1.ApplicationException {
    constructor(message = "Forbidden.", cause) {
        super(message, 403, cause);
    }
}
exports.ForbiddenException = ForbiddenException;
