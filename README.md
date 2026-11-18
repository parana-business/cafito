# cafito · Café Take & Away

Landing mobile first en HTML, CSS y módulos de JavaScript. Para probarla localmente, ejecutar `python3 -m http.server 8080` y abrir `http://localhost:8080`. No requiere instalación ni compilación.

## Editar el contenido

- `index.html` contiene el hero, el catálogo, el pedido, Instagram y la presentación de cafito.
- `config.js` contiene el menú, precios en ARS, medios de pago, WhatsApp, perfil de Instagram y sus publicaciones. Para activar pedidos, cargar los datos reales, definir `sampleMenu: false` y colocar el número con código de país sin signos ni espacios. Verificar que el número abra el chat correcto. El cliente envía el texto desde WhatsApp y cafito responde con el plazo de retiro.
- Actualizar las tres entradas de Instagram, de la más reciente a la más antigua, con miniaturas propias en `assets` y enlaces permanentes de los posts. La galería se actualiza manualmente.
- `style.css` contiene las variables de marca. Las alternativas se previsualizan con `?paleta=frutilla`, `?paleta=pistacho` y `?paleta=moka`. Las fotografías conceptuales son iguales en las tres vistas.
- `app.js` arma el pedido y genera el texto. El parallax está en `paintParallax` y se apaga cuando el sistema solicita movimiento reducido.
- `assets/` reúne las fotos conceptuales WebP. El arte del hero se generó como campaña de un vaso amarillo sobre pedestal rosa. Montserrat está incluida de forma local con su licencia en `assets/montserrat-OFL.txt`. El catálogo usa fotografía de estudio de espresso, latte, iced latte y cookies. La galería usa fotos conceptuales de café en mano, preparación y merienda.

El prototipo muestra un catálogo ilustrativo y lleva `noindex`. Antes del lanzamiento comercial, actualizar los datos de la tienda y revisar la indexación.

## Publicar en GitHub Pages

Desde **Settings → Pages**, elegir **Deploy from a branch** y seleccionar **main** con la carpeta **/ (root)**. Guardar la configuración. El sitio es estático y las rutas de sus recursos funcionan bajo el subdirectorio del repositorio. Si se asigna un dominio propio, actualizar la URL de `og:image` en `index.html`.
