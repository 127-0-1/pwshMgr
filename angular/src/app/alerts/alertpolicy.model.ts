export interface Machine {
    _id: string,
    name: string
}

export interface Group {
    _id: string,
    name: string
}

export interface AlertPolicy {
    _id: string,
    machine: Machine,
    drive: string,
    threshold: string,
    type: string,
    priority: string,
    integrations: String
}

export interface AlertPolicyView {
    name: string,
    _id: string,
    machine: Machine,
    drive: string,
    threshold: string,
    type: string,
    priority: string
    group: Group
    assignmentType: String
    dateCreated: Date
}