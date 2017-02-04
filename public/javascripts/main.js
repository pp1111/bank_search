var m,
MAIN = {
    settings: {
        window: $(window),
        menuBtn: $('.menu-btn'),
        topBar: $('.top-bar'),
        middleBar: $('.middle-bar'),
        bottomBar: $('.bottom-bar'),
        menu: $('.dl-menu-container'),
        menuCategory: $('.dl-menu .category-link'),
        subMenuCategory: $('.dl-menu .subcategory-link'),
        submenu: $('.dl-submenu'),
        searchIconBtn: $('nav .search .svg-btn'),
        search: $('nav .search'),
        dimness: $('.dimness'),
        searchIconNotBtn: $('nav .search .svg-not-btn'),
        valueBtn: $('.value button'),
        valueInput: $('.value input'),
        uiWidget: $('ul#ui-id-1.ui-menu.ui-widget.ui-widget-content.ui-autocomplete.ui-front'),
        searchInput: $('#searcharea'),
        dimness: $('.dimness'),
        bannersWrapper: $('.banners'),
        isCloseBtn: 0,
        isArrowBtn: 0,
    },

    init: function() {
        m = this.settings;
        this.openMenu();
        this.openSubMenu();
        this.closeSubMenu();
        this.applyNowBtnStopScroll();
        this.stickyHeader();
        this.footerPosition();
        this.slideToggleAbout();
        this.searchFocus();
        this.randomBanner();
        m.dimness.click(function() {
            $(this).fadeOut();
            $('body').removeClass('noscroll');
        })
    },

    setMenuBtn: function(topBarClass, middleBarClass, bottomBarClass) {
        m.topBar.addClass(topBarClass);
        m.middleBar.addClass(middleBarClass);
        m.bottomBar.addClass(bottomBarClass);
    },
    unsetMenuBtn: function(topBarClass, middleBarClass, bottomBarClass) {
        m.topBar.removeClass(topBarClass);
        m.middleBar.removeClass(middleBarClass);
        m.bottomBar.removeClass(bottomBarClass);
    },
    openMenu: function() {
        m.menuBtn.click(function(){
            if(!m.isArrowBtn) {
                if(!m.isCloseBtn) {
                    m.menu.animate({
                        left: 0
                    }, 300);
                    $('.bar').addClass('bar-open');
                    setTimeout(function() { MAIN.setMenuBtn('top-bar-close', 'middle-bar-close', 'bottom-bar-close');}, 400);
                    setTimeout(function() {
                        m.menuBtn.addClass('menu-btn-open')
                    }, 300);
                    setTimeout(function() {
                        $('.dl-menu-header h3').show();
                    }, 300);
                    m.isCloseBtn = 1;
                    m.dimness.fadeIn();
                    $('body').addClass('noscroll');
                }
                else {
                    $('.bar').removeClass('bar-open');
                    setTimeout(function() {
                        $('.dl-menu-header h3').hide();
                    }, 0);
                    setTimeout(function() { MAIN.unsetMenuBtn('top-bar-close', 'middle-bar-close', 'bottom-bar-close'); }, 100);
                    if (m.window.width() > 768) {
                        m.menu.animate({
                            left: '-50%'
                        }, 300);
                    }
                    else {
                        m.menu.animate({
                            left: '-100%'
                        }, 300);
                    }
                    m.menuBtn.removeClass('menu-btn-open');
                    m.isCloseBtn = 0;
                    m.dimness.fadeOut();
                    $('body').removeClass('noscroll');
                }
                if( m.window.width() < 425) {
                    m.search.removeClass('search-clicked');
                    $('nav .search form').removeClass('form-active');
                    m.searchIconBtn.hide();
                    m.searchIconNotBtn.show();
                }
            }
        });
        $('nav').click(function(e){
            e.stopPropagation();
        });
        $('body').click(function() {
            if (m.window.width() > 768) {
                m.menu.animate({
                    left: '-50%'
                }, 300);
            }
            else {
                m.menu.animate({
                    left: '-100%'
                }, 300);
            }
            $('.bar').removeClass('bar-open');
            setTimeout(function() { MAIN.unsetMenuBtn('top-bar-close', 'middle-bar-close', 'bottom-bar-close'); }, 100);
            m.menuBtn.removeClass('menu-btn-open');
            m.isCloseBtn = 0;
        });
    },

    openSubMenu: function() {
        m.menuCategory.click(function(){
            if($(this).parent().find(m.submenu).is(':visible')) {
                $(this).parent().find(m.submenu).slideUp();
                MAIN.unsetMenuBtn('top-bar-arrow', 'middle-bar-arrow', 'bottom-bar-arrow')
                setTimeout(function(){
                    $('.dl-menu-container .line').removeClass('open');
                }, 200);
                if (m.window.width() > 768) {
                    setTimeout(function(){
                        $('.dl-menu-container').animate({
                            width: '50%'
                        });
                    }, 600);
                }
                else {
                    setTimeout(function(){
                        $('.dl-menu-container').animate({
                            width: '100%'
                        });
                    }, 600);
                }
                m.isCloseBtn = 1;
                m.isArrowBtn = 0;
            }
            else {
                $('.dl-menu-container').animate({
                    width: '100%'
                });
                let thatSubmenu = $(this).parent().find(m.submenu);
                m.submenu.not(thatSubmenu).fadeOut();
                if (m.window.width() >= 768) {
                    setTimeout(function(){
                        thatSubmenu.fadeIn(500);
                    }, 850);
                    setTimeout(function(){
                        $('.dl-menu-container .line').addClass('open');
                    }, 500);
                }
                else {
                    setTimeout(function(){
                        thatSubmenu.fadeIn(500);
                    }, 500);
                    m.menuCategory.fadeOut(300);
                    $('.calc-link').fadeOut(300);
                }
                MAIN.setMenuBtn('top-bar-arrow', 'middle-bar-arrow', 'bottom-bar-arrow');
                m.isCloseBtn = 0;
                m.isArrowBtn = 1;
            }
        });
    },

    closeSubMenu: function() {
        m.menuBtn.click(function(){
            if(m.topBar.hasClass('top-bar-arrow')) {
                m.submenu.slideUp();
                m.topBar.removeClass('top-bar-arrow');
                m.middleBar.removeClass('middle-bar-arrow');
                m.bottomBar.removeClass('bottom-bar-arrow');
                if (m.window.width() >= 768) {
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
                    setTimeout(function(){
                        m.menuCategory.fadeIn(500);
                        $('.calc-link').fadeIn(500);
                    }, 500);
                }
                m.isCloseBtn = 1;
                m.isArrowBtn = 0;
            }
        });
    },
    applyNowBtnStopScroll: function() {
        m.window.scroll(function() {
            if(m.window.height() > 425) {
                if($(this).scrollTop() > 250) {
                    $('.whole-product .button').addClass('stop');
                }
                else {
                    $('.whole-product .button').removeClass('stop');
                }
            }
            else {
                if($(this).scrollTop() > 500) {
                    $('.whole-product .button').addClass('stop');
                }
                else {
                    $('.whole-product .button').removeClass('stop');
                }
            }
        });
    },
    stickyHeader: function() {
         m.window.scroll(function() {
             if($(this).scrollTop() > 100) {
                $('header').not('.page-start header, .calcMain header').css('position', 'fixed');
                //$('.ui-widget-content').not('.page-start .ui-widget-content').css('position', 'fixed');
                $('header').not('.page-start header, .calcMain header').css('background-color', '#2ca9ed');
                $('.wrapper').not('.page-start, .calcMain').css('margin-top', '200px');
             }
             else {
                 $('header').not('.page-start header, .calcMain header').css('position', 'relative');
                 //$('.ui-widget-content').not('.page-start .ui-widget-content').css('position', 'relative');
                 $('.wrapper').not('.page-start, .calcMain').css('margin-top', '0');
                 $('header').not('.page-start header, .calcMain header').css('background-color', 'transparent');
             }
         });
    },
    footerPosition: function() {
        if ($("body").height() < m.window.height() ) {
            $("footer").addClass('bottom');
        }
    },
    searchFocus: function() {
        m.searchInput.focus(function() {
            m.dimness.fadeIn();
            $('body').addClass('noscroll');
        });
        m.searchInput.focusout(function() {
            m.dimness.fadeOut();
            $('body').removeClass('noscroll');
        });
    },
    randomBanner: function() {
        var bannerNumber = Math.floor((Math.random()*2)+1);
        console.log('banner number:', bannerNumber);
        m.bannersWrapper.find("[data-banner-number='" + bannerNumber + "']").show();
    },
    slideToggleAbout: function() {
        //if(m.window.width() > 768) {
            $('footer .about').on('mouseenter touchstart', function(e){ 
                $('.footer-about').animate({
                    bottom: '49px'
                }, 500);
                e.stopPropagation();
            });
            $('footer').mouseleave(function() {
                if(m.window.width() < 567) {
                    $('.footer-about').animate({
                        bottom: '-450px'
                    }, 500);
                }
                else {
                    $('.footer-about').animate({
                        bottom: '-250px'
                    }, 500);
                }
            });
            $('.footer-about').on('touchstart', function(e){ 
                e.stopPropagation()
            });
            $('body').on('touchstart', function(e){ 
                if(m.window.width() < 567) {
                    $('.footer-about').animate({
                        bottom: '-450px'
                    }, 500);
                }
                else {
                    $('.footer-about').animate({
                        bottom: '-250px'
                    }, 500);
                }        
            });
        }
        /*else {
            $('footer .about').click(function() {
                $('.footer-about').animate({
                    bottom: '49px'
                }, 500);
            });
            
            $('body').click(function(){
                if(m.window.width() < 567) {
                    $('.footer-about').animate({
                        bottom: '-450px'
                    }, 500);
                }
                else {
                    $('.footer-about').animate({
                        bottom: '-250px'
                    }, 500);
                }
            });
            $('footer').click(function(e) {
                e.stopPropagation();
            });
        }*/
    //}
};
$(function(){
    MAIN.init();
});