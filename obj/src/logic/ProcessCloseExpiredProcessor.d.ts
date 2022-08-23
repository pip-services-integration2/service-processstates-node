import { IConfigurable, IReferenceable, IOpenable, ConfigParams, IReferences } from "pip-services3-commons-nodex";
export declare class ProcessCloseExpiredProcessor implements IConfigurable, IReferenceable, IOpenable {
    private _logger;
    private _timer;
    private _controller;
    private _persistence;
    private _correlationId;
    private _interval;
    private readonly _batchSize;
    constructor();
    configure(config: ConfigParams): void;
    setReferences(references: IReferences): void;
    open(correlationId: string): Promise<void>;
    close(correlationId: string): Promise<void>;
    isOpen(): boolean;
    private _closeExpiredProcessing;
}
