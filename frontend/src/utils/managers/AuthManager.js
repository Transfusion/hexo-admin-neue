import HexoAdminNeueAPIService from '../api/HexoAdminNeueAPIService';

export default class AuthManager {
  static performLogin = HexoAdminNeueAPIService.performLogin;

  static performLogout = HexoAdminNeueAPIService.performLogout;

  static getAuthed = HexoAdminNeueAPIService.getAuthed;
}
