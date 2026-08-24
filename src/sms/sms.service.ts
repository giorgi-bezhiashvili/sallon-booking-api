import { Injectable, Logger } from '@nestjs/common';

// Stands in for a real provider (e.g. Twilio's messages.create). Swap the
// body of sendOtp for an actual Twilio SDK call when ready — BookingService
// only depends on this interface, so nothing else needs to change.
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async sendOtp(phone: string, code: string): Promise<void> {
    this.logger.log(`[MOCK SMS] To ${phone}: your salon verification code is ${code}`);
    return Promise.resolve();
  }
}
