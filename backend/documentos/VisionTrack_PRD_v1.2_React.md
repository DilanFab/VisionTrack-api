# VISIONTRACK
## Sistema de Gestión Clínica para Optometría
### Product Requirements Document (PRD) - Versión 1.2 (Stack React)
**Fecha**: Junio 2026

| Campo | Detalle |
| :--- | :--- |
| **Proyecto** | VisionTrack |
| **Tipo** | Clínica de Optometría – Web Admin + PWA Paciente |
| **Stack Frontend** | React 19 + Vite + React-Bootstrap + Axios |
| **Stack Backend** | Node.js + Express + TypeScript + Prisma ORM |
| **Base de Datos** | PostgreSQL (Supabase) |
| **Estado** | Adaptado al nuevo stack tecnológico |

---

## 1. Descripción General del Proyecto

### 1.1 Visión del Producto
VisionTrack es una plataforma integral de gestión clínica y comercial diseñada específicamente para clínicas de optometría. La solución consta de dos interfaces principales:
1. **App Web (Panel Administrativo)**: Gestión total de la clínica — pacientes, citas, historiales clínicos, inventario, laboratorios, facturación y reportes.
2. **App Móvil (Portal del Paciente)**: Acceso del cliente a sus citas pasadas y próximas, historial clínico y resultados de exámenes visuales.

### 1.2 Objetivos del Negocio
* Digitalizar y centralizar el historial clínico de pacientes de la clínica optométrica.
* Reducir tiempos de gestión administrativa mediante flujos automatizados.
* Mejorar la experiencia del paciente con acceso móvil a su información médica.
* Optimizar la coordinación con laboratorios externos para pedidos de lentes.
* Generar reportes estadísticos para la toma de decisiones gerenciales.

### 1.3 Alcance del Sistema
| Módulo | App Web (Admin) | App Móvil (Paciente) |
| :--- | :---: | :---: |
| **Autenticación y Roles** | ✅ Completo | ✅ Login paciente |
| **Gestión de Pacientes** | ✅ CRUD completo | ✅ Vista propia |
| **Citas y Agenda** | ✅ Gestión total | ✅ Ver citas |
| **Historia Clínica** | ✅ Crear/editar | ✅ Solo lectura |
| **Exámenes Visuales** | ✅ Completo | ✅ Ver resultados |
| **Órdenes a Laboratorio** | ✅ Completo | ❌ No aplica |
| **Inventario / Productos** | ✅ Completo | ❌ No aplica |
| **Facturación** | ✅ Completo | ❌ No aplica |
| **Notificaciones** | ✅ Enviar | ✅ Recibir |
| **Reportes y Estadísticas** | ✅ Completo | ❌ No aplica |

---

## 2. Stack Tecnológico Definitivo

### 2.1 Justificación de la Arquitectura
Se adopta una estructura de **repositorio unificado** que separa de manera clara el backend en Node/Express y el frontend en React/Vite.
* **React 19 + Vite**: Proporciona una velocidad de desarrollo y renderizado óptima (HMR rápido), con un ecosistema robusto de componentes reutilizables y ganchos (Hooks) para gestionar estados complejos de manera sencilla.
* **React-Bootstrap**: Proporciona componentes nativos listos para usar y altamente estilizados en Bootstrap 5, acelerando la creación del panel administrativo responsive.
* **Axios**: Permite realizar peticiones HTTP eficientes y manejar interceptores para la inyección automática del token de sesión (JWT) y manejo centralizado de errores.
* **Node + Express + TypeScript**: Proporciona un servidor de API ultrarrápido, flexible, y tipado estáticamente de forma nativa.
* **Prisma ORM**: Facilita la comunicación tipada con la base de datos de Supabase, simplificando la generación de tipos basados en esquemas y la gestión de migraciones.

### 2.2 Frontend – App Web Admin + PWA Paciente (React)
| Tecnología | Versión | Justificación |
| :--- | :--- | :--- |
| **React** | 19+ | Biblioteca principal de renderizado de UI. Basada en componentes declarativos y ganchos. |
| **Vite** | 8+ | Servidor de desarrollo y empaquetador ultrarrápido. |
| **TypeScript** | 6+ | Tipado estático nativo en todo el frontend, reduciendo bugs en formularios de optometría. |
| **React-Bootstrap** | 2.10+ | Componentes de UI listos para usar: tablas, calendarios, datepickers, modals, formularios. |
| **Axios** | 1.18+ | Cliente HTTP para consumir la API REST del Backend. |
| **React Router DOM** | 7+ | Enrutamiento de la SPA, manejo de layouts (Sidebar para Admin vs Bottom Nav para Paciente) y rutas protegidas por roles. |
| **SweetAlert2** | 11+ | Cuadros de diálogo estilizados para confirmaciones de eliminación y notificaciones de éxito/error. |
| **Chart.js** | Latest | Gráficas para el dashboard de KPIs y reportes estadísticos. |

