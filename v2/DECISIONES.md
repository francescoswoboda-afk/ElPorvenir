# El Porvenir Farm — DECISIONES

Sitio nuevo de presentación para El Porvenir Farm. Un único `index.html` autocontenido (CSS, JavaScript, las dos fotos y el logo van incrustados). Las únicas cargas externas son las permitidas: Google Fonts, GSAP + ScrollTrigger (cdnjs) y Lenis (unpkg).

- Página publicada: https://claude.ai/artifact/NzXVQyWgEQRKuNAqzw15be
- Código fuente: rama `v2` del repositorio `francescoswoboda-afk/ElPorvenir`, carpeta `v2/` (`src/` + `build.py`, que genera el `index.html`).

---

## 1. La idea

El sitio es un solo recorrido continuo: **mientras bajas, pasa un año en el huerto y pasa un día entero.**

- **Un año:** el árbol (dibujado en código) cambia de estación con el scroll. El color del "papel" de toda la página cambia con él: gris frío en invierno, verde claro en primavera, crema cálida en verano y ámbar en otoño.
- **Un día:** la luz va del amanecer (rosado y dorado arriba) al mediodía, a la tarde dorada, al anochecer en Contacto y a la noche en el pie de página, donde el árbol se convierte en un huerto entero en reposo.

La pregunta de cada sección fue la del brief: *¿esto hace sentir lo que es El Porvenir?* Todo lo que solo "informaba" se quitó o se convirtió en algo que se ve o se toca.

## 2. Estructura (y por qué)

Seguí la estructura propuesta, con un cambio de concepto en cómo se encadenan las estaciones:

1. **Inicio:** una nuez cae, se abre y crece un árbol completo, rama a rama. Detrás, la palabra *Porvenir* enorme; las ramas la atraviesan. Una línea: "Un huerto familiar de pecanas en el sur de Brasil, donde el tiempo se mide en estaciones." Y la definición de *porvenir* ("el futuro; lo que está por venir"), porque el nombre ya cuenta la historia.
2. **La familia:** Enrique, Francesco y Alessandro, con marcos de retrato vacíos marcados [TBD]. La historia, las fechas y el origen del nombre son [TBD]. No inventé nada.
3. **La tierra:** mapa animado dibujado en código. Hace zoom de Sudamérica (con el Trópico de Capricornio, que explica las cuatro estaciones) a Rio Grande do Sul (con la Laguna de los Patos y el Atlántico), a Monte Alverne (curvas de nivel) y termina fundiéndose con la foto aérea real de la finca. Mientras el mapa ocupa la escena, el árbol desaparece y la estación avanza "por detrás": cuando vuelve, es invierno.
4. **El año del huerto:** sección fija (sticky) en la que el scroll mueve el año: invierno (poda, escarcha, ramitas cortadas que caen), primavera (brotes, amentos colgando, abejas), verano (copa cerrada, cáscaras verdes que crecen) y otoño (hojas amarillas que caen, cáscaras que se abren y pecanas que caen y se pueden atrapar). Un dial de 12 meses (hemisferio sur) y una barra de progreso acompañan.
5. **Del árbol a la nuez:** recorrido horizontal con cuatro escenas SVG animadas en bucle suave: recoger, secar, limpiar, seleccionar. Es narración, no ficha técnica; el "cómo se hace en El Porvenir" queda [TBD].
6. **Galería:** una pared de exposición con marcos de museo, cartelas numeradas en romano, arrastre horizontal y visor a pantalla completa (teclado, flechas, Esc, swipe en móvil). Dos fotos reales y cinco marcos [TBD] listos para recibir fotos.
7. **En números:** cuatro cifras grandes que cuentan al entrar en pantalla, con formato según el idioma (6,000 / 6.000). Todas llevan [VERIFY] o [TBD].
8. **Contacto:** al anochecer. Correo con botón de copiar; teléfono, WhatsApp y dirección completa como [TBD]/[VERIFY]. Sin formulario.
9. **Pie:** el árbol camina hasta la primera fila de un huerto que aparece fila a fila, en perspectiva, de noche. Logo, la frase "Cultivamos para hoy, con respeto por el mañana" (de la web actual), y Privacidad / Aviso legal como diálogos [TBD].

**Mejora sobre la estructura propuesta:** no puse las estaciones solo en la sección 4. El año corre por todo el sitio (verano en el inicio, fin del verano en la familia, el otoño termina "detrás" del mapa, el ciclo completo en la sección 4, la poscosecha en la 5 y el invierno en reposo al final). Así el árbol de verdad es el hilo conductor y no un adorno de una sección.

## 3. Estudio tipográfico

