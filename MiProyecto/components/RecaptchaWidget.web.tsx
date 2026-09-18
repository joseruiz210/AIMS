import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';

interface RecaptchaWidgetProps {
  onChange: (token: string | null) => void;
  onExpired?: () => void;
  theme?: 'light' | 'dark';
}

const SITE_KEY =
  process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY ||
  '6LclGsMtAAAAAKIrWUSkjX9qzOciKUrPxPk3sD_D';

declare global {
  interface Window {
    grecaptcha?: any;
    onRecaptchaLoaded?: () => void;
  }
}

export const RecaptchaWidget = forwardRef<any, RecaptchaWidgetProps>(
  ({ onChange, onExpired, theme = 'light' }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<number | null>(null);

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current !== null && window.grecaptcha) {
          const api = window.grecaptcha.enterprise || window.grecaptcha;
          try {
            api.reset(widgetIdRef.current);
          } catch (e) {
            console.warn('Error resetting captcha', e);
          }
        }
      },
    }));

    useEffect(() => {
      let isMounted = true;

      const renderWidget = () => {
        if (!containerRef.current || !isMounted) return;
        const api = window.grecaptcha?.enterprise || window.grecaptcha;
        if (!api || !api.render) return;

        // Limpiar contenedor si ya tenía algo
        containerRef.current.innerHTML = '';

        try {
          widgetIdRef.current = api.render(containerRef.current, {
            sitekey: SITE_KEY,
            callback: (token: string) => {
              if (isMounted) onChange(token);
            },
            'expired-callback': () => {
              if (isMounted && onExpired) onExpired();
            },
            theme: theme,
            hl: 'es',
          });
        } catch (err) {
          console.error('Error rendering reCAPTCHA:', err);
        }
      };

      // Si el script ya existe y está cargado
      if (window.grecaptcha && (window.grecaptcha.enterprise || window.grecaptcha.render)) {
        renderWidget();
        return;
      }

      // Cargar script de reCAPTCHA Enterprise & Clásico
      const scriptId = 'google-recaptcha-enterprise-script';
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://www.google.com/recaptcha/enterprise.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          if (isMounted) renderWidget();
        };
        document.head.appendChild(script);
      } else {
        const interval = setInterval(() => {
          if (window.grecaptcha) {
            clearInterval(interval);
            if (isMounted) renderWidget();
          }
        }, 200);
        return () => clearInterval(interval);
      }

      return () => {
        isMounted = false;
      };
    }, [theme, onChange, onExpired]);

    return (
      <View style={styles.container}>
        <div ref={containerRef} style={{ minHeight: 78 }} />
      </View>
    );
  }
);

RecaptchaWidget.displayName = 'RecaptchaWidget';

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});
