import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ListInvitationsQueryDto {
    @ApiPropertyOptional({
        description: 'Cursor for forward pagination (base64 encoded invitation ID)',
        example: 'NjQ5ZjJhYzM5YzM5YzM5YzM5YzM5YzM5',
    })
    @IsOptional()
    @IsString()
    next?: string;

    @ApiPropertyOptional({
        description: 'Cursor for backward pagination (base64 encoded invitation ID)',
        example: 'NjQ5ZjJhYzM5YzM5YzM5YzM5YzM5YzM5',
    })
    @IsOptional()
    @IsString()
    previous?: string;

    @ApiPropertyOptional({
        description: 'Number of items to return (max 50)',
        example: 20,
        minimum: 1,
        maximum: 50,
        default: 20,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 20;
}
