
flashSlider('.user-comments-slider', {
	gap: 20,
	slideToShow: 1,
	arrows: false,
	width: "80%",
	dots: true,
	responsive: [
		{
			breakpoint: 768,
			settings: {
				slideToShow: 2,
				width: "73%",
			}
		}
	]
});
