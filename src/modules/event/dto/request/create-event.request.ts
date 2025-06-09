import { ErrorDetail, ErrorResult } from '@app/common/utils';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEventDto {
  @ApiProperty({ type: String, example: 'Tdev community' })
  title: string;

  @ApiProperty({
    type: String,
    example: 'Tdev est un evenement de la communauté dev',
  })
  description: string;

  @ApiProperty({ type: String, example: 'Agoe-Zongo' })
  location: string;

  @ApiProperty({ type: Number, example: 15 })
  capacity: number;

  @ApiProperty({ type: Boolean, example: false, default: false })
  isOnline: boolean;

  @ApiProperty({ type: Boolean, example: false, default: false })
  isPaid: boolean;

  @ApiProperty({
    type: Number,
    example: 5000,
    description: "Prix de l'événement (obligatoire si isPaid=true)",
    nullable: true,
    required: false,
  })
  price?: number | null;

  @ApiProperty({ type: [String], example: ['#tdev'] })
  tags: string[];

  @ApiProperty({ type: String, example: 'http://localhost' })
  imageUrl: string;

  @ApiProperty({ type: Date, example: '2023-01-01T00:00:00.000Z' })
  startDate: Date;

  @ApiProperty({ type: Date, example: '2023-01-02T00:00:00.000Z' })
  endDate: Date;

  constructor(input: Record<string, any>) {
    if (input.capacity !== undefined) {
      input.capacity = Number(input.capacity);
    }

    if (input.price !== undefined && input.price !== null) {
      input.price = Number(input.price);
    }

    if (typeof input.tags === 'string') {
      input.tags = JSON.parse(input.tags);
    }

    if (typeof input.isPaid === 'string') {
      input.isPaid = input.isPaid === 'true';
    }

    if (typeof input.isOnline === 'string') {
      input.isOnline = input.isOnline === 'true';
    }

    this.validate(input);

    this.title = input.title;
    this.description = input.description;
    this.location = input.location;
    this.capacity = input.capacity;
    this.isOnline = input.isOnline ?? false;
    this.isPaid = input.isPaid ?? false;
    this.price = input.price ?? null;
    this.tags = input.tags;
    this.startDate = new Date(input.startDate);
    this.endDate = new Date(input.endDate);
  }

  private validate(input: Record<string, any>) {
    const errors: ErrorDetail[] = [];

    // Validation titre
    if (!input.title) {
      errors.push({
        code: 400_047,
        clean_message: 'Le titre est obligatoire',
        message: 'Le champ [title] est obligatoire',
      });
    }

    // Validation description
    if (!input.description) {
      errors.push({
        code: 400_048,
        clean_message: 'La description est obligatoire',
        message: 'Le champ [description] est obligatoire',
      });
    }

    // Validation localisation
    if (!input.location) {
      errors.push({
        code: 400_049,
        clean_message: 'La localisation est obligatoire',
        message: 'Le champ [location] est obligatoire',
      });
    }

    // Validation capacité
    if (input.capacity === undefined || input.capacity === null) {
      errors.push({
        code: 400_050,
        clean_message: 'La capacité est obligatoire',
        message: 'Le champ [capacity] est obligatoire',
      });
    } else if (typeof input.capacity !== 'number' || input.capacity <= 0) {
      errors.push({
        code: 400_051,
        clean_message: 'La capacité doit être un nombre positif',
        message: 'Le champ [capacity] doit être un nombre positif',
      });
    }

    if (input.isPaid) {
      if (input.price === undefined || input.price === null) {
        errors.push({
          code: 400_061,
          clean_message: 'Le prix est obligatoire pour un événement payant',
          message: 'Le champ [price] est obligatoire lorsque [isPaid] est true',
        });
      } else if (typeof input.price !== 'number' || input.price <= 0) {
        errors.push({
          code: 400_062,
          clean_message: 'Le prix doit être un nombre positif',
          message: 'Le champ [price] doit être un nombre positif',
        });
      }
    } else {
      // Si l'événement est gratuit, on s'assure que le prix est null
      if (input.price !== undefined && input.price !== null) {
        errors.push({
          code: 400_063,
          clean_message: 'Le prix doit être null pour un événement gratuit',
          message: 'Le champ [price] doit être null lorsque [isPaid] est false',
        });
      }
    }

    // Validation tags
    if (!input.tags) {
      errors.push({
        code: 400_052,
        clean_message: 'Les tags sont obligatoires',
        message: 'Le champ [tags] est obligatoire',
      });
    } else if (!Array.isArray(input.tags) || input.tags.length === 0) {
      errors.push({
        code: 400_053,
        clean_message: 'Les tags doivent être un tableau non vide',
        message: 'Le champ [tags] doit être un tableau non vide',
      });
    }

    // Validation date de début
    const startDate = new Date(input.startDate);
    if (!input.startDate) {
      errors.push({
        code: 400_056,
        clean_message: 'La date de début est obligatoire',
        message: 'Le champ [startDate] est obligatoire',
      });
    } else if (isNaN(startDate.getTime())) {
      errors.push({
        code: 400_057,
        clean_message: 'La date de début est invalide',
        message: 'Le champ [startDate] doit être une date valide',
      });
    }

    // Validation date de fin
    const endDate = new Date(input.endDate);
    if (!input.endDate) {
      errors.push({
        code: 400_058,
        clean_message: 'La date de fin est obligatoire',
        message: 'Le champ [endDate] est obligatoire',
      });
    } else if (isNaN(endDate.getTime())) {
      errors.push({
        code: 400_059,
        clean_message: 'La date de fin est invalide',
        message: 'Le champ [endDate] doit être une date valide',
      });
    }

    // Validation cohérence des dates
    if (
      !isNaN(startDate.getTime()) &&
      !isNaN(endDate.getTime()) &&
      startDate >= endDate
    ) {
      errors.push({
        code: 400_060,
        clean_message: 'La date de fin doit être après la date de début',
        message: 'Le champ [endDate] doit être après [startDate]',
      });
    }

    if (errors.length > 0) {
      throw new ErrorResult(errors);
    }
  }
}
