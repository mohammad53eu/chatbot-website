import { Request, Response, NextFunction } from "express";
import { CustomError } from "../utils/customError";

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
    }

    // if the above don't work
    res.status(500).json({
        success: false,
        error: "An error occurred.."
    })

}