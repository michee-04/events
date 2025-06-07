/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorResult } from '@app/common/utils';
import {
  FilterQuery,
  SortQuery,
} from '@app/core/providers/base.mongo.repository';
import { Events } from '@app/events/infrastructure/models/events';
import { EventsRepository } from '@app/events/infrastructure/repositories/events.repository';
import { FileService } from '@app/file-storage/domain/services/file.service';
import { MinioFileRepository } from '@app/file-storage/infrastructure/repositories/minioFile.repository';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly fileService: FileService,
    private readonly minioFileRepository: MinioFileRepository,
  ) {}

  getAll() {
    return this.eventsRepository.getAll({
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
    return this.eventsRepository.get(filter, limit, skip, sort);
  }

  async createEvent(input: Partial<Events>, file?: Express.Multer.File) {
    const existingEvent = await this.eventsRepository.getTitle(input.title);

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
    eventDto.isPaid = input.isPaid;
    // TODO: A corriger après avoir implementer le fileService
    // eventDto.imageUrl = input.imageUrl;
    eventDto.startDate = input.startDate;
    eventDto.endDate = input.endDate;

    if (file) {
      const fileName = file.filename;
      const filePath = file.path; // si Multer sauvegarde sur le disque

      const imagePath = await this.fileService.uploadSingleFile(
        fileName,
        filePath,
        file.buffer,
        file.size,
        file.mimetype,
      );

      const minio = {
        downloadUrl: imagePath,
        originalName: file.originalname,
        fileName,
        size: file.size,
        type: file.mimetype,
      };

      await this.minioFileRepository.create(minio);

      const originalNale = file.originalname;

      eventDto.imageUrl = imagePath;
    }

    const event = await this.eventsRepository.create(eventDto);

    // TODO: AJoute le eventId comme fileId dans le update de minioRepository
    await this.minioFileRepository.updateFile(eventDto.imageUrl, event._id);

    return event;
  }

  async updateEvent(id: string, input: Partial<Events>) {
    let event = await this.eventsRepository.getById(id);
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
    event.isPaid = input.isPaid || event.isPaid;
    event.tags = input.tags || event.tags;
    // event.imageUrl = input.imageUrl || event.imageUrl;
    event.startDate = input.startDate || event.startDate;
    event.endDate = input.endDate || event.endDate;

    event = await this.eventsRepository.update(event);
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
    const event = await this.eventsRepository.getById(id);

    event.deleted = true;
    event.deletedAt = new Date();

    return this.eventsRepository.update(event);
  }

  async downloadFile(eventId: string) {
    const minioFile = await this.minioFileRepository.getOne({
      fileId: eventId,
    });

    if (!minioFile) {
      throw new ErrorResult({
        code: 404_020,
        clean_message: 'Fichier introuvable',
        message: 'Le fichier associé à cet événement est introuvable',
      });
    }

    const streamFile = await this.fileService.downloadFile(
      minioFile.fileName,
      minioFile.downloadUrl,
    );

    const result = {
      stream: streamFile,
      mimetype: minioFile.type,
      size: minioFile.size,
      originalName: minioFile.originalName,
      fileName: minioFile.fileName,
    };

    return result;
  }
}
