import { GetMyOnboardingUseCase } from '@application/use-cases/onboarding/get-my-onboarding.use-case';
import { RedoOnboardingUseCase } from '@application/use-cases/onboarding/redo-onboarding.use-case';
import { SubmitOnboardingUseCase } from '@application/use-cases/onboarding/submit-onboarding.use-case';
import { OnboardingFacade } from '@presentation/facades/onboarding.facade';
import { ClassificationResult } from '@domain/onboarding/value-objects/classification-result.vo';
import { OnboardingAnswers } from '@domain/onboarding/value-objects/onboarding-answers.vo';
import { ConsistencyLevel } from '@domain/onboarding/enums/consistency-level.enum';
import { Sex } from '@domain/onboarding/enums/sex.enum';
import { TechniqueLevel } from '@domain/onboarding/enums/technique-level.enum';
import { TrainingGoal } from '@domain/onboarding/enums/training-goal.enum';
import { TrainingProfile } from '@domain/onboarding/entities/training-profile.entity';
import {
  TRAINING_PROFILE_REPOSITORY,
} from '@domain/onboarding/repositories/training-profile.repository';
import {
  ONBOARDING_HISTORY_REPOSITORY,
} from '@domain/onboarding/repositories/onboarding-history.repository';
import { TOKEN_SERVICE } from '@domain/services/token.service';
import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { OnboardingController } from './onboarding.controller';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';

const validPayload = {
  sex: Sex.MALE,
  age: 25,
  experienceMonths: 24,
  weeklyFrequency: 5,
  mainGoal: TrainingGoal.STRENGTH,
  followedStructuredPlan: true,
  techniqueLevel: TechniqueLevel.HIGH,
  usesProgressiveLoad: true,
  recentConsistency: ConsistencyLevel.HIGH,
  hasLimitation: false,
};

function makeMockProfile(): TrainingProfile {
  const answers = OnboardingAnswers.create(validPayload);
  const result = ClassificationResult.create(10);
  return TrainingProfile.create('user-abc', answers, result);
}

describe('OnboardingController (integração)', () => {
  let app: INestApplication;
  let mockProfileRepo: { findByUserId: jest.Mock; save: jest.Mock };
  let mockHistoryRepo: { save: jest.Mock; findByUserId: jest.Mock };
  let mockTokenService: { verifyAccessToken: jest.Mock; getRefreshTokenTtl: jest.Mock };

  beforeEach(async () => {
    mockProfileRepo = {
      findByUserId: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };

    mockHistoryRepo = {
      save: jest.fn().mockResolvedValue(undefined),
      findByUserId: jest.fn().mockResolvedValue([]),
    };

    mockTokenService = {
      verifyAccessToken: jest.fn().mockReturnValue({ userId: 'user-abc' }),
      getRefreshTokenTtl: jest.fn(),
    };

    const getMyOnboarding = new GetMyOnboardingUseCase(mockProfileRepo as any);
    const submitOnboarding = new SubmitOnboardingUseCase(mockProfileRepo as any);
    const redoOnboarding = new RedoOnboardingUseCase(
      mockProfileRepo as any,
      mockHistoryRepo as any,
    );
    const facade = new OnboardingFacade(getMyOnboarding, submitOnboarding, redoOnboarding);

    const moduleRef = await Test.createTestingModule({
      controllers: [OnboardingController],
      providers: [
        { provide: OnboardingFacade, useValue: facade },
        { provide: TRAINING_PROFILE_REPOSITORY, useValue: mockProfileRepo },
        { provide: ONBOARDING_HISTORY_REPOSITORY, useValue: mockHistoryRepo },
        { provide: TOKEN_SERVICE, useValue: mockTokenService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    const mockLogger = { error: jest.fn(), log: jest.fn(), warn: jest.fn() };
    app.useGlobalFilters(new DomainExceptionFilter(mockLogger as any));
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /v1/onboarding/me', () => {
    it('retorna completed=false quando onboarding não existe', async () => {
      mockProfileRepo.findByUserId.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .get('/v1/onboarding/me')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.completed).toBe(false);
      expect(res.body.profile).toBeNull();
    });

    it('retorna completed=true com perfil quando onboarding existe', async () => {
      mockProfileRepo.findByUserId.mockResolvedValue(makeMockProfile());

      const res = await request(app.getHttpServer())
        .get('/v1/onboarding/me')
        .set('Authorization', 'Bearer valid-token');

      expect(res.status).toBe(HttpStatus.OK);
      expect(res.body.completed).toBe(true);
      expect(res.body.profile).not.toBeNull();
    });

    it('retorna 401 para usuário não autenticado', async () => {
      mockTokenService.verifyAccessToken.mockImplementation(() => {
        throw new Error('invalid token');
      });

      const res = await request(app.getHttpServer()).get('/v1/onboarding/me');

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /v1/onboarding', () => {
    it('cria perfil com sucesso', async () => {
      mockProfileRepo.findByUserId.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post('/v1/onboarding')
        .set('Authorization', 'Bearer valid-token')
        .send(validPayload);

      expect(res.status).toBe(HttpStatus.CREATED);
      expect(res.body.classification).toBeDefined();
      expect(res.body.score).toBeDefined();
    });

    it('retorna 409 quando onboarding já foi feito', async () => {
      mockProfileRepo.findByUserId.mockResolvedValue(makeMockProfile());

      const res = await request(app.getHttpServer())
        .post('/v1/onboarding')
        .set('Authorization', 'Bearer valid-token')
        .send(validPayload);

      expect(res.status).toBe(HttpStatus.CONFLICT);
    });

    it('retorna 401 para usuário não autenticado', async () => {
      mockTokenService.verifyAccessToken.mockImplementation(() => {
        throw new Error('invalid token');
      });

      const res = await request(app.getHttpServer())
        .post('/v1/onboarding')
        .send(validPayload);

      expect(res.status).toBe(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('PUT /v1/onboarding', () => {
    it('atualiza perfil e salva histórico anterior', async () => {
      const existing = makeMockProfile();
      mockProfileRepo.findByUserId.mockResolvedValue(existing);

      const res = await request(app.getHttpServer())
        .put('/v1/onboarding')
        .set('Authorization', 'Bearer valid-token')
        .send(validPayload);

      expect(res.status).toBe(HttpStatus.OK);
      expect(mockHistoryRepo.save).toHaveBeenCalledTimes(1);
    });

    it('retorna 404 quando não há onboarding anterior', async () => {
      mockProfileRepo.findByUserId.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .put('/v1/onboarding')
        .set('Authorization', 'Bearer valid-token')
        .send(validPayload);

      expect(res.status).toBe(HttpStatus.NOT_FOUND);
    });
  });
});
