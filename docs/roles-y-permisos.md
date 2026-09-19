# Roles y permisos — TrofiApp

Referencia técnica de qué puede hacer cada rol y dónde vive esa capacidad en el código. Actualizar esta tabla en el mismo PR que agregue, cambie o quite un permiso/rol.

> Para una vista visual (onboarding, presentaciones) existe también un diagrama RBAC generado con Archify a partir de esta misma información. Regenerarlo solo cuando se quiera una nueva captura visual — esta tabla es la fuente de verdad que se mantiene al día.

Última sincronización con código: commit `4fcc8ed6` (2026-09-19).

## Roles de registro

Se eligen en el onboarding ([app/(auth)/role-selection.tsx](../app/(auth)/role-selection.tsx)). Un usuario puede tener más de uno.

### Espectador

| Capacidad | Hook / función | Archivo |
|---|---|---|
| Vota MVP del partido | `useVoteMVP` | [features/matches/services/matchApi.ts:219](../features/matches/services/matchApi.ts#L219) |
| Check-in como fan en un partido | `useFanCheckIn` | [features/matches/services/matchApi.ts:182](../features/matches/services/matchApi.ts#L182) |
| Marca favoritos (ligas, equipos, jugadores) | `Favorite` | [features/auth/types/auth.ts:86](../features/auth/types/auth.ts#L86) |

### Jugador

| Capacidad | Hook / función | Archivo |
|---|---|---|
| Se une a un equipo con código de invitación | `useJoinWithToken` | [features/teams/services/teamInvitationApi.ts:48](../features/teams/services/teamInvitationApi.ts#L48) |
| Confirma asistencia a un partido | `useConfirmAttendance` | [features/matches/services/matchApi.ts:129](../features/matches/services/matchApi.ts#L129) |
| Publica una oferta en el mercado | `useCreateMarketListing` | [features/market/services/marketApi.ts:24](../features/market/services/marketApi.ts#L24) |

### Árbitro

| Capacidad | Hook / función | Archivo |
|---|---|---|
| Inicia / pausa / reanuda / finaliza un partido en vivo | `useStartMatch`, `usePauseMatch`, `useResumeMatch`, `useEndMatch` | [features/matches/services/liveMatchApi.ts:15](../features/matches/services/liveMatchApi.ts#L15) |
| Registra eventos del partido (goles, tarjetas, cambios) | `useAddMatchEvent` | [features/matches/services/liveMatchApi.ts:31](../features/matches/services/liveMatchApi.ts#L31) |
| Aplica una sanción disciplinaria manual | `useCreateManualSuspension` | [features/discipline/services/disciplineApi.ts:45](../features/discipline/services/disciplineApi.ts#L45) |

### Sponsor

| Capacidad | Hook / función | Archivo |
|---|---|---|
| Crea un placement de patrocinio | `useCreateSponsorPlacement` | [features/sponsors/services/sponsorApi.ts:43](../features/sponsors/services/sponsorApi.ts#L43) |
| Renueva un placement existente | `useRenewSponsorPlacement` | [features/sponsors/services/sponsorApi.ts:73](../features/sponsors/services/sponsorApi.ts#L73) |
| Mide impresiones y clics de su placement | `useRecordImpression`, `useRecordClick` | [features/sponsors/services/sponsorApi.ts:57](../features/sponsors/services/sponsorApi.ts#L57) |

## Roles derivados

No se eligen en el registro; se determinan por datos del usuario.

### Admin de Liga — `Membership.role` (`admin` \| `owner`) por liga

| Capacidad | Hook / función | Archivo |
|---|---|---|
| Se valida como admin/owner de la liga dueña del equipo | `isLeagueAdmin()` | [features/teams/utils/teamPermissions.ts:47-53](../features/teams/utils/teamPermissions.ts#L47-L53) |
| Define el capitán de un equipo | `useSetCaptain` | [features/teams/services/tournamentTeamApi.ts:21](../features/teams/services/tournamentTeamApi.ts#L21) |
| Resuelve una disputa de partido | `useUpholdMatchDispute` | [features/tournaments/services/matchDisputeApi.ts:51](../features/tournaments/services/matchDisputeApi.ts#L51) |

### Superadmin — `User.is_staff` (flag global, no ligado a una liga)

| Capacidad | Hook / función | Archivo |
|---|---|---|
| Aprueba o rechaza ligas | `useApproveLeague`, `useRejectLeague` | [features/superadmin/services/superadminApi.ts:72](../features/superadmin/services/superadminApi.ts#L72) |
| Aprueba o rechaza torneos | `useApproveTournament`, `useRejectTournament` | [features/superadmin/services/superadminApi.ts:113](../features/superadmin/services/superadminApi.ts#L113) |
| Registra y actualiza pagos de liga | `useCreatePaymentRecord`, `useSetLeaguePaymentStatus` | [features/superadmin/services/superadminApi.ts:145](../features/superadmin/services/superadminApi.ts#L145) |
| Ve el resumen global de la plataforma | `useGetPlatformSummary` | [features/superadmin/services/superadminApi.ts:13](../features/superadmin/services/superadminApi.ts#L13) |

## Núcleo compartido

Usado por los 6 roles, no es exclusivo de ninguno: `auth`, `notifications`, `chat`, `nearby`, `venues`, `announcements`, `share` (ver estructura de dominios en [CLAUDE.md](../CLAUDE.md#arquitectura-components-vs-features)).
