export class PublishedSwabPlanException extends Error {
  private status: number;

  constructor(message: string, status: number) {
    super(message);

    this.status = status;
  }

  getStatus(): number {
    return this.status;
  }
}
