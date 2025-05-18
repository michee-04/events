import { ErrorDetail, ErrorResult, StringUtils } from '@app/common/utils';
import { ApiProperty } from '@nestjs/swagger';

export class SetEntityRoleDto {
  @ApiProperty({
    type: String,
    description: 'Le [_id] du rôle à attribuer',
    example: '66d76fe5ae2c2c6265435e04',
  })
  roleId: string;

  @ApiProperty({
    type: String,
    description: "Le [_id] de l'entité à laquelle attribuer le rôle",
    example: '66d76fe5ae2c2c6265435e01',
  })
  userId: string;

  constructor(input: Record<string, any>) {
    this.validate(input);

    this.userId = input.userId;
    this.roleId = input.roleId;
  }

  private validate(input: Record<string, any>) {
    const errors: ErrorDetail[] = [];

    if (!input.userId) {
      errors.push({
        code: 400_024,
        clean_message: "L'entité est obligatoire",
        message: 'Le champ [entityId] est obligatoire',
      });
    } else if (!StringUtils.isMongoId(input.userId)) {
      errors.push({
        code: 400_025,
        clean_message: "L'entité est invalide",
        message: 'Le champ [entityId] est invalide',
      });
    }

    if (!input.roleId) {
      errors.push({
        code: 400_032,
        clean_message: 'Le rôle est obligatoire',
        message: 'Le champ [roleId] est obligatoire',
      });
    } else if (!StringUtils.isMongoId(input.roleId)) {
      errors.push({
        code: 400_033,
        clean_message: 'Le rôle est invalide',
        message: 'Le champ [roleId] est invalide',
      });
    }

    if (errors.length > 0) {
      throw new ErrorResult(errors);
    }
  }
}
