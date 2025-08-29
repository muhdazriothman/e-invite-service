import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ListInvitationsQueryDto } from '@invitation/interfaces/http/dtos/list';

describe('@invitation/interfaces/http/dtos/list', () => {
    describe('validation', () => {
        it('should pass validation with valid forward pagination data', async () => {
            const dto = plainToClass(ListInvitationsQueryDto, {
                next: 'NjQ5ZjJhYzM5YzM5YzM5YzM5YzM5YzM5',
                limit: 20,
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with valid backward pagination data', async () => {
            const dto = plainToClass(ListInvitationsQueryDto, {
                previous: 'NjQ5ZjJhYzM5YzM5YzM5YzM5YzM5YzM5',
                limit: 20,
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with both cursors (next takes precedence)', async () => {
            const dto = plainToClass(ListInvitationsQueryDto, {
                next: 'NjQ5ZjJhYzM5YzM5YzM5YzM5YzM5YzM5',
                previous: 'NjQ5ZjJhYzM5YzM5YzM5YzM5YzM5YzM5',
                limit: 20,
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
        });

        it('should pass validation with no data (using defaults)', async () => {
            const dto = plainToClass(ListInvitationsQueryDto, {});

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
            expect(dto.limit).toBe(20);
        });

        it('should fail validation with invalid limit (too low)', async () => {
            const dto = plainToClass(ListInvitationsQueryDto, {
                limit: 0,
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].constraints?.min).toBeDefined();
        });

        it('should fail validation with invalid limit (too high)', async () => {
            const dto = plainToClass(ListInvitationsQueryDto, {
                limit: 51,
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].constraints?.max).toBeDefined();
        });

        it('should fail validation with non-integer limit', async () => {
            const dto = plainToClass(ListInvitationsQueryDto, {
                limit: 20.5,
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(1);
            expect(errors[0].constraints?.isInt).toBeDefined();
        });

        it('should pass validation with string limit (will be transformed)', async () => {
            const dto = plainToClass(ListInvitationsQueryDto, {
                limit: '25',
            });

            const errors = await validate(dto);
            expect(errors).toHaveLength(0);
            expect(dto.limit).toBe(25);
        });
    });
});
