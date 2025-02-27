/**
* This file was @generated using pocketbase-typegen
*/

import type PocketBase from 'pocketbase'
import type { RecordService } from 'pocketbase'

export enum Collections {
	Authorigins = "_authOrigins",
	Externalauths = "_externalAuths",
	Mfas = "_mfas",
	Otps = "_otps",
	Superusers = "_superusers",
	Actions = "actions",
	Cameras = "cameras",
	Configurations = "configurations",
	Levels = "levels",
	Models = "models",
	Permissions = "permissions",
	Run = "run",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

// System fields
export type BaseSystemFields<T = never> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
	expand?: T
}

export type AuthSystemFields<T = never> = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields<T>

// Record types for each collection

export type AuthoriginsRecord = {
	collectionRef: string
	created?: IsoDateString
	fingerprint: string
	id: string
	recordRef: string
	updated?: IsoDateString
}

export type ExternalauthsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	provider: string
	providerId: string
	recordRef: string
	updated?: IsoDateString
}

export type MfasRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	method: string
	recordRef: string
	updated?: IsoDateString
}

export type OtpsRecord = {
	collectionRef: string
	created?: IsoDateString
	id: string
	password: string
	recordRef: string
	sentTo?: string
	updated?: IsoDateString
}

export type SuperusersRecord = {
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

export type ActionsRecord = {
	created?: IsoDateString
	id: string
	name: string
	updated?: IsoDateString
}

export enum CamerasModeOptions {
	"live" = "live",
	"auto" = "auto",
	"offline" = "offline",
}

export enum CamerasStatusOptions {
	"off" = "off",
	"on" = "on",
	"waiting" = "waiting",
}

export enum CamerasAllowedOptions {
	"super" = "super",
	"manager" = "manager",
	"user" = "user",
}
export type CamerasRecord<Tautomation = unknown, Tconfiguration = unknown, Tinfo = unknown> = {
	allowed?: CamerasAllowedOptions[]
	automation?: null | Tautomation
	configuration: null | Tconfiguration
	created?: IsoDateString
	hide?: boolean
	id: string
	info?: null | Tinfo
	mode: CamerasModeOptions
	model?: RecordIdString
	nickname?: string
	status?: CamerasStatusOptions
	updated?: IsoDateString
}

export type ConfigurationsRecord<Tvalue = unknown> = {
	created?: IsoDateString
	id: string
	name?: string
	updated?: IsoDateString
	value?: null | Tvalue
}

export type LevelsRecord = {
	created?: IsoDateString
	id: string
	name: string
	updated?: IsoDateString
}

export type ModelsRecord = {
	created?: IsoDateString
	id: string
	name: string
	updated?: IsoDateString
}

export enum PermissionsAllowedOptions {
	"super" = "super",
	"manager" = "manager",
	"user" = "user",
}
export type PermissionsRecord = {
	allowed?: PermissionsAllowedOptions[]
	created?: IsoDateString
	id: string
	name: string
	updated?: IsoDateString
}

export enum RunTargetOptions {
	"local" = "local",
	"remote" = "remote",
}
export type RunRecord = {
	action: RecordIdString
	command?: string
	created?: IsoDateString
	id: string
	model: RecordIdString
	target: RunTargetOptions
	updated?: IsoDateString
}

export enum UsersLevelOptions {
	"super" = "super",
	"manager" = "manager",
	"user" = "user",
}
export type UsersRecord = {
	avatar?: string
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	level?: UsersLevelOptions
	password: string
	tokenKey: string
	updated?: IsoDateString
	verified?: boolean
}

// Response types include system fields and match responses from the PocketBase API
export type AuthoriginsResponse<Texpand = unknown> = Required<AuthoriginsRecord> & BaseSystemFields<Texpand>
export type ExternalauthsResponse<Texpand = unknown> = Required<ExternalauthsRecord> & BaseSystemFields<Texpand>
export type MfasResponse<Texpand = unknown> = Required<MfasRecord> & BaseSystemFields<Texpand>
export type OtpsResponse<Texpand = unknown> = Required<OtpsRecord> & BaseSystemFields<Texpand>
export type SuperusersResponse<Texpand = unknown> = Required<SuperusersRecord> & AuthSystemFields<Texpand>
export type ActionsResponse<Texpand = unknown> = Required<ActionsRecord> & BaseSystemFields<Texpand>
export type CamerasResponse<Tautomation = unknown, Tconfiguration = unknown, Tinfo = unknown, Texpand = unknown> = Required<CamerasRecord<Tautomation, Tconfiguration, Tinfo>> & BaseSystemFields<Texpand>
export type ConfigurationsResponse<Tvalue = unknown, Texpand = unknown> = Required<ConfigurationsRecord<Tvalue>> & BaseSystemFields<Texpand>
export type LevelsResponse<Texpand = unknown> = Required<LevelsRecord> & BaseSystemFields<Texpand>
export type ModelsResponse<Texpand = unknown> = Required<ModelsRecord> & BaseSystemFields<Texpand>
export type PermissionsResponse<Texpand = unknown> = Required<PermissionsRecord> & BaseSystemFields<Texpand>
export type RunResponse<Texpand = unknown> = Required<RunRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	actions: ActionsRecord
	cameras: CamerasRecord
	configurations: ConfigurationsRecord
	levels: LevelsRecord
	models: ModelsRecord
	permissions: PermissionsRecord
	run: RunRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	actions: ActionsResponse
	cameras: CamerasResponse
	configurations: ConfigurationsResponse
	levels: LevelsResponse
	models: ModelsResponse
	permissions: PermissionsResponse
	run: RunResponse
	users: UsersResponse
}

// Type for usage with type asserted PocketBase instance
// https://github.com/pocketbase/js-sdk#specify-typescript-definitions

export type TypedPocketBase = PocketBase & {
	collection(idOrName: '_authOrigins'): RecordService<AuthoriginsResponse>
	collection(idOrName: '_externalAuths'): RecordService<ExternalauthsResponse>
	collection(idOrName: '_mfas'): RecordService<MfasResponse>
	collection(idOrName: '_otps'): RecordService<OtpsResponse>
	collection(idOrName: '_superusers'): RecordService<SuperusersResponse>
	collection(idOrName: 'actions'): RecordService<ActionsResponse>
	collection(idOrName: 'cameras'): RecordService<CamerasResponse>
	collection(idOrName: 'configurations'): RecordService<ConfigurationsResponse>
	collection(idOrName: 'levels'): RecordService<LevelsResponse>
	collection(idOrName: 'models'): RecordService<ModelsResponse>
	collection(idOrName: 'permissions'): RecordService<PermissionsResponse>
	collection(idOrName: 'run'): RecordService<RunResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
