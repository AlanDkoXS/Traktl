import { z } from 'zod';

const ResetPasswordSchema = z.object({
  token: z.string({
    required_error: 'Token is required',
  }),
  password: z
    .string({
      required_error: 'Password is required',
    })
    .min(6, {
      message: 'Password must be at least 6 characters',
    }),
});

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export class ResetPasswordDTO {
  constructor(
    public readonly token: string,
    public readonly password: string,
  ) {}

  static create(
    props: Record<string, unknown>,
  ): [string?, ResetPasswordDTO?] {
    const result = ResetPasswordSchema.safeParse(props);

    if (!result.success) {
      const errorMessages = result.error.errors
        .map((error) => `${error.path.join('.')}: ${error.message}`)
        .join(', ');
      return [errorMessages, undefined];
    }

    const { token, password } = result.data;
    return [undefined, new ResetPasswordDTO(token, password)];
  }
}
