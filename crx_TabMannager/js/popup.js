/*
tab 数据示例：

	active: false
	audible: false
	autoDiscardable: true
	discarded: false
	favIconUrl: "https://one.in.zhihu.com/favicon.png"
	groupId: -1
	height: 764
	highlighted: false
	id: 400674040
	incognito: false
	index: 0
	mutedInfo: {
		muted: false
	}
	pinned: false
	selected: false
	status: "complete"
	title: "工作台"
	url:"https://one.in.zhihu.com/dashboard"
	width: 1440
	windowId: 400673936
	
*/

// 获取最近关闭的标签页
// chrome.sessions.getRecentlyClosed({
// 	maxResults: 20,
// }, function(data) {
// 	console.log('-------')
// 	console.log(data)
// })

// 中\英 语言配置
const localMessages = {
	'zh': {
		'popupTitle': '当前打开的标签页',
		'searchPlaceholder': '搜索标签页',
		'opBtnText': '批量操作',
		'delAllBtnText': '一键关闭',
		'cancleBtnText': '取消',
		'listNoDataText': '暂无标签页数据',
	},
	'en': {
		'popupTitle': 'Current Tab List',
		'searchPlaceholder': 'search',
		'opBtnText': 'Batch Operation',
		'delAllBtnText': 'Close all of the choices',
		'cancleBtnText': 'Cancle',
		'listNoDataText': 'No Tab Data',
	}
}

// 判断语言环境
const len = chrome.i18n.getUILanguage()
const localConfig = len === 'zh-CN' ? localMessages['zh'] : localMessages['en']

// 根据语言环境，设置页面中的固定文案
$('.popupTitle').html(localConfig.popupTitle + '：')
$('#searchInput').attr('placeholder', localConfig.searchPlaceholder)
$('.opBtn').html(localConfig.opBtnText)
$('.delAllTabsBtn').html(localConfig.delAllBtnText)
$('.cancleBtn').html(localConfig.cancleBtnText)


let windowTabsData = [] // 当前浏览器所有标签页数据
let listTabsData = []   // 当前列表展示的标签数据
let checkedTabIds = []  // 已选中的标签id

// 获取指定 tab 数据
function getTabDataById(list, tabId) {
	if (!list || !tabId) {
		return
	}
	return list.find(item => item.id === tabId)
}

// 添加 tab 数据
function addTabData(list=[], tab) {
	if (!tab) {
		return
	}
	list.push(tab)
	return list
}

// 删除 tab 数据
function delTabData(list, tabId) {
	if (!list || !tabId) {
		return
	}
	list = list.filter(item=> item.id !== tabId && item !== tabId)
	return list
}

// 页面初始化
chrome.tabs.query({currentWindow: true}, function(tabs){
	windowTabsData = tabs || []
	buildList(tabs)
});

// 生成列表
function buildList(tabs) {
	listTabsData = tabs || [] // 保存当前展示的列表数据
	let html = ''
	if (tabs&&tabs.length) {
		html += '<div class="list">'
		tabs.forEach(tab => {
			const activeCls = tab.active ? 'listItem_active' : ''
			const logoDom = tab.favIconUrl ? `<img class="logo" src="${tab.favIconUrl}" />` : '<svg class="logo" viewBox="64 64 896 896" focusable="false" data-icon="chrome" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M371.8 512c0 77.5 62.7 140.2 140.2 140.2S652.2 589.5 652.2 512 589.5 371.8 512 371.8 371.8 434.4 371.8 512zM900 362.4l-234.3 12.1c63.6 74.3 64.6 181.5 11.1 263.7l-188 289.2c78 4.2 158.4-12.9 231.2-55.2 180-104 253-322.1 180-509.8zM320.3 591.9L163.8 284.1A415.35 415.35 0 0096 512c0 208 152.3 380.3 351.4 410.8l106.9-209.4c-96.6 18.2-189.9-34.8-234-121.5zm218.5-285.5l344.4 18.1C848 254.7 792.6 194 719.8 151.7 653.9 113.6 581.5 95.5 510.5 96c-122.5.5-242.2 55.2-322.1 154.5l128.2 196.9c32-91.9 124.8-146.7 222.2-141z"></path></svg>'
			html += `<div class="listItem alignItemCenterFlex cursorPointer ${activeCls}" data-id="${tab.id}">
						<input class="checkbox listCheckBox cursorPointer" type="checkbox" value="${tab.id}"  data-id="${tab.id}">
						<div class="hrefContent alignItemCenterFlex" data-id="${tab.id}">
							${logoDom}
							<div>${tab.title}</div>
						</div>
						<span class="delBtn cursorPointer" data-id="${tab.id}">
							<svg viewBox="64 64 896 896" focusable="false" data-icon="delete" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M864 256H736v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zm-200 0H360v-72h304v72z"></path></svg>
						</span>
					 </div>`
		})
		html += '</div>'
	} else {
		html += `<div class="listNoData">${localConfig.listNoDataText}</div>`
	}
	$('#listContainer').html(html)
	
	// 跳转到标签页
	$('.hrefContent').off().on('click', function(e){
		let tabId = $(this).attr('data-id')
		tabId = Number(tabId)
		chrome.tabs.update(tabId, {active: true})
	})
	
	// 删除标签
	$('.delBtn').off().on('click', function(e){
		let tabId = $(this).attr('data-id')
		tabId = Number(tabId)
		closeTabs([tabId]) // 移除标签页
		updateDeletedData(tabId) // 更新各种数据
	})
	
	// 列表中的复选框
	$('.listCheckBox').off().on('click', function(e) {
		let tabId = $(this).val()
		tabId = Number(tabId)
		if ($(this).prop('checked')) {
			checkedTabIds = addTabData(checkedTabIds, tabId)
		} else {
			checkedTabIds = delTabData(checkedTabIds, tabId)
		}
		
		updateDelAllBtnState() // 更新「关闭所选标签页」按钮状态
	})
	
	// footer 中的复选框
	$('.operationCheckBox').off().on('click', function(e) {
		if ($(this).hasClass('disabled')) {
			return
		}
		if ($(this).prop('checked')) {
			checkedTabIds = listTabsData.map(item => item.id) // 仅全选当前展示列表的数据（可能时搜素的部分数据）
			$('.listCheckBox').prop('checked', true)
		} else {
			checkedTabIds = []
			$('.listCheckBox').prop('checked', false)
		}
		
		updateDelAllBtnState()
	})
}

