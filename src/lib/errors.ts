export class SpoilerGateError extends Error {
    constructor(message: string = "SPOILER_GATE") {
        super(message);
        this.name = "SpoilerGateError";
    }
}