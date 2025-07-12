import nodemailer from 'nodemailer'
import { CustomError } from '../domain/errors/custom.errors'
import { envs } from '../config/envs'

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
			secure: false, // false for TLS - as a boolean not string
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASSWORD,
			},
			requireTLS: true,
			tls: {
				ciphers: 'SSLv3',
				rejectUnauthorized: true,
			},
			debug: process.env.NODE_ENV === 'development',
			logger: process.env.NODE_ENV === 'development',
		})

		// Verify connection configuration
		this.transporter.verify((error, success) => {
			if (error) {
				console.error('SMTP connection error:', {
					error,
					config: {
						host: process.env.EMAIL_HOST,
						port: process.env.EMAIL_PORT,
						secure: false,
						user: process.env.EMAIL_USER,
					},
				})
			} else {
				console.log('SMTP connection successful:', success)
			}
		})
	}

	async sendEmail(options: EmailOptions): Promise<boolean> {
		try {
			const { to, subject, html } = options

			const mailOptions = {
				from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
				to,
				subject,
				html,
			}

			console.log('Attempting to send email with options:', {
				...mailOptions,
				html: 'HTML Content hidden',
			})

			const info = await this.transporter.sendMail(mailOptions)
			console.log('Email sent successfully:', {
				messageId: info.messageId,
				response: info.response,
			})

			return true
		} catch (error) {
			console.error('Detailed email sending error:', {
				error,
				stack: error instanceof Error ? error.stack : undefined,
				config: {
					host: process.env.EMAIL_HOST,
					port: process.env.EMAIL_PORT,
					secure: false,
					user: process.env.EMAIL_USER,
					from: process.env.EMAIL_FROM,
					fromName: process.env.EMAIL_FROM_NAME,
				},
			})
			throw CustomError.internalServer(
				`Error sending email: ${
					error instanceof Error ? error.message : 'Unknown error'
				}`,
			)
		}
	}

	async sendVerificationEmail(
		email: string,
		token: string,
		language: string = 'en',
	): Promise<boolean> {
		console.log('FRONTEND_URL:', envs.FRONTEND_URL)
		const verificationUrl = `${envs.FRONTEND_URL}/verify-email/${token}`
		console.log('Generated verification URL:', verificationUrl)

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
		const resetUrl = `${envs.FRONTEND_URL}/reset-password?token=${token}`

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
