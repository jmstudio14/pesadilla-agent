# PESADILLA — Especificación técnica y plan de endurecimiento v0.2

> **Estado:** propuesta técnica pendiente de implementación y revisión  
> **Versión de referencia:** MVP 0.1.0  
> **Rama de trabajo:** `docs/spec-v0.2-audit`  
> **Regla de seguridad:** esta especificación no autoriza a activar PESADILLA como supervisor obligatorio ni a modificar automáticamente agentes, skills o código.

## 1. Propósito y objetivo

PESADILLA debe ser una capa de control independiente, portable y verificable para supervisar el trabajo de agentes de programación y automatización. Su función es evaluar planes, acciones y resultados con políticas explícitas, evidencias reproducibles y autoridad de veto cuando corresponda.

El objetivo no es prometer certeza absoluta ni añadir autonomía por sí misma. El objetivo es impedir aprobaciones sin fundamento, reducir errores y costes evitables, y hacer que cualquier decisión pueda explicarse y auditarse.

Principios obligatorios:

1. Ningún agente puede aprobar su propio trabajo.
2. Una afirmación del agente no constituye evidencia.
3. La ausencia de información, un error del auditor o una integración caída nunca deben convertirse silenciosamente en aprobación.
4. Las decisiones deben estar vinculadas a una tarea, un plan, una versión de política y un conjunto concreto de evidencias.
5. Las mejoras aprendidas no se aplican directamente: se proponen, prueban, versionan y aprueban.
6. El sistema debe minimizar llamadas a modelos y operar por eventos siempre que la plataforma lo permita.
7. La instalación debe ser opt-in, reversible y segura por defecto.

## 2. Estado de partida y alcance de la auditoría

El repositorio de referencia contiene el MVP 0.1.0, con CLI, política determinista básica, proveedor opcional compatible con OpenAI, auditoría JSONL, un ejemplo y una prueba de política. Las guías de Claude Code y Codex existentes son documentación orientativa, no adaptadores ejecutables.

La revisión del repositorio identificó los siguientes riesgos. Deben confirmarse mediante pruebas automatizadas al implementar las correcciones; esta lista es una especificación de trabajo, no una afirmación de que ya se hayan corregido.

### 2.1 Hallazgos críticos

- **Aprobación prematura de planes:** la validación de la etapa `plan` no exige de forma suficientemente estricta un plan estructurado y criterios de aceptación verificables.
- **Evidencia declarativa:** el contenido de `evidence` puede ser texto aportado por el propio agente; no se demuestra que los comandos se ejecutaran ni que sus resultados sean auténticos.
- **Falta de vinculación entre etapas:** el resultado no queda ligado criptográficamente o por identificadores inmutables al plan aprobado, la revisión de código y los criterios de aceptación correspondientes.
- **Independencia no demostrada:** un identificador `agent_id` no prueba separación de roles, procesos o credenciales entre ejecutor y auditor.
- **Política incompleta:** opciones como `criticalFindings` y `maxRevisionCycles` están declaradas pero no tienen aplicación efectiva suficiente.
- **Fallo seguro no garantizado:** debe definirse y probarse qué ocurre ante timeout, JSON inválido, proveedor no disponible, política corrupta o evento incompleto. Ningún fallo puede transformarse en aprobación.

### 2.2 Hallazgos de prioridad alta

- Validación incompleta del contrato de salida del proveedor semántico.
- Contenido no confiable del agente enviado al auditor sin un límite de confianza suficientemente explícito frente a prompt injection.
- Posible consumo de revisión semántica cuando el análisis determinista ya ha bloqueado la tarea.
- Configuración como `report-only` que debe tener semántica real, explícita y probada.
- Registro JSONL sin controles suficientes de integridad, permisos, rotación, retención y trazabilidad.
- Ausencia de adaptadores ejecutables para los agentes objetivo.
- Ausencia de CI y de una batería de pruebas adversariales e integración.

### 2.3 Hallazgos de prioridad media

- Diagnóstico y validación de configuración insuficientes.
- Gestión de errores demasiado genérica en algunos caminos de CLI y proveedor.
- Falta de límites explícitos de tamaño de entrada/salida y timeout uniforme.
- Distribución, dependencias bloqueadas y pruebas reproducibles en Windows aún por definir.

## 3. Arquitectura objetivo

