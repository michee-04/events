import { Duplex } from 'stream';
import { StringUtils } from './string.utils';

const MIME_TYPES = {
  // Images
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.bmp': 'image/bmp',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',

  // Documents
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx':
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',

  // Text
  '.txt': 'text/plain',
  '.csv': 'text/csv',
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',

  // Audio
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',

  // Vidéo
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogv': 'video/ogg',

  // Archives
  '.zip': 'application/zip',
  '.rar': 'application/x-rar-compressed',
  '.tar': 'application/x-tar',
  '.gz': 'application/gzip',

  // Autres
  '.json': 'application/json',
  '.xml': 'application/xml',
  '.yaml': 'application/x-yaml',
  '.md': 'text/markdown',
};

export class FileUtils {
  /**
   * Convert a buffer into a stream
   */
  static bufferToStream(buff: Buffer) {
    const tmp = new Duplex();
    tmp.push(buff);
    tmp.push(null);
    return tmp;
  }

  /**
   * Get the mime type of a file extensionS
   */
  static getMimeType(extension = ''): string {
    return MIME_TYPES[extension.toLowerCase()] || 'application/octet-stream';
  }

  /**
   * Generate unique filename by slugifying the original filename and adding a timestamp
   */
  static generateUniqueFilename(filename = ''): string {
    const timestamp = Date.now();
    const [name, extension] = filename.split(/(\.[^/.]+)$/);
    return `${StringUtils.slugify(name)}-${timestamp}${extension}`;
  }
}
