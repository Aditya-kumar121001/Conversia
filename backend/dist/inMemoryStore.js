"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryStore = void 0;
const EVICTION_TIME = 60 * 60 * 1000; // 1 hour
const EVICTION_CLOCK_TIME = 15 * 60 * 1000; // 15 min
class InMemoryStore {
    constructor() {
        this.memory = {};
        this.clock = setInterval(() => {
            Object.entries(this.memory).forEach(([key, value]) => {
                if (value.evictionTime < Date.now()) {
                    delete this.memory[key];
                }
            });
        }, EVICTION_CLOCK_TIME);
    }
    destroy() {
        clearInterval(this.clock);
    }
    static getInstance() {
        if (!InMemoryStore.instance) {
            InMemoryStore.instance = new InMemoryStore();
        }
        return InMemoryStore.instance;
    }
    get(sessionId) {
        const entry = this.memory[sessionId];
        if (!entry)
            return null;
        // Optional: refresh TTL on read
        entry.evictionTime = Date.now() + EVICTION_TIME;
        return entry.session;
    }
    set(sessionId, session) {
        this.memory[sessionId] = {
            session,
            evictionTime: Date.now() + EVICTION_TIME,
        };
    }
}
exports.InMemoryStore = InMemoryStore;
//# sourceMappingURL=inMemoryStore.js.map