Separar el núcleo de las integraciones. El núcleo no debe depender de Claude Code, Codex ni de un proveedor de modelos concreto.

### 3.1 Módulos

| Módulo | Responsabilidad |
|---|---|
| Policy Engine | Cargar, validar y evaluar políticas con valores seguros por defecto. |
| Evidence Engine | Verificar resultados de comandos, pruebas, artefactos, hashes y criterios de aceptación. |
| Independent Auditor | Separar identidad, permisos y proceso de ejecución respecto al agente auditado. |
| Event Core | Normalizar eventos, correlacionarlos y gestionar estados y ciclos de revisión. |
| Agent Adapters | Traducir eventos y decisiones al contrato específico de cada plataforma. |
| Token & Cost Guard | Presupuestos, límites, caché, telemetría y prevención de llamadas redundantes. |
| Learning Engine | Proponer causas raíz y lecciones a partir de fallos confirmados. |
| Regression Engine | Convertir lecciones en casos reproducibles y comprobar que no generan regresiones. |
| Change Control | Revisar, versionar, aprobar y revertir cambios en políticas, skills e instrucciones. |
| Security & Audit | Secretos, permisos mínimos, integridad de registros, redacción y trazabilidad. |

### 3.2 Flujo de eventos

1. Un adaptador recibe un evento del agente.
2. Normaliza el evento y valida su esquema, identidad y correlación.
3. El motor determinista comprueba política, etapa, límites y requisitos.
4. Si existe un bloqueo determinista, se devuelve la decisión sin gastar tokens en revisión semántica, salvo que una política lo requiera expresamente.
5. Si la revisión semántica está habilitada y justificada, se envía al proveedor únicamente el contexto mínimo necesario, marcado como contenido no confiable.
6. El resultado se valida contra un esquema estricto y se combina de forma conservadora con la decisión determinista.
7. El adaptador aplica la decisión usando el mecanismo de bloqueo real de la plataforma.
8. Se registra la decisión, sus evidencias, versión de política y correlación.
9. Una tarea de aprendizaje puede analizar fallos confirmados por separado; nunca modifica automáticamente el sistema en producción.

### 3.3 Máquina de estados mínima

Estados recomendados:

- `received`: evento recibido, aún no validado.
- `invalid`: evento o identidad no válidos.
- `needs_revision`: falta información o hay hallazgos corregibles.
- `blocked`: infracción crítica o fallo de seguridad.
- `approved`: requisitos y evidencias verificadas para el alcance exacto.
- `expired`: aprobación caducada o invalidada por cambios posteriores.

No reutilizar una aprobación si cambia el commit, los archivos relevantes, el plan, la política, la configuración de pruebas o el conjunto de evidencias. La aprobación debe tener alcance y caducidad explícitos.

## 4. Contratos y reglas de aprobación

### 4.1 Eventos

Definir un esquema versionado (por ejemplo JSON Schema) para eventos de plan, ejecución, resultado, revisión y fallo. Validar tipos, campos obligatorios, tamaños máximos, enumeraciones y compatibilidad de versiones.

Cada evento debe incluir como mínimo:

- `schema_version`
- `event_id` único
- `task_id` y correlación de sesión
- `agent_id` y rol declarado
- `stage`
- `policy_version`
- `created_at` y origen
- identificador/hash del plan cuando aplique
- requisitos y criterios de aceptación estructurados
- referencias a evidencias verificables, no solo descripciones textuales

Rechazar campos desconocidos peligrosos cuando puedan alterar decisiones. No permitir que los datos del agente sobrescriban la política efectiva.

### 4.2 Evidencias

Distinguir claramente:

- **Afirmación:** texto que el agente dice que ha hecho.
- **Referencia:** ruta, URL, ID de ejecución o artefacto que se puede recuperar.
- **Evidencia verificada:** resultado recuperado y comprobado por un verificador confiable.

Una evidencia verificable debe registrar, según el tipo:

- tipo de verificador y versión;
- comando ejecutado y directorio de trabajo;
- código de salida;
- stdout/stderr o resumen con límites de tamaño y redacción de secretos;
- hora de inicio/fin;
- hash del artefacto, commit o archivos comprobados;
- entorno y versión de herramientas;
- resultado estructurado y criterio que satisface.

