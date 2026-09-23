# 🎨 AIMS Frontend — Academic Intelligent Management System

> **Servicio Nacional de Aprendizaje (SENA)**  
> **Programa:** Tecnología en Análisis y Desarrollo de Software (**ADSO**)  
> **Ficha:** 3144585  
> **Equipo de Desarrollo:**  
> • Samuel Guarín  
> • Andrés Narváez  
> • Brahian Cataño  
> • Darly Zambrano  
> • Juan Esteban Henao  

---

## 📌 Contexto del Proyecto

**AIMS Frontend** es la interfaz de usuario universal de la plataforma **AIMS (Academic Intelligent Management System / Sistema de Gestión Académica e Inteligencia Asistida)**. Está construida sobre **React Native y Expo**, lo que permite compilar una aplicación web moderna (SPA responsiva de alto rendimiento) y clientes móviles nativos a partir de una única base de código.

### 🎯 Propósito de la Interfaz
Reemplazar las planillas de papel y la dispersión de información académica en los centros de formación, ofreciendo una experiencia digital ágil, intuitiva y accesible desde cualquier dispositivo:
* **Para el Aprendiz:** Consulta transparente en tiempo real de asistencias, fallas acumuladas, horarios y juicios evaluativos.
* **Para el Instructor:** Marcación rápida de asistencia en el aula con un solo clic, calificación de evidencias y generación de retroalimentaciones asistidas por **Inteligencia Artificial (Google Gemini)**.
* **Para el Administrador:** Control centralizado de fichas, programas de formación, matrículas, usuarios, auditoría del sistema y reportes institucionales.

---

## 🔗 Repositorio Backend Relacionado

Para que el frontend funcione requiere comunicarse con la API RESTful de AIMS:  
👉 **Repositorio Backend API:** [https://github.com/samgO001/AIMS-API](https://github.com/samgO001/AIMS-API)

---

## 📱 Vistas y Módulos por Rol de Usuario

El frontend adapta automáticamente sus menús y pantallas según el rol del usuario autenticado:

### 1. 🛡️ Portal Administrador
* **Dashboard Global:** Métricas de aprendices activos, total de fichas y porcentaje general de asistencia.
* **Gestión de Fichas y Programas:** Creación, edición y asignación de programas académicos, cupos y jornadas.
* **Matrícula y Usuarios:** Vinculación de aprendices a fichas formativas e instructores líderes.
* **Auditoría del Sistema:** Consulta cronológica de operaciones críticas realizadas en la plataforma.
* **Reportes:** Exportación de reportes de asistencia y desempeño académico.

### 2. 👨‍🏫 Espacio del Instructor
* **Control de Asistencia en Aula:** Selección de ficha y marcación ágil por sesión (Presente, Falla, Excusa o Retardo) con autoguardado en tiempo real.
* **Evaluación de Evidencias:** Revisión de entregas de aprendices (incluyendo enlaces a repositorios de GitHub).
* **Asistente de IA (Gemini):** Botón *"Asistir con IA"* que genera borradores cualitativos de retroalimentación técnica para orientar al aprendiz, conservando siempre la autonomía del juicio del instructor.
* **Observaciones y Novedades:** Registro pedagógico de seguimiento formativo.

### 3. 🎓 Portal del Aprendiz
* **Récord de Asistencia:** Gráfica del porcentaje global de asistencia y contador de horas de fallas acumuladas por módulo formativo.
* **Seguimiento Evaluativo:** Consulta de juicios de evaluación (Aprobado o Deficiente) y retroalimentación emitida por los instructores.
* **Horarios y Comunicados:** Visualización de cronogramas de clases y circulares oficiales del centro.

---

## 🛠️ Stack Tecnológico Frontend

* **Framework:** React Native con **Expo** (v52+).
* **Enrutamiento:** Expo Router (enrutamiento declarativo basado en archivos).
* **Entorno Web:** Compilado a Single Page Application (SPA) optimizada servida con servidor estático `serve`.
* **Estilos:** Vanilla CSS / React Native StyleSheet con diseño moderno, componentes accesibles y diseño responsivo adaptado a PC, tablets y smartphones.
* **Consumo de API:** Cliente HTTP centralizado con interceptores para inyección automática de cabeceras `Authorization: Bearer <token>` y manejo de errores 401/403.
* **Contenerización:** Docker con compilación multi-etapa (*multi-stage build*).

---

## 🚀 Despliegue y Ejecución con Docker (Recomendado)

El frontend está integrado en el stack orquestado de AIMS mediante Docker Compose.

### Opción A: Stack Completo (Backend + Frontend)
Desde el repositorio raíz del backend (`AIMS-API`):
```bash
docker compose up --build
```
El frontend estará corriendo automáticamente en:  
👉 **[http://localhost:8081](http://localhost:8081)**

### Opción B: Construcción y Ejecución Aislada del Frontend
Si deseas construir únicamente el contenedor del frontend de producción:

```bash
# Construir la imagen Docker multi-stage
docker build -t aims-frontend .

# Ejecutar el contenedor en el puerto 8081
docker run -d -p 8081:8081 --name aims-frontend aims-frontend
```

El Dockerfile realiza un proceso de dos etapas:
1. **Stage 1 (Builder):** Instala dependencias y compila la aplicación web estática mediante `npx expo export -p web` en la carpeta `dist/`.
2. **Stage 2 (Servidor):** Utiliza una imagen ligera de `node:20-alpine`, instala `serve` y expone la aplicación compilada en el puerto `8081`.

---

## 💻 Instalación y Desarrollo Local (Modo Manual)

Si deseas trabajar en desarrollo activo con recarga rápida (*Fast Refresh*):

### 1️⃣ Requisitos Previos
* [Node.js](https://nodejs.org/) v18 o superior.
* [npm](https://www.npmjs.com/) instalado.

### 2️⃣ Instalación de Dependencias
```bash
npm install
```

### 3️⃣ Configuración de Variables de Entorno
Crea un archivo `.env` o `.env.local` en la raíz del proyecto frontend:
```ini
# URL de la API del Backend de AIMS
EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1

# Autenticación con Google (Opcional)
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=tu_client_id_web
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=tu_client_id_android
```

### 4️⃣ Iniciar la Aplicación
```bash
# Iniciar en navegador web directamente:
npm run web

# O iniciar con la CLI de Expo:
npx expo start --web
```
Abre tu navegador en `http://localhost:8081`.

---

## 📂 Estructura de Directorios

```
├── app/                  # Enrutamiento de vistas y pantallas (Expo Router)
│   ├── (auth)/          # Pantallas de Login y Recuperación de Contraseña
│   ├── (admin)/         # Vistas exclusivas del Administrador
│   ├── (instructor)/    # Vistas de Asistencias, Evidencias e IA
│   └── (aprendiz)/      # Portal del Aprendiz y consulta de notas
├── components/           # Componentes UI reutilizables (Tarjetas, Tablas, Modales)
├── constants/            # Colores institucionales, tipografías y constantes
├── context/              # Contextos globales de React (AuthContext, ThemeContext)
├── services/             # Servicios de comunicación HTTP con la API de AIMS
├── hooks/                # Hooks personalizados de sesión y comportamiento
├── Dockerfile            # Construcción multi-stage de producción
└── package.json          # Dependencias y scripts del proyecto
```

---

## 📄 Licencia y Créditos
Proyecto desarrollado con fines formativos e institucionales en el **SENA - Centro de Formación**.  
Ficha 3144585 | ADSO © 2026.