### 2.3 Estrategia PWA – Portal del Paciente (Móvil)
El frontend en React se configura como una **Progressive Web App (PWA)** usando Service Workers.
* **Instalable**: Mediante un archivo `manifest.webmanifest`.
* **Layout diferenciado**: El `React Router` redirige a los usuarios con rol `patient` a un diseño optimizado para móviles con navegación inferior (Bottom Navigation).

### 2.4 Backend (API)
| Tecnología | Versión | Justificación |
| :--- | :--- | :--- |
| **Node.js** | 20 LTS | Entorno de ejecución de Javascript en el servidor. |
| **Express** | 5+ | Servidor HTTP minimalista y rápido para construir la REST API. |
| **TypeScript** | 6+ | Tipado estático nativo en el backend. |
| **Prisma ORM** | 7+ | Acceso tipado a datos y migraciones automáticas. |
| **BcryptJS** | 3+ | Cifrado y hashing seguro de contraseñas. |
| **Cors** | 2.8+ | Habilitación de intercambio de recursos de origen cruzado para el frontend. |
| **Dotenv** | 17+ | Carga de variables de configuración locales (.env). |

### 2.5 Base de Datos e Infraestructura
* **PostgreSQL (Supabase)**: Base de datos relacional principal.
* **Supabase Auth**: Proveedor de autenticación (opcional o integrado en el backend).
* **Supabase Storage**: Almacenamiento de archivos y recetas en formato PDF/imágenes.

---

## 3. Requerimientos Funcionales

*(Detallado en la versión original, adaptado para usar el flujo REST API del backend y renderizado en componentes React)*

### 3.1 Gestión de Usuarios y Roles
* **Roles**: Administrador, Optómetra, Recepcionista, Paciente.
* Permisos diferenciados controlados en el frontend mediante `React Router Guards` y en el backend mediante middlewares de autenticación de roles.

### 3.2 Citas y Agenda
* Calendario visual de citas en el frontend (ej. con `fullcalendar` o similar adaptado a React).
* Envío de solicitudes de citas y consultas.

### 3.3 Historia Clínica y Prescripción
* Formulario técnico para optómetras con campos detallados: Esfera (OD/OI), Cilindro, Eje, Adición, DIP.
* Exportación a PDF de la receta visual para el paciente.

---

## 4. Estructura Organizada del Proyecto (React + Express)

```
VisionTrack-api/                      # Directorio raíz del proyecto
  ├── .env                            # Variables de entorno del backend (DATABASE_URL, PORT)
  ├── .gitignore                      # Archivos y carpetas ignorados por git (dist, node_modules, .env)
  ├── package.json                    # Dependencias y scripts del Backend
  ├── tsconfig.json                   # Configuración del compilador TypeScript para backend
  │
  ├── prisma/                         # Configuración de base de datos
  │   ├── schema.prisma               # Esquema relacional de Prisma
  │   └── migrations/                 # Migraciones de base de datos
  │
  ├── src/                            # Backend (API REST en Express)
  │   ├── app.ts                      # Punto de entrada de la aplicación y middlewares
  │   ├── config/
  │   │   └── prisma.ts               # Cliente Prisma inicializado con adaptador pg
  │   ├── routes/                     # Rutas de la API (usuarios, citas, medicos, etc.)
  │   └── controllers/                # Lógica del CRUD y controladores (generos, pacientes, etc.)
  │
  └── frontend/                       # Frontend (React + Vite)
      ├── .env                        # Variables de entorno del frontend (VITE_API_URL)
      ├── package.json                # Dependencias y scripts del Frontend
      ├── tsconfig.json               # Configuración del compilador TypeScript para frontend
      ├── index.html                  # Punto de entrada HTML
      ├── vite.config.ts              # Configuración del empaquetador Vite
      │
      └── src/                        # Código fuente del Frontend
          ├── main.tsx                # Entrada principal de React (renderiza App)
          ├── App.tsx                 # Configuración de rutas (React Router) y Layouts
          ├── index.css               # Estilos globales y tokens de diseño personalizados
          ├── App.css                 # Estilos específicos del layout general
          ├── api/                    # Servicios y consumo de API con Axios
          │   ├── axios.ts            # Cliente Axios configurado
          │   └── usuarios/           # Servicios por módulo (ej: generoService.ts)
          ├── pages/                  # Vistas principales (ej: Generos.tsx)
          ├── components/             # Componentes de UI reutilizables
          ├── types/                  # Interfaces de TypeScript (ej: Genero.ts)
          └── lib/                    # Librerías auxiliares (idiomas de tablas, alertas, etc.)
```
