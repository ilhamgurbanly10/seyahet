
function flashSlider(elements, settings = {}) {

	// default-settings

	const setDefaultSettings = () => {

		const defaultSettings = {
			autoplay: false,
			autoplaySpeed: "normal",
			speed: "fast",
			arrows: true,
			draggable: true,
			touchMove: true,
			indexes: false,
			dots: false,
			buttons: false,
			buttonsHTML: [],
			slideToShow: 3,
			slideToScrollAbsolutely: false,
			gap: "0",
			height: undefined,
			cssEase: 'ease',
			pauseOnHover: true,
			pauseOnFocus: false,
            width: "90%",
            responsive: []
		}

		for (key in defaultSettings) { if (settings[key] == undefined) settings[key] = defaultSettings[key]; }

	}		

	setDefaultSettings();

	// the-end-of-default-settings


	// slider-function

	const slider = (el) => {

		// elements-and-values
		var list, track, slides = [], slidesLength, slideContainers = [], slideWidth, prevArrow, nextArrow;
		var nextIndex = 1, lastIndex, prevIndex, scrollSize, lastAllowedIndex, fullIndex, restSlides, size,
		playFunction, isPlaying = false, isEnded = false, indexes, thisIndex, totalIndexes, dots = [],
		dotList, dotItems = [], buttons = [], buttonList, buttonItems = [], dataIndex, oneSlide, slidable;
		const dataSettings = Object.assign({}, settings);
		const lastSettings = Object.assign({}, settings);

		el.style.setProperty('width',''+settings.width+'');

		// the-end-of-elements-and-values


		// functions

		const setNextIndex = () => {

			if (nextIndex == lastAllowedIndex) isEnded = true;

			if (nextIndex == 0) prevIndex = lastIndex;
			else prevIndex = nextIndex - 1;
			if (nextIndex == lastIndex) nextIndex = 0;
			else nextIndex += 1;

			

		}

		const setPrevIndex = () => {

			if (prevIndex == lastIndex)  nextIndex = 0; 
			else nextIndex = prevIndex + 1;
			if (prevIndex == 0) { isEnded = false; prevIndex = lastIndex; }
			else prevIndex -= 1;

		}	

		const createSlide = () => {

			el.classList.add('flash-slider');

			slidesLength = el.childElementCount;
			slides = getChildElementNodes(el);

			list = createElement('div','', { class: "flash-slider-list" }, el);

			track = createElement('div','', { 
				class: "flash-slider-track",
				style: "opacity: 1; transform: translate3d(0px, 0px, 0px);" 
			}, list);

			for (let i = 0, divs = []; i < slidesLength; i++) {
				
				slideContainers[i] = createElement('div','', { class: "flash-slider-slide" }, track);

				divs[i] = createElement('div','', {}, slideContainers[i]);

				divs[i].appendChild(slides[i]);

				slides[i].style.display = "inline-block";
				slides[i].style.width = "100%";


			}

			lastIndex = slidesLength - 1;
			prevIndex = lastIndex;

			slidesLength <= 1 ? oneSlide = true : oneSlide = false;

		}

		// arrows

		const createArrows = () => {

			if (el.querySelector('.flash-slider-arrow')) return;

			nextArrow = createElement('button','<i class="flash-slider-arrow-icon"></i>', { 
				class: "flash-slider-next flash-slider-arrow",
				type: "button" }, 
				el, "first-child");

			prevArrow = createElement('button','<i class="flash-slider-arrow-icon"></i>', { 
				class: "flash-slider-prev flash-slider-arrow",
				type: "button" }, 
				el, "first-child");

			nextArrow.addEventListener('click', next);
			prevArrow.addEventListener('click', prev);
			nextArrow.addEventListener('click', replay);
			prevArrow.addEventListener('click', replay);

			disablePrevArrow();

		}

		const removeArrows = () => { if (prevArrow) { prevArrow.remove(); nextArrow.remove(); } }

		const toggleArrows = () => { settings.arrows ? createArrows() : removeArrows(); }

		const enablePrevArrow = () => { if (prevArrow) prevArrow.removeAttribute('disabled'); }

		const disablePrevArrow = () => { if (prevArrow) prevArrow.setAttribute('disabled',''); }

		const enableNextArrow = () => { if (nextArrow) nextArrow.removeAttribute('disabled'); }

		const disableNextArrow = () => { if (nextArrow) nextArrow.setAttribute('disabled',''); }

		// the-end


		// scroll

		const scrollAbsolutely = () => {

			if (nextIndex == fullIndex) { 

				size = scrollSize * (nextIndex - 1) + (slideWidth * restSlides + settings.gap * restSlides);
				disableNextArrow();
				isEnded = true;

			}	else { 

				size = scrollSize * nextIndex;
				enableNextArrow();

			}	

			if (nextIndex == fullIndex - 1 && restSlides == 0) { disableNextArrow(); isEnded = true; }

		}

		const prev = () => {

			if (prevIndex == lastIndex) return; 

			prevIndex == 0 ? disablePrevArrow() : enablePrevArrow();

			enableNextArrow();

			const size = scrollSize * prevIndex;
			track.style.transform = "translate3d(-"+size+"px, 0px, 0px)";

			selectActiveDot(prevIndex);
			selectActiveButton(prevIndex);

			setIndex(prevIndex);
			setPrevIndex();	

		}

		const next = () => {
			
			if (nextIndex > lastAllowedIndex) return; 

			nextIndex == lastAllowedIndex ? disableNextArrow() : enableNextArrow();

			enablePrevArrow();

			settings.slideToScrollAbsolutely ? scrollAbsolutely() : size = scrollSize * nextIndex; 

			track.style.transform = "translate3d(-"+size+"px, 0px, 0px)";	

			selectActiveDot(nextIndex);
			selectActiveButton(nextIndex);

			setIndex(nextIndex);
			setNextIndex();
			
		}

		const toStartPosition = () => {

			nextIndex = 1;
			lastIndex = slidesLength - 1;
			prevIndex = lastIndex;
			isEnded = false;

			track.style.transitionDuration = "0s"; 
			track.style.transform = "translate3d(0px, 0px, 0px)";
			setTimeout( function() { track.style.transitionDuration = settings.speed; }, 100); 

			disablePrevArrow();
			enableNextArrow();

			selectActiveDot(0);
			selectActiveButton(0);
			setIndex(0);

			replay();

		}

		// the-end


		// drag

		const dragElement = (elmnt) => {

			if (!settings.draggable) return;
			var limit;

			const dragMouseDown = (e) => {

				if (!slidable) return;

				if(settings.autoplay) stop();

				limit = (slideWidth - settings.gap) / 5;

				defaultTranslateX = elmnt.style.transform;
				defaultTranslateX = defaultTranslateX.slice(12, defaultTranslateX.length - 13);

				e = e || window.event;

				defaultPos = e.clientX || e.touches[0].clientX;
				
				document.addEventListener('mouseup', closeDragElement);
				if (settings.touchMove) { document.addEventListener('touchend', closeDragElement); document.addEventListener('touchcancel', closeDragElement); }

				document.addEventListener('mousemove', elementDrag);
				if (settings.touchMove) document.addEventListener('touchmove', elementDrag);

				elmnt.removeEventListener('mousedown', dragMouseDown);
				if (settings.touchMove) elmnt.removeEventListener('touchstart', dragMouseDown);

			}

			var defaultPos = 0, defaultTranslateX, lastClientX;

			elmnt.addEventListener('mousedown', dragMouseDown);
			if (settings.touchMove) elmnt.addEventListener('touchstart', dragMouseDown);

			const elementDrag = (e) => {

				e = e || window.event;
				track.classList.add('flash-dragging');
				pos = e.clientX || e.touches[0].clientX;
				pos -= defaultPos;
				elmnt.style.transform = "translate3d(calc("+defaultTranslateX+"px + "+pos+"px), 0px , 0px)"; 
				lastClientX = e.clientX || e.touches[0].clientX;

			}

			const closeDragElement = (e) => {

					

				e = e || window.event;
				track.classList.remove('flash-dragging');

				if (lastClientX != null) {

					if (lastClientX < defaultPos - limit) 
						nextIndex > lastAllowedIndex || nextIndex > fullIndex || nextIndex == 0 ? elmnt.style.transform = "translate3d("+defaultTranslateX+"px, 0px , 0px)" : next();

					else if (lastClientX > defaultPos + limit)  
						prevIndex == lastIndex ? elmnt.style.transform = "translate3d(0px, 0px , 0px)" : prev();

					else elmnt.style.transform = "translate3d("+defaultTranslateX+"px, 0px , 0px)";

					if(settings.autoplay && !settings.pauseOnHover && !settings.pauseOnFocus) play();

				}	

				document.removeEventListener('mouseup', closeDragElement);
				document.removeEventListener('touchend', closeDragElement);
				document.removeEventListener('touchcancel', closeDragElement);
				document.removeEventListener('mousemove', elementDrag);
				document.removeEventListener('touchmove', elementDrag);
				lastClientX = null;

				const duration = Number(settings.speed.slice(0, settings.speed.length - 1)) * 1000;

				setTimeout( function() {

					elmnt.addEventListener('mousedown', dragMouseDown);
					if (settings.touchMove) elmnt.addEventListener('touchstart', dragMouseDown);

				}, duration);	

			}

		}

		// the-end


		// play

		const play = () => { playFunction = setInterval( function() { !isEnded ? next() : prev(); }, settings.autoplaySpeed); }

		const stop = () => { clearInterval(playFunction); }

		const replay = () => { if (settings.autoplay) { stop(); play(); } }

		const togglePlay = () => { if (!slidable) return; settings.autoplay && !playFunction ? play() : stop(); }

		const togglePauseOnHover = () => { 

			if (!settings.autoplay) return;

			if (settings.pauseOnHover) { 

				track.addEventListener('mouseenter', stop);
				track.addEventListener('mouseleave', play);

			} else {

				track.removeEventListener('mouseenter', stop);
				track.removeEventListener('mouseleave', play);

			}	

		}

		const togglePauseOnFocus = () => { 

			if (!settings.autoplay) return;

			if (settings.pauseOnFocus) { 

				track.setAttribute('tabindex','-1');
				track.addEventListener('focusin', stop);
				track.addEventListener('focusout', play);

			} else {

				track.removeAttribute('tabindex');
				track.removeEventListener('focusin', stop);
				track.removeEventListener('focusout', play);

			}	

		}

		// the-end


		// indexes

		const createIndexes = () => {

			if (el.querySelector('.flash-slider-indexes')) return;

			indexes = createElement('div','', { class: "flash-slider-indexes" }, el);
			thisIndex = createElement('span','1', { class: "flash-slider-index" }, indexes);
			totalIndexes = createElement('span','', { class: "flash-slider-total-indexes" }, indexes);

		}

		const setTotalIndexes = () => { 

			if (!settings.indexes) return;

			let length;
			if (settings.slideToScrollAbsolutely && restSlides > 0) length = fullIndex + 1;
			else if (settings.slideToScrollAbsolutely && restSlides == 0) length = fullIndex;
			else length = slidesLength; 

			totalIndexes.innerHTML = ' / '+length+'';

		}

		const removeIndexes = () => { if (indexes) indexes.remove(); }

		const toggleIndexes = () => { settings.indexes ? createIndexes() : removeIndexes(); }

		const setIndex = (x) => { if (settings.indexes) thisIndex.innerHTML = x + 1; }

		// the-end


		// dots

		const createDots = () => {

			if (el.querySelector('.flash-slider-dot-list') || !slidable) return;

			let length;
			settings.slideToScrollAbsolutely ? length = Math.ceil(slidesLength / settings.slideToShow - 1) : length = lastAllowedIndex;

			dotList = createElement('ul','', { class: "flash-slider-dot-list" }, el);

			for (let i = 0; i <= length; i++) {
				
				dotItems[i] = createElement('li','', { class: "flash-slider-dot-item" }, dotList);
				dots[i] = createElement('button','', { class: "flash-slider-dot", type: "button" }, dotItems[i]);
				dots[i].addEventListener('click', selectSlide);
				dots[i].addEventListener('click', replay);
				dots[i].setAttribute('data-index', ''+i+'');
			}

			dots[0].classList.add('flash-active');

		}

		const uploadDots = () => {

			if (!settings.dots || !slidable) return;

			dotList.innerHTML = "";

			let length;
			settings.slideToScrollAbsolutely ? length = Math.ceil(slidesLength / settings.slideToShow - 1) : length = lastAllowedIndex;

			for (let i = 0; i <= length; i++) {
				
				dotItems[i] = createElement('li','', { class: "flash-slider-dot-item" }, dotList);
				dots[i] = createElement('button','', { class: "flash-slider-dot", type: "button" }, dotItems[i]);
				dots[i].addEventListener('click', selectSlide);
				dots[i].setAttribute('data-index', ''+[i]+'');
			}

			dots[0].classList.add('flash-active');

		}

		const removeDots = () => { if (dotList && slidable) dotList.remove(); }

		const toggleDots = () => { settings.dots ? createDots() : removeDots(); }

		function selectSlide() {

			dataIndex = Number(this.getAttribute('data-index'));

			if (dataIndex > lastAllowedIndex) return;

			dataIndex == 0 ? disablePrevArrow() : enablePrevArrow();
			dataIndex == lastAllowedIndex ? disableNextArrow() : enableNextArrow();

			settings.slideToScrollAbsolutely ? selectScrollAbsolutely() : size = scrollSize * dataIndex; 

			track.style.transform = "translate3d(-"+size+"px, 0px, 0px)";

			selectActiveDot(dataIndex);
			selectActiveButton(dataIndex);
			setIndex(dataIndex);

			if (dataIndex == lastAllowedIndex) isEnded = true;

			if (dataIndex == 0) { prevIndex = lastIndex; isEnded = false; }
			else prevIndex = dataIndex - 1;
			if (dataIndex == lastIndex) nextIndex = 0;
			else nextIndex = dataIndex + 1;

			

		}

		const selectScrollAbsolutely = () => {
			
			if (dataIndex == fullIndex) { 

				size = scrollSize * (dataIndex - 1) + (slideWidth * restSlides + settings.gap * restSlides);
				disableNextArrow();
				isEnded = true;

			}	else { 

				size = scrollSize * dataIndex;
				enableNextArrow();

			}	

			if (dataIndex == fullIndex - 1 && restSlides == 0) { disableNextArrow(); isEnded = true; }

		}

		const selectActiveDot = (x) => {

			if (!settings.dots || !slidable) return;

			for (let i = 0; i < dots.length; i++) {

				if (i == x) dots[i].classList.add('flash-active'); 
				else dots[i].classList.remove('flash-active');

			}

		}

		// the-end


		// buttons

		const createButtons = () => {

			if (el.querySelector('.flash-slider-button-list') || !slidable) return;

			buttonList = createElement('ul','', { class: "flash-slider-button-list" }, el, "first-child");

			let length;
			settings.slideToScrollAbsolutely ? length = Math.ceil(slidesLength / settings.slideToShow - 1) : length = lastAllowedIndex;

			for (let i = 0; i <= length; i++) {
				
				if (!settings.buttonsHTML[i]) settings.buttonsHTML[i] = i + 1;

				buttonItems[i] = createElement('li','', { class: "flash-slider-button-item" }, buttonList);
				buttons[i] = createElement('button',''+settings.buttonsHTML[i]+'', { class: "flash-slider-button", type: "button" }, buttonItems[i]);
				buttons[i].addEventListener('click', selectSlide);
				buttons[i].addEventListener('click', replay);

				buttons[i].setAttribute('data-index', ''+i+'');
				
			}

			buttons[0].classList.add('flash-active');

		}

		const uploadButtons = () => {

			if (!settings.buttons || !slidable) return;

			buttonList.innerHTML = "";

			let length;
			settings.slideToScrollAbsolutely ? length = Math.ceil(slidesLength / settings.slideToShow - 1) : length = lastAllowedIndex;

			for (let i = 0; i <= length; i++) {

				if (!settings.buttonsHTML[i]) settings.buttonsHTML[i] = i + 1;
				
				buttonItems[i] = createElement('li','', { class: "flash-slider-button-item" }, buttonList);
				buttons[i] = createElement('button',''+settings.buttonsHTML[i]+'', { class: "flash-slider-button", type: "button" }, buttonItems[i]);
				buttons[i].addEventListener('click', selectSlide);
				buttons[i].addEventListener('click', replay);

				buttons[i].setAttribute('data-index', ''+i+'');
				
			}

			buttons[0].classList.add('flash-active');

		}

		const removeButtons = () => { if (buttonList && slidable) buttonList.remove(); }

		const toggleButtons = () => { settings.buttons ? createButtons() : removeButtons(); }

		const selectActiveButton = (x) => {

			if (!settings.buttons || !slidable) return;

			for (let i = 0; i < buttons.length; i++) {

				if (i == x) buttons[i].classList.add('flash-active'); 
				else buttons[i].classList.remove('flash-active');

			}

		}

		// the-end


		// slidable

		const resetIfNotSlideable = () => { 

			if (!slidable) {

				if (el.querySelector('.flash-slider-dot-list')) dotList.remove(); 
				if (el.querySelector('.flash-slider-button-list')) buttonList.remove();
				disablePrevArrow();
				disableNextArrow();

			}

		}	

		const checkSlidable = () => { slidesLength <= settings.slideToShow ? slidable = false : slidable = true; }

		// the-end


		// speed

		const setSpeed = () => { 

			switch (settings.speed) {
			  case "very-fast":
			    settings.speed = ".3s";
			    break;
			  case "fast":
			    settings.speed = ".5s";
			    break;
			  case "normal":
			    settings.speed = "1s";
			    break;
			  case "slow":
			    settings.speed = "2s";
			    break;
			  case "very-slow":
			    settings.speed = "2.5s";
			    break;
			}

			track.style.transitionDuration = settings.speed; 
			track.style.transitionTimingFunction = settings.cssEase; 

			switch (settings.autoplaySpeed) {
			  case "very-fast":
			    settings.autoplaySpeed = 3000;
			    break;
			  case "fast":
			    settings.autoplaySpeed = 4000;
			    break;
			  case "normal":
			    settings.autoplaySpeed = 8000;
			    break;
			  case "slow":
			    settings.autoplaySpeed = 12000;
			    break;
			  case "very-slow":
			    settings.autoplaySpeed = 13000;
			    break;
			}

		}

		// the-end

		const setSlideToShow = () => {

			el.style.setProperty('width',''+settings.width+'','important');

			const listStyles = list.getBoundingClientRect();
			const width = listStyles.width;
			const totalGaps = settings.gap * (slidesLength - 1);
			slideWidth = (width - ((settings.slideToShow - 1) * settings.gap)) / settings.slideToShow;
			const totalWidth = slidesLength * slideWidth + totalGaps;
			
			lastAllowedIndex = slidesLength - settings.slideToShow;

			if (settings.slideToScrollAbsolutely) { 
				scrollSize = slideWidth * settings.slideToShow + settings.gap * settings.slideToShow;
				fullIndex = Math.floor(slidesLength / settings.slideToShow);
				restSlides = slidesLength - fullIndex * settings.slideToShow;

			} else scrollSize = slideWidth + settings.gap;

			track.style.width = totalWidth + "px";

			for (let i = 0; i < slidesLength; i++) { 
				slideContainers[i].style.width = slideWidth + "px"; 
				if (settings.height) slideContainers[i].style.height = settings.height; 
			}

			for (let i = 0; i < slidesLength - 1; i++) { slideContainers[i].style.marginRight = settings.gap + "px"; }

			
				
		}

		const setSettings = () => {

			if (!settings.responsive[0]) return;
				
				if (settings.responsive[0].breakpoint <= window.innerWidth) {

					for (let i = 0; i < settings.responsive.length; i++) {

						if (settings.responsive[i].breakpoint <= window.innerWidth)
												
							for (key in settings) { 

								if (settings.responsive[i]['settings'][key] != undefined) {

									settings[key] = settings.responsive[i]['settings'][key];
									lastSettings[key] = settings.responsive[i]['settings'][key];

								}	

								else if (lastSettings[key] != undefined) settings[key] = lastSettings[key];

								else settings[key] = dataSettings[key];
							}		

					}

				}

				else settings = Object.assign({}, dataSettings); 	

		}

		function createElement(tagName, html = "", attributes = {}, parent = false, childIndex = "last-child") {

			var el = document.createElement(''+tagName+'');
			el.innerHTML = html;

			for (x in attributes) {	el.setAttribute(''+x+'',''+attributes[x]+''); }

		  	if (parent) {

		  		if (childIndex == "last-child") parent.appendChild(el);
		  		else if (childIndex == "first-child") parent.insertBefore(el, parent.childNodes[0]);
		 		else parent.insertBefore(el, parent.children[childIndex]);
		  	}

		  	return el;

		}

		function getChildElementNodes(par) {

			var children = [];
			let x = 0;

			for (let i = 0; i < par.childNodes.length; i++) {
				
				if (par.childNodes[i].nodeType == 1) { children[x] = par.childNodes[i]; x++; }

			}

			return children;

		}

		const upload = () => {

			setSettings();
			setSlideToShow();
			toggleArrows();
			checkSlidable();
			setSpeed();
			togglePlay();
			togglePauseOnHover();
			togglePauseOnFocus();
			toggleIndexes();
			setTotalIndexes();
			toStartPosition();
			toggleDots();
			uploadDots();
			toggleButtons();
			uploadButtons();
			resetIfNotSlideable();

		}

		// the-end-of-functions


		// calling-functions

		createSlide(); 
		if (oneSlide) return;
		setSettings();
		setSlideToShow();
		toggleArrows();
		checkSlidable();
		setSpeed();
		togglePlay();
		togglePauseOnHover();
		togglePauseOnFocus();
		toggleIndexes();
		setTotalIndexes();
		toggleDots();
		toggleButtons();
		dragElement(track);

		// the-end-of-calling-functions

		window.addEventListener('resize', upload);
		document.documentElement.addEventListener('mouseleave', function() { if (settings.autoplay) stop(); })
		document.documentElement.addEventListener('mouseenter', function() { if (settings.autoplay) replay(); })
		
	}

	// the-end-of-slider-function


	// selecting-elements-and-calling-slider-function-for-them

	const selectElements = (query) => {
		var elements;
		if (typeof query == "string") return elements = document.querySelectorAll(''+query+'');
		return query;
	}

	elements = selectElements(elements);

	if (!elements[0]) slider(elements);
	else for (let i = 0; i < elements.length; i++) { slider(elements[i]); }

	// the-end-of-selecting-elements-and-calling-slider-function-for-them

}