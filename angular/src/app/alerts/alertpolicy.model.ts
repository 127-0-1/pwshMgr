export interface MachineId {
    _id: string,
    name: string
}

export interface AlertPolicy {
    _id: string,
    machineId: MachineId,
    drive: string,
    threshold: string,
    type: string,
    priority: string,
    integrations: String
}

export interface AlertPolicyView {
    name: string,
    _id: string,
    machineId: MachineId,
    drive: string,
    threshold: string,
    type: string,
    priority: string
}