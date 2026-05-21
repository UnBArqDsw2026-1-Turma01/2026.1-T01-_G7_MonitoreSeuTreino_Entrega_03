import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class DeleteAccountRequest {
  @ApiProperty({ example: 'P@ssw0rd!' })
  @IsString()
  @MaxLength(64)
  password!: string;

  @ApiProperty({
    example: 'CONFIRMAR',
    description: 'Must be exactly "CONFIRMAR" (case-sensitive)',
  })
  @IsString()
  confirmation!: string;
}
