/**
 * Created by Samuel Gratzl on 27.12.2016.
 */
import { PropertyHandler } from './PropertyHandler';
/**
 * manages the hash location property helper
 */
export class HashProperties extends PropertyHandler {
    constructor() {
        super();
        this.updated = () => {
            this.parse(location.hash);
            this.fire(HashProperties.EVENT_HASH_CHANGED);
        };
        this.debounceTimer = -1;
        const bak = history.state;
        if (bak) {
            Object.keys(bak).forEach((k) => this.map.set(k, bak[k]));
        }
        else {
            this.parse(location.hash);
        }
        window.addEventListener('hashchange', this.updated, false);
    }
    setInt(name, value, update = true) {
        this.setProp(name, String(value), update);
    }
    setProp(name, value, update = true) {
        if (this.map.get(name) === value) {
            return;
        }
        this.map.set(name, value);
        if (update !== false) {
            this.update(typeof update === 'number' ? update : 0);
        }
    }
    removeProp(name, update = true) {
        if (this.map.has(name)) {
            this.map.delete(name);
            if (update !== false) {
                this.update(typeof update === 'number' ? update : 0);
            }
            return true;
        }
        return false;
    }
    toObject() {
        const r = {};
        this.map.forEach((v, k) => r[k] = v);
        return r;
    }
    update(updateInMs = 0) {
        if (updateInMs <= 0) {
            return this.updateImpl();
        }
        if (this.debounceTimer >= 0) {
            self.clearTimeout(this.debounceTimer);
            this.debounceTimer = -1;
        }
        this.debounceTimer = self.setTimeout(() => this.updateImpl(), updateInMs);
    }
    updateImpl() {
        if (this.debounceTimer >= 0) {
            self.clearTimeout(this.debounceTimer);
            this.debounceTimer = -1;
        }
        // check if same state
        if (history.state) {
            const current = history.state;
            const keys = Object.keys(current);
            if (keys.length === this.map.size && keys.every((k) => this.map.get(k) === current[k])) {
                return;
            }
        }
        window.removeEventListener('hashchange', this.updated, false);
        history.pushState(this.toObject(), 'State ' + Date.now(), '#' + this.toString());
        window.addEventListener('hashchange', this.updated, false);
        this.fire(HashProperties.EVENT_STATE_PUSHED, 'State ' + Date.now(), '#' + this.toString());
    }
}
HashProperties.EVENT_STATE_PUSHED = 'pushedState';
HashProperties.EVENT_HASH_CHANGED = 'hashChanged';
//# sourceMappingURL=HashProperties.js.map