import { User } from '@user/domain/entities/user';
import { UserMapper, UserDto } from '@user/interfaces/http/mappers/user';
import { UserFixture } from '@test/fixture/user';

describe('@user/interfaces/http/mappers/user', () => {
    let user: User;
    let userProps: any;

    beforeEach(() => {
        userProps = UserFixture.getUserProps({
            id: '123',
            username: 'testuser',
            email: 'test@example.com',
            passwordHash: 'hashedpassword123',
        });
        user = UserFixture.getUserEntity(userProps);
    });

    describe('UserMapper', () => {
        describe('#toDto', () => {
            it('should map User entity to RegisterResponseDto', () => {
                const result = UserMapper.toDto(user);

                expect(result).toEqual({
                    id: userProps.id,
                    username: userProps.username,
                    email: userProps.email,
                    createdAt: user.createdAt.toISOString(),
                    updatedAt: user.updatedAt.toISOString(),
                });
            });

            it('should not include passwordHash in the DTO', () => {
                const result = UserMapper.toDto(user);

                expect(result).not.toHaveProperty('passwordHash');
                expect(Object.keys(result)).toHaveLength(5);
                expect(Object.keys(result)).toEqual(['id', 'username', 'email', 'createdAt', 'updatedAt']);
            });

            it('should return a new object instance', () => {
                const result1 = UserMapper.toDto(user);
                const result2 = UserMapper.toDto(user);

                expect(result1).not.toBe(result2);
                expect(result1).toEqual(result2);
            });
        });

        describe('#toListDto', () => {
            it('should map single User entity to ListUsersResponseDto', () => {
                const result = UserMapper.toListDto(user);

                expect(result).toEqual({
                    id: userProps.id,
                    username: userProps.username,
                    email: userProps.email,
                    createdAt: user.createdAt.toISOString(),
                    updatedAt: user.updatedAt.toISOString(),
                });
            });

            it('should not include passwordHash in the DTO', () => {
                const result = UserMapper.toListDto(user);

                expect(result).not.toHaveProperty('passwordHash');
                expect(Object.keys(result)).toHaveLength(5);
                expect(Object.keys(result)).toEqual(['id', 'username', 'email', 'createdAt', 'updatedAt']);
            });

            it('should return a new object instance', () => {
                const result1 = UserMapper.toListDto(user);
                const result2 = UserMapper.toListDto(user);

                expect(result1).not.toBe(result2);
                expect(result1).toEqual(result2);
            });
        });
    });

    describe('UserDto interface', () => {
        it('should have correct structure', () => {
            const dto: UserDto = {
                id: 'test-id',
                username: 'test-username',
                email: 'test@email.com',
                isDeleted: false,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            };

            expect(dto).toHaveProperty('id');
            expect(dto).toHaveProperty('username');
            expect(dto).toHaveProperty('email');
            expect(dto).toHaveProperty('isDeleted');
            expect(dto).toHaveProperty('createdAt');
            expect(dto).toHaveProperty('updatedAt');
            expect(dto).toHaveProperty('deletedAt');
            expect(typeof dto.id).toBe('string');
            expect(typeof dto.username).toBe('string');
            expect(typeof dto.email).toBe('string');
            expect(typeof dto.isDeleted).toBe('boolean');
            expect(dto.createdAt).toBeInstanceOf(Date);
            expect(dto.updatedAt).toBeInstanceOf(Date);
            expect(dto.deletedAt).toBeNull();
        });
    });
});
