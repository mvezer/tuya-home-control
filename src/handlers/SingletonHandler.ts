class SingletonHandler {
    private instances:Map<string, any> = new Map<string, any>();

    register(className:string, instance:any):any {
        this.instances.set(className, instance);
        return instance;
    }

    getInstance(className:string):any {
        if (this.instances.has(className)) {
            return this.instances.get(className);
        }
    
        console.error(`[singletons] ERROR: ${className} instance is not registered!`);

        return null;
    }
}

export default new SingletonHandler();