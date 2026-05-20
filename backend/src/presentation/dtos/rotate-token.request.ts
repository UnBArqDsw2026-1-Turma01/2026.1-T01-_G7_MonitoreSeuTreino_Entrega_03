import { IsNotEmpty, IsString } from 'class-validator';

export class RotateTokenRequest {
  @IsString()
  @IsNotEmpty()
  token!: string;
}
