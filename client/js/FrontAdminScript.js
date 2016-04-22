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
});





