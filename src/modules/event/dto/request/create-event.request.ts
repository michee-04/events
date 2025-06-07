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

    this.validate(input);

    this.title = input.title;
    this.description = input.description;
    this.location = input.location;
    this.capacity = input.capacity;
    this.isOnline = input.isOnline ?? false;
    this.isPaid = input.isPaid ?? false;
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

    // Validation URL image
    // if (!input.imageUrl) {
    //   errors.push({
    //     code: 400_054,
    //     clean_message: "L'URL de l'image est obligatoire",
    //     message: 'Le champ [imageUrl] est obligatoire',
    //   });
    // } else if (!StringUtils.isUrl(input.imageUrl)) {
    //   errors.push({
    //     code: 400_055,
    //     clean_message: "L'URL de l'image est invalide",
    //     message: 'Le champ [imageUrl] doit être une URL valide',
    //   });
    // }

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
