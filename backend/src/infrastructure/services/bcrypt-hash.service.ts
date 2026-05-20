import { HashService } from '@domain/services/hash.service';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptHashService implements HashService {
  private readonly BCRYPT_COST_FACTOR = 10;

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.BCRYPT_COST_FACTOR);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
