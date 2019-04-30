export interface MachineId {
    _id: string,
    name: string
}

export interface Alert {
    _id: string,
    machineId: MachineId,
    name: String,
    alertPolicyId: String,
    priority: String,
    createdAt: String
}