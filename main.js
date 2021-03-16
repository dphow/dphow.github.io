var browser = function() {
    var a = navigator.appName,
        b = navigator.userAgent,
        d, c = b.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
    c && null != (d = b.match(/version\/([\.\d]+)/i)) && (c[2] = d[1]);
    return c = c ? [c[1], c[2]] : [a, navigator.appVersion, "-?"]
}();
jQuery.fn.redraw = function() {
    return this.hide(0, function() {
        $(this).show()
    })
};

var gui = true,
	menDown = false,
    menUp = true,
    clicksEnabled = false,
    apiInfoActive = false,
    aboutOpen = false,
    redditThumb = "",
    backImageNotYetLoaded = true,
	backGifNotYetLoaded = true,
    infoActive = false,
    quote = false,
	nicknameOn = false,
	footerSelector = "#redditbox,#status,#apis,#randomQuote,#trackerGlobe",
    menuItems = document.querySelectorAll(".menu_item"),
    projectsPane = false,
    currProjIndex = 0,
    projectsLength = document.querySelectorAll(".projectsElement").length;

function toggleGUI() {
	if (gui) {
		blurBackground(false);
		$(".container").hide();
		$("#hideAll a").html("Show All");
		gui = false;
	} else {
		blurBackground(projectsPane);
		$(".container").show();
		$("#hideAll a").html("Hide All");
		gui = true;
	}
}

var gifData = "";
var imgData = "";
var randIndex = -1;
function fillBackground(gif) {
	$("#redditboxContent").html('<img id="redditLogo"src="css/icons/loader.gif"/>');
	randIndex = -1;
	if (backImageNotYetLoaded) {
		var p1 = $.getJSON("https://www.reddit.com/r/EarthPorn/.json?jsonp=?", function(data) {
			imgData = data;
			backImageNotYetLoaded = false;
			if (!gif) {
				readData(gif);
			}
		});
		setTimeout(function(){ 
			p1.abort();
			if (randIndex == -1) {
				console.log("Timeout on reddit background image get.");
			}
		}, 3000);	
	} else if (!gif) {
		readData(gif);
	}

	if (backGifNotYetLoaded && gif) {
		var p2 = $.getJSON("https://www.reddit.com/r/EarthPornGifs/.json?jsonp=?", function(data) {
			gifData = data;
			backGifNotYetLoaded = false;
			if (gif) {
				readData(gif);
			}
		});
		setTimeout(function(){ 
			p2.abort();
			if (randIndex == -1) {
				console.log("Timeout on reddit background gif get.");
			}
		}, 3000);
	} else if (gif) {
		readData(gif);
	}
}

function readData (gif) {
	var allData;
	if (gif) {
		allData = gifData;
	} else {
		allData = imgData;
	}
	
	var picData;
	while (randIndex < 0 || picData.locked || !(picData.url.match(".gif") || picData.url.match(".jp"))) {
		randIndex = Math.floor(Math.random() * allData.data.children.length);
		picData = allData.data.children[randIndex].data;
	}
	
	var siteURL = picData.url;
	if (siteURL.match(".gifv")) {
		siteURL = siteURL.substr(0,siteURL.length-1);
	}
	redditThumb = picData.thumbnail;
	$("#drawCover").fadeTo(750, 0, function() {
		$("#drawCover").attr("title", picData.title);
		$("#drawCover").css("background", "url(" + siteURL + ") no-repeat center center fixed").css("background-size", "cover").fadeTo(750, 1);
		$("#redditboxContent").html('Images courtesy of <a title="Link to reddit Page" target="_blank"href=https://www.reddit.com' + 
			picData.permalink + '"><img id="redditLogo"src="css/icons/redditLogo.png" height=30/></a>');
		if (!gif) {
		hueViaKMeans();
		}
	});
	
}

$(".first, .dash, #projects").mouseleave(upMenu);
$(".first, .dash, #projects").mouseenter(dropMenu);
$(document).ready(function() {
    var $body = $('body');
    var detectMouse = function(e){
        if (e.type === 'mousedown') {
        }
        else if (e.type === 'touchstart') {
            $(".dash")[0].classList.add("menDown")
			$(".first, .dash").unbind();
        }
        // remove event bindings, so it only runs once
        $body.off('mousedown touchstart', detectMouse);
    }
    // attach both events to body
    $body.on('mousedown touchstart', detectMouse);
});

