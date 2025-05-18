import { ErrorResult } from '../domain';

export enum SearchFilterOperator {
  EQ = 'eq',
  NE = 'ne',
  GT = 'gt',
  LT = 'lt',
  GTE = 'gte',
  LTE = 'lte',
  IN = 'in',
  NIN = 'nin',
  REGEX = 'regex',
}

export enum SearchSortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class SearchFilter {
  constructor(
    private readonly validTypes: Record<
      string,
      'string' | 'number' | 'boolean' | 'date'
    >,
  ) {}

  handle(filter: Record<string, any>, sort: Record<string, any>) {
    this.formatFilters(filter);
    this.formatSort(sort);
  }

  private formatFilters(filter: Record<string, any>) {
    if (Object.prototype.toString.call(filter) !== '[object Object]') {
      throw new ErrorResult({
        code: 400_331,
        clean_message: 'Cette recherche est invalide',
        message:
          'Le champ [filters] doit être un objet contenant des paires clé-valeur',
      });
    }

    Object.keys(filter).forEach((field) => {
      // Verify field is supported
      if (!this.validTypes[field]) {
        throw new ErrorResult({
          code: 400_332,
          clean_message: "Cette recherche n'est pas supportée",
          message: `Le champ [${field}] n'est pas supporté`,
        });
      }

      const conditions = filter[field];
      Object.keys(conditions).forEach((operator) => {
        // Verify operator is supported
        if (!Object.values(SearchFilterOperator).includes(operator as any)) {
          throw new ErrorResult({
            code: 400_332,
            clean_message: "Cette recherche n'est pas supportée",
            message: `L'opérateur [${operator}] du champ [${field}] n'est pas supporté`,
          });
        }

        const value = conditions[operator];
        const valueStr = this.stringify(value);
        const fieldType = this.validTypes[field];

        if (operator === SearchFilterOperator.REGEX) {
          // Apply to string fields
          if (fieldType === 'string') {
            Object.assign(filter, {
              [field]: { $regex: new RegExp(valueStr), $options: 'i' }, // Ignore case with $options = i
            });
          } else {
            throw new ErrorResult({
              code: 400_331,
              clean_message: 'Cette recherche est invalide',
              message: `L'opérateur [${operator}] du champ [${field}] ne s'applique qu'aux champs de chaînes de caractères`,
            });
          }
        } else if (
          [SearchFilterOperator.IN, SearchFilterOperator.NIN].includes(
            operator as any,
          )
        ) {
          // Apply to string array or number array on string, number or date fields
          if (!Array.isArray(value)) {
            throw new ErrorResult({
              code: 400_331,
              clean_message: 'Cette recherche est invalide',
              message: `L'opérateur [${operator}] du champ [${field}] n'accepte qu'une liste de nombres ou une liste de chaînes de caractères`,
            });
          }

          if (fieldType === 'date') {
            if (
              value.some((el) => Number.isNaN(Date.parse(this.stringify(el))))
            ) {
              throw new ErrorResult({
                code: 400_333,
                clean_message: 'La liste de dates est invalide',
                message: `La valeur de l'opérateur [${operator}] du champ [${field}] n'est pas une liste de dates valide`,
              });
            } else {
              Object.assign(filter[field], {
                [`$${operator}`]: value.map((el) =>
                  new Date(this.stringify(el)).toISOString(),
                ),
              });
            }
          } else if (fieldType === 'number') {
            if (value.some((el) => Number.isNaN(el))) {
              throw new ErrorResult({
                code: 400_334,
                clean_message: 'La liste de nombres est invalide',
                message: `La valeur de l'opérateur [${operator}] du champ [${field}] n'est pas une liste de nombres valide`,
              });
            } else {
              Object.assign(filter[field], {
                [`$${operator}`]: value.map((el) => Number(el)),
              });
            }
          } else {
            Object.assign(filter[field], {
              [`$${operator}`]: value.map((el) => this.stringify(el)),
            });
          }
        } else if (fieldType === 'boolean') {
          if (!['eq', 'ne'].includes(operator)) {
            throw new ErrorResult({
              code: 400_331,
              clean_message: 'Cette recherche est invalide',
              message: `L'opérateur [${operator}] du champ [${field}] de type [${fieldType}] est invalide : 'eq' ou 'ne'`,
            });
          } else if (typeof value !== 'boolean') {
            throw new ErrorResult({
              code: 400_331,
              clean_message: 'Cette recherche est invalide',
              message: `La valeur de l'opérateur [${operator}] du champ [${field}] n'est pas un booléen valide`,
            });
          } else {
            Object.assign(filter[field], {
              [`$${operator}`]: value,
            });
          }
        } else if (fieldType === 'date') {
          if (Number.isNaN(Date.parse(valueStr))) {
            throw new ErrorResult({
              code: 400_335,
              clean_message: 'La date est invalide',
              message: `La valeur de l'opérateur [${operator}] du champ [${field}] n'est pas une date valide`,
            });
          } else {
            Object.assign(filter[field], {
              [`$${operator}`]: new Date(valueStr).toISOString(),
            });
          }
        } else if (fieldType === 'number') {
          if (Number.isNaN(value)) {
            throw new ErrorResult({
              code: 400_336,
              clean_message: 'Le nombre est invalide',
              message: `La valeur de l'opérateur [${operator}] du champ [${field}] n'est pas un nombre valide`,
            });
          } else {
            Object.assign(filter[field], {
              [`$${operator}`]: Number(value),
            });
          }
        } else {
          Object.assign(filter[field], {
            [`$${operator}`]: valueStr,
          });
        }

        delete filter[field][operator];
      });
    });
  }

  private formatSort(sort: Record<string, any>) {
    if (Object.prototype.toString.call(sort) !== '[object Object]') {
      throw new ErrorResult({
        code: 400_337,
        clean_message: 'Ce tri est invalide',
        message:
          'Le champ [sort] doit être un objet contenant des paires clé-valeur',
      });
    }

    Object.keys(sort).forEach((field) => {
      // Verify field is supported
      if (!this.validTypes[field]) {
        throw new ErrorResult({
          code: 400_338,
          clean_message: "Ce tri n'est pas supporté",
          message: `Le champ [${field}] n'est pas supporté`,
        });
      }

      const value = sort[field];
      if (!Object.values(SearchSortOrder).includes(value)) {
        throw new ErrorResult({
          code: 400_324,
          clean_message: 'La valeur du tri est invalide',
          message: `La valeur de tri du champ [${field}] est invalide : 'asc' (ascendant) ou 'desc' (descendant)`,
        });
      }
      Object.assign(sort, { [field]: value === SearchSortOrder.ASC ? 1 : -1 });
    });
  }

  private stringify(value: unknown) {
    if (typeof value === 'string') return value;
    return JSON.stringify(value);
  }
}
