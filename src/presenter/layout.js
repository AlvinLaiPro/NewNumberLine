function winSize() {
    var t = 0
      , e = 0;
    return document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth && (t = document.documentElement.clientWidth,
    e = document.documentElement.clientHeight),
    {
        width: t,
        height: e
    }
}
function getRatio() {
    var t = winSize();
    return t.width / t.height > 1920 / 1080 ? t.height / 1080 : t.width / 1920
}
function layoutReset() {
    var t = (document.getElementById("wrapper"),
    document.getElementById("layout"))
      , e = 1920
      , n = 1080
      , i = 24
      , o = function() {
        var o, d = window.layoutResetHandles, h = winSize(), u = 0, w = h.width, l = h.height;
        if (h.width / h.height <= e / n ? (u = h.width / e * i,
        w = h.width < e ? h.width : e,
        l = n * w / e,
        h.height > l) : (u = h.height / n * i,
        l = h.height < n ? h.height : n,
        w = e * l / n),
        t.style.fontSize = u + "px",
        d)
            for (o in d)
                d[o]()
    };
    o(),
    window.onresize = function() {
        o()
    }
}
window.onload = function() {
    layoutReset()
}
,
window.onLayoutReset = function(t) {
    window.layoutResetHandles || (window.layoutResetHandles = []),
    window.layoutResetHandles.push(t)
}
;