import React, { forwardRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import ReCAPTCHA from 'react-google-recaptcha';

interface RecaptchaWidgetProps {
  onChange: (token: string | null) => void;
  onExpired?: () => void;
  theme?: 'light' | 'dark';
}

const SITE_KEY =
  process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY ||
  '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

export const RecaptchaWidget = forwardRef<ReCAPTCHA, RecaptchaWidgetProps>(
  ({ onChange, onExpired, theme = 'light' }, ref) => {
    return (
      <View style={styles.container}>
        {Platform.OS === 'web' && (
          <style>{`
            .g-recaptcha-bubble-arrow,
            iframe[title*="recaptcha"] + div,
            div[style*="color: red"],
            div[style*="color: rgb(255, 0, 0)"] {
              display: none !important;
            }
          `}</style>
        )}
        <View style={styles.recaptchaWrapper}>
          <ReCAPTCHA
            ref={ref}
            sitekey={SITE_KEY}
            onChange={onChange}
            onExpired={onExpired}
            theme={theme}
            hl="es"
          />
        </View>
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
  recaptchaWrapper: {
    height: 78,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 304,
  },
});
