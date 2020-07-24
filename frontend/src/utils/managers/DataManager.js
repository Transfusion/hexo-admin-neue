import HexoAdminNeueAPIService from '../api/HexoAdminNeueAPIService';

export default class DataManager {
  static getAllPosts = HexoAdminNeueAPIService.getAllPosts;

  static getAllPages = HexoAdminNeueAPIService.getAllPages;
  // static getRendered = HexoAdminNeueAPIService.getRendered;

  static createPost = HexoAdminNeueAPIService.createPost;

  static deletePost = HexoAdminNeueAPIService.deletePost;

  static createPage = HexoAdminNeueAPIService.createPage;

  static deletePage = HexoAdminNeueAPIService.deletePage;


  static publishPost = HexoAdminNeueAPIService.publishPost;

  static unpublishPost = HexoAdminNeueAPIService.unpublishPost;

  static savePost = HexoAdminNeueAPIService.savePost;

  static savePage = HexoAdminNeueAPIService.savePage;

  static hexoGenerate = HexoAdminNeueAPIService.hexoGenerate;

  static hexoDeploy = HexoAdminNeueAPIService.hexoDeploy;

  static hexoClean = HexoAdminNeueAPIService.hexoClean;

  static hexoUnwatch = HexoAdminNeueAPIService.hexoUnwatch;

  static hexoWatch = HexoAdminNeueAPIService.hexoWatch;

  static hexoGetWatchStatus = HexoAdminNeueAPIService.hexoGetWatchStatus;
}
