(function($) {

  'use strict';

  $.coreSlider = function(container, options) {

    this.defaults = {
      interval: 5000,
      loop: true,
      slideshow: true,
      resize: true,
      pauseOnHover: true,
      startOnHover: false,
      sliderSelector: '.core-slider_list',
      viewportSelector: '.core-slider_viewport',
      itemSelector: '.core-slider_item',
      navEnabled: true,
      navSelector: '.core-slider_nav',
      navItemNextSelector: '.core-slider_arrow__right',
      navItemPrevSelector: '.core-slider_arrow__left',
      controlNavEnabled: false,
      controlNavSelector: '.core-slider_control-nav',
      controlNavItemSelector: 'core-slider_control-nav-item',
      loadedClass: 'is-loaded',
      clonedClass: 'is-cloned',
      disabledClass: 'is-disabled',
      activeClass: 'is-active',
      reloadGif: false,
      clone: false,
      items: 1,
      itemsPerSlide: 1,
      cloneItems: 0
    };

    this.settings = $.extend({}, this.defaults, options);

    var self = this,
        animateInterval,
        $sliderContainer = $(container),
        $sliderViewport = $sliderContainer.find(self.settings.viewportSelector),
        $slider = $sliderContainer.find(self.settings.sliderSelector),
        $sliderItems = $sliderContainer.find(self.settings.itemSelector),
        $clonedSliderItems = null,
        $sliderNav = $sliderContainer.find(self.settings.navSelector),
        $sliderPrevBtn = $sliderContainer.find(self.settings.navItemPrevSelector),
        $sliderNextBtn = $sliderContainer.find(self.settings.navItemNextSelector),
        $sliderControlNav = $sliderContainer.find(self.settings.controlNavSelector),
        $sliderControlNavItems,
        slideCount = $sliderItems.length - 1,
        slideCountTotal = $sliderItems.length,
        slideWidth,
        currentSlide = 0,
        transformPrefix = getVendorPrefixes(["transform", "msTransform", "MozTransform", "WebkitTransform"]),
        resizeTimeout,
        currentUrl = null,
        currentTags = null,
        remainingItems = {
          left: 0,
          right: 0
        },
        isFirstLoad = true;

    function getVendorPrefixes(prefixes) {
      var tmp = document.createElement("div"),
          result = "";
      for (var i = 0; i < prefixes.length; i++) {
        if (typeof tmp.style[prefixes[i]] != 'undefined') {
          result = prefixes[i];
          break;
        } else {
          result = null;
        }
      }
      return result;
    }

    function getTranslateX(offset) {
      return 'translateX(' + offset + 'px)';
    }

    this.init = function() {
      $sliderContainer.addClass(self.settings.loadedClass);
      if (self.settings.clone) {
        self.cloneSlides();
      }
      self.setSizes();
      self.setSlide(currentSlide, false);
      if (self.settings.slideshow) {
        self.play();
      }
      if (self.settings.resize) {
        self.resize();
      }
      if (self.settings.pauseOnHover && self.settings.slideshow) {
        $sliderContainer.mouseenter(function() {
          self.stop();
        });
        $sliderContainer.mouseleave(function() {
          self.play();
        });
      }
      if (self.settings.startOnHover && self.settings.slideshow) {
        $sliderContainer.mouseenter(function() {
          self.play();
        });
        $sliderContainer.mouseleave(function() {
          self.stop();
        });
      }
      if (self.settings.navEnabled) {
        $sliderPrevBtn.on('click', function() {
          if(!$(this).hasClass(self.settings.disabledClass)) {
            self.setSlide(currentSlide - self.settings.itemsPerSlide, true);
          }
        });
        $sliderNextBtn.on('click', function() {
          if(!$(this).hasClass(self.settings.disabledClass)) {
            self.setSlide(currentSlide + self.settings.itemsPerSlide, true);
          }
        });
      } else {
        $sliderNav.addClass(self.settings.disabledClass);
      }
      if (self.settings.controlNavEnabled) {
        var buffer = [];
        for (var i = 0; i < slideCount + 1; i++) {
          if (i == currentSlide) {
            buffer.push('<div class="' + self.settings.controlNavItemSelector + ' ' + self.settings.activeClass + '"></div>');
          } else {
            buffer.push('<div class="' + self.settings.controlNavItemSelector + '"></div>');
          }
        }
        $sliderControlNav.append(buffer.join(''));
        $sliderControlNavItems = $sliderControlNav.children();
        $sliderControlNav.on('click', $sliderControlNavItems, function(e) {
          self.setSlide($(e.target).index(), false);
        });
        if (slideCountTotal <= self.settings.items) {
          $sliderNextBtn.addClass(self.settings.disabledClass);
          $sliderPrevBtn.addClass(self.settings.disabledClass);
        }
      } else {
        $sliderControlNav.addClass(self.settings.disabledClass);
      }
    };

    this.cloneSlides = function() {
      $slider.append($sliderItems.slice(0, self.settings.cloneItems).clone().addClass(self.settings.clonedClass));
      $slider.prepend($sliderItems.slice(slideCount - self.settings.cloneItems + 1, slideCount + 1).clone().addClass(self.settings.clonedClass));
      $clonedSliderItems = $sliderContainer.find(self.settings.itemSelector).filter('.' + self.settings.clonedClass);
    };
    this.setSizes = function() {
      slideWidth = $sliderViewport.width() / self.settings.items;
      $sliderItems.add($clonedSliderItems).css('width', slideWidth);
      $slider.css('width', slideWidth * (slideCount + self.settings.cloneItems*2 +  1));
    };

    this.setSlide = function(index, isDirectionNav) {
      var isDirectionNavClick = isDirectionNav;

      self.stop();

      if(remainingItems.left === 0 && !self.settings.loop) {
        $sliderPrevBtn.addClass(self.settings.disabledClass);
      }

      if (slideCountTotal > self.settings.items && isDirectionNavClick) {
        remainingItems.right = (slideCount + 1) - currentSlide - self.settings.items;
        remainingItems.left = currentSlide;

        $sliderNextBtn.removeClass(self.settings.disabledClass);
        $sliderPrevBtn.removeClass(self.settings.disabledClass);

        if (currentSlide - index < 0) {
          if (remainingItems.right <= self.settings.itemsPerSlide) {
            index = slideCount - self.settings.items + 1;
            if (!self.settings.loop) {
              $sliderNextBtn.addClass(self.settings.disabledClass);
            }
          }
          if (remainingItems.right == 0) {
            index = 0;
          }
        } else {
          if (remainingItems.left <= self.settings.itemsPerSlide) {
            index = 0;
            if (!self.settings.loop) {
              $sliderPrevBtn.addClass(self.settings.disabledClass);
            }
          }
          if (remainingItems.left == 0 && !isFirstLoad) {
            index = slideCount - self.settings.items + 1;
          }
        }

        if (self.settings.reloadGif) {
          currentTags = $sliderItems.eq(index).find('img');
          currentTags.each(function() {
            var $this = $(this);
            currentUrl = $this.attr('src');
            $this.attr('src', '');
            $this.attr('src', currentUrl);
          });
        }
      }

      if(!isDirectionNavClick && self.settings.controlNavEnabled) {
        index = (index > slideCount - self.settings.items + self.settings.cloneItems + 1) ? slideCount - self.settings.items + self.settings.cloneItems + 1 : index;
      }

      if (self.settings.controlNavEnabled && typeof $sliderControlNavItems !== 'undefined') {
        $sliderControlNavItems.removeClass(self.settings.activeClass);
        $sliderControlNavItems.eq(index).addClass(self.settings.activeClass);
      }

      $slider.css(transformPrefix, getTranslateX(-(index + self.settings.cloneItems) * slideWidth));

      currentSlide = index;
      isFirstLoad = false;
    };

    this.resize = function() {
      $(window).resize(function() {
        if (resizeTimeout) {
          clearTimeout(resizeTimeout);
          resizeTimeout = null;
        }
        resizeTimeout = setTimeout(function() {
          self.setSizes();
          self.setSlide(currentSlide, false);
        }, 250);
      });
    };

    this.destroy = function() {
      $sliderContainer.removeClass(self.settings.loadedClass);
      clearInterval(animateInterval);
    };

    this.play = function() {
      animateInterval = setInterval(function() {
        self.setSlide(currentSlide + self.settings.itemsPerSlide, true);
        self.play();
      }, self.settings.interval);
    };

    this.stop = function() {
      clearInterval(animateInterval);
    };

    this.init();
  };

  $.fn.coreSlider = function(options) {
    if (options === undefined) {
      options = {};
    }
    if (typeof options === 'object') {
      return this.each(function() {
        new $.coreSlider(this, options);
      });
    }
  }
})(jQuery);
