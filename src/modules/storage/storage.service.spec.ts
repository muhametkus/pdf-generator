import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import * as fs from 'fs';
import * as path from 'path';

describe('StorageService', () => {
  let service: StorageService;
  const testUploadDir = 'test-uploads';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string, defaultValue?: any) => {
              if (key === 'storage.uploadDir') return testUploadDir;
              if (key === 'baseUrl')
                return 'https://teklifpdfgenerator.hebilogluahsap.com';
              return defaultValue;
            },
          },
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
  });

  afterAll(() => {
    const dir = path.resolve(process.cwd(), testUploadDir);
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('should save buffer to file and return public URL', async () => {
    const buffer = Buffer.from('test-pdf-content');
    const filename = 'test-doc-123';

    const url = await service.savePdf(filename, buffer);

    expect(url).toBe(
      'https://teklifpdfgenerator.hebilogluahsap.com/test-uploads/test-doc-123.pdf',
    );
    const filePath = path.resolve(
      process.cwd(),
      testUploadDir,
      'test-doc-123.pdf',
    );
    expect(fs.existsSync(filePath)).toBe(true);
    expect(fs.readFileSync(filePath).toString()).toBe('test-pdf-content');
  });
});
