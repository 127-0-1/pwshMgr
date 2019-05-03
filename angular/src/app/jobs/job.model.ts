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
        startDate: number,
        finishDate: string,
        group: string,
        subJob: boolean,
        dateAdded: number,
        subJobs: Job[],
        output: String,
        script: Script,
        type: String
}