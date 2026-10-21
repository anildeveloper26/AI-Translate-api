/** Error with an HTTP status; thrown from services/validators and rendered by the error handler. */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }

  static badRequest(message: string) {
    return new HttpError(400, message);
  }

  static notFound(message = "Not found") {
    return new HttpError(404, message);
  }

  static tooManyRequests(message = "Too many requests") {
    return new HttpError(429, message);
  }

  static unavailable(message: string) {
    return new HttpError(503, message);
  }
}
