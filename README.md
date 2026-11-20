# PESADILLA

**Supervisor portátil de calidad, auditoría y mejora controlada para agentes de IA**

[Repositorio](https://github.com/jmstudio14/pesadilla-agent) · [Especificación técnica v0.2](docs/SPEC-v0.2-HARDENING-AND-AUDIT.md) · Licencia MIT

> **Estado del proyecto: MVP experimental 0.1.0.**
>
> PESADILLA todavía no es un supervisor autónomo multiagente ni un control de seguridad apto para producción. La versión actual es un prototipo inicial de CLI y auditoría básica. No debe utilizarse para bloquear de forma obligatoria agentes, aprobar despliegues ni autorizar operaciones sensibles. La especificación v0.2 documenta el endurecimiento necesario, pero sus requisitos todavía no están implementados.

---

## Índice

- [1. Qué es PESADILLA](#1-qué-es-pesadilla)
- [2. Problema que pretende resolver](#2-problema-que-pretende-resolver)
- [3. Objetivos y principios](#3-objetivos-y-principios)
- [4. Estado actual y alcance real](#4-estado-actual-y-alcance-real)
- [5. Arquitectura objetivo](#5-arquitectura-objetivo)
- [6. Flujo de auditoría previsto](#6-flujo-de-auditoría-previsto)
- [7. Estados de decisión](#7-estados-de-decisión)
- [8. Requisitos](#8-requisitos)
- [9. Instalación y primeros pasos](#9-instalación-y-primeros-pasos)
- [10. Uso de la CLI actual](#10-uso-de-la-cli-actual)
- [11. Formato de eventos actual](#11-formato-de-eventos-actual)
- [12. Configuración y proveedor semántico](#12-configuración-y-proveedor-semántico)
- [13. Integraciones con agentes](#13-integraciones-con-agentes)
- [14. Seguridad y privacidad](#14-seguridad-y-privacidad)
- [15. Control de tokens y costes](#15-control-de-tokens-y-costes)
- [16. Aprendizaje continuo y control de cambios](#16-aprendizaje-continuo-y-control-de-cambios)
- [17. Desarrollo y pruebas](#17-desarrollo-y-pruebas)
- [18. Roadmap](#18-roadmap)
- [19. Criterios para considerar PESADILLA listo](#19-criterios-para-considerar-pesadilla-listo)
- [20. Limitaciones conocidas](#20-limitaciones-conocidas)
- [21. Contribuciones](#21-contribuciones)
- [22. Licencia](#22-licencia)

## 1. Qué es PESADILLA

PESADILLA es un proyecto para construir una capa independiente de control de calidad sobre agentes de inteligencia artificial que trabajan en tareas de software y automatización.

Su propósito es revisar los planes, las acciones y los resultados de otros agentes; exigir pruebas y evidencias; detectar incumplimientos; impedir aprobaciones injustificadas; y convertir errores recurrentes en propuestas de mejora que puedan validarse antes de incorporarse.

La idea central es separar tres responsabilidades:

1. **Ejecutar:** el agente realiza el trabajo.
2. **Verificar:** PESADILLA comprueba el trabajo mediante políticas, pruebas y evidencias.
3. **Autorizar:** una política explícita o una persona responsable decide si se puede continuar.

El agente que ejecuta una tarea no debe tener autoridad para aprobar su propio trabajo. Una respuesta convincente, una lista de tareas completadas o una afirmación de que los tests han pasado no sustituyen una verificación reproducible.

PESADILLA aspira a ser independiente del proveedor y portable entre proyectos y plataformas. El núcleo debe mantener un contrato común, mientras que cada integración traduce los eventos y las decisiones al mecanismo nativo de su agente.

## 2. Problema que pretende resolver

Los agentes de programación pueden generar planes incompletos, modificar archivos fuera del alcance previsto, omitir pruebas, interpretar mal requisitos o declarar terminado un trabajo sin demostrarlo. Si el mismo agente planifica, ejecuta y valida su resultado, existe un conflicto de interés técnico: el sistema depende de la autoevaluación del componente que puede haber cometido el error.

PESADILLA pretende reducir estos riesgos:

- Planes sin criterios de aceptación concretos.
- Resultados que no corresponden al plan aprobado.
- Pruebas declaradas pero no ejecutadas.
- Cambios de archivos no previstos.
- Errores críticos que quedan ocultos en resúmenes.
- Repetición indefinida de ciclos de corrección.
- Uso excesivo de modelos, herramientas o plugins.
- Cambios automáticos y no trazables en prompts, skills o configuraciones.
- Falta de historial verificable sobre quién decidió qué y con qué evidencias.

PESADILLA no puede garantizar que un software esté libre de errores. Su función es hacer explícitos los controles aplicados, los resultados observados y las incertidumbres restantes.

## 3. Objetivos y principios

### Objetivos

- Supervisar agentes de distintos proveedores desde un núcleo común.
- Auditar planes, ejecución y resultados.
- Verificar evidencias con herramientas reproducibles.
- Aplicar políticas configurables sin permitir que una configuración accidental debilite los controles esenciales.
- Bloquear o solicitar correcciones ante incumplimientos demostrables.
- Limitar ciclos de revisión y consumo de recursos.
- Registrar decisiones y evidencias de forma trazable.
- Detectar causas raíz de fallos recurrentes.
- Proponer mejoras y validarlas con pruebas de regresión.
- Mantener la instalación reversible y el funcionamiento local cuando sea posible.

### Principios no negociables

1. **Independencia:** el ejecutor no se aprueba a sí mismo.
2. **Evidencia sobre afirmaciones:** una declaración del agente no es una prueba.
3. **Fallo seguro:** un error de verificación no se convierte en aprobación.
4. **Mínimo privilegio:** PESADILLA solo recibe los permisos necesarios.
5. **Trazabilidad:** toda decisión debe poder explicarse y relacionarse con su contexto.
6. **Cambios controlados:** ninguna skill, instrucción o política se modifica silenciosamente.
7. **Coste acotado:** primero se ejecutan controles deterministas; el modelo se utiliza solo cuando aporta valor.
8. **Portabilidad:** las particularidades de cada plataforma permanecen en adaptadores.
9. **Reversibilidad:** instalación, configuración y cambios deben poder deshacerse.
10. **Honestidad operativa:** no se declara una integración, prueba o capacidad como funcional hasta haberla verificado.

## 4. Estado actual y alcance real

### Versión disponible: 0.1.0

La versión publicada contiene una base experimental:

| Componente | Estado actual |
|---|---|
| CLI Node.js | Implementada con comandos init, audit y doctor |
| Política determinista | Implementación inicial y limitada |
| Proveedor compatible con OpenAI Chat Completions | Opcional, mediante variables de entorno |
| Registro de auditorías | JSONL local |
| Ejemplo de evento | Disponible en examples/sample-task.json |
| Pruebas automatizadas | Tres pruebas unitarias de política |
| Integración Claude Code | Documento orientativo; no es un adaptador ejecutable |
| Integración Codex | Documento orientativo; no es un adaptador ejecutable |
| Watchdog/event watcher | No implementado |
| Auditor independiente con aislamiento real | No implementado |
| Verificación automática de evidencias | No implementada |
| Memoria de aprendizaje validado | No implementada |
| Control efectivo de presupuesto de tokens | No implementado |
| CI de GitHub Actions | No implementada |
| Instalación y desinstalación de hooks | No implementadas |

**Importante:** el resultado aprobado por la política actual solo significa que los campos que comprueba esa versión no han producido hallazgos. No demuestra que el trabajo sea correcto ni que las evidencias sean auténticas.

La política actual puede aceptar una etapa de plan con una estructura mínima y no verifica de forma independiente el contenido de las evidencias. El ejemplo incluido contiene una descripción textual de una ejecución de tests; no es una prueba de que esos tests se hayan ejecutado realmente.

Además, la configuración inicial crea el modo report-only, pero la CLI actual todavía no aplica ese modo como una barrera efectiva de ejecución. No debe interpretarse como una garantía de que las operaciones estén protegidas.

La especificación de endurecimiento v0.2 describe los cambios necesarios y sus criterios de aceptación. Es un documento de diseño, no una lista de funcionalidades ya entregadas.

## 5. Arquitectura objetivo

La arquitectura prevista separa un núcleo independiente de los adaptadores de cada plataforma.

### Módulos previstos

| Módulo | Responsabilidad |
|---|---|
| Policy Engine | Validar y evaluar políticas, severidades, límites y excepciones |
| Evidence Engine | Comprobar comandos, pruebas, artefactos, hashes y criterios de aceptación |
| Independent Auditor | Separar permisos e identidad del agente ejecutor |
| Event Core | Normalizar eventos, correlacionar tareas y controlar estados |
| Agent Adapters | Integrarse con los hooks y APIs de cada agente |
| Token & Cost Guard | Aplicar presupuestos, límites, caché y telemetría |
| Learning Engine | Analizar errores confirmados y proponer lecciones |
| Regression Engine | Convertir lecciones en pruebas reproducibles |
| Change Control | Revisar, aprobar, versionar y revertir cambios |
| Security & Audit | Proteger secretos, permisos, registros y trazabilidad |

### Vista conceptual

    Agentes de IA
        |
        v
    Adaptadores nativos
        |
        v
    Núcleo de eventos PESADILLA
        |
        +--> Validación de esquema e identidad
        |
        +--> Motor de políticas deterministas
        |
        +--> Verificación de evidencias
        |
        +--> Revisión semántica opcional
        |
        +--> Decisión y registro
        |
        +--> Propuesta de aprendizaje
                  |
                  v
          Pruebas de regresión
                  |
                  v
          Aprobación del cambio

La revisión semántica es complementaria. No sustituye pruebas ejecutables ni puede anular un bloqueo determinista.

## 6. Flujo de auditoría previsto

1. **Recepción:** el adaptador recibe un evento del agente.
2. **Normalización:** convierte el evento nativo al esquema común de PESADILLA.
3. **Validación:** comprueba esquema, identidad, correlación, etapa y límites.
4. **Política determinista:** evalúa requisitos, restricciones y hallazgos críticos.
5. **Verificación:** recupera y ejecuta los verificadores permitidos en un entorno controlado.
6. **Revisión semántica opcional:** solicita análisis a un modelo solo cuando es necesario y está permitido.
7. **Decisión:** combina los resultados de forma conservadora.
8. **Aplicación:** el adaptador comunica la decisión al mecanismo real de la plataforma.
9. **Registro:** almacena el alcance, la política, las evidencias y la decisión.
10. **Aprendizaje:** los errores confirmados pueden generar propuestas de mejora independientes del flujo de aprobación.

Un fallo del proveedor, un timeout, un evento inválido o una evidencia no verificable nunca deben producir una aprobación silenciosa.

## 7. Estados de decisión

Los estados objetivo son:

| Estado | Significado |
|---|---|
| received | Evento recibido, todavía sin validar |
| invalid | Evento, esquema o identidad no válidos |
| needs_revision | Falta información o existen problemas corregibles |
| blocked | Incumplimiento crítico o condición de seguridad |
| approved | Requisitos y evidencias verificadas para el alcance exacto |
| expired | La aprobación ha caducado o ha quedado invalidada por cambios |

Una aprobación debe estar vinculada a una instantánea concreta: tarea, plan, commit, archivos relevantes, versión de política, entorno de pruebas y evidencias. Si alguno de esos elementos cambia materialmente, la aprobación anterior debe invalidarse.

Los estados descritos son el diseño objetivo. La implementación actual 0.1.0 utiliza únicamente approved, needs_revision y blocked.

## 8. Requisitos

### Para utilizar el MVP

- Node.js 20 o superior.
- npm.
- Git, si se clona el repositorio.
- Un terminal compatible con Node.js.

### Para la futura integración

Los requisitos dependerán de las versiones de Claude Code, Codex y otras plataformas que se declaren compatibles. Cada adaptador deberá documentar la versión probada y los eventos que realmente puede bloquear.

### Proveedor semántico opcional

Se puede configurar un endpoint compatible con el formato de OpenAI Chat Completions. No se incluye un proveedor ni se necesita una API key para ejecutar únicamente las comprobaciones deterministas.

## 9. Instalación y primeros pasos

Clona el repositorio:

    git clone https://github.com/jmstudio14/pesadilla-agent.git
    cd pesadilla-agent

Instala las dependencias:

    npm install

El MVP no declara dependencias de ejecución externas en package.json.

Ejecuta las pruebas disponibles:

    npm test

Comprueba la sintaxis de los módulos incluidos en el script check:

    npm run check

Inicializa PESADILLA en el proyecto:

    node ./src/cli.js init

Esto crea:

    .pesadilla/
      config.json
      events/
      learning/

Ejecuta una auditoría de ejemplo:

    node ./src/cli.js audit examples/sample-task.json

Consulta el diagnóstico del entorno:

    node ./src/cli.js doctor

No conectes todavía esta versión a hooks que bloqueen operaciones reales. Utilízala como prototipo de evaluación y familiarización.

## 10. Uso de la CLI actual

### init

    node ./src/cli.js init

Crea el directorio local y un archivo de configuración inicial. Si el archivo de configuración ya existe, la CLI lo conserva.

### audit

    node ./src/cli.js audit ruta/al/evento.json

Lee el evento JSON, intenta cargar la política de .pesadilla/config.json, ejecuta la auditoría y muestra el informe en formato JSON. El informe se añade al registro local.

El proceso devuelve código de salida 2 cuando el estado no es approved. Un error de ejecución puede devolver un código distinto.

### doctor

    node ./src/cli.js doctor

Muestra la versión de Node.js y si están presentes las variables de configuración del proveedor. No realiza llamadas al modelo y no constituye todavía un diagnóstico completo de configuración, seguridad o integraciones.

## 11. Formato de eventos actual

El MVP acepta eventos JSON con campos como los siguientes:

    {
      "task_id": "demo-001",
      "agent_id": "example-coding-agent",
      "stage": "result",
      "task": "Implementar un endpoint REST",
      "plan": [
        "Definir el contrato",
        "Implementar el endpoint",
        "Añadir pruebas"
      ],
      "result": "Endpoint implementado",
      "requirements": [
        "La entrada válida devuelve HTTP 200",
        "La entrada inválida devuelve HTTP 400"
      ],
      "evidence": [
        "node --test: pruebas superadas"
      ],
      "changed_files": [
        "src/routes/example.js"
      ]
    }

Etapas reconocidas por la política actual:

- plan
- execution
- result

El ejemplo es ilustrativo. El campo evidence es actualmente una lista de valores declarativos; PESADILLA 0.1.0 no recupera ni verifica automáticamente la ejecución de esos comandos.

### Contrato futuro

La especificación v0.2 prevé un esquema versionado con identificadores de evento, correlación, versión de política, origen, referencias a evidencias verificables, hashes y criterios de aceptación estructurados.

No se debe asumir que el contrato futuro ya está soportado por la CLI actual.

## 12. Configuración y proveedor semántico

El comando init genera una configuración inicial similar a esta:

    {
      "schema_version": "1.0",
      "mode": "report-only",
      "policy": {
        "maxRevisionCycles": 2,
        "requirePlan": true,
        "requireResult": true,
        "requireEvidenceForApproval": true,
        "requireRequirements": true,
        "blockOnMissingTaskId": true
      }
    }

Esta configuración es una base experimental. En la versión actual, no todos los parámetros tienen efecto completo y el modo report-only no se aplica como control efectivo de ejecución. No modifiques estos valores pensando que ya constituyen una frontera de seguridad.

### Variables del proveedor

Configura las variables en el entorno del proceso, nunca en archivos versionados:

- PESADILLA_MODEL_URL: endpoint completo compatible con Chat Completions.
- PESADILLA_MODEL_NAME: identificador del modelo.
- PESADILLA_API_KEY: credencial opcional si el endpoint la requiere.

Ejemplo de configuración en PowerShell:

    $env:PESADILLA_MODEL_URL = "https://api.example.com/v1/chat/completions"
    $env:PESADILLA_MODEL_NAME = "nombre-del-modelo"
    $env:PESADILLA_API_KEY = "TU_CLAVE"

La revisión semántica es opcional y puede enviar el evento al proveedor remoto. No incluyas información confidencial, secretos, datos personales ni código privado en esa petición sin evaluar antes el tratamiento de datos y la política del proveedor.

La versión actual utiliza un timeout de 30 segundos para la llamada. Todavía no dispone de presupuestos completos de tokens, límites por proyecto ni medición uniforme de costes.

## 13. Integraciones con agentes

La integración se realizará mediante adaptadores específicos. No se debe asumir que todas las plataformas tienen los mismos eventos, formatos de entrada o mecanismos de bloqueo.

### Claude Code

Documentación de referencia: https://code.claude.com/docs/en/hooks

El directorio integrations/claude-code contiene instrucciones de diseño y despliegue gradual. No contiene todavía un adaptador ejecutable.

Antes de habilitar un hook real será necesario:

1. Confirmar la versión instalada y el contrato del evento.
2. Normalizar el payload al esquema de PESADILLA.
3. Probar el resultado permitido y bloqueado en un proyecto desechable.
4. Verificar el comportamiento ante timeout, crash y respuesta inválida.
5. Comprobar que no se sobrescribe configuración previa.
6. Documentar instalación y desinstalación.

### Codex

Documentación de referencia: https://developers.openai.com/codex/hooks

El directorio integrations/codex contiene notas de integración, no un adaptador ejecutable.

Se debe verificar la disponibilidad de hooks y su semántica en la versión instalada. No se debe asumir que un evento o error bloquea una operación si la documentación y las pruebas no lo demuestran.

### Otras plataformas

Un adaptador futuro deberá:

- implementar el contrato común;
- validar y limitar los datos recibidos;
- comunicar decisiones usando el mecanismo oficial de la plataforma;
- respetar permisos y configuración existentes;
- incluir pruebas de integración;
- declarar versiones compatibles;
- permitir desinstalación y rollback.

## 14. Seguridad y privacidad

PESADILLA está diseñado para actuar cerca de código, herramientas y datos de proyectos. Por ello, la seguridad debe ser una condición de diseño, no una funcionalidad posterior.

### Amenazas que deben contemplarse

- Prompt injection en código, documentación, logs, issues y salidas de herramientas.
- Exposición de claves y variables de entorno.
- Comandos destructivos o accesos fuera del workspace.
- Suplantación y repetición de eventos.
- Manipulación de evidencias y registros.
- Cambios no autorizados en políticas o instrucciones.
- Dependencias comprometidas.
- Envío accidental de código o datos privados a proveedores externos.

### Reglas de seguridad

- Tratar el contenido generado por agentes y repositorios como datos no confiables.
- No ejecutar comandos propuestos por un agente sin controles, sandbox y permisos explícitos.
- No almacenar credenciales en el repositorio.
- No enviar secretos a modelos ni incluirlos en logs.
- Utilizar permisos mínimos.
- Limitar tamaño de entrada y salida, tiempo de ejecución y frecuencia.
- Verificar la relación entre evidencias, tarea y commit.
- Mantener registros protegidos y con retención definida.
- Informar de forma clara cuándo se envían datos fuera del equipo.
- Mantener modo local/determinista cuando no se autorice un proveedor remoto.

La versión 0.1.0 todavía no implementa todas estas garantías. No debe considerarse un sandbox ni un mecanismo de protección de secretos.

## 15. Control de tokens y costes

La estrategia objetivo es ejecutar primero verificaciones deterministas y recurrir a un modelo únicamente cuando exista una pregunta que no pueda resolverse de forma fiable mediante reglas o herramientas.

Controles previstos:

- Presupuesto por tarea, proyecto y periodo.
- Límite de tokens de entrada y salida.
- Límite de tamaño del contexto.
- Caché de revisiones solo para entradas realmente idénticas e inmutables.
- Registro de modelo, proveedor, duración y consumo disponible.
- Evitar revisiones semánticas redundantes.
- No llamar al modelo si una condición determinista ya ha bloqueado el evento, salvo excepción explícita.
- Funcionamiento sin proveedor y con presupuesto de modelo cero.

Estos controles forman parte del roadmap; no están implementados de forma completa en 0.1.0.

## 16. Aprendizaje continuo y control de cambios

El aprendizaje no debe modificar directamente el comportamiento del supervisor ni de los agentes.

Flujo previsto:

1. Detectar un error reproducible.
2. Recopilar evidencias y contexto mínimo.
3. Identificar la causa raíz.
4. Redactar una propuesta de aprendizaje.
5. Determinar si es una lección específica de un agente/proyecto o generalizable.
6. Crear una prueba de regresión que reproduzca el error.
7. Ejecutar las pruebas nuevas y existentes.
8. Revisar el diff y los riesgos.
9. Solicitar aprobación humana.
10. Versionar el cambio y conservar un mecanismo de rollback.

Los aprendizajes específicos no deben propagarse a otros proyectos. Solo se compartirán reglas generales cuando se haya comprobado que no dependen de información privada o de un contexto particular.

La versión actual crea el directorio learning, pero todavía no implementa este motor de aprendizaje.

## 17. Desarrollo y pruebas

### Scripts disponibles

| Comando | Función |
|---|---|
| npm test | Ejecuta las pruebas con el test runner integrado de Node.js |
| npm run check | Comprueba la sintaxis de cli.js, audit.js y provider.js |

### Ejecutar pruebas

    npm test
    npm run check

El conjunto de pruebas actual es pequeño y cubre tres casos de la política determinista. No equivale a una suite de seguridad, integración o regresión completa.

### Calidad exigida para futuras contribuciones

- Pruebas para cada corrección y funcionalidad.
- Casos negativos y adversariales.
- Validación de esquemas y configuración.
- Pruebas de fallos de proveedor y timeout.
- Pruebas de integración en versiones declaradas de cada agente.
- CI reproducible.
- Revisión de dependencias y permisos.
- Documentación actualizada.
- Ninguna capacidad se declara operativa sin evidencia.

## 18. Roadmap

El roadmap de implementación se organiza por dependencias. No se debe saltar a funciones avanzadas antes de asegurar el núcleo.

| Prioridad | Fase | Resultado esperado |
|---|---|---|
| P0 | Contratos y Policy Engine | Esquemas estrictos, defaults seguros y decisiones fail-closed |
| P0 | Evidence Engine | Evidencias recuperables y verificadas, vinculadas a tarea y commit |
| P0 | Auditor independiente | Separación de permisos, identidad y autoridad |
| P1 | Seguridad y pruebas | Casos adversariales, protección de secretos y CI |
| P1 | Adaptadores | Integraciones Claude Code y Codex probadas en sus versiones objetivo |
| P1 | Trazabilidad | Registros protegidos, correlación y alcance de aprobación |
| P2 | Token & Cost Guard | Presupuestos, medición, caché y reducción de llamadas |
| P3 | Learning Engine | Causas raíz y propuestas de aprendizaje |
| P3 | Regression Engine | Validación de cada aprendizaje antes de aceptarlo |
| P4 | Distribución portable | Instalación, actualización, diagnóstico y desinstalación |
| P4 | Expansión | Nuevos adaptadores y políticas reutilizables |

### Orden de ejecución

P0 debe completarse antes de permitir que PESADILLA ejerza autoridad de veto sobre tareas reales. P1 debe superar pruebas reproducibles antes de declarar las primeras integraciones utilizables. El aprendizaje continuo se implementará después de disponer de auditoría y regresiones fiables.

La planificación detallada y los criterios de aceptación están en [SPEC-v0.2-HARDENING-AND-AUDIT.md](docs/SPEC-v0.2-HARDENING-AND-AUDIT.md).

## 19. Criterios para considerar PESADILLA listo

PESADILLA no debe considerarse listo para producción hasta que, como mínimo:

- Ningún plan incompleto pueda aprobarse.
- Las afirmaciones textuales no se acepten como evidencias verificadas.
- Los resultados estén vinculados al plan, commit y artefactos comprobados.
- El agente ejecutor no pueda alterar la decisión del auditor.
- Los fallos, timeouts y entradas inválidas no produzcan aprobaciones.
- Los hallazgos críticos y límites de revisión funcionen.
- Las pruebas adversariales y CI estén operativas.
- Cada adaptador demuestre el bloqueo real en la plataforma y versión declaradas.
- La instalación sea reversible y no destruya configuraciones existentes.
- Los límites de coste sean efectivos y medibles.
- Las mejoras de aprendizaje requieran pruebas, revisión, aprobación y rollback.

La especificación v0.2 contiene la matriz de aceptación ampliada.

## 20. Limitaciones conocidas

En la versión actual:

- No existe un supervisor autónomo en segundo plano.
- No hay watchdog ni escucha global de eventos.
- No hay adaptadores funcionales para Claude Code o Codex.
- No se verifica de forma independiente la ejecución de pruebas.
- No existe una frontera de confianza robusta entre agente y auditor.
- No hay memoria validada de aprendizaje ni evolución automática de skills.
- No hay control completo de tokens o costes.
- No existe CI configurada en el repositorio.
- La política y el esquema de eventos son iniciales y necesitan endurecimiento.
- El modo report-only no constituye todavía una garantía de no bloqueo.
- No hay certificación de seguridad ni compatibilidad de producción.

Estas limitaciones son conocidas y forman parte del trabajo pendiente. No deben ocultarse en documentación, demos ni comunicaciones del proyecto.

## 21. Contribuciones

Las contribuciones deben centrarse en cambios pequeños, verificables y alineados con la especificación.

Antes de proponer una funcionalidad:

1. Explica el problema que resuelve.
2. Indica el módulo afectado y las implicaciones de seguridad.
3. Define criterios de aceptación.
4. Añade pruebas que reproduzcan el comportamiento esperado y los fallos relevantes.
5. Actualiza documentación y ejemplos.
6. No declares una integración funcional sin probarla contra la plataforma real.
7. Evita introducir dependencias o llamadas a modelos sin justificar su coste y necesidad.

Los cambios que afecten a políticas, permisos, hooks, evidencias o autoridad de veto requieren especial atención y revisión.

## 22. Licencia

Este proyecto se distribuye bajo licencia MIT. Consulta el archivo [LICENSE](LICENSE).

---

**PESADILLA — primero demostrar, después aprobar.**