No ejecutar comandos arbitrarios aportados por el agente sin sandbox, allowlist y política de permisos. La evidencia textual nunca debe elevar por sí sola el estado a `approved`.

### 4.3 Reglas de decisión

- **Fail closed:** evento inválido, evidencia ausente en un requisito obligatorio, timeout del verificador o error de política no puede dar aprobación.
- Los hallazgos críticos bloquean; los altos requieren corrección según política; los informativos no bloquean por defecto.
- Las políticas personalizadas se validan y fusionan con defaults seguros; no pueden debilitar controles críticos salvo override explícito, versionado y autorizado.
- Aplicar realmente `criticalFindings`, `maxRevisionCycles` y todos los parámetros declarados. Rechazar valores inválidos.
- Limitar ciclos de revisión y detectar repeticiones idénticas para evitar bucles.
- Diferenciar `report-only` (observa y registra, no bloquea) de `enforce` (aplica decisiones). Mostrar el modo efectivo en cada diagnóstico y registro.
- Una aprobación de plan no equivale a aprobación del resultado final.

## 5. Independencia del auditor

La independencia no se consigue con un campo de texto distinto. Debe diseñarse como una frontera de confianza.

- El ejecutor no puede escribir, firmar ni alterar el registro de decisión del auditor.
- Separar credenciales y permisos de ejecución y auditoría.
- El auditor recibe datos de entrada como no confiables y no hereda instrucciones del agente.
- Para verificaciones deterministas, usar un proceso/herramienta controlado y reproducible.
- Para revisión semántica, usar un proveedor y contexto separados cuando sea viable; registrar modelo, versión, parámetros y respuesta validada.
- La revisión semántica nunca sustituye pruebas ejecutables ni puede ignorar un bloqueo determinista.
- Si no se puede garantizar independencia suficiente, declarar la limitación y no presentar la decisión como auditoría independiente.

## 6. Seguridad y privacidad

Amenazas que deben cubrirse:

- Prompt injection dentro de código, README, logs, issues, documentación, salida de tests o artefactos.
- Exfiltración de claves, tokens, variables de entorno, datos privados y contenido de otros proyectos.
- Comandos destructivos o acceso fuera del workspace.
- Suplantación de eventos, repetición de eventos antiguos y manipulación de resultados.
- Modificación de políticas, adaptadores o registros por el agente auditado.
- Dependencias comprometidas y scripts de instalación no confiables.

Controles requeridos:

1. Tratar todo contenido de repositorios y agentes como datos no confiables, nunca como instrucciones de control.
2. No incluir secretos en prompts, logs, telemetría ni informes.
3. Aplicar redacción de secretos antes de persistir o enviar datos.
4. Usar permisos mínimos, allowlists y sandbox para comandos.
5. Verificar hashes, IDs de ejecución y relación entre evento, commit y artefactos.
6. Añadir límites de tamaño, timeout, rate limit y protección contra repetición.
7. Proteger configuración y directorios de auditoría con permisos adecuados.
8. Definir retención y borrado de logs, así como modo local sin proveedor externo.
9. Documentar explícitamente qué datos salen del equipo cuando se usa un proveedor remoto.

## 7. Integraciones por eventos

Implementar adaptadores separados; no asumir que las plataformas comparten el mismo contrato.

### 7.1 Claude Code

Consultar y fijar la versión de la documentación oficial de hooks en el momento de implementar. Mapear únicamente eventos y respuestas documentados. Probar especialmente los eventos de pre-herramienta y los mecanismos reales de permitir/bloquear.

Referencia: https://code.claude.com/docs/en/hooks

### 7.2 Codex

Usar los hooks documentados y respetar su configuración, revisión/confianza y semántica de bloqueo. Verificar por evento qué errores, timeouts y respuestas bloquean realmente; no asumir que un fallo de hook siempre bloquea la herramienta. Considerar que los hooks MCP y de comando tienen contratos y límites propios.

Referencia: https://developers.openai.com/codex/hooks

### 7.3 Otras plataformas

Añadir adaptadores solo cuando exista una interfaz documentada, estable y probada. El núcleo debe funcionar también en modo CLI/manual sin integración.

### 7.4 Instalación y reversibilidad

- No sobrescribir hooks o configuración existente.
- Detectar conflictos y duplicados antes de instalar.
- Hacer backup y ofrecer uninstall/rollback.
- Instalar inicialmente en modo observación.
- Solicitar confianza/permisos mediante los mecanismos nativos de cada plataforma.
- No activar autoridad de veto global sin pruebas y consentimiento explícito.

