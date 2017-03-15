var button='<button class="close" type="button" title="Remove this page">×</button>';
var tabID = 1;
function resetTab(){
	var tabs=$("#tab-list li:not(:first)");
	var len=1
	$(tabs).each(function(k,v){
		len++;
		$(this).find('a').html('Tab ' + len + button);
	})
	tabID--;
}

$(document).ready(function() {
    $('#btn-add-tab').click(function() {
        tabID++;
        $('#tab-list').append($('<li><a href="#tab' + tabID + '" role="tab" data-toggle="tab">Tab ' + tabID + '<button class="close" type="button" title="Remove this page">×</button></a></li>'));
        $('#tab-content').append($('<div class="tab-pane fade" id="tab' + tabID + '">Tab ' + tabID + ' content</div>'));
    });
    $('#tab-list').on('click', '.close', function() {
        var tabID = $(this).parents('a').attr('href');
        $(this).parents('li').remove();
        $(tabID).remove();

        //display first tab
        var tabFirst = $('#tab-list a:first');
        resetTab();
        tabFirst.tab('show');
    });

    var list = document.getElementById("tab-list");
});
