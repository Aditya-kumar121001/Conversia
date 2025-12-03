import type { Session } from "./models/Session";

const EVICTION_TIME = 60 * 60 * 1000; // 1 hour
const EVICTION_CLOCK_TIME = 15 * 60 * 1000; // 15 min

export class InMemoryStore {
    private static instance: InMemoryStore;

    private memory: Record<string, {
        session: Session;
        evictionTime: number;
    }>;

    private clock: NodeJS.Timeout;

    private constructor() {
        this.memory = {};

        this.clock = setInterval(() => {
            Object.entries(this.memory).forEach(([key, value]) => {
                if (value.evictionTime < Date.now()) {
                    delete this.memory[key];
                }
            });
        }, EVICTION_CLOCK_TIME);
    }

    public destroy() {
        clearInterval(this.clock);
    }

    static getInstance() {
        if (!InMemoryStore.instance) {
            InMemoryStore.instance = new InMemoryStore();
        }
        return InMemoryStore.instance;
    }

    get(sessionId: string): Session | null {
        const entry = this.memory[sessionId];
        if (!entry) return null;

        // Optional: refresh TTL on read
        entry.evictionTime = Date.now() + EVICTION_TIME;

        return entry.session;
    }

    set(sessionId: string, session: Session) {
        this.memory[sessionId] = {
            session,
            evictionTime: Date.now() + EVICTION_TIME,
        };
    }
}
