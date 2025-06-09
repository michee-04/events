import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { MAIN_DATABASE_CONNECTION_NAME } from '@app/common/constants';
import { BaseRepository } from '@app/core/providers/base.mongo.repository';
import { Programme } from '../models/program';

@Injectable()
export class ProgrammeRepository extends BaseRepository<Programme> {
  constructor(
    @InjectModel(Programme.name, MAIN_DATABASE_CONNECTION_NAME)
    model: Model<Programme>,
  ) {
    super(model);
  }

  async getTitle(title: string) {
    return this.get({ title, deleted: false });
  }

  async getTitleExists(title: string, eventId: any) {
    return this.exists({ title, eventId, deleted: false });
  }

  async getEventByProgramme(eventId: string, excludeProgrammeId?: string) {
    // return this.get({ eventId: eventId, deleted: false });
    const query: Record<string, any> = {
      // Assurez-vous que eventId est converti en ObjectId pour la requête MongoDB
      eventId: new Types.ObjectId(eventId),
      deleted: false,
    };

    if (excludeProgrammeId) {
      // Si un ID à exclure est fourni, ajoutez la condition $ne (not equal) à la requête
      // et assurez-vous que l'ID exclu est aussi un ObjectId.
      query._id = { $ne: new Types.ObjectId(excludeProgrammeId) };
    }

    // ⭐ MODIFICATION CLÉ : Utilisez directement .find() pour récupérer TOUS les documents
    // et .lean() pour obtenir des objets JavaScript simples, ce qui est plus performant. ⭐
    return this.getAll(query);
  }
}
