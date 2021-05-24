import ConfigStore from './config-store.js';

export default class NetworkManager {
  constructor() {
    this.configStore = new ConfigStore();
  }

  setup() {
    this.configStore.updateConfig();
  }
}