// ---------------------------  GULP -----------------------------------
// After compile, Gulp will add global variables below in to the compiled script; 
//
// * Main
// presentationName [ Ex : BrandShorthand_JobNum_ProductName_Extention ]
// tmpSlideName [ Ex : vX_P{0}_ProductName_Extention ]
//
// * Hidden
// hiddenPresentationName [ Ex : BrandShorthand_JobNum_ProductName_{0}_HIDDEN ]
// hiddenPageName [ Ex : vX_P{0}_ProductName_{1}_HIDDEN ]
//
// production [ debug mode : false, build mode : true ]
// ---------------------------------------------------------------------

var debug = false; // It will open-close debug features like logging.
var currentSlide = 1;
var isSideInfoActive = false;
var isVideoOpen = false;
var isPopupOpen = false;
var target = 0; // 0 mean slide page (root).
var btnReference = '#btnReferences';
var btnStudyDesign = '#btnStudyDesign';
var btnVideo = '#btnVideo';
var handleClick = 'ontouchstart' in document.documentElement ? 'touchstart': 'click';


// Doment Ready
$(document).ready(function(){
	// Disable Touch Move other areas except scrollable class
	$(document).on('touchmove',function (e) {
		if (!$(e.target).hasClass('iscroll') && !$(e.target).closest('.iscroll').length > 0) {
	       e.preventDefault();
	       window.scroll(0,0);
	       return false;
    	}
	});

	// Set Current Slide ID
	currentSlide = getCurrentSlideId();

	// Init Slide
	onSlideLoad();


	// Slide 2 Functions
	if(currentSlide == 2){ initSlide2(); }

});

// Should be trigger every slide load or changed...
function onSlideLoad(){

	// Init slide links
	initLinks();

	// Side Popup
	initSidePopups();

	// Video Popup
	initVideo();

	// Init Popups
	initPopups();

	// init Buttons
	initButtons();
}


function initButtons(){

	// Close Reference
	$('.closeReference').on(handleClick,function(){
		$('#btnReferences').trigger(handleClick);
	});

	// Close Study Design
	$('.closeStudyDesign').on(handleClick,function(){
		$('#btnStudyDesign').trigger(handleClick);
	});

	// Close Video
	$('.closeVideo').on(handleClick,function(){
		$('#btnVideo').trigger(handleClick);
	});

	// Flip effect
	$('.btnFlip').on(handleClick, function(){
		$(this).siblings('.flipper').toggleClass('flipEffect');
	});
}

// References Button
function initSidePopups(){
	var slideInfoId1 = '#references'+currentSlide;
	var slideInfoTarget1 = slideInfoId1+' .ref'+target;
	var tmpBtn1 = $(btnReference);
	toggleSideInfo(slideInfoId1, slideInfoTarget1, tmpBtn1);

	var slideInfoId2 = '#studydesign'+currentSlide;
	var slideInfoTarget2 = slideInfoId2+' .std'+target;
	var tmpBtn2 = $(btnStudyDesign);
	toggleSideInfo(slideInfoId2, slideInfoTarget2, tmpBtn2);
}

// ************** Toggle Side Info and ui effects
// Toggle Slide
function toggleSideInfo(slideInfoId, slideInfoTarget, tmpBtn){

	// Clean click event
	$(tmpBtn).unbind(handleClick);

	// IF reference exist
	if($(slideInfoTarget).length){ // Check content exist

		$(tmpBtn).removeClass('noContent');

		// Add button toggle functionality
		$(tmpBtn).on(handleClick,function(){
			if (!isSideInfoActive && !isVideoOpen) { // If there is no active popup
				// Hide All Targets and show selected one.
				$(slideInfoId+' > div').hide();
				$(slideInfoTarget).show();
				openSideInfo(slideInfoId); // Open Reference
				$(this).removeClass('disabled').addClass('selected');
			}else{
				if($(this).hasClass('selected')){ // If active popup is self..
					$(this).removeClass('selected');
					closeSideInfo(slideInfoId); // Close Reference
				}
			}
		});

	}else{

		if(!$(tmpBtn).hasClass('noContent')) {
			$(tmpBtn).addClass('noContent'); // Disable button
		}

	}
}
// Apply css effects
function openSideInfo(id){
	isSideInfoActive = true;
	$(id).addClass('activated');
	$('.content').addClass('shrinked');
	$('.popup.popupActive').addClass('shrinked');
	handleButtonStatus(true);
}
function closeSideInfo(id){
	isSideInfoActive = false;
	$(id).removeClass('activated');
	$('.shrinked').removeClass('shrinked'); // remove all shrinked effect
	handleButtonStatus(false);
}


