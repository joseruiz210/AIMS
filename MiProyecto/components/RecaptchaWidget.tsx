import React, { forwardRef } from 'react';

interface RecaptchaWidgetProps {
  onChange: (token: string | null) => void;
  onExpired?: () => void;
  theme?: 'light' | 'dark';
}

export const RecaptchaWidget = forwardRef<any, RecaptchaWidgetProps>(() => {
  return null;
});

RecaptchaWidget.displayName = 'RecaptchaWidget';
