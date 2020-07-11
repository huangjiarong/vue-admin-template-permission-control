import request from '@/utils/request'

export function getAllGoods(query) {
  return request({
    url: '/api/goods/',
    method: 'get',
    params: query
  })
}

export function getAllCategory() {
  return request({
    url: '/api/category/',
    method: 'get'
  })
}

export function fetchArticle(id) {
  return request({
    url: '/vue-element-admin/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/vue-element-admin/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function createGoods(data) {
  return request({
    url: '/api/goods/',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data
  })
}

export function updateGoods(id, data) {
  return request({
    url: '/api/goods/' + id + '/',
    method: 'patch',
    // headers: {
    //   'Content-Type': 'multipart/form-data'
    // },
    data
  })
}

export function deleteGoods(id) {
  return request({
    url: '/api/goods/' + id + '/',
    method: 'delete'
  })
}

export function updateArticle(data) {
  return request({
    url: '/vue-element-admin/article/update',
    method: 'post',
    data
  })
}
