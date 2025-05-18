import { Injectable } from '@nestjs/common';

import { ErrorResult, StringUtils } from '@app/common/utils';
import { LeanedDocument } from '@app/core/providers/base.mongo.repository';
import { EmailTemplate } from '../../infrastructure/models/emailTemplate';
import { EmailTemplateRepository } from '../../infrastructure/repositories/emailTemplate.repository';

@Injectable()
export class EmailTemplateService {
  constructor(
    private readonly emailTemplateRepository: EmailTemplateRepository,
  ) {}

  async create(input: Partial<EmailTemplate>) {
    await this.validateData(input);

    return this.emailTemplateRepository.create(input);
  }

  async update(id: string, data: Partial<EmailTemplate>) {
    const template = await this.getById(id);
    Object.assign(template, { ...data });

    return this.emailTemplateRepository.update(template);
  }

  async delete(id: string) {
    const template = await this.getById(id);

    template.active = false;
    template.deleted = true;
    template.deletedAt = new Date();

    return this.emailTemplateRepository.update(template);
  }

  async getById(id: string, active = false) {
    let template: LeanedDocument<EmailTemplate> | null = null;

    if (active) {
      template = await this.emailTemplateRepository.getNotDeletedById(id);
    } else {
      template = await this.emailTemplateRepository.getById(id);
    }

    if (!template) {
      throw new ErrorResult({
        code: 404_001,
        clean_message: "Le modèle d'email est introuvable",
        message: `Le modèle d'email [${id}] est introuvable`,
      });
    }

    return template;
  }

  async activate(id: string) {
    const template = await this.getById(id);
    if (!template.active && !template.deleted) {
      template.active = true;
      await this.emailTemplateRepository.update(template);
    }

    return template;
  }

  async deactivate(id: string) {
    const template = await this.getById(id);
    if (template.active && !template.deleted) {
      template.active = false;
      await this.emailTemplateRepository.update(template);
    }

    return template;
  }

  private async validateData(data: Partial<EmailTemplate>) {
    const { label } = data;

    if (label) {
      const slug = StringUtils.slugify(label);

      const template = await this.emailTemplateRepository.getOne({ slug });

      if (template) {
        throw new ErrorResult({
          code: 409_001,
          clean_message: "Un modèle d'email ayant le même nom existe déjà",
          message: "Un modèle d'email ayant le même [label] existe déjà",
        });
      }

      Object.assign(data, { slug });
    }
  }
}
