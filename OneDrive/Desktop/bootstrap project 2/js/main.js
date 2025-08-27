$(document).ready(function () {

    // ======== Filter buttons (Isotope) ========
    let $btns = $('.project-area .button-group button');

    $btns.click(function (e) {
        $('.project-area .button-group button').removeClass('active');
        e.target.classList.add('active');

        let selector = $(e.target).attr('data-filter');
        $('.project-area .grid').isotope({
            filter: selector
        });

        return false;
    });

    $('.project-area .button-group #btn1').trigger('click');

    // ======== Magnific Popup ========
    $('.project-area .grid .test-popup-link').magnificPopup({
        type: 'image',
        gallery: { enabled: true }
    });

    // ======== Owl Carousel ========
    // هنا نضيف الكاروسيل للـ 4 صور
    $('.about-area .owl-carousel').owlCarousel({
        loop: true,
        margin: 10,
        autoplay: true,
        dots: true,
        nav: true,
        responsive: {
            0: { items: 1 },
            600: { items: 2 },
            1000: { items: 3 }
        }
    });

    // ======== Sticky Navigation ========
    let nav_offset_top = $('.header_area').height() + 50;

    function navbarFixed() {
        if ($('.header_area').length) {
            $(window).scroll(function () {
                let scroll = $(window).scrollTop();
                if (scroll >= nav_offset_top) {
                    $('.header_area .main-menu').addClass('navbar_fixed');
                } else {
                    $('.header_area .main-menu').removeClass('navbar_fixed');
                }
            });
        }
    }

    navbarFixed();

});
