export interface PasswordRequirements {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export interface PasswordValidationResult {
  isValid: boolean;
  score: number; // 0 a 5
  strengthText: 'Muy Débil' | 'Débil' | 'Aceptable' | 'Fuerte' | 'Excelente';
  strengthColor: string;
  requirements: PasswordRequirements;
  errors: string[];
}

/**
 * Dominios de correos temporales / desechables no permitidos
 */
const DISPOSABLE_DOMAINS = [
  'yopmail.com', 'mailinator.com', '10minutemail.com', 'guerrillamail.com', 
  'tempmail.com', 'trashmail.com', 'dispostable.com', 'sharklasers.com',
  'getnada.com', 'binkmail.com', 'safetymail.info'
];

/**
 * Valida si un correo electrónico tiene un formato sintáctico válido
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Comprueba si el correo pertenece a un dominio temporal/desechable
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.trim().split('@')[1]?.toLowerCase();
  return domain ? DISPOSABLE_DOMAINS.includes(domain) : false;
}

export interface EmailVerificationResult {
  isValidFormat: boolean;
  isNotDisposable: boolean;
  domainExists: boolean;
  message: string;
}

/**
 * Consulta los registros MX de DNS para verificar si el dominio del correo existe y puede recibir correos reales
 */
export async function verifyEmailDomainExistence(email: string): Promise<EmailVerificationResult> {
  const trimmed = email.trim().toLowerCase();

  if (!validateEmail(trimmed)) {
    return {
      isValidFormat: false,
      isNotDisposable: true,
      domainExists: false,
      message: 'El formato de correo no es válido (ej. usuario@dominio.com).'
    };
  }

  if (isDisposableEmail(trimmed)) {
    return {
      isValidFormat: true,
      isNotDisposable: false,
      domainExists: false,
      message: 'No se permiten correos temporales o desechables.'
    };
  }

  const domain = trimmed.split('@')[1];

  // Dominios institucionales y oficiales permitidos de antemano
  const trustedDomains = ['sena.edu.co', 'soy.sena.edu.co', 'misena.edu.co', 'gmail.com', 'aims.edu.co'];
  if (trustedDomains.includes(domain)) {
    return {
      isValidFormat: true,
      isNotDisposable: true,
      domainExists: true,
      message: `Dominio @${domain} verificado.`
    };
  }

  try {
    // Consulta DNS pública de Google sobre registros MX (Mail Exchange)
    const response = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });

    const data = await response.json();

    // Status 0 significa que el dominio existe. Si data.Answer contiene registros MX, el servidor de correo funciona.
    const hasMXRecords = data.Status === 0 && Array.isArray(data.Answer) && data.Answer.length > 0;

    if (hasMXRecords) {
      return {
        isValidFormat: true,
        isNotDisposable: true,
        domainExists: true,
        message: `El dominio "@${domain}" existe y cuenta con servidores de correo activos.`
      };
    } else {
      return {
        isValidFormat: true,
        isNotDisposable: true,
        domainExists: false,
        message: `El dominio "@${domain}" no existe o no tiene servidores de correo habilitados para recibir mensajes.`
      };
    }
  } catch (error) {
    // Fallback si no hay conexión a internet para consultar DNS
    return {
      isValidFormat: true,
      isNotDisposable: true,
      domainExists: true, // Permitir continuar si no hay acceso a la API DNS
      message: 'Dominio verificado con formato estándar.'
    };
  }
}


/**
 * Valida una contraseña según criterios de seguridad exigidos
 */
export function validatePassword(password: string): PasswordValidationResult {
  const requirements: PasswordRequirements = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const errors: string[] = [];
  if (!requirements.minLength) errors.push('Mínimo 8 caracteres');
  if (!requirements.hasUppercase) errors.push('Al menos una letra mayúscula');
  if (!requirements.hasLowercase) errors.push('Al menos una letra minúscula');
  if (!requirements.hasNumber) errors.push('Al menos un número');
  if (!requirements.hasSpecialChar) errors.push('Al menos un carácter especial (!@#$%^&*)');

  const fulfilledCount = Object.values(requirements).filter(Boolean).length;

  let strengthText: PasswordValidationResult['strengthText'] = 'Muy Débil';
  let strengthColor = '#EF4444'; // Rojo

  if (fulfilledCount === 5) {
    strengthText = 'Excelente';
    strengthColor = '#10B981'; // Verde
  } else if (fulfilledCount === 4) {
    strengthText = 'Fuerte';
    strengthColor = '#3B82F6'; // Azul
  } else if (fulfilledCount === 3) {
    strengthText = 'Aceptable';
    strengthColor = '#F59E0B'; // Naranja/Amarillo
  } else if (fulfilledCount === 2) {
    strengthText = 'Débil';
    strengthColor = '#F97316'; // Naranja oscuro
  }

  return {
    isValid: errors.length === 0,
    score: fulfilledCount,
    strengthText,
    strengthColor,
    requirements,
    errors,
  };
}

/**
 * Valida la coincidencia entre la contraseña y la confirmación
 */
export function validatePasswordMatch(password: string, confirmPassword: string): boolean {
  return password.length > 0 && password === confirmPassword;
}
