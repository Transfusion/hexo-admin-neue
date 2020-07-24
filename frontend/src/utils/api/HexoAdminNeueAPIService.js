import axios from 'axios';
import Cookies from 'universal-cookie';
import { toast } from 'react-toastify';
import { Config } from '../Config';
import history from '../history';

const cookies = new Cookies();


// https://stackoverflow.com/questions/47216452/how-to-handle-401-authentication-error-in-axios-and-react
axios.interceptors.response.use((response) => response, (error) => {
  if (error?.response.status === 403) {
    // nuke cookie
    cookies.remove('hexo-admin-neue-auth');
    localStorage.removeItem(Config.localStorageProfileKey);
    // https://stackoverflow.com/questions/42941708/react-history-push-is-updating-url-but-not-navigating-to-it-in-browser
    history.push('/login');
  } else if (error?.response.status === 408 || error?.code === 'ECONNABORTED') {
    toast('Operation timed out, please retry.');
  }
  throw error;
});

export default class HexoAdminNeueAPIService {
  static performLogin(username: String, password: String) {
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    return axios.post(`${Config.routerBase}/api/auth/login/`, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  static performLogout() {
    return axios.post(`${Config.routerBase}/api/auth/logout`);
  }

  static getSettings() {
    return axios.get(`${Config.routerBase}/api/settings/list`);
  }

  static getAuthed() {
    return axios.get(`${Config.routerBase}/api/profile`);
  }

  static createPost(title: String) {
    return axios.post(`${Config.routerBase}/api/posts/new`, {
      title,
    });
  }

  static createPage(title: String) {
    return axios.post(`${Config.routerBase}/api/pages/new`, {
      title,
    });
  }

  static getAllPosts() {
    return axios.get(`${Config.routerBase}/api/posts/list`);
  }

  static getAllPages() {
    return axios.get(`${Config.routerBase}/api/pages/list`);
  }

  // TODO: add a parameter for filetype
  /* static getRendered(raw: String) {
    return axios.post(`${Config.routerBase}/api/mdrender`, {
      md: raw,
    });
  } */

  static publishPost(postId: String) {
    return axios.post(`${Config.routerBase}/api/posts/${postId}/publish`);
  }

  static unpublishPost(postId: String) {
    return axios.post(`${Config.routerBase}/api/posts/${postId}/unpublish`);
  }

  static savePost(postId: String, content: String) {
    /* return axios.post(Config.routerBase + `/api/posts/${postId}`, {
      _content: content
    }); */
    return axios.post(`${Config.routerBase}/api/posts/${postId}`, {
      postRaw: content,
    });
  }

  static deletePost(postId: String) {
    return axios.post(`${Config.routerBase}/api/posts/${postId}/remove`);
  }

  /* static publishPage(pageId: String) {
    return axios.post(Config.routerBase + `/api/posts/${pageId}/publish`);
  }

  static unpublishPage(pageId: String) {
    return axios.post(Config.routerBase + `/api/posts/${pageId}/unpublish`);
  } */

  static savePage(pageId: String, content: String) {
    /* return axios.post(Config.routerBase + `/api/posts/${postId}`, {
      _content: content
    }); */
    return axios.post(`${Config.routerBase}/api/pages/${pageId}`, {
      pageRaw: content,
    });
  }

  static deletePage(pageId: String) {
    return axios.post(`${Config.routerBase}/api/pages/${pageId}/remove`);
  }

  static hexoGenerate() {
    return axios.post(`${Config.routerBase}/api/generate`);
  }

  static hexoDeploy(args) {
    return axios.post(`${Config.routerBase}/api/deploy`, {
      args,
    });
  }

  static hexoClean() {
    return axios.post(`${Config.routerBase}/api/clean`);
  }

  static hexoUnwatch() {
    return axios.post(`${Config.routerBase}/api/unwatch`);
  }

  static hexoWatch() {
    return axios.post(`${Config.routerBase}/api/watch`);
  }

  static hexoGetWatchStatus() {
    return axios.get(`${Config.routerBase}/api/watch/status`);
  }

  static killServer() {
    return axios.post(`${Config.routerBase}/api/kill-server`);
  }
}
