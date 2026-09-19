# Permisos por Tipo de Usuario

Este documento lista qué puede hacer cada tipo de usuario en Trofi, según el código real del backend y todos los chequeos.

No es un documento de diseño — es un espejo de lo que el sistema hace hoy. Salió de una auditoría de permisos completa hecha durante la sesión; los huecos que encontró ya están resueltos y su arreglo quedó reflejado directamente en la sección del rol que corresponde (marcados donde vale la pena aclarar el porqué). Si algo de acá te sorprende, es información nueva, no una decisión tomada a propósito.

> **Nota de reconciliación con el frontend.** Los "roles de registro" documentados antes en este mismo archivo (Espectador, Jugador, Árbitro, Sponsor — elegidos en [app/(auth)/role-selection.tsx](../app/(auth)/role-selection.tsx)) son **tipos de perfil** (`SpectatorProfile`, `PlayerProfile`, `RefereeProfile`, `SponsorProfile`), no roles de permisos del backend. Tener un `RefereeProfile`, por ejemplo, no otorga por sí solo ningún permiso de arbitraje — lo que otorga poder es ser `LeagueMembership.role = 'referee'` de una liga o estar asignado como `Match.referee` de un partido puntual (ver más abajo). Este documento reemplaza esa sección como fuente de verdad sobre permisos; la tabla de "roles de registro" describe identidad/perfil, no autorización.

## Los roles que existen

- **Trofi Staff / Super Admin** (`user.is_staff`) — global, no depende de ninguna liga. Pisa (bypasea) casi todos los demás permisos.
- **Admin de Liga** (`LeagueMembership.role = 'admin'`) — por liga.
- **Admin de Torneo** (`LeagueMembership.role = 'tournament_admin'`) — por liga (no por torneo puntual — un admin de torneo lo es de todos los torneos de esa liga).
- **Árbitro de liga** (`LeagueMembership.role = 'referee'`) — por liga, no por partido. Distinto del árbitro asignado a un partido (`Match.referee`), que es más específico y se usa para un puñado de acciones puntuales (ver abajo).
- **Moderador de liga** (`LeagueMembership.role = 'moderator'`) — por liga, scoped a moderación de chat (ver su propia sección más abajo) — no es un admin de liga chico, es un rol bien acotado.
- **Capitán de equipo** (`TeamCaptain`) — por `TournamentTeam`, es decir, por la inscripción de un equipo a un torneo puntual. Un mismo equipo puede tener capitanes distintos en cada torneo en el que está anotado.
- **Dueño de equipo** (`Team.owner`) — un dato informativo en general, pero dos permisos reales: acceder al chat de su equipo, e inscribirlo en un torneo (`TournamentTeam`) sin necesitar ser capitán ni admin.
- **Jugador** (`Player`, `request.user.player_profile`) — el perfil de jugador propio.
- **Cualquier usuario logueado** — sin ningún rol especial.
- **Sin cuenta (anónimo)** — casi nada; ver la sección final.

Todos los roles de liga/torneo/árbitro/capitán se resuelven objeto por objeto (`has_object_permission`) — nunca son un permiso global. "Admin de Liga" significa admin de esa liga puntual, no de todas.

## Trofi Staff (Super Admin)

Todo lo de cualquier rol de abajo, más lo que solo ellos pueden hacer:

- Aprobar/rechazar una liga (`POST /leagues/{id}/approve|reject/`).
- Marcar el estado de pago de una liga, asignarle un plan de suscripción, ver el resumen de toda la plataforma (`platform-summary`).
- Cambiar las features (módulos pagos) de una liga por `PATCH` — un admin de liga puede leerlas pero no auto-otorgarse un módulo.
- Aprobar/rechazar un torneo (`POST /tournaments/{id}/approve|reject/`).
- Verificar/desverificar un perfil de árbitro o una cancha de pickup (anula el cálculo automático).
- Todo lo de `PaymentRecord` (crear, ver, listar) y de `SubscriptionPlan` (crear/editar/borrar planes — leer los planes es público para cualquier logueado).
- Crear/editar/borrar un `Achievement` (la definición del logro en sí, no el otorgamiento puntual a un jugador/equipo).
- Resolver denuncias: `ChatMessageReport`, `PickupReport`, `RefereeRatingReport` — nadie más puede verlas ni resolverlas (el que denuncia solo puede crear la denuncia, no verla después).
- Reabrir un resultado de partido ya bloqueado (`reopen`) — comparte este permiso únicamente con el admin de esa liga puntual, nadie más.
- Todo lo que hace un usuario logueado común sobre cualquier objeto de cualquiera (staff nunca está limitado por dueño/roster/capitanía).

