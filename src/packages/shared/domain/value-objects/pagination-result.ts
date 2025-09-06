export class PaginationResult<T> {
  constructor(
    public readonly data: T[],
    public readonly hasNextPage: boolean,
    public readonly hasPreviousPage: boolean,
    public readonly count: number,
    public readonly nextCursor?: string,
    public readonly previousCursor?: string,
  ) {}

  static create<T>(
    data: T[],
    nextCursor?: string,
    previousCursor?: string,
    hasNextPage: boolean = false,
    hasPreviousPage: boolean = false,
  ): PaginationResult<T> {
    return new PaginationResult(
      data,
      hasNextPage,
      hasPreviousPage,
      data.length,
      nextCursor,
      previousCursor,
    );
  }
}
