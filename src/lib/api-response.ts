
/**
 * Geniric intercave for sending response
 * @param success - operation success or failed
 * @param data - data to be sent in response (optional)
 * @param message - message (optional)
 * @param errorDetails - details regarding error  ( optional)
 * @param statusCode - The HTTP status code (default 200 for success and 500 for failure)
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    errorDetails?: string;
    statusCode: number;
}

/**
 * Utility function to send a success response
 * @param res - Express response object
 * @param data - The data to be sent in the response (optional)
 * @param message - The message (optional)
 * @param statusCode - The HTTP status code (defaults to 200)
 */
export function sendSuccess<T>(res: any, data: T | undefined, message: string = 'Success', statusCode: number = 200): void {
    const response: ApiResponse<T> = {
        success: true,
        data,
        message,
        statusCode,
    };

    res.status(statusCode).json(response);
}


/**
 * Utility function to send an error response
 * @param res - Express response object
 * @param message - The error message
 * @param statusCode - The HTTP status code (defaults to 500)
 * @param errorDetails - Optional, for more error details
 */
export function sendError(res: any, message: string, statusCode: number = 500, errorDetails?: string): void {
    const response: ApiResponse<null> = {
        success: false,
        message,
        errorDetails,
        statusCode,
    };

    res.status(statusCode).json(response);
}

