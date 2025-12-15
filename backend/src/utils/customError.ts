export class CustomError extends Error {
    
    statusCode: number;

    constructor({
        name,
        message,
        statusCode
    }: {
        name: string,
        message: string,
        statusCode: number
    }) {
        super();
        this.name = name;
        this.message = message;
        this.statusCode = statusCode;
    }
}

export class AuthenticationError extends CustomError {
    constructor(message: string = "User not authenticated") {
        super({
            name: "AuthenticationError",
            message,
            statusCode: 401
        });
    }
}

export class ValidationError extends CustomError {
    constructor(message: string = "Invalid input") {
        super({
            name: "ValidationError",
            message,
            statusCode: 400
        });
    }
}

export class ConflictError extends CustomError {
    constructor(message: string = "Resource already exists") {
        super({
            name: "ConflictError",
            message,
            statusCode: 409
        });
    }
}

export class MessageError extends CustomError {
    constructor(message: string = "Message content required") {
        super({
            name: "MessageError",
            message,
            statusCode: 404
        });
    }
}

export class NotFoundError extends CustomError {
    constructor(message: string = "Resource not found") {
        super({
            name: "NotFoundError",
            message,
            statusCode: 404
        });
    }
}

export class AuthorizationError extends CustomError {
    constructor(message: string = "Access denied") {
        super({
            name: "AuthorizationError",
            message,
            statusCode: 403
        });
    }
}

export class ProviderError extends CustomError {
    constructor(message: string = "AI provider error", statusCode: number = 502) {
        super({
            name: "ProviderError",
            message,
            statusCode
        });
    }
}

export class DatabaseError extends CustomError {
    constructor(message: string = "Database operation failed") {
        super({
            name: "DatabaseError",
            message,
            statusCode: 500
        });
    }
}



export class InternalServerError extends CustomError {
    constructor(message: string = "Internal server error") {
        super({
            name: "InternalServerError",
            message,
            statusCode: 500
        });
    }
}