function dropMenu() {
    menDown || ($(".dash")[0].classList.add("menDown"), menUp = false);
	menDown = true;
}

function upMenu() {
    menUp || ($(".dash")[0].classList.remove("menDown"), menDown = false)
	menUp = true;
}

$("#apis").click(toggleAPIInfo);

$("#status").hover(function() {
    setTimeout(function() {
        document.querySelector("#status:hover") && $("#date_time").html(dateString())
    }, 250)
}, function() {
    $("#date_time").html("")
});
$("#status").on("mouseenter", "#dateString", function() {
    var a = new Date;
    $("#infoboxInlay p").load("http://numbersapi.com/" + (a.getMonth() + 1) + "/" + a.getDate() + "/date");
    $("#infobox").fadeTo(300, 1)
});
$("#status").on("mouseleave", "#dateString", function() {
    $("#infobox").fadeTo(300, 0)
});
$("#status").on("mouseenter", ".timeString", function() {
    $("#infoboxInlay p").load("http://numbersapi.com/" + this.innerHTML + "/math");
    $("#infobox").fadeTo(300, 1)
});
$("#status").on("mouseleave", ".timeString", function() {
    $("#infobox").fadeTo(300, 0)
});
$("#fb, #email, #linkedin").click(function () {
	$(".menu_open").addClass("menu_closed").removeClass("menu_open");
	$(this).addClass("menu_open");
	$("#linkedin").css("background-position","50% 0%");
	console.log($(this).css("background-position"));
	if ($(this).css("background-position") == "50% 0%") {
		$("#linkedin").css("background-position","80% 0%");
	}
});

function dateString() {
    var a = new Date;
    return '<span class="timeString">' + a.getHours() + '</span>:<span class="timeString">' + (9 < a.getMinutes() ? a.getMinutes() : "0" + a.getMinutes()) + '</span><br><span id="dateString">' + (a.getMonth() + 1) + "|" + a.getDate() + "|" + a.getFullYear() % 2E3 + "</span>"
}

function quoteToggle() {
	if (quote) {
		$("#randomeQuote").fadeTo(250, 0, function() {
			$(this).css("display", "none");
		});
    } else {
		newQuote();
		$("#randomeQuote").css("display", "block").fadeTo(500, 0.8);
	}
    quote = !quote;
}

function newQuote() {
	var p = $.getJSON("https://api.forismatic.com/api/1.0/?method=getQuote&lang=en&format=jsonp&jsonp=?", function(data) {
		$("#quote").html(data.quoteText + "<br>***" + data.quoteAuthor + "***");
	});
	setTimeout(function(){
		p.abort();
	}, 3000);
}

function expandFirst() {
	$("#h,#o,#w,#qr,#that,#how").animate({
        marginLeft: "+=30vmin"
    }, 1e3);
    $("#d,#head,#cover").animate({
        marginLeft: "-=30vmin"
    }, 1e3);
    $("#a").animate({
        marginLeft: "-=18vmin"
    }, 1e3);
    $("#n").animate({
        marginLeft: "-=6vmin"
    }, 1e3);
	$("#i").animate({
        marginLeft: "+=6vmin"
    }, 1e3);
    $("#e").animate({
        marginLeft: "+=18vmin"
    }, 1e3);
	$("#l").animate({
        marginLeft: "+=30vmin"
    }, 1e3, expandLast);
}

function expandLast() {
	$("#head,#cover").animate({
        marginLeft: "-=12vmin"
    }, 1e3);
    $(".letter").animate({
        marginLeft: "-=0vmin"
    }, 1e3);
    $("#o,#w,#qr,#that,#how").animate({
        marginLeft: "+=12vmin"
    }, 1e3);
	$("#h").animate({
        marginLeft: "+=12vmin"
    }, 1e3, function() {
		if (backImageNotYetLoaded) {
			fillBackground(false); //false loads image, true loads gif
			quoteToggle();
		}
		$(".dash").css({
            opacity: 1
        });
        $("#head").flip({trigger: "manual", front: ".headFront", back: ".headBack", speed: 1e3});
        $(".headFront").css("margin-top","-12vmin");
		lockClicks(false);
		showFooters(true);
		$(".letterTiles").click(toggleNickname);
		$("#qr").click(function() {
			window.open("https://www.youtube.com/watch?v=vDxrW-9lY7w","_blank").focus();
		});
	});
}

