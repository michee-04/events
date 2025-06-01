import { DateUtils, ErrorDetail, ObjectUtils } from '@app/common/utils';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEventDto {
  @ApiProperty({ type: String, example: 'Tdev community' })
  title?: string;

  @ApiProperty({
    type: String,
    example: 'Tdev est un evenement de la communauté dev',
  })
  description?: string;

  @ApiProperty({ type: String, example: 'Agoe-Zongo' })
  location?: string;

  @ApiProperty({ type: Number, example: 15 })
  capacity?: number;

  @ApiProperty({ type: Boolean, example: false, default: false })
  isOnline?: boolean;

  @ApiProperty({ type: [String], example: ['#tdev'] })
  tags?: string[];

  @ApiProperty({ type: String, example: 'http://localhost' })
  imageUrl?: string;

  @ApiProperty({ type: Date, example: '2023-01-01T00:00:00.000Z' })
  startDate?: Date;

  @ApiProperty({ type: Date, example: '2023-01-02T00:00:00.000Z' })
  endDate?: Date;

  constructor(input: Record<string, any>) {
    this.validate(input);

    this.title = input.title;
    this.description = input.description;
    this.location = input.location;
    this.capacity = input.capacity;
    this.isOnline = input.isOnline ?? false;
    this.tags = input.tags;
    // this.imageUrl = input.imageUrl;
    this.startDate = new Date(input.startDate);
    this.endDate = new Date(input.endDate);
  }

  private validate(input: Record<string, any>) {
    const errors: ErrorDetail[] = [];

    if (
      ObjectUtils.hasProperty(input, 'title') &&
      !input.title?.toString().trim()
    ) {
      errors.push({
        code: 400_000,
        clean_message: "Le titre de l'événement ne peut pas être vide",
        message: "Le titre de l'événement ne peut pas être vide",
      });
    }

    if (
      ObjectUtils.hasProperty(input, 'description') &&
      !input.description?.toString().trim()
    ) {
      errors.push({
        code: 400_000,
        clean_message: "La description de l'événement ne peut pas être vide",
        message: "La description de l'événement ne peut pas être vide",
      });
    }

    if (
      ObjectUtils.hasProperty(input, 'location') &&
      !input.location?.toString().trim()
    ) {
      errors.push({
        code: 400_000,
        clean_message: "La localisation de l'événement ne peut pas être vide",
        message: "La localisation de l'événement ne peut pas être vide",
      });
    }

    if (input.capacity) {
      const capacity = Number(input.capacity);
      if (Number.isNaN(capacity) || capacity < 0) {
        errors.push({
          code: 400_070,
          clean_message:
            "Le nombre de place [capacity] de l'événement ne peut pas être vide",
          message:
            "Le nombre de place [capacity]  de l'événement ne peut pas être vide",
        });
      } else {
        Object.assign(input, { capacity });
      }
    }

    if (
      ObjectUtils.hasProperty(input, 'isOnline') &&
      !input.isOnline?.toString().trim()
    ) {
      errors.push({
        code: 400_000,
        clean_message: "Le titre de l'événement ne peut pas être vide",
        message: "Le titre de l'événement ne peut pas être vide",
      });
    }

    if (
      ObjectUtils.hasProperty(input, 'tags') &&
      !input.tags?.toString().trim()
    ) {
      errors.push({
        code: 400_000,
        clean_message: "Le tags de l'événement ne peut pas être vide",
        message: "Le tags de l'événement ne peut pas être vide",
      });
    }

    const isValidStartAt = DateUtils.isValid(input.startDate);
    if (input.startDate && !isValidStartAt) {
      errors.push({
        code: 400_000,
        clean_message: "La date de début de l'événement ne peut pas être vide",
        message: "La date de début de l'événement ne peut pas être vide",
      });
    }

    const isValidEndAt = DateUtils.isValid(input.endDate);
    if (input.endDate && !isValidEndAt) {
      errors.push({
        code: 400_000,
        clean_message: "La date de fin de l'événement ne peut pas être vide",
        message: "La date de fin de l'événement ne peut pas être vide",
      });
    }

    if (
      isValidStartAt &&
      isValidEndAt &&
      DateUtils.isAfter(input.startDate, input.endDate)
    ) {
      errors.push({
        code: 400_119,
        clean_message: 'La date de début doit être antérieure à la date de fin',
        message:
          'La date du champ [startDate] doit être antérieure à celle du champ [endDate]',
      });
    }
  }
}