// ************** Video Popup
// Video Popup
function initVideo(){
	var slideInfoId = '#slide' + currentSlide + ' .videoPopup';
	// IF reference exist
	if($(slideInfoId).length){ // Check content exist

		var currentVideo = slideInfoId + ' video';

		$(btnVideo).on(handleClick,function(){ // Assign Functionality
			if (!isSideInfoActive && !isVideoOpen && !isPopupOpen) { // If there is no active popup
				if($(currentVideo).data('autoplay')){
					$(currentVideo).get(0).play();
				}
				isVideoOpen = true;
				$(slideInfoId).show(); // Show Popup
				handleButtonStatus(true);
				$(this).removeClass('disabled').addClass('selected');
			}else{
				if($(this).hasClass('selected')){
					$(currentVideo).get(0).pause();
					isVideoOpen = false;
					$(this).removeClass('selected');
					$(slideInfoId).hide(); // Close Reference
					handleButtonStatus(false);
				}
			}
		});
	}else{
		$(btnVideo).hide(); // Remove button
	}
}

// Handle Buttons
function handleButtonStatus(status){
	if (status) {
		// Disable all popup functionality
		$('.info').addClass('disabled');
		$('.btnVideoPopup').addClass('disabled');
	}else{
		// Enable all popup functionality
		$('.info').removeClass('disabled');
		if(!isPopupOpen){
			$('.btnVideoPopup').removeClass('disabled');
		}
	}
}


// Get Current Slide ID
function getCurrentSlideId(){
	return $('.slideContainer').attr('id').replace('slide','');
}


// ************** Popups

function initPopups(){
	$('[data-target-popup]').on(handleClick,function(){
		// Disable Video Popup
		$('.btnVideoPopup').addClass('disabled');
		// Set Popup Open
		isPopupOpen = true;
		// Set target
		target = $(this).data('target-popup');
		// Find popup
		$('#popup'+target).addClass('popupActive');

		initSidePopups();
	});
	$('.closePopup').on(handleClick,function(){
		closePopup();
	});
}

function closePopup(){
	// Enable Video Popup
	$('.btnVideoPopup').removeClass('disabled');
	// Set Popup Close
	isPopupOpen = false;
	// Close Popup
	$('#popup'+target).removeClass('popupActive');
	// Reset target
	target = 0;

	initSidePopups();
}


// ************** Handle Veeva/Web Slide Links
// Init Links
function initLinks(){
	$('[data-go]').on(handleClick,function(){
		var target = $(this).data('go')+ '';
		var data = target.split(',');
		if(data.length === 1){
			goToSlide(data[0],'');
		}else{
			goToSlide(data[0],data[1]);
		}
	});
}
// Redirect user slide page or slide 
function goToSlide(slideNumber,presentation){
	if (production) {
		if(presentation === ''){
			com.veeva.clm.gotoSlide(tmpSlideName.replace('{0}', slideNumber)+'.zip', presentationName);
		}else{ 
			com.veeva.clm.gotoSlide(hiddenPageName.replace('{0}', slideNumber).replace('{1}', presentation)+'.zip', hiddenPresentationName.replace('{1}', presentation));
		}
	}else{
		if(presentation === ''){
			window.location.href = 'slide'+slideNumber+'.html';
		}else{ 
			window.location.href = presentation + '_slide'+slideNumber+'.html';
		}
	}
	return false;
}

// ************** Common Functions
// Log
function log(obj){
	if(debug){
		console.log(obj);
	}
}

// ************** Slide Spesific Functions

function initSlide2(){
	// Do things when slide 2 document ready..
	alert('This alert only works slide 2 document when ready.');
}


function initSlider(id){
	function initscroll(){
		var tmpscroll = new IScroll('#'+id);
	};
	setTimeout(initscroll, 1000);	
}
