/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorResult } from '@app/common/utils';
import {
  FilterQuery,
  SortQuery,
} from '@app/core/providers/base.mongo.repository';
import { Events } from '@app/events/infrastructure/models/events';
import { EventsRepository } from '@app/events/infrastructure/repositories/events.repository';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private readonly EventsRepository: EventsRepository) {}

  getAll() {
    return this.EventsRepository.getAll({
      deleted: false,
    });
  }

  async get(
    filter: FilterQuery<Events> = {},
    limit = 20,
    skip = 0,
    sort: SortQuery<Events> = {},
    // isAdmin = false,
  ) {
    filter = {
      ...filter,
      // isAdmin,
      deleted: false,
    };
    return this.EventsRepository.get(filter, limit, skip, sort);
  }

  async createEvent(input: Partial<Events>) {
    const existingEvent = await this.EventsRepository.getTitle(input.title);

    if (existingEvent) {
      throw new ErrorResult({
        code: 409_001,
        clean_message: 'Un évenements avec ce titre existe déjà',
        message: 'Un évenements avec ce titre existe déjà',
      });
    }

    const eventDto: Partial<Events> = {};
    eventDto.title = input.title;
    eventDto.description = input.description;
    eventDto.location = input.location;
    eventDto.capacity = input.capacity;
    eventDto.isOnline = input.isOnline;
    eventDto.tags = input.tags;
    // TODO: A corriger après avoir implementer le fileService
    // eventDto.imageUrl = input.imageUrl;
    eventDto.startDate = input.startDate;
    eventDto.endDate = input.endDate;

    const event = await this.EventsRepository.create(eventDto);

    return event;
  }

  async updateEvent(id: string, input: Partial<Events>) {
    let event = await this.EventsRepository.getById(id);
    if (!event) {
      throw new ErrorResult({
        code: 400_016,
        clean_message: "L'évenement est introuvable",
        message: "L'évenement est introuvable",
      });
    }

    event.title = input.title || event.title;
    event.description = input.description || event.description;
    event.location = input.location || event.location;
    event.capacity = input.capacity || event.capacity;
    event.isOnline = input.isOnline || event.isOnline;
    event.tags = input.tags || event.tags;
    // event.imageUrl = input.imageUrl || event.imageUrl;
    event.startDate = input.startDate || event.startDate;
    event.endDate = input.endDate || event.endDate;

    event = await this.EventsRepository.update(event);
    if (!event) {
      throw new ErrorResult({
        code: 404_016,
        clean_message: "L'évenement est introuvable",
        message: `L'évenement [${id}] est introuvable`,
      });
    }

    return event;
  }

  async deleteEvent(id: string) {
    const event = await this.EventsRepository.getById(id);

    event.deleted = true;
    event.deletedAt = new Date();

    return this.EventsRepository.update(event);
  }
}