Lo hice con fuentes reales de Google Fonts, renderizadas en el navegador (archivo `v2/type-study.html`). Para cada dirección compuse el mismo titular en portugués ("Uma árvore leva anos."), un párrafo en español, una línea en inglés, una cifra grande ("6.000") y la línea de caracteres `ç ã õ ñ á é í ó ú â ê ü`. Comprobé con `document.fonts.check` que todas las familias cubren esos caracteres (están todos en el subconjunto latino de Google Fonts).

| Dirección | Pareja | Resultado |
|---|---|---|
| A · Herencia agrícola | Cormorant SC + Cormorant Garamond / Spectral | **Descartada.** Es la más cercana a las mayúsculas grabadas del logo, pero tiene una altura de x muy baja y trazos finos que desaparecen en tamaños pequeños y sobre los colores de estación. El "6.000" con números de estilo antiguo parecía un precio en un menú de boda: se siente de lujo, no de finca. |
| **B · Editorial cálido** | **Fraunces (variable: opsz, wght, SOFT) + Newsreader** | **Elegida.** |
| B2 · Variante | Fraunces + Instrument Sans | **Descartada para el texto.** El cuerpo en sans la hacía parecer una web de producto. Me quedé con Instrument Sans solo para etiquetas de 11–12 px (navegación, rótulos), donde una sans se lee mejor. |
| C · Moderno y mínimo | Bricolage Grotesque + Hanken Grotesk | **Descartada.** Fuerte y actual, pero parecía una startup tecnológica o una marca de café. Perdía lo terroso y el vínculo con el logo. |

**Por qué Fraunces + Newsreader:** Fraunces es clásica como el logo, pero tiene remates suaves y redondos, como una nuez o una etiqueta hecha a mano. Sobre todo, sus ejes variables permiten que la tipografía se mueva *con significado*:

- Los titulares se revelan palabra a palabra y su peso sube de 220 a 360 mientras aparecen.
- El nombre de cada estación gana peso a medida que avanza la estación, como el árbol.
- El eje SOFT sube en otoño.
- Los números ganan peso mientras cuentan.

Newsreader es una serif de texto pensada para leer en pantalla y da la sensación de "libro digital" que pedía el brief. El texto de lectura no se anima nunca.

**Escala tipográfica (fluida con clamp(), de 390 a 1440 px):**

| Nivel | Tamaño | Interlineado | Espaciado | Peso |
|---|---|---|---|---|
| Wordmark | 76 → 330 px | .82 | -0.045em | 200 → 300 (animado) |
| H1 | 44 → 108 px | .96 | -0.028em | 360 |
| H2 | 36 → 76 px | 1.0 | -0.022em | 360 |
| H3 | 26 → 40 px | 1.08 | -0.012em | 360 |
| Número | 76 → 190 px | .86 | -0.045em | 220 (cuenta hasta 320) |
| Entradilla | 20 → 26 px | 1.42 | normal | 400 |
| Texto | 17 → 19.5 px | 1.66 | normal | 400 |
| Pequeño | 15 px | 1.5 | normal | 400 |
| Etiqueta (Instrument Sans) | 11.5 px | 1.3 | 0.2em, mayúsculas | 600 |

## 4. El árbol

Dibujado en canvas 2D, de forma procedural, con una semilla fija para que siempre sea el mismo árbol:

- **Ramas:** recursivas, con 2–3 hijas por nivel, curvatura propia y fototropismo (las ramas se curvan hacia la luz para dar una copa ancha y redonda, como la del pecanero). Algunas ramas terminan antes de tiempo, para que haya follaje a varias alturas y no solo en la capa exterior.
- **Hojas compuestas:** como las del pecanero de verdad, un raquis que cuelga un poco, con tres pares de foliolos y uno terminal. Esta fue la diferencia entre "brócoli de dibujos animados" y un árbol que se reconoce.
- **Viento:** procedural, con ráfagas lentas; cada rama oscila según su profundidad y el movimiento se acumula hacia las puntas. El cursor (o el dedo) empuja las ramas cercanas, y la velocidad del scroll aumenta el viento.
- **Estaciones:** curvas continuas para la cantidad y el tamaño de las hojas, el verde, el amarilleo, la caída, los amentos, las abejas, las cáscaras (crecen, se secan, se abren en cuatro valvas) y la caída de las nueces.
- **Nueces que se atrapan:** con un clic o un toque, la nuez se rompe en trozos de cáscara y suena un crujido sintetizado. Un contador cuenta cuántas atrapaste.
- **Easter eggs:**
  1. Golpea el tronco tres veces y viene un picaflor (beija-flor), que se queda un momento en la copa.
  2. Escribe "pecan", "pecana", "pecã" o "noz" y llueven pecanas.
  3. En la consola hay una nota que da las pistas.
