export interface EmailService {
  sendPasswordResetEmail(to: string, resetLink: string): Promise<void>;
}

export const EMAIL_SERVICE = Symbol('EMAIL_SERVICE');
