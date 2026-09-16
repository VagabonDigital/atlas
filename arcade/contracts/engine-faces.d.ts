export type EngineId = string;
export type RevisionId = string;

export interface EngineIdentity {
    engineId: EngineId;
    runtimeVersion: string;
    supportedDefinitionSchemaVersions: readonly string[];
    sessionSchemaVersion: string;
}

export interface GameRevision<TCompiledGame = unknown> {
    revisionId: RevisionId;
    engineId: EngineId;
    contentHash: string;
    engineRuntimeVersion: string;
    definitionSchemaVersion: string;
    compilerVersion: string;
    generationContractVersion: string;
    compiledGame: TCompiledGame;
    provenance?: Readonly<Record<string, unknown>>;
}

export interface PrimaryActionDescriptor {
    id: string;
    label: string;
    interaction: 'press' | 'hold';
    enabled: boolean;
    reason?: string;
}

export interface ArcadeSessionStore {
    read(): unknown | null;
    write(record: unknown): void | Promise<void>;
    clear(): void | Promise<void>;
}

export interface RuntimeHostContext {
    container: HTMLElement;
    appearance: 'light' | 'night';
    sessionStore: ArcadeSessionStore;
    chromeSlot: HTMLElement;
}

export interface RuntimeController {
    serialise(): unknown;
    restore(record: unknown): boolean;
    pause(): void;
    destroy(): void;
    subscribePrimaryActions(
        listener: (
            actions: readonly PrimaryActionDescriptor[]
        ) => void
    ): () => void;
    subscribeFinish(
        listener: () => void
    ): () => void;
}

export interface PreviewStillOptions {
    phase?: string;
}

export interface RuntimeFace<
    TCompiledGame = unknown,
    TSessionRecord = unknown
> {
    identity: EngineIdentity;
    mount(
        host: RuntimeHostContext,
        revision: GameRevision<TCompiledGame>,
        sessionRecord?: TSessionRecord | null
    ): RuntimeController;
    mountPreviewStill(
        host: Pick<RuntimeHostContext, 'container' | 'appearance'>,
        revision: GameRevision<TCompiledGame>,
        options?: PreviewStillOptions
    ): RuntimeController;
}

export interface DiagnosticEnvelope {
    code: string;
    severity: 'error' | 'warning' | 'info';
    locus?: string;
    message: string;
    modelMessage?: string;
}

export interface EngineFitDescriptor {
    tags: readonly string[];
    description: string;
}

export interface ModelStagePlanStep {
    id: string;
    kind: 'model';
    promptAssetId: string;
    outputSchemaId: string;
}

export interface EngineStagePlanStep {
    id: string;
    kind: 'engine';
    operationId: string;
}

export interface HumanStagePlanStep {
    id: string;
    kind: 'human';
    interactionId: string;
}

export type StagePlanStep =
    | ModelStagePlanStep
    | EngineStagePlanStep
    | HumanStagePlanStep;

export interface AuthoringFace<
    TBrief = unknown,
    TAuthoredDefinition = unknown,
    TCompiledGame = unknown,
    TAnalysisReport = unknown
> {
    engineId: EngineId;
    generationContractVersion: string;
    fit: EngineFitDescriptor;
    briefSchema: unknown;
    definitionSchema: unknown;
    stagePlan: readonly StagePlanStep[];
    candidateDiversityHint?: string;
    compile(
        draft: TAuthoredDefinition
    ): {
        ok: boolean;
        compiledGame?: TCompiledGame;
        diagnostics: readonly DiagnosticEnvelope[];
    };
    analyse(
        compiledGame: TCompiledGame
    ): TAnalysisReport;
    phraseDiagnosticsForRepair(
        diagnostics: readonly DiagnosticEnvelope[]
    ): string;
    deriveTutorBrief(
        compiledGame: TCompiledGame
    ): unknown;
    blockingPolicy(
        authorClass: string,
        diagnostics: readonly DiagnosticEnvelope[]
    ): readonly DiagnosticEnvelope[];
}
