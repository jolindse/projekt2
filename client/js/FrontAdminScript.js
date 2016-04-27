/**
 * Created by robin on 2016-04-22.
 */

$(document).ready(function(){
    $('#sortUserTab').click(function (e) {
        $("#classContainer").slideToggle();
         $("#testContainer").hide();
        e.preventDefault();
    });
    $('#createTestTab').click(function (e) {
        $("#classContainer").hide();
        $("#testContainer").slideToggle();
        e.preventDefault();
    });
    
    $('#addAnsRow').click(function () {
        $('#inputAnsDivs').append('<div class="inputAnsRow"> <div class="input-group"> <span class="input-group-addon"> <input type="checkbox" aria-label="..."> </span> <input type="text" class="form-control" aria-label="..."> </div> </div>');
    });

    $('.list-group-item').click(function (e) {
        $('.list-group a').removeClass('active');
        $(this).addClass('active');
        e.preventDefault();
    });
    
    $('#saveAnsRow').click(function (e) {
        $('.btn-group').prepend('<button type="button" class="btn btn-default">'+butValue+'</button>');
    })
    
});





