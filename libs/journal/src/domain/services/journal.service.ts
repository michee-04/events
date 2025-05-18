import { Injectable, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ErrorResult } from '@app/common/utils';
import { AppConfig } from '@app/core/config';
import { JournalRepository } from '../../infrastructure/repositories/journal.repository';

@Injectable()
export class JournalService {
  private readonly isEnabled: boolean = false;

  constructor(
    private readonly config: ConfigService<AppConfig, true>,
    private readonly journalRepository: JournalRepository,
  ) {
    this.isEnabled = this.config.get('LIB_JOURNAL_ENABLED', { infer: true });
  }

  async save(
    moduleName: string,
    className: string,
    level: LogLevel = 'error',
    message: string = '',
    data: Record<string, any> = {},
  ) {
    if (!this.isEnabled) return null;

    const msg = `${level.toUpperCase()} [${moduleName}/${className}] ${message}`;

    const logData = { moduleName, className, ...data };
    if (data instanceof Error) {
      Object.assign(logData, {
        name: data.name ?? '',
        message: data.message ?? '',
        stack: data.stack ?? '',
      });
    }

    try {
      return await this.journalRepository.create({
        level,
        message: msg,
        data: logData,
      });
    } catch (error) {
      console.error('[JOURNAL SERVICE] Logging failed', error);
    }
  }

  async delete(id: string) {
    const line = await this.journalRepository.getById(id);
    if (!line) {
      throw new ErrorResult({
        code: 404_007,
        clean_message: "L'entrée de journal est introuvable",
        message: `L'entrée de journal [${id}] est introuvable`,
      });
    }

    line.active = false;
    line.deleted = true;
    line.deletedAt = new Date();

    await this.journalRepository.update(line);
  }
}