function toggleNickname() {
	lockClicks(true);
	if (infoActive) {
		toggleInfo();
	}
	if (nicknameOn) {
		$("#head").flip(false);
		$("#h").animate({
			marginLeft: "+=60vmin"
		}, 1e3);
		$("#o").animate({
			marginLeft: "+=48vmin"
		}, 1e3);
		$("#w").animate({
			marginLeft: "+=36vmin"
		}, 1e3);
		$("#qr").animate({
			marginLeft: "+=24vmin"
		}, 1e3);
		$("#that").animate({
			marginLeft: "+=12vmin"
		}, 1e3, function() {
			$("#h,#o,#w,#qr,#that,#how").css("z-index", "auto");
			nicknameOn = false;
			lockClicks(false);
		});
	} else {
		$("#head").flip(true);
		$("#h,#o,#w,#qr,#that,#how").css("z-index", 1);
		$("#h").animate({
			marginLeft: "-=60vmin"
		}, 1e3);
		$("#o").animate({
			marginLeft: "-=48vmin"
		}, 1e3);
		$("#w").animate({
			marginLeft: "-=36vmin"
		}, 1e3);
		$("#qr").animate({
			marginLeft: "-=24vmin"
		}, 1e3);
		$("#that").animate({
			marginLeft: "-=12vmin"
		}, 1e3, function() {
			nicknameOn = true;
			lockClicks(false);
		});
	}
}

function toggleAbout() {
    aboutOpen ? ($(".letterTiles").css({
        "pointer-events": "auto"
    }), $(".about").css({
        "pointer-events": "none"
    }), $(".letterTiles").css("transform", "rotateX(0deg)"), 
	$(".about").css("transform", "rotateX(-90deg)"), 
	document.querySelector("ul:first-child").style.backgroundColor = "transparent", 
	aboutOpen = false) 
	: ($(".letterTiles").css({
        "pointer-events": "none"
    }), $(".about").css({
        "pointer-events": "auto"
    }), infoActive && toggleInfo(), 
	$(".letterTiles").css("transform", "rotateX(90deg)"), 
	$(".about").css("transform", "rotateX(0deg)"), 
	document.querySelector("ul:first-child").style.backgroundColor = "#FF0000", 
	aboutOpen = true)
}

function toggleInfo() {
	if (nicknameOn) {
		toggleNickname();
	}
    infoActive ? ($("#i").css({
        "box-shadow": "none",
		"transform-origin": "right",
        "transform": "rotateY(0deg)",
		"cursor": "pointer"
    }),
	$("#menu_container").css("display", "none"),
	$("#info").animate({
        width: "0vmin"
    }, 500, function() {
        $("#d,#a,#n").css("z-index", "auto");
    }),  
	document.querySelector("ul:nth-child(2)").style.backgroundColor = "", 
	infoActive = false) 
	: ((aboutOpen ? toggleAbout() : 0),
	$("#d,#a,#n").css("z-index", -1),
	$("#i").css({
        "box-shadow": "-1vmin 0vmin 1vmin #000000",
		"transform-origin": "right",
        "transform": "rotateY(25deg)",
		"cursor": "pointer"
    }),
	$("#info").animate({
        "width": "42vmin"
    }, 500, function() {
		$("#menu_container").css("display", "block")
	}),
	document.querySelector("ul:nth-child(2)").style.backgroundColor = "#F00", 
	infoActive = true)
}

function createMailtoLinks(){
    $('A[data-u][href=""]').each(function(){
        var i = $(this);
        i.attr('href', 'mai'+'lto:'+i.data('u')+'@'+i.data('d'));
        if (i.html()==''){ i.html(i.data('u')+'@'+i.data('d')); }
    }); 
}

