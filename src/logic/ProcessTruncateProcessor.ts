import { IConfigurable, IReferenceable, IOpenable, ConfigParams, IReferences, FixedRateTimer, Descriptor } from "pip-services3-commons-nodex";
import { CompositeLogger } from "pip-services3-components-nodex";
import { IProcessStatesController } from "./IProcessStatesController";
import { Parameters } from "pip-services3-commons-nodex";


export class ProcessTruncateProcessor implements IConfigurable, IReferenceable, IOpenable {
    private _logger: CompositeLogger = new CompositeLogger();
    private _timer: FixedRateTimer = new FixedRateTimer();
    private _controller: IProcessStatesController;
    private _correlationId: string = "integration.processesstates";
    private _interval: number = 90 * 24 * 60 * 60 * 1000; // 90 days;

    constructor() {

    }

    public configure(config: ConfigParams): void {
        this._logger.configure(config);
        this._interval = config.getAsIntegerWithDefault("options.interval", this._interval);
    }

    public setReferences(references: IReferences): void {
        this._logger.setReferences(references);
        this._controller = references.getOneRequired<IProcessStatesController>(new Descriptor("service-processstates", "controller", "default", "*", "1.0"));
    }

    public async open(correlationId: string): Promise<void> {
        this._timer.setDelay(this._interval);
        this._timer.setInterval(this._interval);
        this._timer.setTask({
            notify: (correlationId: string, args: Parameters) => {
                this._truncateProcessing(correlationId);
            }
        });
        this._logger.info(correlationId, "Truncate processing is enable");
        this._timer.start();
    }

    public async close(correlationId: string): Promise<void> {
        this._timer.stop();
        this._logger.info(correlationId, "Truncate processing is disable");
    }

    public isOpen(): boolean {
        return this._timer != null && this._timer.isStarted();
    }

    private async _truncateProcessing(correlationId: string): Promise<void> {
        this._logger.info(correlationId, "Starting truncation of process states");
        
        try {
            await this._controller.truncate(correlationId, 0);
            this._logger.info(correlationId, "Completed truncation of process states");
        } catch(err) {
            this._logger.error(correlationId, err, "Truncation of process states failed");
        }
    }

}