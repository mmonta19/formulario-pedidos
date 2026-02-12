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

Si en Vercel aparece `NOT_FOUND`, verificar:

1. Que exista `index.html` en la raíz del proyecto.
2. Que el proyecto esté apuntando al directorio correcto.
3. Que `vercel.json` esté incluido en el deploy.
