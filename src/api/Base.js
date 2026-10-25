import { BASE_URL } from '../constants/url';

export default class Base {
  sendRequest = async ({ path, method = 'GET', data = {}, base, headers }) => {
    let url = base ? base + path : BASE_URL + path;
    const isFormData = data instanceof FormData;
    const token = window.localStorage.getItem("token");

    let config = {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      method: method,
    };

    if (!isFormData) {
      config.headers['Content-Type'] = 'application/json';
    }

    if (headers) {
      config = {
        ...config,
        headers: {
          ...config.headers,
          ...headers,
        },
      };
    }

    if (method !== 'GET') {
      config.body = isFormData ? data : JSON.stringify(data);
    }
    let response;
    let responseData;
    try {
      response = await fetch(url, config);
      responseData = await response.text();
    } catch (error) {
      return {
        ok: false,
        network_error: true,
        data: { message: "Cannot connect to the server. Please try again." },
      };
    }

    if (this.isJSON(responseData)) {
      responseData = JSON.parse(responseData);
    }

    if (response.status === 401 && token && token === window.localStorage.getItem('token')) {
      window.localStorage.clear();
      window.location.assign("/");
    }

    if (response.ok && !['GET', 'HEAD'].includes(method) && !path.startsWith('/api/v1/notifications')) {
      window.dispatchEvent(new Event('notifications:refresh'));
    }

    let output = {
      res: response,
      ok: response.ok,
      status: response.status,
      data: responseData,
      statusMessage: this.getStatusMessage(response.status),
    };
    return output;
  };

  isJSON = str => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  };

  getStatusMessage = status_code => {
    switch (status_code) {
      case 100:
        return 'Continue';
      case 101:
        return 'Switching Protocols';
      case 102:
        return 'Processing';
      case 200:
        return 'OK';
      case 201:
        return 'Created';
      case 202:
        return 'Accepted';
      case 203:
        return 'Non-authoritative Information';
      case 204:
        return 'No Content';
      case 205:
        return 'Reset Content';
      case 206:
        return 'Partial Content';
      case 207:
        return 'Multi-Status';
      case 208:
        return 'Already Reported';
      case 226:
        return 'IM Used';
      case 300:
        return 'Multiple Choices';
      case 301:
        return 'Moved Permanently';
      case 302:
        return 'Found';
      case 303:
        return 'See Other';
      case 304:
        return 'Not Modified';
      case 305:
        return 'Use Proxy';
      case 307:
        return 'Temporary Redirect';
      case 308:
        return 'Permanent Redirect';
      case 400:
        return 'Bad Request';
      case 401:
        return 'Unauthorized';
      case 402:
        return 'Payment Required';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not Found';
      case 405:
        return 'Method Not Allowed';
      case 406:
        return 'Not Acceptable';
      case 407:
        return 'Proxy Authentication Required';
      case 408:
        return 'Request Timeout';
      case 409:
        return 'Conflict';
      case 410:
        return 'Gone';
      case 411:
        return 'Length Required';
      case 412:
        return 'Precondition Failed';
      case 413:
        return 'Payload Too Large';
      case 414:
        return 'Request-URI Too Long';
      case 415:
        return 'Unsupported Media Type';
      case 416:
        return 'Requested Range Not Satisfiable';
      case 417:
        return 'Expectation Failed';
      case 418:
        return "I'm a teapot";
      case 421:
        return 'Misdirected Request';
      case 422:
        return 'Unprocessable Entity';
      case 423:
        return 'Locked';
      case 424:
        return 'Failed Dependency';
      case 426:
        return 'Upgrade Required';
      case 428:
        return 'Precondition Required';
      case 429:
        return 'Too Many Requests';
      case 431:
        return 'Request Header Fields Too Large';
      case 444:
        return 'Connection Closed Without Response';
      case 451:
        return 'Unavailable For Legal Reasons';
      case 499:
        return 'Client Closed Request';
      case 500:
        return 'Internal Server Error';
      case 501:
        return 'Not Implemented';
      case 502:
        return 'Bad Gateway';
      case 503:
        return 'Service Unavailable';
      case 504:
        return 'Gateway Timeout';
      case 505:
        return 'HTTP Version Not Supported';
      case 506:
        return 'Variant Also Negotiates';
      case 507:
        return 'Insufficient Storage';
      case 508:
        return 'Loop Detected';
      case 510:
        return 'Not Extended';
      case 511:
        return 'Network Authentication Required';
      case 599:
        return 'Network Connect Timeout Error';
      default:
        return 'Something went wrong: ' + status_code;
    }
  };
}