function toggleAPIInfo() {
    apiInfoActive ? ($("#apisInfo").fadeTo(150, 0, function() {
        $(this).css("display", "none")
    }),
	$("#apisInfo p").addClass("back").removeClass("mid"), 
	apiInfoActive = false) 
	: ($("#apisInfo").css("display", "inline").fadeTo(150, 1),
	$("#apisInfo p").addClass("mid").removeClass("back"), 
	apiInfoActive = true)
}

function openMap() {
	var title = "Travel and places you may know me from.";
	$("#modal-title").html(title);
	//document.querySelector("ul:nth-child(5)").style.backgroundColor = "#F00";
	$("#modal-content").html('<iframe src="https://www.google.com/maps/d/u/0/embed?mid=1Fiu_6cYbtzj2S7wT6A0L7axEMng" width="99%" height="90%" frameborder="0" style="border:0"></iframe>');
	$("#modal").css("display","block");
}

function openSchedule() {
	var title = `<strong>My Calendar</strong> <br> 
				 Schedule <a href=\"https://calendly.com/ucar-dhoward/15min\" target=\"_blank\">15</a>/
				 		<a href=\"https://calendly.com/ucar-dhoward/30min\" target=\"_blank\">30</a>/
				 		<a href=\"https://calendly.com/ucar-dhoward/60min\" target=\"_blank\">60</a> minute meeting with me`;
	//document.querySelector("ul:nth-child(6)").style.backgroundColor = "#F00";
	$("#modal-title").html(title);
	$("#modal-content").load("publicCalendar.html");
	$("#modal").css("display","block");
}

var research = $("#modal-content").html();
function openResearch() {
	$("#modal-title").html("Daniel Howard's Research Interests");
	//document.querySelector("ul:nth-child(4)").style.backgroundColor = "#F00";
	$("#modal-content").html(research);
	$("#modal").css("display","block");
}

function openResume() {
	$("#modal-title").html("Last Updated: ");
	var key = "AIzaSyDlUs1fHWB2A_-up3aN7Wffa8VxifUi0jM";
	var fileId = "1hu8cshqy54vM8L_vyyWOyENE08HVCn_c";
	var url = "https://www.googleapis.com/drive/v3/files/" + fileId + 
				"?fields=modifiedTime&key=" + key;
	//document.querySelector("ul:nth-child(7)").style.backgroundColor = "#F00";			
	var p = $.getJSON(url, function(data) {
		$("#modal-title").append(data.modifiedTime.substr(0,data.modifiedTime.indexOf("T")));
	});
	$("#modal-content").html('<iframe src="https://docs.google.com/viewer?srcid=1hu8cshqy54vM8L_vyyWOyENE08HVCn_c&pid=explorer&efh=false&a=v&chrome=false&embedded=true" width="99%" height="90%" frameborder="0" scrolling="no"></iframe>');
	$("#modal").css("display","block");
}

function openCV() {
	$("#modal-title").html("Last Updated: ");
	var key = "AIzaSyDlUs1fHWB2A_-up3aN7Wffa8VxifUi0jM";
	var fileId = "1IL9_CMhr7T2ozE1BJdAuxedwWZd7YnZb";
	var url = "https://www.googleapis.com/drive/v3/files/" + fileId + 
				"?fields=modifiedTime&key=" + key;
	//document.querySelector("ul:nth-child(7)").style.backgroundColor = "#F00";			
	var p = $.getJSON(url, function(data) {
		$("#modal-title").append(data.modifiedTime.substr(0,data.modifiedTime.indexOf("T")));
	});
	$("#modal-content").html('<iframe src="https://docs.google.com/viewer?srcid=1IL9_CMhr7T2ozE1BJdAuxedwWZd7YnZb&pid=explorer&efh=false&a=v&chrome=false&embedded=true" width="99%" height="90%" frameborder="0" scrolling="no"></iframe>');
	$("#modal").css("display","block");
}

