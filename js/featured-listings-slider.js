

flashSlider('.featured-listings-slider', {
	gap: 16,
	autoplay: true,
	autoplay: "normal",
	slideToShow: 1,
	arrows: false,
	width: "100%",
	dots: true,
	responsive: [
		{
			breakpoint: 576,
			settings: {
				slideToShow: 1,

			}
		},
		{
			breakpoint: 768,
			settings: {
				slideToShow: 1,

			}
		},
		{
			breakpoint: 992,
			settings: {
				slideToShow: 4,
			}
		}
	]
});
