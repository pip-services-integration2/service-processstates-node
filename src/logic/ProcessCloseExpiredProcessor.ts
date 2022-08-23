import { 
    IConfigurable, IReferenceable, IOpenable, ConfigParams, 
    IReferences, FixedRateTimer, Descriptor, FilterParams, 
    PagingParams 
} from "pip-services3-commons-nodex";

import { CompositeLogger } from "pip-services3-components-nodex";
import { IProcessStatesController } from "./IProcessStatesController";
import { Parameters } from "pip-services3-commons-nodex";
import { ProcessStatusV1 } from "../data/version1";
import { IProcessStatesPersistence } from "../persistence";

export class ProcessCloseExpiredProcessor implements IConfigurable, IReferenceable, IOpenable {

    private _logger: CompositeLogger = new CompositeLogger();
    private _timer: FixedRateTimer = new FixedRateTimer();
    private _controller: IProcessStatesController;
    private _persistence: IProcessStatesPersistence;
    private _correlationId: string = "integration.processesstates";
    private _interval: number = 5 * 60 * 1000; // 5 minutes
    private readonly _batchSize: number = 100;

    constructor(){
        
    }
    public configure(config: ConfigParams): void {
        this._logger.configure(config);
        this._interval = config.getAsIntegerWithDefault("options.interval", this._interval);
    }

    public setReferences(references: IReferences): void {
        this._logger.setReferences(references);
        this._controller = references.getOneRequired<IProcessStatesController>(new Descriptor("service-processstates", "controller", "default", "*", "1.0"));
        this._persistence = references.getOneRequired<IProcessStatesPersistence>(new Descriptor("service-processstates", "persistence", "*", "*", "1.0"));
    }

    public async open(correlationId: string): Promise<void> {
        this._timer.setDelay(this._interval);
        this._timer.setInterval(this._interval);
        this._timer.setTask({
            notify: (correlationId: string, args: Parameters) => {
                this._closeExpiredProcessing(correlationId);
            }
        });
        this._logger.info(correlationId, "Closing expired processing is enable");
        this._timer.start();
    }

    public async close(correlationId: string): Promise<void> {
        this._timer.stop();
        this._logger.info(correlationId, "Closing expired processing is disable");
    }

    public isOpen(): boolean {
        return this._timer != null && this._timer.isStarted();
    }


    private async _closeExpiredProcessing(correlationId: string): Promise<void> {
        this._logger.info(correlationId, "Starting close expired of process states");

        let expirations = 0;
        let skip = 0;
        let now = new Date();
        let recover: boolean = true;

        try {
            while (recover) {
                let filter = FilterParams.fromTuples(
                    "states", ProcessStatusV1.Starting + "," + ProcessStatusV1.Running,
                    "recovered", true
                );

                let paging = new PagingParams(skip, this._batchSize, false);
                let page = await this._persistence.getPageByFilter(correlationId, filter, paging);

                let counter = 0;

                try {
                    while (counter != page.data.length) {
                        let process = page.data[counter];
                        counter++;
                        // Double check for expired processes
                        if (process.expiration_time < now) {
                            // Fail expired processes
                            try {
                                await this._controller.failProcess(correlationId, process, "Reached expiration time");
                                expirations++;
                                this._logger.warn(process.id, "Close expired process " + process);
                            } catch (ex) {
                                this._logger.error(process.id, ex, "Failed to expire process " + process);
                                throw ex;
                            }
                        }
                    }
                } catch (err) {
                    if (page.data.length < this._batchSize)
                        recover = false;
                    else
                        skip += page.data.length;

                    throw err;
                }
            }
        } catch(err) {
            if (expirations > 0)
                this._logger.info(correlationId, "Close " + expirations + " expired processes");
            else
                this._logger.info(correlationId, "No expired processes were found");

            this._logger.debug(correlationId, "Completed close expired of process states");

            throw err;
        }
    }
}