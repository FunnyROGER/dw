$(function() {

	var $arrs = $("[class*=js-slider]");

	$(".banner__inner").hammer().on("swiperight", function() {
		$(".js-slider-prev").click();
	});
	$(".banner__inner").hammer().on("swipeleft", function() {
		$(".js-slider-next").click();
	});

	$("[class*=js-slider]").click(function() {

		var func = arguments.callee,
		$slider = $(this).siblings(".slider"),
		$items = $slider.children(),
		$thisItem = $slider.find(".slide-cur"),
		$prevItem = $slider.children().eq($thisItem.index() - 1),
		$nextItem = $slider.children().eq(0),
		$arr = $(this),
		$newItem;
		
		$arrs.unbind('click', func);

		if ($arr.hasClass("js-slider-prev")) {
			$newItem = $prevItem;
			$newItem.css({"left" : "-100%", "right" : "-100%"})
			.animate({"left" : "0", "right" : "0"}, 1000);
			$thisItem.animate({"left" : "100%", "right" : "100%"}, 1000);
		} else {
			$newItem = $nextItem;
			$newItem.insertBefore($thisItem)
			.css({"left" : "100%", "right" : "100%"})
			.animate({"left" : "0", "right" : "0"}, 1000);
			$thisItem.animate({"left" : "-100%", "right" : "-100%"}, 1000);
		}

		setTimeout(function() {
			$items.css({"left" : "0", "right" : "0"});
			if ($arr.hasClass("js-slider-prev")) {
				$thisItem.prependTo($slider);
			} else {
				$thisItem.insertBefore($newItem);
			}
			$thisItem.removeClass("slide-cur");
			$newItem.addClass("slide-cur");

			$arrs.click(func);
		}, 1100);

	});

});