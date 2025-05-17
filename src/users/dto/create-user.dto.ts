import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
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
    description: 'User password (min 8 characters)',
    format: 'password',
    example: 'Password123!',
    type: String,
    minLength: 8
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    type: String,
    required: false
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    type: String,
    required: false
  })
  @IsString()
  @IsOptional()
  lastName?: string;
}
