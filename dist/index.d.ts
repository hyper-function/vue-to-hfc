/// <reference types="hyper-function-component" />
export declare function vueToHfc(Comp: any, opts: {
    tag: string;
    props: [string[], string[], string[]];
    connected?: (container: Element, props: HfcProps) => void;
    disconnected?: () => void;
}): typeof HyperFunctionComponent;
