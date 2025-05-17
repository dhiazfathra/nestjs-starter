import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    format: 'email',
    example: 'user@example.com',
    type: String
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password',
    format: 'password',
    example: 'Password123!',
    type: String
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
