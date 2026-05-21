import { User } from '@domain/entities/user.entity';
import { UserRegisteredEvent } from '@domain/events/user-events';
import { Email } from '@domain/value-objects/email.vo';
import { HashedPassword } from '@domain/value-objects/hashed-password.vo';
import { PersonName } from '@domain/value-objects/person-name.vo';
import { Timestamp } from '@domain/value-objects/timestamp.vo';

describe('User Entity (Factory Methods)', () => {
  // Mocks de Value Objects necessários para instanciar a entidade
  const mockName = PersonName.reconstitute('João da Silva');
  const mockEmail = Email.reconstitute('joao@email.com');
  const mockPassword = HashedPassword.fromHash('hash_super_seguro_123');
  const now = Timestamp.now();

  describe('create() - Criação Genuína', () => {
    it('✓ User.create() gera id UUID válido automaticamente', () => {
      const user = User.create(mockName, mockEmail, mockPassword);

      expect(user.id).toBeDefined();
      // Regex para validar integridade do formato UUID v4
      const uuidV4Regex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(user.id).toMatch(uuidV4Regex);
    });

    it('✓ User.create() acumula e expõe exatamente um UserRegisteredEvent', () => {
      const user = User.create(mockName, mockEmail, mockPassword);

      const events = user.pullDomainEvents();

      expect(events).toHaveLength(1);
      expect(events[0].constructor.name).toBe('UserRegisteredEvent');

      // Valida se o evento carrega o ID correto
      const event = events[0] as UserRegisteredEvent;
      expect(event.userId).toBe(user.id);
    });
  });

  describe('reconstitute() - Hidratação da Persistência', () => {
    it('✓ User.reconstitute() não acumula nenhum evento de domínio em sua inicialização', () => {
      const user = User.reconstitute(
        'b31a89ea-3e5f-40c2-9e8c-f86a98765432',
        mockName,
        mockEmail,
        mockPassword,
        now,
        now,
        null,
      );

      const events = user.pullDomainEvents();
      expect(events).toHaveLength(0); // Garante ausência de efeitos colaterais
    });

    it('✓ User.reconstitute() preserva fielmente o ID recebido sem substituições indesejadas', () => {
      const fixedId = 'b31a89ea-3e5f-40c2-9e8c-f86a98765432';
      const user = User.reconstitute(
        fixedId,
        mockName,
        mockEmail,
        mockPassword,
        now,
        now,
        null,
      );

      expect(user.id).toBe(fixedId); // Garante que a Factory não sobrescreveu o ID
    });
  });
});
