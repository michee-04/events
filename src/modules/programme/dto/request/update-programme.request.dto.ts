import {
  DateUtils,
  ErrorDetail,
  ErrorResult,
  ObjectUtils,
} from '@app/common/utils';
import { ApiProperty } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';

export class UpdateProgrammeDto {
  @ApiProperty({ type: String, example: 'Atelier de cybersécurité' })
  title?: string;

  @ApiProperty({ type: String, example: 'Prof. Komlan Dossou' })
  speaker?: string;

  @ApiProperty({
    type: Date,
    example: '2025-06-01T10:00:00.000Z',
  })
  startDate?: Date;

  @ApiProperty({
    type: Date,
    example: '2025-06-01T12:00:00.000Z',
  })
  endDate?: Date;

  @ApiProperty({
    type: String,
    example: '6833576793cbc7d255a4fce4',
    description: "L'ID de l'événement associé",
  })
  eventId?: string | ObjectId | any;

  constructor(input: Record<string, any>) {
    this.validate(input);

    this.title = input.title;
    this.speaker = input.speaker;
    this.startDate = input.startDate ? new Date(input.startDate) : undefined;
    this.endDate = input.endDate ? new Date(input.endDate) : undefined;
    this.eventId = input.eventId;
  }

  private validate(input: Record<string, any>) {
    const errors: ErrorDetail[] = [];

    if (
      ObjectUtils.hasProperty(input, 'title') &&
      !input.title?.toString().trim()
    ) {
      errors.push({
        code: 400_001,
        clean_message: 'Le titre du programme ne peut pas être vide',
        message: 'Le titre du programme ne peut pas être vide',
      });
    }

    if (
      ObjectUtils.hasProperty(input, 'speaker') &&
      !input.speaker?.toString().trim()
    ) {
      errors.push({
        code: 400_002,
        clean_message: 'Le nom de l’intervenant ne peut pas être vide',
        message: 'Le nom de l’intervenant ne peut pas être vide',
      });
    }

    const isValidStart = new Date(input.startDate);
    const isValidEnd = new Date(input.endDate);

    if (input.startDate && !isValidStart) {
      errors.push({
        code: 400_003,
        clean_message: 'La date de début du programme est invalide',
        message: 'La date de début du programme est invalide',
      });
    }

    if (input.endDate && !isValidEnd) {
      errors.push({
        code: 400_004,
        clean_message: 'La date de fin du programme est invalide',
        message: 'La date de fin du programme est invalide',
      });
    }

    if (
      isValidStart &&
      isValidEnd &&
      DateUtils.isAfter(input.startDate, input.endDate)
    ) {
      errors.push({
        code: 400_005,
        clean_message:
          'La date de début du programme doit précéder la date de fin',
        message:
          'La date [startDate] doit être antérieure à [endDate] pour le programme',
      });
    }

    // if (
    //   !isNaN(isValidStart.getTime()) &&
    //   !isNaN(isValidEnd.getTime()) &&
    //   isValidStart >= isValidEnd
    // ) {
    //   errors.push({
    //     code: 400_067,
    //     clean_message: 'La date de fin doit être après la date de début',
    //     message: 'Le champ [endDate] doit être après [startDate]',
    //   });
    // }

    if (errors.length > 0) {
      throw new ErrorResult(errors);
    }
  }
}