## Admin de Liga

### Cómo se llega a ser admin de una liga

No hay ningún flujo de "aprobación" separado — son tres caminos, todos ya existentes:

1. **Crear la liga.** `POST /leagues/` está abierto a cualquier usuario logueado, y quien la crea queda automáticamente como su admin (`LeagueMembership(role='admin')` se crea sola, junto con el plan de suscripción por defecto y sus `LeagueFeatures`).
2. **Que un admin existente de esa liga te agregue.** `POST /leagues/{id}/add_member/` (o, equivalente, `POST /memberships/` con `league`/`user`/`role` en el body) — cualquiera de los dos requiere ya ser admin de esa liga (o Trofi staff) — `POST /memberships/` pide exactamente lo mismo que `add_member`.
3. **Que Trofi staff lo asigne a mano** — bypasea el chequeo de arriba igual que todo lo demás.

No hay forma de autopromoverte a admin de una liga que no creaste vos, sin que alguien con ese rol (o staff) te lo otorgue explícitamente.

(Todo lo del árbitro de liga y del admin de torneo de esa misma liga también les sirve, porque casi todos los chequeos son `IsLeagueAdmin | IsTournamentAdmin | IsReferee` con distintas combinaciones — ver cada sección.)

- Editar la liga, borrarla, ver su dashboard, agregar miembros (`add_member` — puede otorgar cualquier rol a cualquier usuario en esa liga). El admin de torneo **no** puede hacer nada de esto — es exclusivo del admin de liga.
- Editar o borrar cualquier equipo de su liga (`DELETE /teams/{id}/` es eliminación lógica).
- Aprobar/rechazar/editar cualquier `TournamentTeam` de su liga, asignar capitán, marcar la cuota de inscripción como pagada.
- Crear/editar/borrar un torneo de su liga, generar el fixture (simple o semanal), crear/editar el bracket de playoffs, abrir/cerrar inscripciones, calcular el MVP semanal, determinar campeón, coronar premios de fin de temporada, clonar el torneo a una nueva temporada.
- Otorgar un `TeamAchievement` a mano.
- Aprobar/rechazar una solicitud de unión (`JoinRequest`) a cualquier equipo de su liga.
- Generar un enlace de invitación (`POST /teams/{id}/invitations/`) para cualquier equipo/torneo de su liga.
- Cargar, editar o bloquear el resultado de cualquier partido de su liga; arrancar/pausar/reanudar/terminar un partido; declarar forfeit; cambiar el estado; asignar árbitro; ofrecer el partido a un árbitro del mercado; cargar tiempo extra/penales; sustituciones.
- Presentar o resolver (`uphold`/`reject`) una disputa de resultado.
- **Reabrir (`reopen`) un resultado ya bloqueado** — junto con Trofi staff, nadie más puede.
- Aplicar o levantar (`lift`) una suspensión disciplinaria manual.
- Reclamar una cancha/complejo pública para su liga (`Venue`/`Field` con `league`).
- Publicar un aviso (`Announcement`) para toda la liga o un torneo suyo.
- Registrar (o dar de baja) a un jugador de un torneo (`TournamentPlayer`) en nombre de otra persona, no solo la propia.
- Inscribir el equipo de otra persona en un torneo de su liga (`TournamentTeam`) — no hace falta ser el dueño de ese equipo si sos admin de su liga.
- Crear/editar/borrar una `Lineup` o `LineupAssignment` de cualquier equipo de su liga (lo mismo que el capitán de ese equipo, pero sin necesidad de serlo).
- Descargar o rotar el QR/token de check-in (`checkin-qr`, `regenerate-checkin-token`) de cualquier partido de su liga.
- Editar (`PUT`) la configuración de fixture semanal (`schedule-config`) de un torneo de su liga.
- Ver cualquier disputa, oferta de árbitro, o interés de mercado de su liga — no solo las propias (staff y admin de liga/torneo son las únicas excepciones al scoping de esas listas).
- Resolver una denuncia de mensaje de chat — **no**, esto es solo Trofi staff o el moderador de esa liga (ver sus propias secciones).

## Admin de Torneo

Mismo alcance que el admin de liga en casi todo lo relacionado a torneos y partidos — comparten el mismo chequeo (`IsLeagueAdmin | IsTournamentAdmin`) en casi todas las acciones de esa lista. Las excepciones donde el admin de torneo no llega son:

