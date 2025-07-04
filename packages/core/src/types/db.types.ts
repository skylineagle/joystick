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
	ActionLogs = "action_logs",
	Actions = "actions",
	Devices = "devices",
	Gallery = "gallery",
	Models = "models",
	Notifications = "notifications",
	ParametersTree = "parameters_tree",
	Permissions = "permissions",
	Rules = "rules",
	Run = "run",
	Templates = "templates",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string
export type HTMLString = string

type ExpandType<T> = unknown extends T
	? T extends unknown
		? { expand?: unknown }
		: { expand: T }
	: { expand: T }

// System fields
export type BaseSystemFields<T = unknown> = {
	id: RecordIdString
	collectionId: string
	collectionName: Collections
} & ExpandType<T>

export type AuthSystemFields<T = unknown> = {
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

export type ActionLogsRecord<Tparameters = unknown, Tresult = unknown> = {
	action?: RecordIdString
	created?: IsoDateString
	device?: RecordIdString
	execution_time?: number
	id: string
	ip_address?: string
	parameters?: null | Tparameters
	result?: null | Tresult
	updated?: IsoDateString
	user?: RecordIdString
	user_agent?: string
}

export type ActionsRecord = {
	created?: IsoDateString
	id: string
	name: string
	updated?: IsoDateString
}

export enum DevicesStatusOptions {
	"off" = "off",
	"on" = "on",
	"waiting" = "waiting",
}
export type DevicesRecord<Tautomation = unknown, Tconfiguration = unknown, Tinformation = unknown> = {
	allow?: RecordIdString[]
	auto?: boolean
	automation?: null | Tautomation
	client?: string
	configuration?: null | Tconfiguration
	created?: IsoDateString
	description?: HTMLString
	device: RecordIdString
	hide?: boolean
	id: string
	information: null | Tinformation
	mode: string
	name?: string
	overlay?: string
	status?: DevicesStatusOptions
	updated?: IsoDateString
}

export type GalleryRecord = {
	created?: IsoDateString
	device: RecordIdString
	event?: string
	event_id: string
	flagged?: boolean
	id: string
	name?: string
	thumbnail: string
	updated?: IsoDateString
	viewed?: boolean
}

export enum ModelsStreamOptions {
	"mediamtx" = "mediamtx",
	"ws" = "ws",
	"none" = "none",
}
export type ModelsRecord<Tmode_configs = unknown, Tparams = unknown, Tstream_quality = unknown> = {
	created?: IsoDateString
	id: string
	mode_configs?: null | Tmode_configs
	name: string
	params: null | Tparams
	stream?: ModelsStreamOptions
	stream_quality?: null | Tstream_quality
	updated?: IsoDateString
}

export enum NotificationsTypeOptions {
	"info" = "info",
	"success" = "success",
	"error" = "error",
	"warning" = "warning",
	"emergency" = "emergency",
}
export type NotificationsRecord<Tmetadata = unknown> = {
	created?: IsoDateString
	device?: RecordIdString
	dismissed?: RecordIdString[]
	id: string
	message?: string
	metadata?: null | Tmetadata
	seen?: RecordIdString[]
	title: string
	type: NotificationsTypeOptions
	updated?: IsoDateString
	user?: RecordIdString
}

export type ParametersTreeRecord<Tschema = unknown> = {
	created?: IsoDateString
	id: string
	model: RecordIdString
	name: string
	read: RecordIdString
	schema: null | Tschema
	updated?: IsoDateString
	write: RecordIdString
}

export type PermissionsRecord = {
	created?: IsoDateString
	id: string
	name: string
	updated?: IsoDateString
	users: RecordIdString[]
}

export type RulesRecord = {
	action?: RecordIdString[]
	allow?: RecordIdString[]
	created?: IsoDateString
	id: string
	updated?: IsoDateString
}

export enum RunTargetOptions {
	"local" = "local",
	"device" = "device",
}
export type RunRecord<Tparameters = unknown> = {
	action: RecordIdString
	command: string
	created?: IsoDateString
	device: RecordIdString
	id: string
	parameters?: null | Tparameters
	target: RunTargetOptions
	updated?: IsoDateString
}

export type TemplatesRecord = {
	created?: IsoDateString
	id: string
	model?: RecordIdString[]
	name: string
	updated?: IsoDateString
	value?: string
}

export type UsersRecord = {
	avatar?: string
	created?: IsoDateString
	email: string
	emailVisibility?: boolean
	id: string
	name?: string
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
export type ActionLogsResponse<Tparameters = unknown, Tresult = unknown, Texpand = unknown> = Required<ActionLogsRecord<Tparameters, Tresult>> & BaseSystemFields<Texpand>
export type ActionsResponse<Texpand = unknown> = Required<ActionsRecord> & BaseSystemFields<Texpand>
export type DevicesResponse<Tautomation = unknown, Tconfiguration = unknown, Tinformation = unknown, Texpand = unknown> = Required<DevicesRecord<Tautomation, Tconfiguration, Tinformation>> & BaseSystemFields<Texpand>
export type GalleryResponse<Texpand = unknown> = Required<GalleryRecord> & BaseSystemFields<Texpand>
export type ModelsResponse<Tmode_configs = unknown, Tparams = unknown, Tstream_quality = unknown, Texpand = unknown> = Required<ModelsRecord<Tmode_configs, Tparams, Tstream_quality>> & BaseSystemFields<Texpand>
export type NotificationsResponse<Tmetadata = unknown, Texpand = unknown> = Required<NotificationsRecord<Tmetadata>> & BaseSystemFields<Texpand>
export type ParametersTreeResponse<Tschema = unknown, Texpand = unknown> = Required<ParametersTreeRecord<Tschema>> & BaseSystemFields<Texpand>
export type PermissionsResponse<Texpand = unknown> = Required<PermissionsRecord> & BaseSystemFields<Texpand>
export type RulesResponse<Texpand = unknown> = Required<RulesRecord> & BaseSystemFields<Texpand>
export type RunResponse<Tparameters = unknown, Texpand = unknown> = Required<RunRecord<Tparameters>> & BaseSystemFields<Texpand>
export type TemplatesResponse<Texpand = unknown> = Required<TemplatesRecord> & BaseSystemFields<Texpand>
export type UsersResponse<Texpand = unknown> = Required<UsersRecord> & AuthSystemFields<Texpand>

// Types containing all Records and Responses, useful for creating typing helper functions

export type CollectionRecords = {
	_authOrigins: AuthoriginsRecord
	_externalAuths: ExternalauthsRecord
	_mfas: MfasRecord
	_otps: OtpsRecord
	_superusers: SuperusersRecord
	action_logs: ActionLogsRecord
	actions: ActionsRecord
	devices: DevicesRecord
	gallery: GalleryRecord
	models: ModelsRecord
	notifications: NotificationsRecord
	parameters_tree: ParametersTreeRecord
	permissions: PermissionsRecord
	rules: RulesRecord
	run: RunRecord
	templates: TemplatesRecord
	users: UsersRecord
}

export type CollectionResponses = {
	_authOrigins: AuthoriginsResponse
	_externalAuths: ExternalauthsResponse
	_mfas: MfasResponse
	_otps: OtpsResponse
	_superusers: SuperusersResponse
	action_logs: ActionLogsResponse
	actions: ActionsResponse
	devices: DevicesResponse
	gallery: GalleryResponse
	models: ModelsResponse
	notifications: NotificationsResponse
	parameters_tree: ParametersTreeResponse
	permissions: PermissionsResponse
	rules: RulesResponse
	run: RunResponse
	templates: TemplatesResponse
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
	collection(idOrName: 'action_logs'): RecordService<ActionLogsResponse>
	collection(idOrName: 'actions'): RecordService<ActionsResponse>
	collection(idOrName: 'devices'): RecordService<DevicesResponse>
	collection(idOrName: 'gallery'): RecordService<GalleryResponse>
	collection(idOrName: 'models'): RecordService<ModelsResponse>
	collection(idOrName: 'notifications'): RecordService<NotificationsResponse>
	collection(idOrName: 'parameters_tree'): RecordService<ParametersTreeResponse>
	collection(idOrName: 'permissions'): RecordService<PermissionsResponse>
	collection(idOrName: 'rules'): RecordService<RulesResponse>
	collection(idOrName: 'run'): RecordService<RunResponse>
	collection(idOrName: 'templates'): RecordService<TemplatesResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
