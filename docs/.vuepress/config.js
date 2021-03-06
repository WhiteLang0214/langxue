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
		lastUpdated: '更新时间',
		nav: [ // 导航栏配置
			{ text: 'js', link: '/js/' },
			{ text: '算法题库', link: '/algorithm/' },
			{ text: '微博', link: 'https://baidu.com', target: '_blank' }
		],
		sidebar: [
			{
				title: 'VUE3',   // 必要的
				path: '/vue3/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
				collapsable: true, // 可选的, 默认值是 true,
				sidebarDepth: 3,    // 可选的, 默认值是 1
				children: [
					'vue3/optimize.md',
					'vue3/globalAPI.md'
				]
			},
			{
				title: 'REACT',   // 必要的
				path: '/react/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
				collapsable: true, // 可选的, 默认值是 true,
				sidebarDepth: 6,    // 可选的, 默认值是 1
				children: [
					'',
					'react/vdom.md',
					// 'react/xml',
					'react/jsx.md',
					'react/module.md',
					'react/component.md',
					'react/state.md',
					'react/props.md',
					'react/refs.md',
					'react/form.md',
					'react/func.md',
					'react/life.md',
					'react/cli.md'
				]
			},
			{
				title: 'JS',   // 必要的
				path: '/js/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
				collapsable: true, // 可选的, 默认值是 true,
				sidebarDepth: 3,    // 可选的, 默认值是 1
				children: [
					'js/one.md',
					'js/two.md'
				]
			},
			{
				title: 'GIT',   // 必要的
				path: '/git/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
				collapsable: true, // 可选的, 默认值是 true,
				sidebarDepth: 1,    // 可选的, 默认值是 1
			},
			{
				title: 'Node',   // 必要的
				path: '/node/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
				collapsable: true, // 可选的, 默认值是 true,
				sidebarDepth: 3,    // 可选的, 默认值是 1
				children: [
					'node/base.md',
					'node/eventEmitter.md',
					'node/buffer.md',
					'node/stream.md'
				]
			},
			{
				title: 'ESLINT',   // 必要的
				path: '/eslint/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
				collapsable: true, // 可选的, 默认值是 true,
				sidebarDepth: 1,    // 可选的, 默认值是 1
			},
			{
				title: '性能优化',   // 必要的
				path: '/optimize/',      // 可选的, 标题的跳转链接，应为绝对路径且必须存在
				collapsable: true, // 可选的, 默认值是 true,
				sidebarDepth: 1,    // 可选的, 默认值是 1
			},
		]
	}
}