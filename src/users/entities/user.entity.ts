import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

/**
 * User entity representing a user in the system
 * Used for Swagger documentation
 */
export class User {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
    type: String,
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    type: String,
    required: false,
  })
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    type: String,
    required: false,
  })
  lastName?: string;

  @ApiProperty({
    description: 'User roles',
    example: [Role.USER],
    type: [String],
    enum: Role,
    isArray: true,
  })
  roles: Role[];

  @ApiProperty({
    description: 'When the user was created',
    example: '2025-05-17T13:19:32.000Z',
    format: 'date-time',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the user was last updated',
    example: '2025-05-17T13:19:32.000Z',
    format: 'date-time',
    type: Date,
  })
  updatedAt: Date;
}