- **Huerto final:** el árbol se renderiza en un sprite cada pocos fotogramas y se estampa en siete filas en perspectiva. Cada copia oscila con un pequeño sesgo distinto, y el árbol principal camina hasta su lugar en la primera fila.

## 5. Navegación

- **Escritorio:** una tira fina negra a la derecha, con un punto por sección (el activo en amarillo). Al acercar el cursor se abre el panel completo; los nombres van en blanco y se vuelven amarillos al pasar el cursor, con magnificación tipo Dock (gaussiana según la distancia vertical al cursor). Al hacer clic, Lenis desliza la página hasta la sección en 1.9 s, así que la nueva "página" sube desde abajo sin recargar. Con teclado: el foco en el Dock lo abre y Tab recorre los enlaces.
- **Móvil:** una pestaña en el borde derecho, a la altura del pulgar. Se toca o se desliza hacia la izquierda, y el panel sale desde la derecha con nombres grandes y el activo en amarillo. Se cierra deslizando a la derecha, tocando fuera o con Esc. El idioma y el sonido también están dentro.
- **Idioma:** EN / PT / ES. Al cambiar, el visitante se queda en la misma sección y en el mismo punto. Se recuerda la elección; si no hay ninguna guardada, se usa el idioma del navegador.

## 6. Movimiento y oficio

- **Curvas de animación elegidas a propósito:** expo-out para todo lo que llega (titulares, revelados), in-out quíntica para los viajes largos (la navegación), smoothstep para las estaciones y el día (nada debe "frenar" de golpe).
- **Otros detalles:**
  - grano de papel generado en código (sin modos de fusión, que son caros);
  - cursor propio que cambia sobre enlaces, sobre la pared de la galería ("Arrastra") y sobre una nuez que cae (✦);
  - brillo de luz según la hora del día.
- **Sonido (apagado por defecto):** todo sintetizado con Web Audio, sin muestras.
  - viento: ruido rosa por un filtro paso banda que se mueve lentamente;
  - susurro de hojas: ruido agudo que solo suena cuando hay hojas;
  - pájaros: barridos de frecuencia, más frecuentes en primavera y verano;
  - crujido de nuez: ráfaga de ruido filtrado más un golpe grave.

## 7. Honestidad

No hay nada inventado: ni historia, ni fechas, ni premios, ni certificaciones, ni citas. Todo lo que debe aportar la familia aparece como una etiqueta visible **[TBD]** (falta el dato) o **[VERIFY]** (dato tomado de la web actual que hay que confirmar).

Pendientes principales:

- número de árboles (6.000 [VERIFY]), hectáreas (72 [VERIFY]), años (12 desde 2014 [VERIFY]), cosechas [TBD];
- meses de cosecha [VERIFY];
- historia de la familia y del nombre [TBD];
- retratos [TBD];
- teléfono, WhatsApp y dirección completa [TBD/VERIFY];
- ubicación exacta de la finca en el mapa [VERIFY];
- suelo y altitud [TBD];
- textos legales [TBD].

Las costas del mapa están simplificadas a mano: es una ilustración, no cartografía. Las estaciones por meses son las astronómicas del hemisferio sur.

## 8. Qué más descarté

- **La foto de las pecanas de la web actual:** parece una imagen de stock o generada, y el brief prohíbe las fotos de stock. Solo usé las dos fotos aéreas reales.
- **three.js:** un árbol 3D habría sido más pesado y menos "dibujado a mano". El 2D procedural permite viento, estaciones y 60 fps con mucho menos coste. three.js no aportaba lo suficiente.
- **Pinear secciones con ScrollTrigger:** usé `position: sticky` y calculé el progreso yo mismo, porque así el sitio sigue funcionando y leyéndose sin JavaScript de animación y con movimiento reducido. GSAP se usa para las revelaciones, los contadores, la intro y el ticker; Lenis para el scroll suave.
- **Formulario de contacto:** el brief no lo pedía.
- **Un árbol solo en el hero:** ver el punto 2.

## 9. Accesibilidad y rendimiento

