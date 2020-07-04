/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const tableRouter = {
  path: '/user',
  component: Layout,
  redirect: '/user/user',
  name: 'User',
  meta: {
    title: '用户管理',
    icon: 'table'
  },
  children: [
    {
      path: 'user',
      component: () => import('@/views/user/user'),
      name: '用户管理',
      meta: { title: '用户管理' }
    }
  ]
}
export default tableRouter
