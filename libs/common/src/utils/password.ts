import * as PasswordValidator from 'password-validator';

const passwdSchema = new PasswordValidator();

passwdSchema
  .is()
  .min(8, `${400_062}|Le mot de passe doit contenir au moins 8 caractères`)
  .is()
  .max(30, `${400_063}|Le mot de passe doit contenir au plus 30 caractères`)
  .has()
  .uppercase(
    1,
    `${400_064}|Le mot de passe doit contenir au moins une lettre majuscule`,
  )
  .has()
  .lowercase(
    1,
    `${400_065}|Le mot de passe doit contenir au moins une lettre minuscule`,
  )
  .has()
  .digits(1, `${400_066}|Le mot de passe doit contenir au moins un chiffre`)
  .has()
  .not()
  .spaces(0, `${400_067}|Le mot de passe ne doit pas comporter d'espaces`)
  .is()
  .not()
  .oneOf(
    ['Passw0rd', 'Password123'],
    `${400_068}|Le mot de passe ne doit pas être commun`,
  );

export const validatePassword = (password: string) => {
  const result = passwdSchema.validate(password, { details: true });

  if (Array.isArray(result) && result.length > 0) {
    return result.map((err: { message: string }) => {
      const [code, message] = err.message.split('|') as [string, string];
      return { code: Number(code), message };
    });
  }

  return true;
};
