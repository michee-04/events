import { ErrorResult } from '@app/common/utils';
import { AppConfig } from '@app/core/config';
import { FileService } from '@app/file-storage/domain/services/file.service';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  PayloadTooLargeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { FileInterceptor } from '@nestjs/platform-express';
import * as crypto from 'crypto';
import { Request } from 'express';
import * as multer from 'multer';
import * as path from 'path';
import { catchError, from, map, Observable, switchMap } from 'rxjs';
import { ALLOWED_BUCKETS_KEY } from '../decorators/allowed-buckets.decorator';
import { BUCKET_KEY } from '../decorators/bucket.decorator';

enum FileErrorCode {
  LIMIT_FILE_SIZE = 'LIMIT_FILE_SIZE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
}

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  private readonly defaultAllowedBuckets: string[];
  private readonly allowedFileTypes: string;
  private readonly maxFileSizeMB: number;
  private readonly uploadInterceptor: NestInterceptor;

  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService<AppConfig, true>,
    private readonly fileService: FileService,
  ) {
    this.defaultAllowedBuckets = this.config
      .get('LIB_FILESTORAGE_BUCKETS_WHITELIST', { infer: true })
      .split(',');
    this.allowedFileTypes = this.config
      .get('LIB_FILESTORAGE_FILE_UPLOAD_ALLOWED_TYPES', { infer: true })
      .replaceAll(',', '|');
    this.maxFileSizeMB = this.config.get(
      'LIB_FILESTORAGE_FILE_UPLOAD_MAX_SIZE_MB',
      { infer: true },
    );

    this.uploadInterceptor = new (FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: { fileSize: this.maxFileSizeMB * 1024 * 1024 },
      fileFilter: (_, file, cb) => {
        const fileTypesRegex = new RegExp(this.allowedFileTypes);
        const isValidExtname = fileTypesRegex.test(
          path.extname(file.originalname).toLowerCase(),
        );
        const isValidMimetype = fileTypesRegex.test(file.mimetype);

        if (isValidExtname && isValidMimetype) {
          return cb(null, true);
        }

        const err: Error & { code?: string } = new Error(
          `Type de fichier invalide : ${this.allowedFileTypes.replaceAll('|', ', ').toUpperCase()}`,
        );
        err.code = FileErrorCode.INVALID_FILE_TYPE;
        return cb(err, false);
      },
    }))();
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    let allowedBuckets = this.reflector.get<string[]>(
      ALLOWED_BUCKETS_KEY,
      context.getHandler(),
    );

    if (!allowedBuckets) {
      allowedBuckets = this.defaultAllowedBuckets;
    }

    const request = context.switchToHttp().getRequest<Request>();

    let bucket = this.reflector.get<string | undefined>(
      BUCKET_KEY,
      context.getHandler(),
    );

    if (bucket) {
      request.query.bucket = bucket;
    } else {
      bucket = request.query.bucket as string | undefined;
    }

    if (!bucket) {
      bucket = this.config.get<string>('LIB_MINIO_BUCKET_NAME');
      request.query.bucket = bucket;
    }

    this.validateBucket(bucket, allowedBuckets);

    return from(this.uploadInterceptor.intercept(context, next)).pipe(
      switchMap(() => {
        const file = request.file;
        if (!file || !file.buffer) {
          throw new ErrorResult({
            code: 400_327,
            clean_message: "Aucun fichier n'a été chargé",
            message: "Aucun fichier n'a été chargé",
          });
        }

        const fileBuffer = file.buffer;
        const hash = this.generateHash(fileBuffer);
        const timestamp = Date.now();
        const extension = path.extname(file.originalname);
        const filename = `${hash}-${timestamp}${extension}`;

        return from(
          this.fileService.uploadBufferFile(
            bucket!,
            filename,
            fileBuffer,
            file.size,
            file.mimetype,
          ),
        ).pipe(
          map(() => {
            request.uploadedFile = {
              ...file,
              filename,
              extension,
              timestamp,
              bucket,
              hash,
            };
            return next.handle();
          }),
          switchMap((handle) => handle),
        );
      }),
      catchError((error) => {
        if (error instanceof ErrorResult) {
          throw error;
        }

        if (
          error.code === FileErrorCode.LIMIT_FILE_SIZE ||
          error instanceof PayloadTooLargeException
        ) {
          throw new ErrorResult({
            code: 400_325,
            clean_message: `Le fichier dépasse la taille limite autorisée de ${this.maxFileSizeMB}Mo`,
            message: `Le fichier dépasse la taille limite autorisée de ${this.maxFileSizeMB}Mo`,
          });
        }

        if (error.code === FileErrorCode.INVALID_FILE_TYPE) {
          throw new ErrorResult({
            code: 400_326,
            clean_message: error.message,
            message: error.message,
          });
        }

        throw new ErrorResult({
          code: 500_006,
          clean_message: 'Erreur lors du chargement du fichier',
          message: error.message,
        });
      }),
    );
  }

  private validateBucket(
    bucket: string | undefined,
    allowedBuckets: string[],
  ): asserts bucket is string {
    if (!bucket) {
      throw new ErrorResult({
        code: 400_328,
        clean_message: "L'unité de stockage est obligatoire",
        message: 'Le paramètre de requête [bucket] est obligatoire',
      });
    }

    if (!allowedBuckets.includes(bucket)) {
      throw new ErrorResult({
        code: 400_329,
        clean_message: "L'unité de stockage est invalide",
        message: `Le paramètre de requête [bucket] est invalide : ${allowedBuckets.join(', ')}`,
      });
    }
  }

  private generateHash(fileBuffer: crypto.BinaryLike) {
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }
}
