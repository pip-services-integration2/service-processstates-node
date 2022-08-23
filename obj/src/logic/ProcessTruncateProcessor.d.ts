import { IConfigurable, IReferenceable, IOpenable, ConfigParams, IReferences } from "pip-services3-commons-nodex";
export declare class ProcessTruncateProcessor implements IConfigurable, IReferenceable, IOpenable {
    private _logger;
    private _timer;
    private _controller;
    private _correlationId;
    private _interval;
    constructor();
    configure(config: ConfigParams): void;
    setReferences(references: IReferences): void;
    open(correlationId: string): Promise<void>;
    close(correlationId: string): Promise<void>;
    isOpen(): boolean;
    private _truncateProcessing;
}
