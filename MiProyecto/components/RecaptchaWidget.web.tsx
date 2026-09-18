import React, { forwardRef } from 'react';
import { View, StyleSheet } from 'react-native';
import ReCAPTCHA from 'react-google-recaptcha';

interface RecaptchaWidgetProps {
  onChange: (token: string | null) => void;
  onExpired?: () => void;
  theme?: 'light' | 'dark';
}

const SITE_KEY =
  process.env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY ||
  '6LclGsMtAAAAAKIrWUSkjX9qzOciKUrPxPk3sD_D';

export const RecaptchaWidget = forwardRef<ReCAPTCHA, RecaptchaWidgetProps>(
  ({ onChange, onExpired, theme = 'light' }, ref) => {
    return (
      <View style={styles.container}>
        <ReCAPTCHA
          ref={ref}
          sitekey={SITE_KEY}
          onChange={onChange}
          onExpired={onExpired}
          theme={theme}
          hl="es"
        />
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
