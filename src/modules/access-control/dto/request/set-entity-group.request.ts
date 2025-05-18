import { ErrorDetail, ErrorResult, StringUtils } from '@app/common/utils';
import { ApiProperty } from '@nestjs/swagger';

export class SetEntityGroupDto {
  @ApiProperty({
    type: String,
    description: 'Le [_id] du groupe à attribuer',
    example: '66d76fe5ae2c2c6265435e04',
  })
  groupId: string;

  @ApiProperty({
    type: String,
    description: "Le [_id] de l'entité à laquelle attribuer le groupe",
    example: '66d76fe5ae2c2c6265435e01',
  })
  userId: string;

  constructor(input: Record<string, any>) {
    this.validate(input);

    this.userId = input.userId;
    this.groupId = input.groupId;
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

    if (!input.groupId) {
      errors.push({
        code: 400_028,
        clean_message: 'Le groupe est obligatoire',
        message: 'Le champ [groupId] est obligatoire',
      });
    } else if (!StringUtils.isMongoId(input.groupId)) {
      errors.push({
        code: 400_029,
        clean_message: 'Le groupe est invalide',
        message: 'Le champ [groupId] est invalide',
      });
    }

    if (errors.length > 0) {
      throw new ErrorResult(errors);
    }
  }
}
