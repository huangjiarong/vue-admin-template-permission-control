/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const GoodsRouter = {
  path: '/goods',
  component: Layout,
  redirect: '/goods/goods',
  name: 'User',
  meta: {
    title: '商品管理',
    icon: 'table'
  },
  children: [
    {
      path: 'category',
      component: () => import('@/views/goods/goods'),
      name: '分类',
      meta: { title: '分类' }
    },
    {
      path: 'goods',
      component: () => import('@/views/goods/goods'),
      name: '商品',
      meta: { title: '商品' }
    }
  ]
}
export default GoodsRouter