function openFun() {
	var title = "Fun Stuff About Me";
	//document.querySelector("ul:nth-child(6)").style.backgroundColor = "#F00";
	$("#modal-title").html(title);
	$("#modal-content").load("funAbout.html");
	$("#modal").css("display","block");
}

function lockClicks(a) {
    a ? $("#lockClick").css("display", "block") 
	: $("#lockClick").css("display", "none");
    clicksEnabled = !a
}

function showFooters(a) {
    a ? $(footerSelector).css("display", "table") 
	: $(footerSelector).css("display", "none")
}

// K-Means functions - Thank you Kevin Hsiung (kevinhsiung.com)!

function euclidean(a, b) {
    for (var d = 0, c = 0, e = a.length; c < e; c++) d += (a[c] - b[c]) * (a[c] - b[c]);
    return Math.sqrt(d)
}

function calculateCenter(a, b) {
    var d = [];
    if (0 == a.length) return null;
    for (var c = 0; c < b; c++) d.push(0);
    for (var c = 0, e = a.length; c < e; c++)
        for (var f = 0; f < b; f++) d[f] += a[c][f];
    for (c = 0; c < b; c++) d[c] /= a.length;
    return d
}

function getClusterPos(a, b, d) {
    for (var c = 0;;) {
        for (var e = parseInt(Math.random() * a.length), f = false, g = 0; g < b.length; g++)
            if (e == b[g]) {
                f = true;
                break
            }
        if (!f && 10 > c)
            for (g = 0; g < b.length; g++)
                if (30 > euclidean(a[e], d[g][0])) {
                    f = true;
                    break
                }
        c++;
        if (!f) return b.push(e), e
    }
}

function kmeans(a, b, d) {
    for (var c = [], e = []; c.length < b;) {
        var f = getClusterPos(a, e, c);
        c.push([a[f],
            [a[f]]
        ])
    }
    for (e = 0;;) {
        for (var f = [], g = 0; g < b; g++) f.push([]);
        for (var h = 0; h < a.length; h++) {
            for (var k = a[h], m = Number.MAX_VALUE, l = 0, g = 0; g < b; g++) {
                var n = euclidean(k, c[g][0]);
                n < m && (m = n, l = g)
            }
            f[l].push(k)
        }
        h = 0;
        k = true;
        for (g = 0; g < b; g++) l = c[g][0], m = calculateCenter(f[g], 3), null == m ? (assignNewCenter(c, g), k = false) : (l = euclidean(l, m), c[g][0] = m, c[g][1] = f[g], h = h > l ? h : l, h > d && (k = false));
        e++;
        if (k || 75 < e) break
    }
    console.log("Iterations: " + e);
    return c
}

function assignNewCenter(a, b) {
    for (var d = -1, c = -1, e = 0; e < a.length; e++) e != b && a[e][1].length > c && (c = a[e][1].length, d = e);
    for (e = 0;;) {
        for (var c = parseInt(Math.random() * a[d][1].length), f = 0, f = 0; f < a[d][0].length; f++)
            if (a[d][0][f] != a[d][1][c][f]) {
                a[b][0] = a[d][1][c];
                return
            }
        e++;
        if (25 <= e) {
            e = [];
            for (f = 0; f < a[d][0].length; f++) 250 < a[d][1][c][f] ? e.push(a[d][1][c][f] - 5) : e.push(a[d][1][c][f] + 5);
            a[b][0] = e;
            break
        }
    }
}

function rgbToHsv(a, b, d) {
    a /= 255;
    b /= 255;
    d /= 255;
    var c = Math.max(a, b, d),
        e = Math.min(a, b, d),
        f, g = c - e;
    if (c == e) f = 0;
    else {
        switch (c) {
            case a:
                f = (b - d) / g + (b < d ? 6 : 0);
                break;
            case b:
                f = (d - a) / g + 2;
                break;
            case d:
                f = (a - b) / g + 4
        }
        f /= 6
    }
    return [f, 0 == c ? 0 : g / c, c]
}

