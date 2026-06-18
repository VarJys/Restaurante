# Implementación del Backend para "Plataforma Digital Para El Manejo de Mensualidades Gastronómicas"

De acuerdo al documento `proyectoRestaurante.pdf`, el proyecto requiere el desarrollo de un prototipo bajo una arquitectura cliente-servidor usando **Angular** (frontend) y **Supabase** (Backend-as-a-Service, PostgreSQL) para la persistencia de datos y autenticación.

## User Review Required

> [!IMPORTANT]
> **Creación del proyecto en Supabase:** Al ser Supabase un servicio en la nube, es necesario crear un proyecto en su plataforma (https://supabase.com/). ¿Ya tienes un proyecto de Supabase creado o quieres que definamos el esquema SQL aquí para que tú lo ejecutes en tu instancia de Supabase?

> [!WARNING]
> La integración con Angular requerirá instalar la librería oficial `@supabase/supabase-js`. 

## Open Questions

- ¿Deseas que los diagramas UML (Casos de Uso, Entidad-Relación y Clases) los coloque en un documento PDF/Imagen aparte, o es suficiente con tenerlos generados en código (Mermaid) dentro de esta documentación para que los puedas exportar?
- Para la autenticación, ¿se usarán correos institucionales o cualquier tipo de correo para los estudiantes y administradores?

## Modelos y Diagramas

A continuación se presentan los modelos solicitados basados en los requerimientos del proyecto.

### Diagrama de Casos de Uso

```mermaid
usecaseDiagram
    actor Cliente
    actor Administrador
    
    Cliente --> (Iniciar Sesión)
    Cliente --> (Registrar Consumo Diario)
    Cliente --> (Ver Estado de Mensualidad)
    
    Administrador --> (Iniciar Sesión)
    Administrador --> (Gestionar Usuarios)
    Administrador --> (Registrar/Validar Pagos)
    Administrador --> (Generar Reportes)
    Administrador --> (Monitorear Consumos)
```

### Diagrama Entidad-Relación (ERD)

```mermaid
erDiagram
    USERS ||--o{ PAYMENTS : realiza
    USERS ||--o{ CONSUMPTIONS : registra
    USERS {
        uuid id PK
        string email
        string role "admin | client"
        string full_name
        datetime created_at
    }
    PAYMENTS {
        uuid id PK
        uuid user_id FK
        decimal amount
        date start_date
        date end_date
        string status "active | expired | pending"
        datetime created_at
    }
    CONSUMPTIONS {
        uuid id PK
        uuid user_id FK
        date consumption_date
        string meal_type "lunch | dinner"
        datetime created_at
    }
```

### Diagrama de Clases

```mermaid
classDiagram
    class User {
        +UUID id
        +String email
        +String role
        +String fullName
        +Date createdAt
        +login()
        +logout()
    }
    class Payment {
        +UUID id
        +UUID userId
        +Decimal amount
        +Date startDate
        +Date endDate
        +String status
        +Date createdAt
        +isValid()
    }
    class Consumption {
        +UUID id
        +UUID userId
        +Date consumptionDate
        +String mealType
        +Date createdAt
        +registerConsumption()
    }
    
    class AdminService {
        +createUser()
        +registerPayment()
        +generateReport()
    }
    
    User "1" *-- "*" Payment : has
    User "1" *-- "*" Consumption : has
```

## Proposed Changes

### Database (Supabase / PostgreSQL)

Se propondrá un script SQL para ejecutar en Supabase que creará las tablas, habilitará *Row Level Security (RLS)* y definirá las políticas de seguridad (para que los clientes solo vean sus propios datos y los administradores vean todo).

#### [NEW] `supabase/schema.sql`
Script SQL con la definición de:
- Tabla `users` (extiende la tabla de autenticación de Supabase).
- Tabla `payments` (mensualidades).
- Tabla `consumptions` (consumos diarios).
- Políticas de seguridad (RLS).

### Frontend (Angular)

Se integrará Supabase al proyecto existente de Angular.

#### [MODIFY] `package.json`
Se instalará `@supabase/supabase-js`.

#### [NEW] `src/environments/environment.ts`
Se agregarán las variables de entorno para Supabase (`SUPABASE_URL` y `SUPABASE_KEY`).

#### [NEW] `src/app/services/supabase.service.ts`
Servicio centralizado en Angular para manejar la inicialización del cliente de Supabase, la autenticación y las consultas a la base de datos (pagos y consumos).

#### [MODIFY] Componentes Existentes (`inicio`, `login`)
Se conectarán estos componentes al `supabase.service.ts` para que el inicio de sesión y la vista de inicio utilicen datos reales desde el backend.

## Verification Plan

### Automated Tests
- Verificación de tipos en TypeScript durante la compilación (`ng build`).
- Linting del código Angular.

### Manual Verification
1. Ingresar a la aplicación y realizar un flujo de Login usando Supabase Auth.
2. Como administrador: Registrar un pago para un cliente y verificar que se refleje en la base de datos.
3. Como cliente: Registrar un consumo y verificar que el sistema valide que tiene una mensualidad activa.
4. Validar que la información se guarda y consulta correctamente desde Supabase.

---

# Generación de APK para Android (Integración con Capacitor)

Para que el proyecto Angular pueda ser visualizado e instalado como una aplicación nativa en dispositivos Android (.apk), utilizaremos **Capacitor**, la herramienta moderna recomendada (desarrollada por el equipo de Ionic) que envuelve aplicaciones web en contenedores nativos de forma sencilla y eficiente.

## User Review Required

> [!IMPORTANT]
> **Generación Final del APK:** Capacitor preparará el proyecto de Android y lo vinculará con tu código de Angular. Sin embargo, para compilar el archivo `.apk` final o el `.aab`, **necesitarás tener instalado Android Studio** en tu computadora local. El agente ejecutará todas las configuraciones y preparativos, pero el paso final de construcción nativa deberás hacerlo abriendo el proyecto en Android Studio. ¿Estás de acuerdo con este flujo?

## Proposed Changes

### Dependencias y Configuración

#### [MODIFY] `package.json`
Se instalarán las dependencias necesarias de Capacitor:
- `@capacitor/core`
- `@capacitor/cli` (devDependencies)
- `@capacitor/android`
Además, se añadirán scripts útiles para la sincronización con Android.

#### [NEW] `capacitor.config.ts`
Archivo de configuración principal de Capacitor que se generará automáticamente con `npx cap init`. Se configurará el `webDir` apuntando a la carpeta de salida del build de Angular (`dist/frontend/browser`).

#### [NEW] `android/`
Se generará el directorio nativo de Android ejecutando `npx cap add android`. Esta carpeta contendrá el proyecto nativo que Android Studio utilizará para generar el APK.

## Verification Plan

### Automated Steps
- Ejecutar el build de producción de Angular (`npm run build`).
- Sincronizar los archivos compilados con la plataforma Android (`npx cap sync android`).

### Manual Verification
- Solicitar al usuario que ejecute `npx cap open android` en su terminal local.
- Verificar que Android Studio abra el proyecto correctamente y permita compilar/ejecutar el APK en un emulador o dispositivo físico conectado.
