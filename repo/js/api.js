import { XTASKVERSION, curToken } from "@js/config.js";

export const getHeaders = function () {
  const headers = {
    "Content-Type": "application/json",
    "X-TASK-VERSION": XTASKVERSION,
  };
  if (curToken) {
    headers["Authorization"] = "Bearer " + curToken;
  }
  return headers;
};

export const get = function (url, headers = {}) {
  const controller = new AbortController();
  const { signal } = controller;
  controllers.push(controller);
  return fetch(url, {
    method: "GET",
    headers: {
      ...getHeaders(),
      ...headers,
    },
    signal,
  }).then((response) => response.json());
};

export const post = function (url, data, headers = {}) {
  const controller = new AbortController();
  const { signal } = controller;
  controllers.push(controller);
  return fetch(url, {
    method: "POST",
    headers: {
      ...getHeaders(),
      ...headers,
    },
    signal,
    body: JSON.stringify(data),
  }).then((response) => response.json());
};

export const postFormData = function (url, data, headers = {}) {
  const controller = new AbortController();
  const { signal } = controller;
  controllers.push(controller);
  const curHeaders = {
    ...getHeaders(),
    ...headers,
  };
  delete curHeaders["Content-Type"];
  const formData = new FormData();
  for (const key in data) {
    formData.append(key, data[key]);
  }
  return fetch(url, {
    method: "POST",
    headers: curHeaders,
    signal,
    body: formData,
  }).then((response) => response.json());
};