## 8. Control de tokens y costes

- Ejecutar primero comprobaciones deterministas.
- No invocar modelo si el evento es inválido o ya está bloqueado, salvo excepción explícita.
- Establecer límites por evento, tarea, proyecto y periodo.
- Limitar tamaño de contexto y salida.
- Registrar proveedor, modelo, tokens de entrada/salida y coste cuando el proveedor lo exponga.
- Añadir caché solo para entradas idénticas e inmutables, con clave que incluya versión de política, modelo, prompt, commit y evidencias.
- No cachear decisiones si cambian artefactos, política, contexto relevante o versión del verificador.
- Permitir presupuesto cero y funcionamiento totalmente determinista.
- Exponer métricas de ahorro, llamadas evitadas y coste real; no afirmar ahorros no medidos.

## 9. Aprendizaje continuo con control de cambios

El aprendizaje es posterior a la auditoría, no parte de la autoridad de aprobación.

Flujo:

1. Detectar un fallo repetible y recopilar evidencias.
2. Clasificar causa raíz: instrucciones, herramienta, contexto, bug, configuración o error humano.
3. Crear una propuesta de aprendizaje con alcance (global o específico del agente/proyecto).
4. Convertir la lección en prueba de regresión reproducible.
5. Ejecutar pruebas existentes y nuevas.
6. Mostrar diff y riesgo del cambio.
7. Solicitar aprobación humana antes de modificar skills, prompts, políticas o agentes.
8. Versionar el cambio y conservar rollback.
9. Observar el resultado en modo piloto antes de extenderlo.

No propagar aprendizajes específicos de un proyecto a otros. Solo compartir reglas genéricas cuando se haya demostrado que son independientes del contexto y no contienen datos sensibles.

## 10. Auditoría, trazabilidad y observabilidad

Cada decisión debe registrar:

- ID de evento y tarea;
- agente y adaptador de origen;
- estado y modo de operación;
- política y versión;
- verificaciones ejecutadas y resultados;
- referencias/hash de evidencias;
- hallazgos con severidad y código;
- proveedor/modelo utilizado, si aplica;
- duración, tokens/coste disponibles y errores;
- decisión final y motivo;
- versión del núcleo.

Proteger los registros contra modificación no autorizada. Para detectar alteraciones, considerar encadenamiento de hashes y exportación a almacenamiento de solo anexado. No almacenar secretos ni contenido completo innecesario. Definir rotación, retención y exportación.

## 11. Pruebas obligatorias

### 11.1 Unitarias

- plan vacío, malformado o incompleto;
- requisitos duplicados o vacíos;
- política ausente, parcial, inválida y con overrides;
- aplicación de `criticalFindings` y `maxRevisionCycles`;
- evidencia declarativa frente a evidencia verificada;
- salida de proveedor malformada, contradictoria o incompleta;
- timeout, error de red y proveedor no configurado;
- límites de tamaño y tipos incorrectos;
- estados y transiciones inválidas.

### 11.2 Adversariales y de seguridad

- el agente afirma que los tests pasan sin ejecutarlos;
- salida de test con instrucciones para ignorar la política;
- README/código que intenta instruir al auditor;
- evidencia reutilizada de otro commit o tarea;
- agente que intenta aprobar su propio resultado;
- evento repetido, alterado o fuera de orden;
- política personalizada que intenta desactivar controles críticos;
- salida JSON con campos extra o valores inesperados;
- intento de incluir secretos en logs o llamadas al proveedor;
- comando que intenta salir del workspace o borrar datos.

### 11.3 Integración y extremo a extremo

- instalación limpia y desinstalación;
- ejecución real de hooks Claude Code y Codex en versiones soportadas;
- bloqueo efectivo en cada evento configurado;
- comportamiento con hook ausente, timeout, crash y JSON inválido;
- conflictos con hooks de usuario/proyecto/plugins;
- modo report-only frente a enforce;
- Windows 11 y rutas con espacios;
- ejecución sin red y sin proveedor;
- rollback de configuración y aprendizaje.

### 11.4 CI

