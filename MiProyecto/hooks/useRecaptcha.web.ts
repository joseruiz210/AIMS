// Implementación WEB: usa el hook real de reCAPTCHA v3
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';

export function useRecaptcha() {
  const { executeRecaptcha } = useGoogleReCaptcha();
  return { executeRecaptcha: executeRecaptcha ?? null };
}
