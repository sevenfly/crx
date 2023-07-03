let allBookmark = [];

let getFavicon = {
  getUrlHost(url) {
    const domain = url.split("/");
    return domain[2];
  },
  getIcon(host) {
    return "http://beneficial-rose-seahorse.faviconkit.com/" + host;
  },
};

//初始化
function init() {
  chrome.bookmarks.getSubTree("0", function (bookmarkArray) {
    console.log(bookmarkArray);
    initList(bookmarkArray[0].children[0].children);
  });
}
//循环数组
function eachDom(data) {
  let html = "";
  $.each(data, function (i, val) {
    html += initDom(val);
  });
  return html;
}
//拼接dom
function initDom(data) {
  let html = "";
  if (data.children) {
    html += `<li><div class='title'><img class='logo' src='../img/icon_folder.png'}/>${
      data.title
    }</div>
		<ul>${eachDom(data.children)}</ul></li>
	`;
  } else {
    allBookmark.push(data);
    let favicon = getFavicon.getIcon(getFavicon.getUrlHost(data.url));
    html += `
		<li class='list' id='bookmark_${data.id}' data-url='${data.url}'><img class='logo' src=${favicon}/>${data.title}</li>
	`;
  }
  return html;
}
//加载列表
function initList(data) {
  console.log(data);
  let html = "";
  $.each(data, function (i, val) {
    console.log(i, val);
    html += initDom(val);
  });
  $("#listContainer").append(html);
  bindEvent();
}
//event
function bindEvent() {
  $("#searchIpt").on("keydown", function (e) {
    var theEvent = e || window.event;
    var code = theEvent.keyCode || theEvent.which || theEvent.charCode;
    if (code == 13) {
      search();
    }
  });
  $(".list").on("click", function () {
    console.log($(this).data("url"));
    chrome.tabs.create({ url: $(this).data("url") });
  });
  // 搜索
  function search() {
    $(".list").removeClass("searchOne");
    let val = $("#searchIpt").val();
    console.log(val, val.trim());
    let curSearch = "";
    if (val && val.trim()) {
      curSearch = allBookmark.filter(
        (item) => item.title.includes(val) || item.url.includes(val)
      );
    }
    console.log(curSearch);
    if (curSearch.length) {
      $.each(curSearch, function (i, val) {
        $("#bookmark_" + curSearch[i].id).addClass("searchOne");
      });
      let dom = document.querySelector("#bookmark_" + curSearch[0].id);

      // document
      //   .querySelector("#bookmark_" + curSearch[0].id)
      //   .scrollIntoView({ behavior: "smooth" });
      //$("#bookmark_" + curSearch[0].id).scrollTop(80);
      //$("html,body").scrollTop(dom.getBoundingClientRect().top + "px");
      $("html,body").animate({
        scrollTop: $("#bookmark_" + curSearch[0].id).offset().top - 120,
      });
    } else {
      console.log("搜索不到");
    }
  }
}

init();
