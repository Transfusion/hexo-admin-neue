import HexoAdminNeueAPIService from '../api/HexoAdminNeueAPIService';

export default class SettingsManager {
  static getSettings = HexoAdminNeueAPIService.getSettings;

  static killServer = HexoAdminNeueAPIService.killServer;
}
