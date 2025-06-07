/* eslint-disable @typescript-eslint/no-unused-vars */
import { ErrorResult, FileUtils, SuccessResult } from '@app/common/utils';
import { AppConfig } from '@app/core/config';
import { LeanedDocument } from '@app/core/providers/base.mongo.repository';
import { MinioFileRepository } from '@app/file-storage/infrastructure/repositories/minioFile.repository';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, ItemBucketMetadata } from 'minio';

export type UploadedFile = {
  filename: string;
  originalname: string;
  extension: string;
  mimetype: string;
  size: number;
  path: string;
  timestamp: number;
  bucket: string;
  hash: string;
};

export type DownloadableFile = LeanedDocument<File> & { filePath: string };

@Injectable()
export class FileService {
  private readonly minioClient: Client;
  private readonly bucketName: string;
  private readonly minioRegion: string;

  constructor(
    private readonly config: ConfigService<AppConfig, true>,
    private readonly minioFIleRepository: MinioFileRepository,
  ) {
    this.minioClient = new Client({
      endPoint: this.config.get('LIB_MINIO_HOST', {
        infer: true,
      }),
      port: this.config.get('LIB_MINIO_API_PORT', {
        infer: true,
      }),
      useSSL: this.config.get('LIB_MINIO_USE_SSL', {
        infer: true,
      }),
      accessKey: this.config.get('LIB_MINIO_ACCESS_KEY', {
        infer: true,
      }),
      secretKey: this.config.get('LIB_MINIO_SECRET_KEY', {
        infer: true,
      }),
    });

    this.bucketName = this.config.get('LIB_MINIO_BUCKET_NAME', {
      infer: true,
    });

    this.minioRegion = this.config.get('LIB_MINIO_REGION', {
      infer: true,
    });
  }

  async create(file: UploadedFile) {
    try {
      const fileData = {
        name: file.filename,
        size: file.size,
        type: file.mimetype,
        extension: file.extension,
        key: file.timestamp,
        hash: file.hash,
        bucket: file.bucket,
      };
    } catch {
      throw new ErrorResult({
        code: 500_001,
        clean_message: 'Une erreur est survenue lors de la création du fichier',
        message: 'Une erreur est survenue lors de la création du fichier',
      });
    }
  }

  async createBucket(): Promise<any> {
    try {
      const bucketExists = await this.checkBucket();
      if (bucketExists) {
        return;
      }
      await this.minioClient.makeBucket(this.bucketName, this.minioRegion);
      return null;
    } catch (error) {
      console.log('error occurred', error);

      throw new ErrorResult({
        code: 500_020,
        clean_message: 'An error occurred while creating the bucket',
        message: 'An error occurred while creating the bucket',
      });
    }
  }

  async uploadSingleFile(
    fileName: string,
    filePath: string,
    buffer: Buffer,
    size: number,
    mimetype: any,
    metadata: ItemBucketMetadata = {},
    contentType = 'application/octet-stream',
  ): Promise<any> {
    try {
      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        buffer,
        size,
        {
          'Content-Type': mimetype,
        },
      );
      const filePathUrl = `/${this.bucketName}/${fileName}`;
      return filePathUrl;
    } catch (error) {
      throw new ErrorResult({
        code: 500_010,
        clean_message: 'An error occurred while uploading the file',
        message: 'An error occurred while uploading the file',
      });
    }
  }

  async uploadBufferFile(
    bucket: string,
    filename: string,
    buffer: Buffer,
    size: number,
    contentType = 'application/octet-stream',
  ): Promise<void> {
    try {
      await this.minioClient.putObject(bucket, filename, buffer, size, {
        'Content-Type': contentType,
      });
    } catch (error) {
      throw new ErrorResult({
        code: 500_012,
        clean_message: 'Erreur lors de l’envoi du fichier vers MinIO',
        message: error,
      });
    }
  }

  async downloadFile(fileName: string, destinationPath: string): Promise<any> {
    try {
      return await this.minioClient.getObject(this.bucketName, fileName);
    } catch (error) {
      throw new ErrorResult({
        code: 500_023,
        clean_message: 'An error occurred while downloading the file',
        message: 'An error occurred while downloading the file',
      });
    }
  }

  // async uploadBuffer(
  //   fileName: string,
  //   buffer: Buffer,
  //   metadata: ItemBucketMetadata = {},
  //   contentType = 'application/octet-stream',
  // ): Promise<any> {
  //   try {
  //     await this.minioClient.putObject(
  //       this.bucketName,
  //       fileName,
  //       buffer,
  //       buffer.length,
  //       {
  //         'Content-Type': contentType,
  //         ...metadata,
  //       },
  //     );
  //     const filePathUrl = `/${this.bucketName}/${fileName}`;
  //     return filePathUrl;
  //   } catch (error) {
  //     throw new ErrorResult({
  //       code: 500_203,
  //       clean_message: 'An error occurred while uploading buffer',
  //       message: 'An error occurred while uploading buffer',
  //     });
  //   }
  // }

  async checkBucket(): Promise<boolean> {
    try {
      return await this.minioClient.bucketExists(this.bucketName);
    } catch {
      return false;
    }
  }
}
