# Preguntas de reflexión

_Escribe tus respuestas debajo de cada pregunta._

**Alumno:** Giovanni Pasillas

---

## Paso 1 · Explorando la API

| Pregunta | Mi respuesta |
|---|---|
| ¿Cuántos personajes trae cada página? | 20 personajes por página. |
| ¿Qué campo me dice si existe una página siguiente? | `info.next`. |
| ¿Qué valor tiene ese campo en la última página? | `null`. |
| ¿Qué código HTTP devuelve una búsqueda sin resultados? | HTTP 404 (Not Found). |
| ¿Qué campos del personaje usa `CharacterCard`? | `id` para identificarlo y `name`, `status`, `species` e `image` para mostrarlo. |

## Paso 2 · Petición HTTP

**¿Qué diferencia hay entre que `fetch` "falle" y que el servidor responda con un error? ¿Qué debo revisar en la respuesta?**

> Si falla la red, `fetch` rechaza la promesa. En cambio, si el servidor responde con un código de error HTTP, `fetch` normalmente sí devuelve una respuesta. Por eso debo revisar `response.ok` y `response.status` para saber si la petición fue exitosa.

## Paso 3 · Estado

**¿Por qué guardo los personajes en estado y no en una variable normal?**

> Porque el estado es administrado por React. Cuando lo actualizo, React vuelve a renderizar el componente y muestra los datos nuevos. Una variable normal no provoca ese renderizado.

## Paso 4 · useEffect

1. **¿Qué pasa si omito por completo el arreglo de dependencias?**

> El efecto se ejecuta después de cada renderizado. Si dentro del efecto actualizo un estado, puede provocar renderizados y ejecuciones repetidas.

2. **¿Qué significa dejar el arreglo vacío?**

> Significa que el efecto no depende de valores reactivos y se ejecuta al montar el componente (con las comprobaciones adicionales que puede realizar el modo de desarrollo de React).

3. **¿Por qué la función que recibe `useEffect` no debe ser `async` directamente?**

> Porque una función `async` siempre devuelve una promesa, pero `useEffect` espera que la función devuelva nada o una función de limpieza. Por eso creo una función asíncrona dentro del efecto y la ejecuto.

## Paso 5 · FlatList

1. **¿Para qué sirve la prop que extrae la llave de cada elemento?**

> `keyExtractor` proporciona una llave única y estable para cada elemento. React la utiliza para identificar los elementos cuando la lista cambia.

2. **¿Por qué usar `FlatList` en lugar de un `ScrollView` con `.map()`?**

> `FlatList` optimiza las listas grandes porque renderiza los elementos que se necesitan en pantalla y administra mejor la memoria. Un `ScrollView` con `.map()` normalmente renderiza todos los elementos de una vez.

## Paso 6 · Carga y error

**¿Por qué es mejor mostrar un mensaje con un botón "Reintentar" que dejar la pantalla vacía?**

> Porque el usuario sabe qué ocurrió y tiene una forma directa de volver a intentar la petición, en lugar de pensar que la aplicación dejó de funcionar.

## Paso 8 · Paginación

**¿Qué problema aparece si la función de "cargar más" se dispara varias veces seguidas? ¿Cómo lo evité?**

> Se pueden enviar varias peticiones para la misma página, duplicar personajes o alterar el orden de los resultados. Lo evité con una referencia (`useRef`) que funciona como bloqueo mientras hay una petición de paginación activa, además de comprobar si existe una página siguiente y si la pantalla está cargando o actualizándose.

## Paso 9 · Pull to refresh

**¿Por qué usé un estado distinto (`refreshing`) y no el mismo de la carga inicial?**

> Porque son procesos diferentes. `loading` representa la carga inicial de la pantalla, mientras que `refreshing` controla el indicador nativo del gesto de actualización sin reemplazar toda la pantalla por un spinner.

## Paso 10 · Búsqueda

1. **¿Qué es el debounce y qué problema resuelve?**

> Es una técnica que espera un tiempo después de la última tecla antes de ejecutar una acción. Evita enviar una petición por cada letra que escribe el usuario y reduce solicitudes innecesarias.

2. **¿Para qué sirve la función de limpieza (cleanup) que se devuelve en un `useEffect`? Da un ejemplo de esta práctica.**

> Sirve para limpiar recursos o cancelar tareas del efecto anterior antes de ejecutar uno nuevo o desmontar el componente. En esta práctica se utiliza `clearTimeout` para cancelar el temporizador anterior si el usuario sigue escribiendo.

3. **Si el usuario escribe rápido y las respuestas llegan en desorden, ¿qué podría salir mal?**

> Una petición anterior podría terminar después de la más reciente y sobrescribir los resultados correctos. Para evitarlo, se identifica cada petición y solo se actualiza el estado si la respuesta corresponde a la petición vigente.

## Cierre

**Menciona dos mejoras que le harías a la app si tuvieras una hora más:**

> 1. Agregaría filtros por estado (Alive, Dead y unknown) para facilitar la búsqueda de personajes.
> 2. Implementaría una pantalla de detalle para mostrar más información de cada personaje al seleccionar su tarjeta.