function hsvToRgb(a, b, d) {
    var c, e, f, g = Math.floor(6 * a),
        h = 6 * a - g;
    a = d * (1 - b);
    var k = d * (1 - h * b);
    b = d * (1 - (1 - h) * b);
    switch (g % 6) {
        case 0:
            c = d;
            e = b;
            f = a;
            break;
        case 1:
            c = k;
            e = d;
            f = a;
            break;
        case 2:
            c = a;
            e = d;
            f = b;
            break;
        case 3:
            c = a;
            e = k;
            f = d;
            break;
        case 4:
            c = b;
            e = a;
            f = d;
            break;
        case 5:
            c = d, e = a, f = k
    }
    return [255 * c, 255 * e, 255 * f]
}

function order(a) {
    for (var b = [], d = 0; d < a.length; d++) b.push(rgbToHsv(a[d][0], a[d][1], a[d][2]));
    b.sort(function(a, b) {
        return (a[1] + a[2]) * (a[1] + a[2]) - (b[1] + b[2]) * (b[1] + b[2])
    });
    return b
}

function rgbToHex(a) {
    a = (parseInt(a[0] << 16) + parseInt(a[1] << 8) + parseInt(a[2])).toString(16);
    return "#000000".substr(0, 7 - a.length) + a
}

function processPalette(a) {
    var b = order(a);
    setTimeout(function() {
        var k = hsvToRgb(b[0][0], b[0][1], b[0][2]);
        $(".back").css("background-color", "rgba(" + parseInt(k[0]) + "," + parseInt(k[1]) + "," + parseInt(k[2]) + ",0.8)");
        $(".mid").css("background-color", a[1].style.backgroundColor);
        $(".accent").css("background-color", a[0].style.backgroundColor)
    }, 500)
}

function hueViaKMeans() {
    if (!backImageNotYetLoaded) {
        var img = new Image();
        img.onload = function() {
            var b = document.getElementById("analyzeBuffer").getContext("2d"),
            d = [];
            b.drawImage(img, 0, 0);
            data = b.getImageData(0, 0, img.width, img.height).data;
            console.log("Data points: " + data.length + "(" + img.width + " x " + img.height + ")");
            for (var b = 0, c = data.length; b < c; b += 4) {
				d.push([data[b], data[b + 1], data[b + 2]]);
			}
            d = kmeans(d, 8, 1);
            c = [];
            for (b = 0; b < d.length; b++) {
				c.push(d[b][0])
			}
			processPalette(c)
		}
		img.onerror = function() {
			console.log("Cannot run k-means on image! Server does not allow anonymous CORS requests.");
		}
		img.crossOrigin = "anonymous";
        img.src = redditThumb;
	}
}

$("#projects").on("click", "#leftProj", function() {
    scrollProj(--currProjIndex)
});
$("#projects").on("click", "#rightProj", function() {
    scrollProj(++currProjIndex)
});
$("#projects").hover(function() {
    $(".projArrow").fadeTo(250, 0.6)
}, function() {
    $(".projArrow").fadeTo(250, 0.2)
}).css("display", "block").fadeTo(300, 1);

function toggleProjects() {
	currProjIndex = 0;
    if (projectsPane) {
        document.querySelector("ul:nth-child(3)").style.backgroundColor = "transparent";
        $("#projectsGalleryInner").css("margin-left","0vmin");
		$("#projects").css("transform", "rotateX(90deg)");
		projectsPane = false;
    } else {
		document.querySelector("ul:nth-child(3)").style.backgroundColor = "#F00";
		$("#projects").css("transform", "rotateX(0deg)");
		projectsPane = true;
	}
	blurBackground(projectsPane);
}

function scrollProj(a) {
    null != currProjIndex && (-1 == a && (a = projectsLength + a), 
	a %= projectsLength, 
	$("#projectsGalleryInner").animate({
        marginLeft: -96 * a + "vmin"
    }, 350), currProjIndex = a)
}

function blurBackground(a) {
	var filterVal = "";
    if (a) {
		filterVal = "blur(5px)";
    } else {
		filterVal = "none";
	}
    $("#drawCover").css("filter", filterVal);
}

function opener() {
    lockClicks(true);
    expandFirst();
	$(function(){
		createMailtoLinks();
	});
}

var modal = document.getElementById("modal");
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
	$("#modal-content").html(research);
  }
}

window.onload = opener;