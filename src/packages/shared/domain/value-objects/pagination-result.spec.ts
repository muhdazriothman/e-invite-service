import { PaginationResult } from '@shared/domain/value-objects/pagination-result';

describe('@shared/domain/value-objects/pagination-result', () => {
    const mockData = [
        { id: '1', name: 'Test 1' },
        { id: '2', name: 'Test 2' },
    ];

    describe('constructor', () => {
        it('should create a PaginationResult with all properties', () => {
            const result = new PaginationResult(
                mockData,
                true,
                false,
                2,
                'next-cursor',
                'prev-cursor',
            );

            expect(result.data).toEqual(mockData);
            expect(result.hasNextPage).toBe(true);
            expect(result.hasPreviousPage).toBe(false);
            expect(result.count).toBe(2);
            expect(result.nextCursor).toBe('next-cursor');
            expect(result.previousCursor).toBe('prev-cursor');
        });
    });

    describe('create', () => {
        it('should create a PaginationResult with default values', () => {
            const result = PaginationResult.create(mockData);

            expect(result.data).toEqual(mockData);
            expect(result.hasNextPage).toBe(false);
            expect(result.hasPreviousPage).toBe(false);
            expect(result.count).toBe(2);
            expect(result.nextCursor).toBeUndefined();
            expect(result.previousCursor).toBeUndefined();
        });

        it('should create a PaginationResult with custom values', () => {
            const result = PaginationResult.create(
                mockData,
                'next-cursor',
                'prev-cursor',
                true,
                true,
            );

            expect(result.data).toEqual(mockData);
            expect(result.hasNextPage).toBe(true);
            expect(result.hasPreviousPage).toBe(true);
            expect(result.count).toBe(2);
            expect(result.nextCursor).toBe('next-cursor');
            expect(result.previousCursor).toBe('prev-cursor');
        });
    });
});
