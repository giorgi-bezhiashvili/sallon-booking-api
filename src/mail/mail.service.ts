import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendBookingNotification(
    staffEmail: string,
    customerPhone: string,
    customerName: string | undefined,
    startTime: Date,
    endTime: Date,
  ): Promise<void> {
    const formattedStartTime = startTime.toLocaleString();
    const formattedEndTime = endTime.toLocaleTimeString();

    await this.mailerService.sendMail({
      to: staffEmail,
      subject: 'New Booking Confirmation',
      html: `
        <h2>New Booking Notification</h2>
        <p>Hello,</p>
        <p>You have received a new booking. Here are the details:</p>
        <ul>
          <li><strong>Customer Phone:</strong> ${customerPhone}</li>
          <li><strong>Customer Name:</strong> ${customerName || 'N/A'}</li>
          <li><strong>Booking Date & Time:</strong> ${formattedStartTime} - ${formattedEndTime}</li>
        </ul>
      `,
    });
  }
}
