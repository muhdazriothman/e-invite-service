import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({ description: 'Cursor for the next page' })
      nextCursor?: string;

  @ApiProperty({ description: 'Cursor for the previous page' })
      previousCursor?: string;

  @ApiProperty({ description: 'Whether there are more items to fetch' })
      hasNextPage: boolean;

  @ApiProperty({ description: 'Whether there are previous items to fetch' })
      hasPreviousPage: boolean;

  @ApiProperty({ description: 'Total number of items in the current page' })
      count: number;
}
