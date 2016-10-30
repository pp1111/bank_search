var menuBtn = $('.menu-btn');
var topBar = $('.top-bar');
var middleBar = $('.middle-bar');
var bottomBar = $('.bottom-bar');
var menu = $('.dl-menu-container');
var menuCategory = $('.dl-menu>.category');
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
    learnMore();
    //repairTile();
});

function productHover() {
    $('.single-product').on('touchend', function (e) {
        'use strict'; //satisfy code inspectors
        var link = $('.show-product');
        if (link.hasClass('hover')) {
            link.removeClass('hover');
        } else {
            link.addClass('hover');
            $('.single-product').not(this).removeClass('hover');
            e.preventDefault();
            return false; //extra, and to make sure the function has consistent return points
        }
    });
}

function menuBtnChange() {
    topBar.toggleClass('top-bar-close');
    middleBar.toggleClass('middle-bar-close');
    bottomBar.toggleClass('bottom-bar-close');
}

function openMenu() {
    menuBtn.click(function(){
        if(!topBar.hasClass('top-bar-arrow')) {
            if(!topBar.hasClass('top-bar-close')) {
                menu.animate({
                    left: 0
                }, 300);
                $('.bar').addClass('bar-open');
                setTimeout(function() {
                    topBar.addClass('top-bar-close');
                    middleBar.addClass('middle-bar-close');
                    bottomBar.addClass('bottom-bar-close');
                }, 400);
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
                setTimeout(function() {
                    topBar.removeClass('top-bar-close');
                    middleBar.removeClass('middle-bar-close');
                    bottomBar.removeClass('bottom-bar-close');
                }, 100);
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
        $(this).find(submenu).addClass('it-must-be-open');
        if($(this).find(submenu).is(':visible')) {
            $(this).find(submenu).slideUp();
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
        else {
            $('.dl-menu-container').animate({
                width: '100%'
            });
            var thatSubmenu = $(this).find(submenu);
            submenu.not(thatSubmenu).fadeOut();
            setTimeout(function(){
                thatSubmenu.fadeIn(500);
            }, 850);
            setTimeout(function(){
                $('.dl-menu-container .line').addClass('open');
            }, 500);
            topBar.addClass('top-bar-arrow');
            middleBar.addClass('middle-bar-arrow');
            bottomBar.addClass('bottom-bar-arrow');
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

function learnMore() {
    var learnMoreBtn = $('.single-product .read-more');
    learnMoreBtn.click(function() {
        /*$(this).parents('.single-product').animate({
            width: 800,
            height: 600
        });*/
        $(this).parents('.single-product').addClass('learn-more');
        dimness.addClass('dimness-visible');
        $(this).parents('.show-product').hide();
    });
}

function repairTile() {
    $('textarea.info').each(function() {
        var text = $(this).text();
        //$(this).text(text.split("<li>"));
        $(this).text(text.replace(/<ul>/g, '').replace(/<li>/g, '- ').replace(/<\/li>/g, '').replace('<\/ul>', ''));
    });
}