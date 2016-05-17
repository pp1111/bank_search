var menuBtn = $('.menu-btn');
var topBar = $('.top-bar');
var middleBar = $('.middle-bar');
var bottomBar = $('.bottom-bar');
var menu = $('.dl-menu');
var menuCategory = $('.dl-menu>.category');
var submenu = $('.dl-submenu');
var searchIcon = $('.search svg');
var search = $('.search');
var dimness = $('.dimness');

$(document).ready(function(){
    openMenu();
    openSubMenu();
    closeSubMenu();
    clickSearch();
    closeNav();
    hideProductInfoText();
    toggleMoreProductInfo();
});

function menuBtnChange() {
    topBar.toggleClass('top-bar-close');
    middleBar.toggleClass('middle-bar-close');
    bottomBar.toggleClass('bottom-bar-close');
}

function openMenu() {
    menuBtn.click(function(){
        if(!topBar.hasClass('top-bar-arrow')) {
            if(!topBar.hasClass('top-bar-close')) {
                menuBtnChange();
                menu.slideDown();
                dimness.addClass('dimness-visible');
            }
            else {
                menuBtnChange();
                menu.slideUp();
                dimness.removeClass('dimness-visible');
            }
            search.removeClass('search-clicked');
            $('.search form').hide();
        }
    });
}
function openSubMenu() {
    menuCategory.click(function(){
        //submenu.slideUp();
        //$('.dl-menu>li').hide(); //do poprawy (kliknięcie w otwartą kategorię zamyka ją)
        //$(this).show();
        $(this).find(submenu).slideToggle();
        topBar.addClass('top-bar-arrow');
        middleBar.addClass('middle-bar-arrow');
        bottomBar.addClass('bottom-bar-arrow');
    });
}
function closeSubMenu() {
    menuBtn.click(function(){
        if(topBar.hasClass('top-bar-arrow')) {
            submenu.slideUp();
            topBar.removeClass('top-bar-arrow');
            middleBar.removeClass('middle-bar-arrow');
            bottomBar.removeClass('bottom-bar-arrow');
            $('.dl-menu>li').show();
        }
    });
}

function clickSearch() {
    searchIcon.click(function() {
        search.addClass('search-clicked');
        dimness.addClass('dimness-visible');
        $('.search form').show();
        $('input[name="search"]').focus();
        menu.hide();
    });
}

function closeNav() {
    dimness.click(function() {
        search.removeClass('search-clicked');
        $('.search form').hide();
        dimness.removeClass('dimness-visible');
        menu.slideUp();
        submenu.slideUp();
        topBar.removeClass('top-bar-close');
        middleBar.removeClass('middle-bar-close');
        bottomBar.removeClass('bottom-bar-close');
        topBar.removeClass('top-bar-arrow');
        middleBar.removeClass('middle-bar-arrow');
        bottomBar.removeClass('bottom-bar-arrow');
    });
}

function hideProductInfoText() {
    var element = $('.single-product>.info');
    var characterLimit = 300;
    var str = element.html();
    var lessStr = str.substr(0,characterLimit);
    str = lessStr + ' <div class="more-btn">Więcej...</div>' + '<span class="hide">' + str.substr(characterLimit,str.length) + '</span>';
    element.html(str);
}

function toggleMoreProductInfo() {
    var moreBtn = $('.single-product .info .more-btn');
    var closeBtn = $('.show-product .close-btn');
    moreBtn.click(function() {
        if(!$('.show-product').hasClass('active')) {
            $('.show-product').addClass('active');
        }
    });
    closeBtn.click(function(){
        if($('.show-product').hasClass('active')) {
            $('.show-product').removeClass('active');
        }
    });
}