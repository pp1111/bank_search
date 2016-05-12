var menuBtn = $('.menu-btn');
var topBar = $('.top-bar');
var middleBar = $('.middle-bar');
var bottomBar = $('.bottom-bar');
var menu = $('.dl-menu');

$(document).ready(function(){
    openMenu();
});

function openMenu() {
    menuBtn.click(function(){
        topBar.toggleClass('top-bar-close');
        middleBar.toggleClass('middle-bar-close');
        bottomBar.toggleClass('bottom-bar-close');
        menu.toggle();
    });
}