- Editar la liga en sí, su dashboard, o agregar miembros — exclusivo del admin de liga.
- Cambiar las features de la liga — exclusivo de Trofi staff.
- Reabrir (`reopen`) un resultado bloqueado — exclusivo de admin de liga + staff, el admin de torneo queda afuera a propósito.
- Aprobar/rechazar la liga o el torneo mismo — exclusivo de Trofi staff.

## Árbitro de liga (`role='referee'`)

Comparte permisos con admin de liga/torneo en casi toda la gestión de partidos de esa liga (no solo los que arbitra él): cargar/editar/bloquear resultado, arrancar/pausar/reanudar/terminar, forfeit, cambiar estado, asignar referee, sustituciones, tiempo extra, penales, cargar goles y tarjetas, aplicar/levantar una suspensión manual, resolver (`uphold`/`reject`) una disputa.

**No puede:** reabrir un resultado bloqueado, ni editar o borrar una tarjeta ya cargada (`DisciplinaryRecord`) — corregir/borrar el registro oficial después del hecho es más grande que la decisión en el momento, así que ahí queda afuera y solo entra admin de liga/torneo. Tampoco nada de gestión de la liga o el torneo en sí (crear/editar/borrar torneo, fixture, bracket, etc. — eso es solo admin de liga/torneo).

## El árbitro asignado a ese partido puntual (`Match.referee`)

Distinto de lo de arriba — estas acciones no miran el rol de liga, miran si sos específicamente el árbitro asignado a este partido:

- Votar el MVP del partido — el árbitro asignado puede votar por cualquiera de los dos equipos (un jugador solo puede votar por el equipo rival).
- Aceptar/rechazar una oferta de partido del mercado de árbitros (`MatchRefereeOffer`) — solo el árbitro destinatario de esa oferta puntual, ni siquiera Trofi staff tiene un atajo acá.
- Su propia disponibilidad (`RefereeAvailability`) — cualquier árbitro gestiona la suya, nunca la de otro.
- Ser calificado (`rate_referee`) o disputado (`RefereeRatingReport`) es algo que le pasa al árbitro, no algo que hace — ver "Jugador" y "Cualquier usuario logueado" para quién puede calificarlo/denunciarlo.

## Moderador de liga (`role='moderator'`)

Rol acotado a moderación de chat — no da nada de la administración de liga/torneo/partidos de arriba:

- Resolver una denuncia de mensaje de chat (`ChatMessageReport`) de su liga — ver la lista de denuncias de su liga, marcar `is_resolved`.
- Borrar (soft-delete) cualquier mensaje de chat de su liga, aunque no lo haya escrito él.
- Todo lo demás (editar la liga, gestionar partidos/torneos, tarjetas, etc.) le es tan ajeno como a cualquier usuario logueado sin rol.

## Capitán de equipo (de una inscripción a torneo puntual)

- Editar los datos básicos del equipo (nombre, ciudad, logo) — `PATCH`/`PUT /teams/{id}/` — con ser capitán de cualquiera de las inscripciones activas de ese equipo alcanza, no hace falta que sea la del torneo en cuestión. **No** puede borrar el equipo — eso es solo admin de liga/staff.
- Editar o quitar jugadores del roster de su equipo directamente (`RosterMembership`), aprobar/rechazar solicitudes de unión (`JoinRequest`) a su equipo.
- Generar un enlace de invitación (`POST /teams/{id}/invitations/`) para el equipo del que es capitán.
- Editar/borrar el `TournamentTeam` (la inscripción en sí) — pero no puede asignar/reasignar el capitán ni marcar la cuota como pagada, eso es admin-only.
- Confirmar asistencia en nombre de todo su plantel de una — no solo la propia (`captain_confirm_attendance`).
- Presentar una disputa de resultado (`MatchDispute`) en nombre de su equipo, si es capitán de uno de los dos equipos del partido — y ver cualquier disputa de un partido de su equipo, la haya presentado él o no.
- Crear/editar/borrar una `Lineup` o `LineupAssignment` de su equipo.
- Acceder al chat de su equipo.

## Jugador (dueño de su propio `Player`/`RosterMembership`)

