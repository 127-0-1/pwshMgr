export interface Application {
    name: String,
    version: String
}

export interface Service {
    displayName: String,
    status: String
}

export interface Drive {
    name: String,
    usedGb: String,
    freeGb: String
}

export interface Process {
    name: String,
    pId: String
}

export interface Machine {
    _id: string,
    name: string,
    operatingSystem: string,
    serialNumber: string,
    applications: Application[]
    make: string,
    model: string,
    type: string,
    architecture: string,
    resGuid: string,
    startDate: string,
    dateAdded: string,
    credential: string,
    domain: string,
    publicIp: string
    drives: Drive[],
    status: String,
    ipAddress: String,
    groupName: String,
    processes: Process[],
    pollingCycle: String,
    lastContact: String
    services: Service[]
}