// 点击 「批量操作」按钮
$('.opBtn').on('click', function(){
	$(this).hide()
	$('.checkbox').show()
	$('.delBox').show()
})
// 取消（取消批量操作）
$('.cancleBtn').on('click', function(){
	$('.checkbox').hide().prop('checked', false)
	$('.delBox').hide()
	$('.opBtn').show()
	checkedTabIds = []
	$('.delAllTabsBtn').addClass('disabled')
})

// 搜索
function search() {
	let val = $('#searchInput').val()
	let tabs = windowTabsData
	if (val && val.trim()) {
		tabs = windowTabsData.filter(tab=> tab?.title?.includes(val) || tab?.url?.includes(val))
	}
	buildList(tabs)
}
$('#searchInput').on('input', function(){
	search()
})
$('#searchIcon').on('click', function(){
	search()
})

// 更新「关闭所选标签页」按钮状态
function updateDelAllBtnState() {
	if (checkedTabIds && checkedTabIds.length) {
		$('.operationCheckBox').prop('checked', true)
		$('.delAllTabsBtn').removeClass('disabled')
	} else {
		$('.operationCheckBox').prop('checked', false)
		$('.delAllTabsBtn').addClass('disabled')
	}
}

// 「关闭所选标签页」按钮点击
$('.delAllTabsBtn').on('click', function(){
	if ($(this).hasClass('disabled')) {
		return
	}
	
	closeTabs(checkedTabIds)
	
	let arr = [].concat(checkedTabIds)
	arr.forEach(tabId => {
		updateDeletedData(tabId) // 更新各种数据
	})
})

/*
  关闭某标签页时，更新后续相关数据：
  
  1、删除 windowTabsData 里的对应数据
  2、删除 listTabsData 里的对应数据
  3、删除 checkedTabIds 里的对应数据(如果已勾选)
  3、删除列表dom listItem
*/ 
function updateDeletedData(tabId) {
	if (!tabId) {
		return
	}
	windowTabsData = delTabData(windowTabsData, tabId)
	listTabsData = delTabData(listTabsData, tabId)
	
	if ($(`.checkbox[data-id=${tabId}]`).prop('checked')) {
		checkedTabIds = delTabData(checkedTabIds, tabId)
		updateDelAllBtnState() // 更新「关闭所选标签页」按钮状态
	}
	
	$(`.listItem[data-id=${tabId}]`).remove()
}

// 关闭指定标签页
function closeTabs(tabIds) {
	if (!tabIds) {
		return
	}
	
	// 直接关闭所有标签页，会导致浏览器直接关闭，这里先创建一个新标签页，然后再把旧的全部关闭
	if (tabIds.length >= windowTabsData.length) {
		chrome.tabs.create({active: true})
	}
	
	chrome.tabs.remove(tabIds)
}

// 监听页面滚动，给 header 增加下边框阴影
$(window).scroll(function(){
	if ($(window).scrollTop() > 5) {
		$('#header').addClass('shadowBorder')
	} else {
		$('#header').removeClass('shadowBorder')
	}
})