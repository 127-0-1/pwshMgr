export interface Machine {
        _id: string,
        name: String
}

export interface Script {
        _id: string,
        name: string
}

export interface Job {
        _id: string,
        name: string,
        machine: Machine,
        status: string,
        startDate: Date,
        finishDate: Date,
        group: string,
        subJob: boolean,
        dateAdded: Date,
        subJobs: Job[],
        output: String,
        script: Script,
        type: String
}

export interface NewJob {
        script: String,
        machine: String,
        _id: String
}