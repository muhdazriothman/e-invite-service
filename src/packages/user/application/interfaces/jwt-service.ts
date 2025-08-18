export interface JwtService {
    sign(payload: any): string;
    verify(token: string): any;
}