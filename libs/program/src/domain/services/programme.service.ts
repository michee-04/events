import { ErrorResult } from '@app/common/utils';
import {
  FilterQuery,
  SortQuery,
} from '@app/core/providers/base.mongo.repository';
import { EventsRepository } from '@app/events/infrastructure/repositories/events.repository';
import { Programme } from '@app/program/infrastructure/models/program';
import { ProgrammeRepository } from '@app/program/infrastructure/repositories/programme.repository';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ProgrammeService {
  private readonly logger = new Logger(ProgrammeService.name);

  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly programmeRepository: ProgrammeRepository,
  ) {}

  getAll() {
    return this.programmeRepository.getAll({
      deleted: false,
    });
  }

  async get(
    filter: FilterQuery<Programme> = {},
    limit = 20,
    skip = 0,
    sort: SortQuery<Programme> = {},
    // isAdmin = false,
  ) {
    filter = {
      ...filter,
      // isAdmin,
      deleted: false,
    };
    return this.programmeRepository.get(filter, limit, skip, sort);
  }

  async createProgramme(input: Partial<Programme>) {
    const existingProgramme = await this.programmeRepository.getTitleExists(
      input.title,
      input.eventId,
    );

    if (existingProgramme) {
      throw new ErrorResult({
        code: 400_023,
        clean_message:
          'Le titre de ce programme existe déjà pour cet événement',
        message: 'Le titre de ce programme existe déjà pour cet événement',
      });
    }

    await this.checkEventDate(input);

    await this.checkForTimeOverlap(
      input.eventId as unknown as string,
      input.startDate as Date,
      input.endDate as Date,
    );

    const programmeDto: Partial<Programme> = {};
    programmeDto.title = input.title;
    programmeDto.speaker = input.speaker;
    programmeDto.startDate = input.startDate;
    programmeDto.endDate = input.endDate;
    programmeDto.eventId = input.eventId;

    const programme = await this.programmeRepository.create(programmeDto);

    return programme;
  }

  async updateProgramme(id: string, input: Partial<Programme>) {
    let programme = await this.programmeRepository.getById(id);
    if (!programme) {
      throw new ErrorResult({
        code: 400_016,
        clean_message: 'Le programme est introuvable',
        message: 'Le programme est introuvable',
      });
    }

    programme.title = input.title || programme.title;
    programme.speaker = input.speaker || programme.speaker;
    programme.startDate = input.startDate || programme.startDate;
    programme.endDate = input.endDate || programme.endDate;
    programme.eventId = input.eventId || programme.eventId;

    await this.checkEventDate(programme);

    await this.checkForTimeOverlap(
      programme.eventId as unknown as string,
      programme.startDate as Date,
      programme.endDate as Date,
      programme._id as unknown as any,
    );

    programme = await this.programmeRepository.update(programme);
    if (!programme) {
      throw new ErrorResult({
        code: 404_016,
        clean_message: 'Le programme est introuvable',
        message: `Le programme [${id}] est introuvable`,
      });
    }

    return programme;
  }

  async deleteProgramme(id: string) {
    const event = await this.programmeRepository.getById(id);

    event.deleted = true;
    event.deletedAt = new Date();

    return this.programmeRepository.update(event);
  }

  private async checkEventDate(input: any): Promise<void> {
    const event = await this.eventsRepository.getById(
      input.eventId as unknown as string,
    );

    if (!event) {
      throw new ErrorResult({
        code: 404_016,
        clean_message: "L'événement est introuvable",
        message: `L'événement [${input.eventId}] est introuvable`,
      });
    }

    if (
      input.startDate &&
      input.endDate &&
      (input.startDate < event.startDate || input.endDate > event.endDate)
    ) {
      throw new ErrorResult({
        code: 404_009,
        clean_message:
          'Les dates du programme doivent être incluses dans les dates de l’événement',
        message:
          'Les dates du programme doivent être incluses dans les dates de l’événement',
      });
    }
  }

  private async checkForTimeOverlap(
    eventId: string,
    startDate: Date,
    endDate: Date,
    currentProgrammeId?: string,
  ) {
    let programmes = await this.programmeRepository.getEventByProgramme(
      eventId,
      currentProgrammeId,
    );

    if (currentProgrammeId) {
      programmes = programmes.filter(
        (programme) => programme._id.toString() !== currentProgrammeId,
      );
    }

    const newStart = new Date(startDate).getTime();
    const newEnd = new Date(endDate).getTime();

    const hasOverlap = programmes.some((programme) => {
      const existingStart = new Date(programme.startDate).getTime();
      const existingEnd = new Date(programme.endDate).getTime();

      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });

    if (hasOverlap) {
      throw new ErrorResult({
        code: 409_024,
        clean_message:
          'Les horaires du programme se chevauchent avec un autre programme existant',
        message:
          'Le créneau sélectionné entre en conflit avec un programme déjà planifié pour cet événement.',
      });
    }
  }
}
