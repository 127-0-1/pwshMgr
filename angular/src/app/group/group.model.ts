export interface Group {
    name: String,
    _id: String
}

export interface Machine {
    name: String,
    _id: String
}

export interface SingleGroupView {
    _id: String,
    name: String
    machines: Machine[]
}