- Editar o borrar su propio perfil de jugador (nadie más puede tocarlo, ni siquiera un admin de liga/torneo — solo Trofi staff).
- Registrarse (o darse de baja) a un torneo por sí mismo (`TournamentPlayer`) — no necesita que un admin lo haga por él.
- Editar sus favoritos, preferencias de notificación, perfil de sponsor/espectador (este último ya arranca creado solo con la cuenta, ver "Sin cuenta").
- Confirmar su propia asistencia a un partido (no la de otro).
- Hacer check-in por QR a un partido en el que juega.
- Votar el MVP de un partido en el que jugó (solo por un jugador del equipo rival, no puede votarse a sí mismo).
- Calificar al árbitro de un partido en el que jugó (con estrellas) — el chequeo es "tenías un `RosterMembership` activo en ese partido", no importa el resultado.
- Postularse a un aviso del mercado de jugadores como `player_seeking_team` (usa su propio perfil automáticamente).
- Expresar interés en un aviso del mercado (`MarketInterest`), salvo en el suyo propio.
- Unirse a un equipo pidiendo (`JoinRequest`) o con un enlace de invitación (`join-with-token`) — pasa por las mismas validaciones de edad/cupo que si lo aprobara un capitán a mano.
- Denunciar una calificación de árbitro sobre sí mismo si es árbitro (`RefereeRatingReport`) — nadie más puede denunciar la calificación de otro árbitro, ni siquiera un admin de liga (solo Trofi staff a nombre del árbitro).
- Ver la disputa de resultado (`MatchDispute`) de un partido en el que jugó, la haya presentado él, su capitán, o un admin/árbitro.

## Cualquier usuario logueado (sin rol especial en nada)

Casi toda la lectura del catálogo público (ligas, torneos, partidos, resultados) está abierta a cualquiera con sesión, sin scoping por liga/equipo/rol. La escritura genuinamente abierta es mucho más acotada — lo que sigue es exactamente eso, no más:

**Lectura, siempre abierta:**

- Ver cualquier liga aprobada (una `pending`/`rejected` solo la ve quien es miembro de esa liga, o Trofi staff — ver la sección de Admin de Liga), torneo, equipo, partido, resultado, tabla de posiciones, timeline de eventos, head-to-head, lineup, bracket.
- Listar los miembros de cualquier liga (`memberships`) — sus roles incluidos.
- Ver el roster completo de cualquier equipo con estado de suspensión.
- Ver el mercado de jugadores y de árbitros completos (sin scoping a la propia liga).
- Ver los avisos (`Announcement`) de cualquier liga/torneo.
- Ver la config de fixture semanal de cualquier torneo (`GET schedule-config/`) — editarla (`PUT`) ya no: pide admin de liga/torneo, ver "Admin de Liga".

**Escritura sin scoping — a propósito, no es un bug:**

- Crear una liga (queda como su admin automáticamente), crear un torneo dentro de cualquier liga aprobada y al día, crear un equipo (inscribirlo en un torneo sí pide ser su dueño o admin — ver más arriba). Postular una oferta de árbitro para un partido (`offer_referee`) — no, esto sí está gateado a admin/árbitro de liga.

**Interacción social/general, siempre abierta:**

- Mandar un mensaje directo a cualquier usuario que no lo haya bloqueado.
- Postear/leer en pickup (spots, check-ins, planes, comentarios, ratings, fotos), crear un crew, unirse/salir de cualquier crew sin aprobación, desafiar a otro crew.
- Registrar impresiones/clicks de un sponsor (`record_impression`/`record_click`) — es intencional, cualquiera que vea el anuncio cuenta.
- Denunciar un mensaje de chat, un spot de pickup, o (si es árbitro) su propia calificación.
- Ver/crear su propio `DeviceToken` para notificaciones push.

## Sin cuenta (anónimo)

Prácticamente nada. Login, registro, refresh de token, y pedido de reseteo de contraseña.

Dos excepciones puntuales, no una política general — `GET` a la imagen de una player card (`card_image`) y a su preview HTML (`player_card_html`) son públicos por diseño, a propósito: son para compartir la tarjeta de un jugador fuera de la app (link a WhatsApp, preview de red social) — quien abre ese link no tiene sesión en la API, así que pedirle login rompería la función en vez de arreglar un bug. Único punto débil real: el id de la tarjeta es adivinable/enumerable — si eso llega a importar, la mejora sería un token de compartir no adivinable (mismo patrón que `Match.checkin_token`), no exigir login.

Al registrarse (`POST /auth/register/`), la cuenta ya no arranca en blanco — se le crea un `SpectatorProfile` propio automáticamente (sin datos todavía: ciudad/bio vacíos). Es la única identidad con la que arranca cualquiera; jugador/árbitro/sponsor siguen siendo opt-in (uno se crea explícitamente cuando hace falta). Volver a `POST /spectator-profiles/` después no da error — actualiza ese mismo perfil en vez de intentar crear uno segundo.
