/** Request 网络请求工具 更详细的 api 文档: https://github.com/umijs/umi-request */
import { extend } from 'umi-request';
import { message } from 'antd';
import { history } from 'umi';

const codeMessage = {
  200: '服务器成功返回请求的数据。',
  201: '新建或修改数据成功。',
  202: '一个请求已经进入后台排队（异步任务）。',
  204: '删除数据成功。',
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
};
/**
 * @zh-CN 异常处理程序
 * @en-US Exception handler
 */

const errorHandler = async (error) => {
  const { response } = error;

  if (response && response.status) {
    let errorText = codeMessage[response.status] || response.statusText;
    const { status } = response;

    const result = await response.json();

    if (status === 422) {
      let errs = '';
      if (Array.isArray(result.errors)) {
        Object.keys(result.errors).forEach((key) => {
          errs += result.errors[key][0];
        });
      }
      errorText += `[ ${errs} ]`;
    }

    if (status === 400) {
      errorText += `[ ${result.message} ]`;
    }

    // 如果无权限，删除本地登录缓存并跳转到登录页
    if (status === 401) {
      errorText += `[ ${result.message} ]`;
      localStorage.removeItem('access_token');
      localStorage.removeItem('userInfo');
      history.replace('/login');
    }

    message.error(errorText);
  } else if (!response) {
    message.error('你的网络发生异常，无法连接服务器');
  }

  return response;
};
/**
 * @en-US Configure the default parameters for request
 * @zh-CN 配置request请求时的默认参数
 */

const request = extend({
  errorHandler, // default error handling
  credentials: 'include', // Does the default request bring cookies
});

// 请求拦截器
request.interceptors.request.use((url, options) => {
  const token = localStorage.getItem('access_token') || '';
  // const token =
  //   'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvYXBpLnNob3AuZWR1d29yay5jblwvYXBpXC9hdXRoXC9sb2dpbiIsImlhdCI6MTYyNDgwNTgyOSwiZXhwIjoxNjI1MTY1ODI5LCJuYmYiOjE2MjQ4MDU4MjksImp0aSI6IjZ0Z0d4NW9ndGJlQlJsSlkiLCJzdWIiOjEsInBydiI6IjIzYmQ1Yzg5NDlmNjAwYWRiMzllNzAxYzQwMDg3MmRiN2E1OTc2ZjcifQ.wcfV8O84ePqaCnLOhCgOubon2cnz1AguRPgQZ3ToGzs';
  const headers = {
    Authorization: `Bearer ${token}`, // 注意是Authorization而不是Authorized
  };
  return {
    url,
    options: { ...options, headers },
  };
});

// request.interceptors.response.use((req, res) => {});

export default request;
