export interface ILiveReloaderMessage{
    command: "reload" | "alert" | undefined;
    liveCSS: boolean;
    liveImg: boolean;
    path: string;
    reloadMissingCSS: boolean;
}
