module.exports = {
	base: '/',
	title: 'note',
	description: 'langxue\'s blog',
	head: [
		['link', { rel: 'icon', href: '/lang.png' }]
	],
	cache: false,
	Markdown: {
		lineNumbers: true
	},
	plugins: {
		'@vuepress/plugin-active-header-links': {},
		'@vuepress/back-to-top': true,
		'@vuepress/last-updated': true
	},
	themeConfig: {
		theme: '@vuepress/blog',
		logo: '/lang.png',
		smoothScroll: true,
		displayAllHeaders: true,
		nav:[ // 导航栏配置
			{text: 'js', link: '/js/' },
			{text: '算法题库', link: '/algorithm/'},
			{text: '微博', link: 'https://baidu.com', target:'_blank'}      
		],
		sidebar: [
			{
				title: 'JS',   // 必要的
				path: '/js/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
				collapsable: false, // 可选的, 默认值是 true,
				sidebarDepth: 3,    // 可选的, 默认值是 1
				children: [
				  'js/one',
					'js/two'
				]
			},
		]
	}
}