Añadir GitHub Actions para versiones de Node soportadas y Windows cuando sea viable. La CI debe ejecutar lint/format check, tests, comprobación de tipos/esquemas, análisis de dependencias y build/package smoke test. Los cambios no se consideran listos por pasar solo pruebas locales.

## 12. Criterios de aceptación por fase

### Fase 0 — Especificación y contratos
- [ ] Esquemas versionados para eventos, políticas, evidencias y decisiones.
- [ ] Threat model y matriz de permisos.
- [ ] Estados y semántica de fallo definidos.
- [ ] Criterios de aceptación y pruebas trazables a cada riesgo.

### Fase 1 — Núcleo seguro
- [ ] Ningún plan vacío o incompleto puede aprobarse.
- [ ] Una afirmación textual nunca cuenta como evidencia verificada.
- [ ] Resultado vinculado al plan, commit y evidencias auditadas.
- [ ] Independencia y permisos del auditor definidos y probados.
- [ ] Overrides, hallazgos críticos y ciclos de revisión funcionan.
- [ ] Error, timeout o dato inválido nunca se convierten en aprobación.

### Fase 2 — Calidad y seguridad
- [ ] Pruebas unitarias y adversariales cubren todos los hallazgos críticos.
- [ ] Prompt injection y secretos se manejan como riesgos explícitos.
- [ ] Logs trazables, protegidos y sin secretos.
- [ ] CI verde en plataformas soportadas.

### Fase 3 — Adaptadores
- [ ] Claude Code y Codex disponen de adaptadores ejecutables.
- [ ] Cada bloqueo se prueba en la plataforma real y versión declarada.
- [ ] Instalación no destructiva, modo observación y rollback probados.
- [ ] No se afirma compatibilidad con plataformas no probadas.

### Fase 4 — Costes y aprendizaje
- [ ] Presupuestos configurables y modo determinista sin coste de modelo.
- [ ] Métricas de uso reales y límites efectivos.
- [ ] Aprendizajes propuestos, no aplicados silenciosamente.
- [ ] Cada cambio de aprendizaje tiene regresión, revisión, versión y rollback.

### Fase 5 — Distribución
- [ ] Instalación portable documentada.
- [ ] Pruebas en Windows 11 y entornos soportados.
- [ ] Dependencias bloqueadas y cadena de suministro revisada.
- [ ] Guía de diagnóstico, actualización y desinstalación.

## 13. Prioridad de implementación

| Prioridad | Trabajo | Motivo |
|---|---|---|
| P0 | Contratos, políticas y decisiones fail-closed | Evitar aprobaciones falsas. |
| P0 | Verificación y vinculación de evidencias | Probar que el trabajo se hizo realmente. |
| P0 | Independencia del auditor y límites de confianza | Evitar autoaprobación y manipulación. |
| P1 | Pruebas adversariales y CI | Detectar regresiones y ataques. |
| P1 | Adaptadores Claude Code y Codex | Aplicar decisiones en el ciclo real del agente. |
| P1 | Seguridad, privacidad y trazabilidad | Evitar filtraciones y decisiones no auditables. |
| P2 | Control de tokens y costes | Evitar gasto redundante y medir consumo. |
| P3 | Aprendizaje y memoria | Mejorar a partir de errores confirmados. |
| P4 | Distribución portable y expansión a otros agentes | Extender solo lo que ya esté probado. |

## 14. Decisiones que deben mantenerse

- Mantener `main` estable; desarrollar v0.2 en rama y mediante pull request.
- No activar todavía PESADILLA como supervisor obligatorio.
- No añadir un proceso de modelo permanente: preferir hooks/eventos y procesos cortos.
- No introducir aprendizaje autónomo que modifique instrucciones o código sin aprobación.
- No confundir una revisión semántica con evidencia ejecutada.
- No declarar compatibilidad ni seguridad sin pruebas reproducibles.
- Priorizar calidad y seguridad sobre cantidad de funcionalidades.

## 15. Referencias técnicas

- Claude Code Hooks: https://code.claude.com/docs/en/hooks
- Codex Hooks: https://developers.openai.com/codex/hooks
- Repositorio: https://github.com/jmstudio14/pesadilla-agent

> **Definición de terminado:** PESADILLA no está listo para ejercer veto obligatorio hasta que los criterios P0 y P1 estén implementados, probados en las plataformas declaradas y revisados mediante una pull request. Esta especificación documenta el objetivo; no certifica que se haya alcanzado.
