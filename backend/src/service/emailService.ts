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
		language: string = 'en',
	): Promise<boolean> {
		const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

		let subject = 'Verify Your Email'
		let heading = 'Email Verification'
		let buttonText = 'Verify Email'
		let paragraph =
			'Please click the button below to verify your email address:'
		let linkText =
			"If the button doesn't work, you can also click on this link:"
		let expirationText = 'This link will expire in 24 hours.'

		if (language === 'es') {
			subject = 'Verifica tu Correo Electrónico'
			heading = 'Verificación de Correo'
			buttonText = 'Verificar Correo'
			paragraph =
				'Por favor haz clic en el botón a continuación para verificar tu correo electrónico:'
			linkText =
				'Si el botón no funciona, también puedes hacer clic en este enlace:'
			expirationText = 'Este enlace expirará en 24 horas.'
		} else if (language === 'tr') {
			subject = 'E-posta Adresinizi Doğrulayın'
			heading = 'E-posta Doğrulama'
			buttonText = 'E-postayı Doğrula'
			paragraph =
				'E-posta adresinizi doğrulamak için lütfen aşağıdaki düğmeye tıklayın:'
			linkText = 'Düğme çalışmıyorsa, bu bağlantıya da tıklayabilirsiniz:'
			expirationText = 'Bu bağlantı 24 saat içinde sona erecektir.'
		}

		const emailOptions: EmailOptions = {
			to: email,
			subject: subject,
			html: `
        <div>
          <h1>${heading}</h1>
          <p>${paragraph}</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
            ${buttonText}
          </a>
          <p>${linkText}</p>
          <a href="${verificationUrl}">${verificationUrl}</a>
          <p>${expirationText}</p>
        </div>
      `,
		}

		return this.sendEmail(emailOptions)
	}

	async sendPasswordResetEmail(
		email: string,
		token: string,
		language: string = 'en',
	): Promise<boolean> {
		const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

		let subject = 'Reset Your Password'
		let heading = 'Password Reset'
		let buttonText = 'Reset Password'
		let paragraph = 'Please click the button below to reset your password:'
		let linkText =
			"If the button doesn't work, you can also click on this link:"
		let expirationText = 'This link will expire in 1 hour.'

		if (language === 'es') {
			subject = 'Restablece tu Contraseña'
			heading = 'Restablecimiento de Contraseña'
			buttonText = 'Restablecer Contraseña'
			paragraph =
				'Por favor haz clic en el botón a continuación para restablecer tu contraseña:'
			linkText =
				'Si el botón no funciona, también puedes hacer clic en este enlace:'
			expirationText = 'Este enlace expirará en 1 hora.'
		} else if (language === 'tr') {
			subject = 'Şifrenizi Sıfırlayın'
			heading = 'Şifre Sıfırlama'
			buttonText = 'Şifreyi Sıfırla'
			paragraph =
				'Şifrenizi sıfırlamak için lütfen aşağıdaki düğmeye tıklayın:'
			linkText = 'Düğme çalışmıyorsa, bu bağlantıya da tıklayabilirsiniz:'
			expirationText = 'Bu bağlantı 1 saat içinde sona erecektir.'
		}

		const emailOptions: EmailOptions = {
			to: email,
			subject: subject,
			html: `
        <div>
          <h1>${heading}</h1>
          <p>${paragraph}</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
            ${buttonText}
          </a>
          <p>${linkText}</p>
          <a href="${resetUrl}">${resetUrl}</a>
          <p>${expirationText}</p>
        </div>
      `,
		}

		return this.sendEmail(emailOptions)
	}
}
