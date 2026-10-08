import { Client } from 'minio';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../errors/AppError';

class StorageService {
  private minioClient: Client;
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.MINIO_BUCKET_NAME || 'ponto-eletronico';
    
    // Suporte automático para Neon Object Storage (AWS_*) ou MinIO Local (MINIO_*)
    let endPoint = process.env.MINIO_ENDPOINT || '127.0.0.1';
    let port = parseInt(process.env.MINIO_PORT || '9000', 10);
    let useSSL = process.env.MINIO_USE_SSL === 'true';

    // Se o Neon injetou a URL do S3 (produção), nós extraímos o hostname
    if (process.env.AWS_ENDPOINT_URL_S3) {
      try {
        const url = new URL(process.env.AWS_ENDPOINT_URL_S3);
        endPoint = url.hostname;
        port = url.port ? parseInt(url.port, 10) : (url.protocol === 'https:' ? 443 : 80);
        useSSL = url.protocol === 'https:';
      } catch (e) {
        console.error("Erro ao parsear AWS_ENDPOINT_URL_S3", e);
      }
    }

    this.minioClient = new Client({
      endPoint,
      port,
      useSSL,
      accessKey: process.env.AWS_ACCESS_KEY_ID || process.env.MINIO_ACCESS_KEY || 'admin',
      secretKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.MINIO_SECRET_KEY || 'adminpassword',
      region: process.env.AWS_REGION || 'us-east-2', // Neon costuma usar us-east-2
    });

    this.initializeBucket();
  }

  private async initializeBucket() {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName);
      if (!exists) {
        // Importante: No Neon Object Storage, a criação de bucket via SDK costuma funcionar
        // mas o ideal é deixar o neon.ts criar. De qualquer forma, mantemos o fallback.
        await this.minioClient.makeBucket(this.bucketName, process.env.AWS_REGION || 'us-east-2');
        console.log(`Bucket ${this.bucketName} inicializado.`);
        
        // Define a política pública de leitura para as fotos (para fallback local)
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
    } catch (error: any) {
      // Ignora erro se não tiver permissão para checar policy no Neon (as vezes S3 bloqueia GetBucketPolicy)
      if (error.code !== 'AccessDenied') {
         console.error('Aviso ao inicializar bucket no Storage:', error.message || error);
      }
    }
  }

  /**
   * Recebe uma imagem em base64 e envia para o Storage
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

      // Constrói a URL pública final
      if (process.env.AWS_ENDPOINT_URL_S3) {
         // Formato S3 padrão: https://endpoint/bucket/file
         const baseEndpoint = process.env.AWS_ENDPOINT_URL_S3.endsWith('/') 
             ? process.env.AWS_ENDPOINT_URL_S3.slice(0, -1) 
             : process.env.AWS_ENDPOINT_URL_S3;
         return `${baseEndpoint}/${this.bucketName}/${fileName}`;
      } else {
         // Formato MinIO Local
         const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
         const endpoint = process.env.MINIO_ENDPOINT || '127.0.0.1';
         const port = process.env.MINIO_PORT || '9000';
         return `${protocol}://${endpoint}:${port}/${this.bucketName}/${fileName}`;
      }
    } catch (error) {
      console.error('Erro ao fazer upload no Storage:', error);
      throw new AppError('Não foi possível enviar a foto.', 500);
    }
  }
}

export const storageService = new StorageService();
