import model1 from "./model1";

export interface modelState {
    t?: number, // Time
    s?: any[] // Species
    // r?: any[] // Resource pool
}

// Creating and modifying the state

export function createInitialState(N: any[]): modelState {
    let state: modelState = {t:0, s:N};
    return state;
}

export function advanceTime(dt: number, initialState: modelState ): modelState {
    let finalState: modelState = {t: initialState.t + dt, s: initialState.s}
    return finalState;
}

export function createSpecies(initialState: modelState, newVal: any): modelState {
    let finalState: modelState = initialState;
    finalState.s.push(newVal)
    return finalState
}

export function removeSpecies(initialState: modelState, index: number): modelState {
    let finalState: modelState = {
        t: initialState.t, 
        s: initialState.s.filter((spec,ind) => ind != index)
    }
    return finalState
}

export function changeSpecies(initialState: modelState, index: number, newVal: any): modelState {
    let finalState: modelState = initialState
    finalState.s[index] = newVal
    return finalState
}