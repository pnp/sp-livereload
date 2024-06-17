export interface ILiveReloaderState {
    available: boolean,
    connected: boolean,
    setState(state: ILiveReloaderState): void
}

export interface ILiveReloaderSession{
    connected: boolean
}