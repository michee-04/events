import { ErrorDetail, ErrorResult } from '@app/common/utils';
import { ApiProperty } from '@nestjs/swagger';
import { Types } from 'mongoose';

export class CreateProgrammeDto {
  @ApiProperty({ type: String, example: 'Accueil' })
  title: string;

  @ApiProperty({ type: String, example: 'Le speaker' })
  speaker: string;

  @ApiProperty({ type: Date, example: '2025-06-01T10:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ type: Date, example: '2025-06-01T12:00:00.000Z' })
  endDate: Date;

  @ApiProperty({
    type: String,
    example: '66d8a7cdff12345bca987654',
    description: "ID de l'événement parent",
  })
  eventId: Types.ObjectId;

  constructor(input: Record<string, any>) {
    this.validate(input);

    this.title = input.title;
    this.speaker = input.speaker;
    this.startDate = new Date(input.startDate);
    this.endDate = new Date(input.endDate);
    this.eventId = new Types.ObjectId(input.eventId);
  }

  private validate(input: Record<string, any>) {
    const errors: ErrorDetail[] = [];

    if (!input.title) {
      errors.push({
        code: 400_061,
        clean_message: 'Le titre est obligatoire',
        message: 'Le champ [title] est obligatoire',
      });
    }

    if (!input.speaker) {
      errors.push({
        code: 400_062,
        clean_message: 'Le nom du speaker est obligatoire',
        message: 'Le champ [speaker] est obligatoire',
      });
    }

    const startDate = new Date(input.startDate);
    if (!input.startDate) {
      errors.push({
        code: 400_063,
        clean_message: 'La date de début est obligatoire',
        message: 'Le champ [startDate] est obligatoire',
      });
    } else if (isNaN(startDate.getTime())) {
      errors.push({
        code: 400_064,
        clean_message: 'La date de début est invalide',
        message: 'Le champ [startDate] doit être une date valide',
      });
    }

    const endDate = new Date(input.endDate);
    if (!input.endDate) {
      errors.push({
        code: 400_065,
        clean_message: 'La date de fin est obligatoire',
        message: 'Le champ [endDate] est obligatoire',
      });
    } else if (isNaN(endDate.getTime())) {
      errors.push({
        code: 400_066,
        clean_message: 'La date de fin est invalide',
        message: 'Le champ [endDate] doit être une date valide',
      });
    }

    if (
      !isNaN(startDate.getTime()) &&
      !isNaN(endDate.getTime()) &&
      startDate >= endDate
    ) {
      errors.push({
        code: 400_067,
        clean_message: 'La date de fin doit être après la date de début',
        message: 'Le champ [endDate] doit être après [startDate]',
      });
    }

    if (!input.eventId) {
      errors.push({
        code: 400_068,
        clean_message: "L'événement associé est obligatoire",
        message: 'Le champ [eventId] est obligatoire',
      });
    }

    if (errors.length > 0) {
      throw new ErrorResult(errors);
    }
  }
}
