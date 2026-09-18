import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * Este archivo configura el HTML raíz generado en la versión web de la aplicación.
 * Garantiza que el viewport en dispositivos móviles no se aleje (zoom out) y que
 * no existan márgenes o desbordamientos horizontales indeseados.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es" style={{ width: '100%', height: '100%', overflowX: 'hidden' }}>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body {
                width: 100% !important;
                max-width: 100% !important;
                min-height: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                overflow-x: hidden !important;
                background-color: #020308 !important;
                -webkit-text-size-adjust: 100% !important;
              }
              #root {
                display: flex !important;
                flex-direction: column !important;
                width: 100% !important;
                max-width: 100% !important;
                min-height: 100% !important;
                min-height: 100vh !important;
                min-height: 100dvh !important;
                overflow-x: hidden !important;
                background-color: #020308 !important;
              }
              * {
                box-sizing: border-box !important;
              }
            `,
          }}
        />
      </head>
      <body style={{ width: '100%', height: '100%', overflowX: 'hidden', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
