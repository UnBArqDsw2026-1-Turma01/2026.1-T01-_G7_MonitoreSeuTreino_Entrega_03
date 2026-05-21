import { RefreshToken } from '@domain/entities/refresh-token.entity';
import { ExpiresAt } from '@domain/value-objects/expires-at.vo';
import { Timestamp } from '@domain/value-objects/timestamp.vo';
import { TokenHash } from '@domain/value-objects/token-hash.vo';

describe('RefreshToken Entity (Factory Methods)', () => {
  const validUserId = '123e4567-e89b-12d3-a456-426614174000'; // Formato UUID válido
  const mockTokenHash = TokenHash.from('7f8a9b...token...hash');
  const mockExpiresAt = ExpiresAt.reconstitute(new Date(Date.now() + 100000));

  describe('create() - Criação de Sessão', () => {
    it('✓ RefreshToken.create() valida a integridade matemática do formato do campo userId', () => {
      const invalidUserId = 'id-malformado-sem-tracos';

      // Espera que a execução quebre na barreira UserId.reconstitute(userId)
      expect(() => {
        RefreshToken.create(invalidUserId, mockTokenHash, mockExpiresAt);
      }).toThrow(); // Pode especificar a exceção, ex: .toThrow(DomainException)
    });

    it('✓ RefreshToken.create() gera tokens identificadores UUID distintos a cada nova chamada', () => {
      const token1 = RefreshToken.create(
        validUserId,
        mockTokenHash,
        mockExpiresAt,
      );
      const token2 = RefreshToken.create(
        validUserId,
        mockTokenHash,
        mockExpiresAt,
      );

      expect(token1.id).toBeDefined();
      expect(token2.id).toBeDefined();
      expect(token1.id).not.toBe(token2.id); // Garante a unicidade entre os tokens
    });
  });

  describe('reconstitute() - Hidratação da Persistência', () => {
    it('✓ RefreshToken.reconstitute() preserva o campo data de revogação nulo ou preenchido conforme persistência', () => {
      const now = Timestamp.now();
      const revokedDate = Timestamp.now();

      // Teste do cenário "Ativo" (Nulo no BD)
      const activeToken = RefreshToken.reconstitute(
        'b31a89ea-token-id-1111',
        validUserId,
        mockTokenHash,
        mockExpiresAt,
        now,
        null,
      );
      expect(activeToken.revokedAt).toBeNull();

      // Teste do cenário "Revogado" (Preenchido no BD)
      const revokedToken = RefreshToken.reconstitute(
        'b31a89ea-token-id-2222',
        validUserId,
        mockTokenHash,
        mockExpiresAt,
        now,
        revokedDate,
      );
      expect(revokedToken.revokedAt).toBe(revokedDate);
    });
  });
});
