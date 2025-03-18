import nodemailer from 'nodemailer'
import { CustomError } from '../domain/errors/custom.errors'

export interface EmailOptions {
	to: string
	subject: string
	html: string
}

export class EmailService {
	private transporter

	constructor() {
		this.transporter = nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: Number(process.env.EMAIL_PORT),
			secure: process.env.EMAIL_SECURE === 'true',
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASSWORD,
			},
		})
	}

	async sendEmail(options: EmailOptions): Promise<boolean> {
		try {
			const { to, subject, html } = options

			await this.transporter.sendMail({
				from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
				to,
				subject,
				html,
			})

			return true
		} catch (error) {
			console.error('Email sending error:', error)
			throw CustomError.internalServer('Error sending email')
		}
	}

	async sendVerificationEmail(
		email: string,
		token: string,
	): Promise<boolean> {
		const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

		const emailOptions: EmailOptions = {
			to: email,
			subject: 'Verify Your Email',
			html: `
        <div>
          <h1>Email Verification</h1>
          <p>Please click the button below to verify your email address:</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
            Verify Email
          </a>
          <p>If the button doesn't work, you can also click on this link:</p>
          <a href="${verificationUrl}">${verificationUrl}</a>
          <p>This link will expire in 24 hours.</p>
        </div>
      `,
		}

		return this.sendEmail(emailOptions)
	}
}
