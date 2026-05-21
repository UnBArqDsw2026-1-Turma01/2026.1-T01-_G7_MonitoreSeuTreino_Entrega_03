import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ConfirmPasswordResetRequest {
  @ApiProperty({ description: 'Plain-text reset token received by email' })
  @IsString()
  token!: string;

  @ApiProperty({ example: 'NewP@ssw0rd!', minLength: 8, maxLength: 64 })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      'newPassword must contain uppercase, lowercase, number and special character',
  })
  newPassword!: string;
}
