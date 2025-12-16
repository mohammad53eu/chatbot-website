import { Request, Response, NextFunction } from "express";
import { ConflictError, CustomError } from "../utils/customError";

function isDatabaseError(err: unknown): err is { code: string } {
    return typeof err === 'object' && err !== null && 'code' in err;
}

export function errorHandler(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
){
    // express default error handler
    if(res.headersSent){
        next(error);
        return;
    }

    // custom errors
    if(error instanceof CustomError){
        res.status(error.statusCode).json({
            success: false,
            name: error.name,
            error: error.message
        })
        return;
    }

    // this is special case for a postgresSQL error
    if (isDatabaseError(error) && error.code === "23505") {
        res.status(409).json({
            success: false,
            name: "ConflictError",
            error: error.message
        })
    }

    // if the above don't work
    res.status(500).json({
        success: false,
        error: "An error occurred.."
    })
}