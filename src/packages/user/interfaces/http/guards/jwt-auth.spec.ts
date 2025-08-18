import { JwtAuthGuard } from '@user/interfaces/http/guards/jwt-auth';
import { AuthGuard } from '@nestjs/passport';

describe('@user/interfaces/http/guards/jwt-auth', () => {
    let jwtAuthGuard: JwtAuthGuard;

    beforeEach(() => {
        jwtAuthGuard = new JwtAuthGuard();
    });

    it('should extend AuthGuard with jwt strategy', () => {
        expect(jwtAuthGuard).toBeInstanceOf(AuthGuard('jwt'));
    });
});