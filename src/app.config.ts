export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/equipment/index',
    'pages/create/index',
    'pages/mine/index',
    'pages/activity-detail/index',
    'pages/activity-log/index',
    'pages/activity-rating/index',
    'pages/monthly-report/index',
    'pages/leader-approval/index',
    'pages/equipment-list/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#2E7D32',
    navigationBarTitleText: '露营管家',
    navigationBarTextStyle: 'white'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#2E7D32',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '活动'
      },
      {
        pagePath: 'pages/equipment/index',
        text: '装备'
      },
      {
        pagePath: 'pages/create/index',
        text: '发布'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
