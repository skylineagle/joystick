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
	Devices = "devices",
	Models = "models",
	Rules = "rules",
	Run = "run",
	Templates = "templates",
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

export enum DevicesStatusOptions {
	"off" = "off",
	"on" = "on",
	"waiting" = "waiting",
}
export type DevicesRecord<Tautomation = unknown, Tconfiguration = unknown, Tinformation = unknown> = {
	allow?: RecordIdString[]
	auto?: boolean
	automation?: null | Tautomation
	configuration?: null | Tconfiguration
	created?: IsoDateString
	description?: HTMLString
	device: RecordIdString
	hide?: boolean
	id: string
	information: null | Tinformation
	mode: string
	name?: string
	status?: DevicesStatusOptions
	updated?: IsoDateString
}

export enum ModelsStreamOptions {
	"mediamtx" = "mediamtx",
	"ws" = "ws",
}
export type ModelsRecord<Tparams = unknown> = {
	created?: IsoDateString
	id: string
	name: string
	params: null | Tparams
	stream?: ModelsStreamOptions
	updated?: IsoDateString
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
export type ActionsResponse<Texpand = unknown> = Required<ActionsRecord> & BaseSystemFields<Texpand>
export type DevicesResponse<Tautomation = unknown, Tconfiguration = unknown, Tinformation = unknown, Texpand = unknown> = Required<DevicesRecord<Tautomation, Tconfiguration, Tinformation>> & BaseSystemFields<Texpand>
export type ModelsResponse<Tparams = unknown, Texpand = unknown> = Required<ModelsRecord<Tparams>> & BaseSystemFields<Texpand>
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
	actions: ActionsRecord
	devices: DevicesRecord
	models: ModelsRecord
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
	actions: ActionsResponse
	devices: DevicesResponse
	models: ModelsResponse
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
	collection(idOrName: 'actions'): RecordService<ActionsResponse>
	collection(idOrName: 'devices'): RecordService<DevicesResponse>
	collection(idOrName: 'models'): RecordService<ModelsResponse>
	collection(idOrName: 'rules'): RecordService<RulesResponse>
	collection(idOrName: 'run'): RecordService<RunResponse>
	collection(idOrName: 'templates'): RecordService<TemplatesResponse>
	collection(idOrName: 'users'): RecordService<UsersResponse>
}
