var menuBtn = $('.menu-btn');
var topBar = $('.top-bar');
var middleBar = $('.middle-bar');
var bottomBar = $('.bottom-bar');
var menu = $('.dl-menu');
var menuCategory = $('.dl-menu .category');
var submenu = $('.dl-submenu');

$(document).ready(function(){
    openMenu();
    openSubMenu();
    closeSubMenu();
});

function openMenu() {
    menuBtn.click(function(){
        if(!topBar.hasClass('top-bar-arrow')) {
            topBar.toggleClass('top-bar-close');
            middleBar.toggleClass('middle-bar-close');
            bottomBar.toggleClass('bottom-bar-close');
            menu.toggle('fast');
        }
    });
}
function openSubMenu() {
    menuCategory.click(function(){
        submenu.hide('fast');
        $('.dl-menu>li').hide(); /*DO POPRAWY*/
        $(this).show();
        $(this).find(submenu).show();
        topBar.addClass('top-bar-arrow');
        middleBar.addClass('middle-bar-arrow');
        bottomBar.addClass('bottom-bar-arrow');
    });
}
function closeSubMenu() {
    menuBtn.click(function(){
        if(topBar.hasClass('top-bar-arrow')) {
            submenu.hide();
            topBar.removeClass('top-bar-arrow');
            middleBar.removeClass('middle-bar-arrow');
            bottomBar.removeClass('bottom-bar-arrow');
            $('.dl-menu>li').show();
        }
    });
}