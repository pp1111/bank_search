var menuBtn = $('.menu-btn');
var topBar = $('.top-bar');
var middleBar = $('.middle-bar');
var bottomBar = $('.bottom-bar');
var menu = $('.dl-menu-container');
var menuCategory = $('.dl-menu .category-link');
var submenu = $('.dl-submenu');
var searchIconBtn = $('nav .search .svg-btn');
var search = $('nav .search');
var dimness = $('.dimness');
var searchIconNotBtn = $('nav .search .svg-not-btn');
var valueBtn = $('.value button');
var valueInput = $('.value input');


$(document).ready(function(){
    openMenu();
    openSubMenu();
    closeSubMenu();
    clickSearch();
    closeNav();
    //hideProductInfoText();
    toggleMoreProductInfo();
    disableCalcButton();
    productHover();
    ifUiMenuOpen();
});

function productHover() {
    $('.single-product').on('touchend', function (e) {
        var link = $('.show-product');
        if (link.hasClass('hover')) {
            link.removeClass('hover');
        } else {
            link.addClass('hover');
            $('.single-product').not(this).removeClass('hover');
            e.preventDefault();
            return false;
        }
    });
}

function ifUiMenuOpen() {
    if($('.ui-menu').is(':visible')) {
        console.log('works!');
        //$('.search input').addClass('ui-menu-open');
        //$('.search button').addClass('ui-menu-open');
    }
    else {
        console.log('doesnt work :(');
        $('.search').removeClass('ui-menu-open');
    }
}

function setMenuBtn(topBarClass, middleBarClass, bottomBarClass) {
    topBar.addClass(topBarClass);
    middleBar.addClass(middleBarClass);
    bottomBar.addClass(bottomBarClass);
}
function unsetMenuBtn(topBarClass, middleBarClass, bottomBarClass) {
    topBar.removeClass(topBarClass);
    middleBar.removeClass(middleBarClass);
    bottomBar.removeClass(bottomBarClass);
}

function openMenu() {
    menuBtn.click(function(){
        if(!topBar.hasClass('top-bar-arrow')) {
            if(!topBar.hasClass('top-bar-close')) {
                menu.animate({
                    left: 0
                }, 300);
                $('.bar').addClass('bar-open');
                setTimeout(function() { setMenuBtn('top-bar-close', 'middle-bar-close', 'bottom-bar-close');}, 400);
                setTimeout(function() {
                    menuBtn.addClass('menu-btn-open')
                }, 300);
                setTimeout(function() {
                    $('.dl-menu-header h3').show();
                }, 300);
                
            }
            else {
                $('.bar').removeClass('bar-open');
                setTimeout(function() {
                    $('.dl-menu-header h3').hide();
                }, 0);
                setTimeout(function() { unsetMenuBtn('top-bar-close', 'middle-bar-close', 'bottom-bar-close'); }, 100);
                menu.animate({
                    left: '-50%'
                }, 300);
                menuBtn.removeClass('menu-btn-open');
            }
            if( $(window).width() < 425) {
                search.removeClass('search-clicked');
                //$('nav .search form').hide();
                $('nav .search form').removeClass('form-active');
                searchIconBtn.hide();
                searchIconNotBtn.show();
            }
        }
    });
}
function openSubMenu() {
    menuCategory.click(function(){
        if($(this).parent().find(submenu).is(':visible')) {
            $(this).parent().find(submenu).slideUp();
            unsetMenuBtn('top-bar-arrow', 'middle-bar-arrow', 'bottom-bar-arrow')
            setTimeout(function(){
                $('.dl-menu-container .line').removeClass('open');
            }, 200);
            setTimeout(function(){
                $('.dl-menu-container').animate({
                    width: '50%'
                });
            }, 600);
        }
        else {
            $('.dl-menu-container').animate({
                width: '100%'
            });
            var thatSubmenu = $(this).parent().find(submenu);
            submenu.not(thatSubmenu).fadeOut();
            setTimeout(function(){
                thatSubmenu.fadeIn(500);
            }, 850);
            setTimeout(function(){
                $('.dl-menu-container .line').addClass('open');
            }, 500);
            setMenuBtn('top-bar-arrow', 'middle-bar-arrow', 'bottom-bar-arrow')
        }
    });
}
function closeSubMenu() {
    menuBtn.click(function(){
        if(topBar.hasClass('top-bar-arrow')) {
            submenu.slideUp();
            topBar.removeClass('top-bar-arrow');
            middleBar.removeClass('middle-bar-arrow');
            bottomBar.removeClass('bottom-bar-arrow');
            setTimeout(function(){
                $('.dl-menu-container .line').removeClass('open');
            }, 200);
            setTimeout(function(){
                $('.dl-menu-container').animate({
                    width: '50%'
                });
            }, 600);
        }
    });
}

function clickSearch() {
    searchIconNotBtn.click(function() {
        $(window).attr('location','http://www.example.com')
        search.addClass('search-clicked');
        dimness.addClass('dimness-visible');
        //$('nav .search form').show();
        $('nav .search form').addClass('form-active');
        $('input[name="search"]').focus();
        menu.hide();
        topBar.addClass('top-bar-close');
        middleBar.addClass('middle-bar-close');
        bottomBar.addClass('bottom-bar-close');
        topBar.removeClass('top-bar-arrow');
        middleBar.removeClass('middle-bar-arrow');
        bottomBar.removeClass('bottom-bar-arrow');
        searchIconNotBtn.hide();
        searchIconBtn.show();
    });
    $('nav form').click(function(){
        dimness.addClass('dimness-visible');
    });
}

function closeNav() {
    dimness.click(function() {
        if( $(window).width() < 425) {
            search.removeClass('search-clicked');
            //$('nav .search form').hide();
            $('nav .search form').removeClass('form-active');
            searchIconBtn.hide();
            searchIconNotBtn.show();
        }
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

/*function hideProductInfoText() {
    var element = $('.single-product>.info');
    var characterLimit = 300;
    var str = element.html();
    var lessStr = str.substr(0,characterLimit);
    str = lessStr + ' <div class="more-btn">Więcej...</div>' + '<span class="hide">' + str.substr(characterLimit,str.length) + '</span>';
    element.html(str);
}*/

function toggleMoreProductInfo() {
    var moreBtn = $('.single-product .info .more-btn');
    var closeBtn = $('.show-product .close-btn');
    moreBtn.click(function() {
        if(!$(this).parent().siblings('.show-product').hasClass('active')) {
            $('.show-product').removeClass('active');
            $(this).parent().siblings('.show-product').addClass('active');
        }
    });
    closeBtn.click(function(){
        if($('.show-product').hasClass('active')) {
            $('.show-product').removeClass('active');
        }
    });
}

function disableCalcButton() {
    valueBtn.attr('disabled',true);
    valueInput.keyup(function(){
        if($(this).val().length !=0)
            valueBtn.attr('disabled', false);            
        else
            valueBtn.attr('disabled',true);
    })
}