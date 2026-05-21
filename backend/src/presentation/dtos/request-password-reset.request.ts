import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class RequestPasswordResetRequest {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email!: string;
}
