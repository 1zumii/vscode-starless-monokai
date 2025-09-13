import { ProxyAgent, setGlobalDispatcher } from "undici";

export const setFetchProxy = (option: ConstructorParameters<typeof ProxyAgent>[0]): void => {
    setGlobalDispatcher(new ProxyAgent(option));
};
