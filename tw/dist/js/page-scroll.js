/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
/*!******************************************************!*\
  !*** ./templates/new-template/Dev/js/page-scroll.js ***!
  \******************************************************/
function handleScrollAnimation() {
	$('.scroll-animation').each(function (i, v) {
		console.log()
		if (v.getBoundingClientRect().top < window.innerHeight * 0.66) {
			$(v).addClass('on')
		} else {
			//$(v).removeClass('on')
		}
	})
}

window.addEventListener("scroll", function () {
	handleScrollAnimation();
});
/******/ })()
;