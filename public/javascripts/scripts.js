$(document).ready(function(){
	var tallestPoster = 0;
	$('.movies .col-sm-3').each(function(){
		var currentElement = $(this);
		if(currentElement.height()>tallestPoster){
			tallestPoster=currentElement.height();
		}
		// console.log($(currentElement).height());
	});
	$('.movies .col-sm-3').height(tallestPoster);
});
