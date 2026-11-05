import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password: string;

  @IsOptional()
  @IsBoolean()
  marketingOptIn?: boolean;
}

export class SignInDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}

// ...

export class EmailDto {
  @IsEmail()
  email: string;
}

/** The token from the reset link, and the new password, under the sign-up rules. */
export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  newPassword: string;
}

export class CreateRoleDto {
  @IsString()
  @Matches(/^[a-z][a-z0-9_-]{1,39}$/)
  key: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  description: string;

  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  permissions: string[];
}

export class RolePermissionsDto {
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  permissions: string[];
}

export class AssignRolesDto {
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  roles: string[];
}

export class AccountStatusDto {
  @IsIn(['active', 'suspended', 'blocked'])
  status: 'active' | 'suspended' | 'blocked';
}
