export interface IJwtService {
  sign(payload: Record<string, any>, expiresIn?: string): string;
  verify<T = any>(token: string): T;
}