export interface Machine {
    _id: string,
    name: string
}

export interface Alert {
    _id: string,
    machine: Machine,
    name: String,
    alertPolicyId: String,
    priority: String,
    createdAt: String
}