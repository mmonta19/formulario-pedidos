# Formulario de pedidos

## Desarrollo local

```bash
npm install
npm run dev
```

## Deploy en Vercel

Esta app es **100% frontend estático**. No usa backend ni funciones serverless.

- `index.html` es el punto de entrada.
- `vercel.json` agrega un rewrite global a `/index.html` para soportar rutas de SPA y evitar `NOT_FOUND` al refrescar una URL interna.
- Se incluye script `npm run build` que no compila (solo confirma build estático) para evitar fallos si Vercel intenta ejecutar build automático.

Si en Vercel aparece `NOT_FOUND`, verificar:

1. Que exista `index.html` en la raíz del proyecto.
2. Que el proyecto esté apuntando al directorio correcto.
3. Que `vercel.json` esté incluido en el deploy.

## Error común: `vite: comando no encontrado`

Si el log dice `vite: comando no encontrado`:

1. En **Vercel > Project Settings > Build & Development Settings**, cambiar el framework preset a **Other**.
2. Build Command: `npm run build`.
3. Output Directory: dejar vacío (`.` raíz).
4. Re-deploy.

Ese error ocurre cuando Vercel quedó configurado como proyecto Vite, pero este repo no usa Vite para compilar.
