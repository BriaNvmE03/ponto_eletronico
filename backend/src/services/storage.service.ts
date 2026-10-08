import { Client } from 'minio';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../errors/AppError';

class StorageService {
  private minioClient: Client;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.MINIO_BUCKET_NAME || 'ponto-eletronico';
    
    this.minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
      port: parseInt(process.env.MINIO_PORT || '9000', 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'admin',
      secretKey: process.env.MINIO_SECRET_KEY || 'adminpassword',
    });

    this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        console.log(`Bucket ${this.bucketName} criado com sucesso no MinIO.`);
        
        // Define a política pública de leitura para as fotos
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/*`],
            },
          ],
        };
        await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
      }
    } catch (error) {
      console.error('Erro ao inicializar bucket do MinIO:', error);
    }
  }

  /**
   * Recebe uma imagem em base64 e envia para o MinIO
   * @param base64String A string base64, ex: "data:image/png;base64,iVBORw0KGgo..."
   * @returns A URL pública da imagem
   */
  async uploadBase64Photo(base64String: string, folder: string = 'punches'): Promise<string> {
    try {
      const matches = base64String.match(/^data:([A-Za-z-+\\/]+);base64,(.+)$/);
      
      if (!matches || matches.length !== 3) {
        throw new AppError('Formato de imagem inválido. Esperado data:image/png;base64,...', 400);
      }

      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      const extension = mimeType.split('/')[1] || 'jpeg';
      const fileName = `${folder}/${uuidv4()}.${extension}`;

      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        buffer,
        buffer.length,
        { 'Content-Type': mimeType }
      );

      const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
      const endpoint = process.env.MINIO_ENDPOINT || '127.0.0.1';
      const port = process.env.MINIO_PORT || '9000';
      
      // Retorna a URL pública
      return `${protocol}://${endpoint}:${port}/${this.bucketName}/${fileName}`;
    } catch (error) {
      console.error('Erro ao fazer upload no MinIO:', error);
      throw new AppError('Não foi possível enviar a foto.', 500);
    }
  }
}

export const storageService = new StorageService();
