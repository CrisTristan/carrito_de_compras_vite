# Carrito de Compras Frontend

Frontend hecho con React y Vite.

## Requisitos

Antes de empezar, instala en tu maquina:

- [Node.js](https://nodejs.org/) (recomendado: version LTS)
- npm (se instala junto con Node.js)
- Git (opcional, solo si vas a clonar el repositorio)

Para verificar que todo esta instalado:

```bash
node -v
npm -v
git --version
```

## 1. Descargar el proyecto

Tienes 2 opciones:

### Opcion A: Clonar con Git

```bash
git clone https://github.com/CrisTristan/carrito_de_compras_vite
cd carrito_de_compras_vite
```

### Opcion B: Descargar ZIP

1. Descarga el proyecto como archivo `.zip`.
2. Extrae el contenido.
3. Abre una terminal dentro de la carpeta `carrito-frontend`.

## 2. Instalar dependencias

Dentro de la carpeta del proyecto, ejecuta:

```bash
npm install
```

## 3. Ejecutar en modo desarrollo

```bash
npm run dev
```

Cuando inicie, abre en el navegador la URL que aparece en terminal (normalmente `http://localhost:5173`).

## Comandos utiles

```bash
npm run dev      # Levanta el servidor de desarrollo
npm run build    # Genera la version de produccion en /dist
npm run preview  # Sirve localmente la build de produccion
```

## Solucion de problemas comunes

- Si `npm install` falla, asegurate de tener una version LTS de Node.js.
- Si el puerto `5173` esta ocupado, Vite mostrara otro puerto automaticamente.
- Si sigue sin funcionar, elimina `node_modules` y `package-lock.json` y vuelve a instalar:

```bash
rm -rf node_modules package-lock.json
npm install
```

En Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
```
