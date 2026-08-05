# Coastline Frontend - Plataforma Integral de Gestión y Operaciones

Plataforma empresarial de última generación desarrollada para **Coastline**, que unifica la gestión comercial (CRM), la administración de obras (Proyectos y Almacén), y el diagnóstico técnico mediante simulaciones 3D interactivas.

---

## 🚀 Arquitectura y Módulos Principales

### 💼 1. CRM y Gestión Comercial
Un sistema completo para el seguimiento de clientes y oportunidades de negocio:
- **Gestión de Cuentas y Contactos:** Base de datos centralizada de clientes.
- **Cotizaciones Inteligentes:** Generador visual de presupuestos con exportación a PDF y seguimiento de estados (Pendiente, Aprobado, Rechazado).
- **Embudo de Ventas (Deals):** Sistema de arrastrar y soltar (Drag & Drop) para mover oportunidades de negocio a través de las distintas etapas de venta.

### 🏗️ 2. Gestión Operativa de Proyectos y Obra
Control total sobre la ejecución y rentabilidad de los proyectos activos:
- **Planificación Global:** Vista general de todos los proyectos, fechas de entrega y responsables.
- **Avances y Certificaciones de Presupuesto:** Control financiero que permite generar Certificaciones de Avance en PDF (con firmas y desgloses de costos) para cobrar a los clientes según el progreso.
- **Reportes Técnicos de Campo:** Sistema avanzado para técnicos que incluye un **Asistente (Wizard)** para crear reportes de instalación de geomembranas con evidencia fotográfica e inspección por zonas.

### 📦 3. Control de Almacén e Inventario
Módulo logístico para asegurar el suministro de materiales en obra:
- **Inventario en Tiempo Real:** Control de stock de membranas, selladores, herramientas y equipos.
- **Gestión de Entradas/Salidas:** Registro de despachos de materiales hacia proyectos específicos para controlar la merma y los costos directos.

### 🌧️ 4. Simulador 3D de Diagnóstico Estructural
Una herramienta de visualización técnica única en su tipo para demostrar el valor del servicio al cliente:
- **Renderizado Isométrico Hiperrealista:** Visualización de techumbres con texturas de concreto y acabados realistas.
- **Motor de Físicas Meteorológicas:** Simulación en tiempo real de lluvia, viento y tormentas usando HTML5 Canvas.
- **Escáner Dinámico:** Capas animadas (SVG + Framer Motion) que revelan daños estructurales por humedad (visión térmica) y muestran el proceso de reparación con geomembranas impermeabilizantes.

### 📊 5. Analíticas y Reportes KPI
- Dashboards interactivos para la directiva con gráficas de rendimiento.
- Exportación automática de reportes KPI a Excel/PDF (Cuentas, Proyectos, Ventas, Cotizaciones).

---

## 🛠️ Stack Tecnológico

- **Core:** React 18 + TypeScript + Vite
- **Estilos y UI:** Tailwind CSS, Lucide Icons, Headless UI (modales interactivos).
- **Animaciones:** Framer Motion (transiciones cinemáticas) y Canvas API (partículas de lluvia).
- **Generación de Documentos:** PDF (react-to-pdf / jspdf) para cotizaciones y certificaciones.
- **Arquitectura de Código:** Diseño modular basado en componentes reutilizables, hooks personalizados y servicios (services) aislados.

---

## ⚙️ Instalación y Uso Local

Para levantar el entorno de desarrollo en tu máquina:

1. Clona el repositorio:
   ```bash
   git clone https://github.com/CoatlineES/coastline-frontend.git
   ```
2. Entra al directorio:
   ```bash
   cd coastline-frontend
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```
5. Abre `http://localhost:5173` en tu navegador.

---

## 🤝 Flujo de Trabajo (Git)
Este repositorio es privado y de uso exclusivo del equipo **Coastline**. 
- Se recomienda crear nuevas ramas (`git checkout -b feature/nueva-funcion`) para desarrollar nuevos módulos.
- Mantener siempre actualizados los paquetes `npm` ante vulnerabilidades críticas.
