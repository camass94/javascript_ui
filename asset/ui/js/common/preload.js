function initLazy(){
    var lazyElements = document.querySelectorAll("img[data-preload]");

    for(var idx=0;idx<lazyElements.length;idx++){
		if(lazyElements[idx].getAttribute('data-preload') == 'false'){
            lazyElements[idx].setAttribute('data-original',lazyElements[idx].src);
			lazyElements[idx].removeAttribute('data-preload');
			lazyElements[idx].src='/lg4-common-gp/img/placeholder.gif';
			lazyElements[idx].className += " lazy";
        }
    }
}
var lazyIntv = setInterval(initLazy,10);
window.onload = function(){
    clearInterval(lazyIntv);
    initLazy();
}