- **Movimiento reducido:** sin scroll suave ni revelados; el árbol aparece ya crecido, con viento mínimo y estaciones que cambian con calma. El mapa salta por etapas en vez de hacer zoom, y las escenas no se animan. Probado con `prefers-reduced-motion`.
- **Teclado:** enlace para saltar al contenido, Dock navegable con Tab, visor de galería con flechas y Esc y foco atrapado dentro, diálogos que devuelven el foco. Probado.
- **Contraste:** el texto secundario (#4b5040) supera 7:1 sobre los cuatro colores de estación. El color de acento solo se usa en tamaños grandes o en etiquetas que superan 4.5:1. En el anochecer, el texto pasa a crema sobre fondo oscuro.
- **Rendimiento:** dibujar el árbol cuesta unos 6 ms por fotograma a 1440 px. El canvas deja de dibujar cuando el árbol no se ve, las escenas solo se animan cuando están en pantalla y hay límite de partículas. En móvil el árbol tiene un nivel de ramas menos y menor densidad de píxeles. No hay saltos de maquetación: el canvas es fijo y las imágenes tienen proporción reservada.

## 10. Iteraciones

1. **Pasada 1, estructura e historia:** concepto "un año y un día", orden de secciones y todos los textos en tres idiomas con [TBD]/[VERIFY].
2. **Pasada 2, tipografía y sistema visual:** estudio de tres direcciones con capturas reales; elegida B; escala tipográfica; colores de estación.
3. **Pasada 3, movimiento, árbol y navegación:** primera versión completa. Problemas encontrados en las capturas y corregidos:
   - las hojas eran manchas grandes ("brócoli") → pasaron a hojas compuestas;
   - la copa colgaba hacia un lado y luego quedó plana como una acacia → fototropismo y terminaciones tempranas;
   - la línea del hero no aparecía (la animación dejaba un desplazamiento residual);
   - las partículas se quedaban congeladas en pantalla al moverse el árbol → ahora siguen al árbol y se desvanecen con él;
   - las etiquetas del mapa no se dibujaban → estaban dentro del `<title>` del SVG, y además Chrome no dibuja tamaños de letra menores de un píxel dentro de un viewBox ampliado;
   - el logo fijo se montaba sobre los titulares → banda de fundido superior y controles sobre una pastilla.
4. **Pasada 4, pulido (1440 y 390 px):**
   - en móvil, el hero se recompuso: árbol más estrecho, palabra encima y tagline debajo;
   - el menú móvil no navegaba porque el scroll estaba en pausa mientras el panel estaba abierto;
   - el Dock se ensanchó para la magnificación;
   - las ciudades del mapa se escalan con el zoom;
   - el pie de página se reordenó (el logo quedaba cortado);
   - se quitó el modo de fusión del grano por rendimiento.

   Probé el Dock, el menú móvil, el cambio de idioma, el visor de la galería con teclado, atrapar nueces, los easter eggs y el sonido.

5. **Pasada 5, contenido de la web antigua (a pedido de Francesco):** se recuperaron tres partes de elporvenir.farm, reescritas como piezas de exposición y no como tienda:
   - **Misión, visión y valores** (nueva subsección "Lo que defendemos", dentro de La familia): misión y visión como dos citas; los cuatro valores como una lista que gana peso tipográfico al pasar el cursor; y la frase "La sostenibilidad no es solo una meta. Es nuestra forma de cultivar, todos los días." a gran tamaño. La historia de la familia usa ahora el texto real de la web antigua (las fechas y anécdotas siguen [TBD]).
   - **Trabajando con la naturaleza** (nueva subsección dentro de La tierra, justo después de la foto aérea): "Elegida, no desmontada." Cinco tarjetas con dibujos animados en código: el monte se queda, cuatro variedades, flores para las abejas (con una abeja volando), miel propia (marcada "Previsto") y +200 hectáreas (una cuadrícula con las 72 hectáreas actuales llenas y las 200 del plan de expansión dibujadas en línea discontinua). El árbol se oculta en esta parte, así el salto de estación hacia el invierno queda fuera de la vista.
   - **Contacto:** Instagram @elporvenirfarm [VERIFY] y un formulario de mensaje que envía a info@elporvenir.farm (con el mismo servicio que la web antigua, formsubmit). Solo envía cuando el sitio está publicado en elporvenir.farm; en la vista previa avisa de que no se envió nada.

   Los textos en español de la web antigua venían sin tildes: se corrigieron. El portugués es nuevo. Se dejaron fuera, a propósito, las páginas de producto (formatos de pecana y tabla nutricional), porque el sitio es de exposición. El Dock sigue teniendo 8 entradas: las dos subsecciones nuevas encienden "La familia" y "La tierra".

## 11. Tiempo

Unos **40 minutos** para la versión inicial (de 11:16 a 11:56 del 17 de noviembre de 2026) y unos **25 minutos** para la pasada 5 (de 12:31 a 12:56), más el tiempo previo de la primera propuesta. No pude crear el repositorio nuevo `elporvenir-new-site` en GitHub (el formulario quedó relleno, pero la creación necesita tu clic), así que el código vive en la rama `v2` del repositorio actual.
