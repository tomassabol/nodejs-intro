import { error } from "console";
import type { IncomingMessage, ServerResponse } from "http";

export class ApiError extends Error {
  private status: number;
  private res: ServerResponse<IncomingMessage>;

  constructor(
    status: number,
    message: string,
    res: ServerResponse<IncomingMessage>
  ) {
    super(message);
    this.status = status;
    this.res = res;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: this.name,
        message: this.message,
        details: this.stack,
      })
    );
  }
}
