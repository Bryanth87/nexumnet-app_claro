# App Claro - Cotizador Multimedia

Aplicación web para generar cotizaciones de equipos multimedia (media players, splitters, cables HDMI) con financiamiento flexible.

## Características

- 📊 **Cotizador interactivo** con selección de agencias y ambientes
- 🎯 **Cálculo automático** de costos incluyendo:
  - Equipos multimedia
  - Licencias de Media Players
  - Mantenimiento por agencia
  - Comisión bancaria configurable
- 💰 **Plazo de financiamiento** flexible (1-36 meses)
- ✅ **Selección de agencias** con checkboxes para pago individual o combinado
- 📄 **Exportación a PDF** de cotizaciones
- 🛠️ **Panel de administrador** para gestionar precios
- 🗄️ **Supabase PostgreSQL** para persistencia de datos

## Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Supabase
- **Database:** PostgreSQL (Supabase)
- **Auth:** JWT tokens for admin panel
- **UI Components:** Radix UI, Lucide Icons

## Estructura del Proyecto

```
app_claro/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Cotizador principal
│   └── admin/             # Admin panel routes
├── components/            # React components
│   ├── step1-agencies.tsx
│   ├── step2-environments.tsx
│   ├── step3-summary.tsx
│   ├── admin-panel.tsx
│   └── ui/               # Reusable UI components
├── lib/                  # Utilities and helpers
│   ├── quote-types.ts    # Type definitions
│   ├── prices-*.ts       # Price management
│   └── generate-pdf.ts   # PDF export
└── public/               # Static assets
```

## Configuración

### Variables de Entorno

Crea un archivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
JWT_SECRET=tu_jwt_secret_32_chars_aleatorio
ADMIN_PASSWORD=tu_contraseña_admin
ADMIN_SESSION_SECRET=tu_session_secret_32_chars
```

### Base de Datos

La aplicación requiere estas tablas en Supabase:

#### `prices`
```sql
CREATE TABLE prices (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  key TEXT UNIQUE NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by TEXT,
  
  CONSTRAINT valid_price CHECK (value >= 0),
  CONSTRAINT valid_key CHECK (key IN (
    'MEDIA_PLAYER',
    'SPLITTER_1X2',
    'SPLITTER_1X4',
    'SPLITTER_1X8',
    'HDMI_CABLE',
    'MONTHLY_MAINTENANCE_PER_AGENCY',
    'MEDIA_PLAYER_LICENSE',
    'BANKING_COMMISSION_RATE'
  ))
);

CREATE INDEX idx_prices_key ON prices(key);
CREATE INDEX idx_prices_updated_at ON prices(updated_at DESC);
```

#### `quotes`
```sql
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  total_monthly DECIMAL(12, 2),
  payment_terms INT,
  agency_count INT,
  
  CONSTRAINT valid_terms CHECK (payment_terms BETWEEN 1 AND 36)
);

CREATE INDEX idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX idx_quotes_agency_count ON quotes(agency_count);
```

## Instalación

```bash
# Clonar repositorio
git clone <repository-url>
cd app_claro

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# Ejecutar en desarrollo
npm run dev

# Build para producción
npm run build
npm start
```

## Uso

### Cotizador (Cliente)

1. Accede a `http://localhost:3000`
2. Paso 1: Selecciona cuántas agencias necesitas
3. Paso 2: Configura ambientes, televisores y media players por agencia
4. Paso 3: Revisa el resumen y selecciona el plazo de financiamiento
5. Exporta a PDF

### Panel de Administrador

1. Accede a `http://localhost:3000/admin`
2. Ingresa la contraseña configurada en `ADMIN_PASSWORD`
3. Modifica precios de equipos, licencias, mantenimiento y comisión bancaria
4. Haz click en "Guardar Precios"

## Cálculo de Costos

El costo total por agencia incluye:

```
Costo Total = (Equipos + Licencias) + Mantenimiento + Comisión Bancaria

Donde:
- Equipos = Media Players + Splitters + Cables HDMI
- Licencias = Media Players × Tasa de Licencia
- Mantenimiento = Cuota mensual fija
- Comisión Bancaria = (Subtotal) × (Tasa %) × (Meses) / 100
```

## Características del Admin Panel

- ✅ Gestión de precios de equipos
- ✅ Configuración de tasa de comisión bancaria
- ✅ Configuración de mantenimiento por agencia
- ✅ Visualización de precios actuales guardados
- ✅ Sincronización automática con Supabase

## API Routes

- `POST /api/prices/update` - Actualizar precios (requiere JWT)
- `GET /api/prices` - Obtener precios actuales

## Licencia

Privado

## Autor

Desarrollado para Clarín
