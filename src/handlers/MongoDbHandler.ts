import mongoose from 'mongoose';

const MAX_RECONNECTION_ATTEMPTS = 5;

export default class MongoDbHandler {
    private _url: string;
    private _port: number;
    private _dbName: string;
    private _connectionString: string;
    private _connectionInstance: typeof mongoose;
    public isConnected: boolean;
    private _reconnectionAttempts: number;

    constructor(url: string, port: number, dbName: string) {
        this._url = url;
        this._port = port;
        this._dbName = dbName;
        this._connectionString = this.createConnectionString(url, port, dbName);
        this.isConnected = false;
        this._reconnectionAttempts = 0;

        mongoose.connection.on('connected', this.onConnected.bind(this));
        mongoose.connection.on('disconnected', this.onDisconnected.bind(this));
        mongoose.connection.on('connecting', this.onConnecting.bind(this));
    }

    public async connect(): Promise<void> {
        try {
            this._connectionInstance = await mongoose.connect(
                this._connectionString,
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                }
            );
        } catch (error: any) {
            console.error(`[MongoDB] ERROR: ${error.message}`);
        }
        
    }

    private onConnected() {
        console.info('[MongoDB] connected');
        this.isConnected = true;
        this._reconnectionAttempts = 0;
    }

    private async onDisconnected() {
        console.info('[MongoDB] disconnected');
        this.isConnected = false;
        this._reconnectionAttempts += 1;
        if (this._reconnectionAttempts <= MAX_RECONNECTION_ATTEMPTS) {
            console.info(`[MongoDB] trying to reconnect (attempt ${this._reconnectionAttempts}/${MAX_RECONNECTION_ATTEMPTS})`);
            await this.connect();
        }
    }

    private onConnecting() {
        console.info(`[MongoDB] attempting to connect to ${this._connectionString}...`)
    }

    private createConnectionString(url: string, port: number, dbName: string): string {
        return `mongodb://${url}:${port}/${dbName}`;
    }
}