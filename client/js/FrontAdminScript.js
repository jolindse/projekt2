/**
 * Created by robin on 2016-04-22.
 */

$(document).ready(function(){
    $('#sortUserTab').click(function () {
        $("#classContainer").slideToggle();
         $("#testContainer").hide();
    });
    $('#createTestTab').click(function () {
        $("#classContainer").hide();
        $("#testContainer").slideToggle();
    });



    $('#addAnsRow').click(function () {
        $('#inputAnsDivs').append('<div class="inputAnsRow"> <div class="input-group"> <span class="input-group-addon"> <input type="checkbox" aria-label="..."> </span> <input type="text" class="form-control" aria-label="..."> </div> </div>');
    });

    $('.list-group-item').click(function () {
        $('.list-group a').removeClass('active');
        $(this).addClass('active');
    });
    
});





