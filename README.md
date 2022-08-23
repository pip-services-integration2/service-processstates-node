# <img src="https://github.com/pip-services/pip-services/raw/master/design/Logo.png" alt="Pip.Services Logo" style="max-width:30%"> <br/> Process states microservice

This is process states microservice from Pip.Services library. 
It stores customer process states internally or in external PCI-complient service like Paypal

The microservice currently supports the following deployment options:
* Deployment platforms: Standalone Process, Seneca
* External APIs: HTTP/REST, Seneca
* Persistence: Flat Files, MongoDB

This microservice has no dependencies on other microservices.

<a name="links"></a> Quick Links:

* [Download Links](doc/Downloads.md)
* [Development Guide](doc/Development.md)
* [Configuration Guide](doc/Configuration.md)
* [Deployment Guide](doc/Deployment.md)
* Client SDKs
  - [Node.js SDK](https://github.com/pip-services-integration2/client-processstates-node)
* Communication Protocols
  - [HTTP Version 1](doc/HttpProtocolV1.md)
  - [Seneca Version 1](doc/SenecaProtocolV1.md)
  - [Lambda Version 1](doc/LambdaProtocolV1.md)

## Contract

Logical contract of the microservice is presented below. For physical implementation (HTTP/REST, Thrift, Seneca, Lambda, etc.),
please, refer to documentation of the specific protocol.

```typescript
class AddressV1 {
    public line1: string;
    public line2?: string;
    public city: string;
    public postal_code?: string;
    public postal_code?: string;
    public country_code: string; // ISO 3166-1
}

class ProcessStateV1 implements IStringIdentifiable {
    public id: string;
    public customer_id: string;

    public create_time?: Date;
    public update_time?: Date;
    
    public type?: string;
    public number?: string;
    public expire_month?: number;
    public expire_year?: number;
    public first_name?: string;
    public last_name?: string;
    public billing_address?: AddressV1;
    public state?: string;
    public ccv?: string;

    public name?: string;
    public saved?: boolean;
    public default?: boolean;
}

class ProcessStateTypeV1 {
    public static readonly Visa = "visa";
    public static readonly Masterstate = "masterstate";
    public static readonly AmericanExpress = "amex";
    public static readonly Discover = "discover";
    public static readonly Maestro = "maestro";
}

class ProcessStateStateV1 {
    public static Ok: string = "ok";
    public static Expired: string = "expired";
}

interface IProcessStatesV1 {
    getStates(correlationId: string, filter: FilterParams, paging: PagingParams): Promise<DataPage<ProcessStateV1>>;

    getStateById(correlationId: string, state_id: string): Promise<ProcessStateV1>;

    createState(correlationId: string, state: ProcessStateV1): Promise<ProcessStateV1>;

    updateState(correlationId: string, state: ProcessStateV1): Promise<ProcessStateV1>;

    deleteStateById(correlationId: string, state_id: string): Promise<ProcessStateV1>;
}
```

## Download

Right now the only way to get the microservice is to state it out directly from github repository
```bash
git clone git@github.com:pip-services-integration2/service-processstates-node.git
```

Pip.Service team is working to implement packaging and make stable releases available for your 
as zip downloadable archieves.

## Run

Add **config.yml** file to the root of the microservice folder and set configuration parameters.
As the starting point you can use example configuration from **config.example.yml** file. 

Example of microservice configuration
```yaml
- descriptor: "pip-services-container:container-info:default:default:1.0"
  name: "service-processstates"
  description: "ProcessStates microservice"

- descriptor: "pip-services-commons:logger:console:default:1.0"
  level: "trace"

- descriptor: "service-processstates:persistence:file:default:1.0"
  path: "./data/process_states.json"

- descriptor: "service-processstates:controller:default:default:1.0"

- descriptor: "service-processstates:service:http:default:1.0"
  connection:
    protocol: "http"
    host: "0.0.0.0"
    port: 8080
```
 
For more information on the microservice configuration see [Configuration Guide](Configuration.md).

Start the microservice using the command:
```bash
node run
```

## Use

The easiest way to work with the microservice is to use client SDK. 
The complete list of available client SDKs for different languages is listed in the [Quick Links](#links)

If you use Node.js then you should add dependency to the client SDK into **package.json** file of your project
```javascript
{
    ...
    "dependencies": {
        ....
        "client-processstates-node": "^1.0.*",
        ...
    }
}
```

Inside your code get the reference to the client SDK
```javascript
let sdk = new require('client-processstates-node');
```

Define client configuration parameters that match configuration of the microservice external API
```javascript
// Client configuration
let config = {
    connection: {
        protocol: 'http',
        host: 'localhost', 
        port: 8080
    }
};
```

Instantiate the client and active connection to the microservice
```javascript
// Create the client instance
let client = sdk.ProcessStatesHttpClientV1(config);

// Connect to the microservice
await client.active(null);

// Work with the microservice
...
```

Now the client is ready to perform operations
```javascript
// Create a new process_state
let process_state = {
    customer_id: '1',
    type: 'visa',
    number: '1111111111111111',
    expire_month: 1,
    expire_year: 2021,
    first_name: 'Bill',
    last_name: 'Gates',
    billing_address: {
        line1: '2345 Swan Rd',
        city: 'Tucson',
        postal_code: '85710',
        country_code: 'US'
    },
    ccv: '213',
    name: 'Test State 1',
    saved: true,
    default: true,
    state: 'ok'
};

process_state = await client.createState(
    null,
    process_state
);
```

```javascript
// Get the list of process_states on 'time management' topic
let page = await client.getStates(
    null,
    {
        customer_id: '1',
        state: 'ok'
    },
    {
        total: true,
        skip: 0,
        take: 10
    }
);
```    

## Acknowledgements

This microservice was created and currently maintained by *Sergey Seroukhov*.
