import { ApiProperty } from '@nestjs/swagger';

export class ApiListQuery {
  @ApiProperty({
    type: String,
    description: 'Le numéro de la page courante',
    example: '2',
    default: '1',
    required: false,
  })
  page?: string = '1';

  @ApiProperty({
    type: String,
    description: "Le nombre d'éléments à afficher par page",
    example: '10',
    default: '20',
    required: false,
  })
  limit?: string = '20';

  @ApiProperty({
    type: String,
    description: 'Le terme à rechercher',
    example: 'john',
    default: '',
    required: false,
  })
  query?: string = '';
}
