import { Injectable } from '@nestjs/common';
import { IJwtService } from '../../domain/jwt/jwt.interface';
import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';


@Injectable()
export class JwtHelper implements IJwtService {
    private readonly secret = process.env.JWT_SECRET || 'default_secret';

    sign(payload: Record<string, any>, expiresIn: `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}` = '5m'): string {
        return jwt.sign(payload, this.secret, { expiresIn });
    }

    verify<T = any>(token: string): T {
        return jwt.verify(token, this.secret) as T;
    }
}