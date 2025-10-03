import { PaginationMetaDto } from '@shared/dtos/pagination-result';

describe('@shared/dtos/pagination-result', () => {
    describe('PaginationMetaDto', () => {
        it('should have the correct structure', () => {
            const paginationMeta: PaginationMetaDto = {
                nextCursor: 'next-cursor',
                previousCursor: 'prev-cursor',
                hasNextPage: true,
                hasPreviousPage: false,
                count: 2,
            };

            expect(paginationMeta).toHaveProperty('nextCursor');
            expect(paginationMeta).toHaveProperty('previousCursor');
            expect(paginationMeta).toHaveProperty('hasNextPage');
            expect(paginationMeta).toHaveProperty('hasPreviousPage');
            expect(paginationMeta).toHaveProperty('count');

            expect(typeof paginationMeta.hasNextPage).toBe('boolean');
            expect(typeof paginationMeta.hasPreviousPage).toBe('boolean');
            expect(typeof paginationMeta.count).toBe('number');
        });

        it('should allow optional cursors', () => {
            const paginationMeta: PaginationMetaDto = {
                hasNextPage: false,
                hasPreviousPage: false,
                count: 0,
            };

            expect(paginationMeta.nextCursor).toBeUndefined();
            expect(paginationMeta.previousCursor).toBeUndefined();
        });

        it('should work with all required properties', () => {
            const paginationMeta: PaginationMetaDto = {
                nextCursor: 'next-cursor',
                previousCursor: 'prev-cursor',
                hasNextPage: true,
                hasPreviousPage: true,
                count: 10,
            };

            expect(paginationMeta.nextCursor).toBe('next-cursor');
            expect(paginationMeta.previousCursor).toBe('prev-cursor');
            expect(paginationMeta.hasNextPage).toBe(true);
            expect(paginationMeta.hasPreviousPage).toBe(true);
            expect(paginationMeta.count).toBe(10);
        });
    });
});
