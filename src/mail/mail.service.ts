import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Service, Sex } from '../schemas/booking.schema';
@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendBookingNotification(
    staffEmail: string,
    customerPhone: string,
    customerName: string | undefined,
    startTime: Date,
    endTime: Date,
    service: Service,
    sex: Sex,
  ): Promise<void> {
    const formattedStartTime = startTime.toLocaleString();
    const formattedEndTime = endTime.toLocaleTimeString();

    await this.mailerService.sendMail({
      to: staffEmail,
      subject: 'ახალი ჯავშანი',
      html: `
        <h2>ახალი ჯავშანი</h2>
        <p>გამარჯობა,</p>
        <p>You have received a new booking. Here are the details:</p>
        <ul>
          <li><strong>მომხმარებლის ტელეფონის ნომერი:</strong> ${customerPhone}</li>
          <li><strong>მომხმარებლის სახელი:</strong> ${customerName || 'N/A'}</li>
          <li><strong>დრო:</strong> ${formattedStartTime} - ${formattedEndTime}</li>
          <li><strong>სქესი:</strong>${sex}</li>
          <li><strong>სერვისი:</strong>${service}</li>
        </ul>
      `,
    });
  }
}
