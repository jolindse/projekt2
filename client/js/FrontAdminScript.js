/**
 * Created by robin on 2016-04-22.
 */

$(document).ready(function(){

    var persNr =  document.getElementById('persId');
    var fName =  document.getElementById('fName');
    var eName =  document.getElementById('eName');
    var eMail =  document.getElementById('eMail');
    var elementTab;


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
    $('.nav-pills li').click(function (e) {
        $('.nav-pills li').removeClass('active');
         $(this).addClass('active');
            elementTab = $(this).attr('id');
            if(elementTab === "butId"){
                $('#inputElements').hide();
                $('#butElements').show();
            }
            if(elementTab === "inputId"){
                $('#butElements').hide();
                $('#inputElements').show();
            }

        e.preventDefault();
    });

    $('#listGroupJava2').click(function (e) {
        fName.innerHTML = "Biffen";
        eName.innerHTML = "Karlsson";
        persNr.innerHTML = "1337";
        eMail.innerHTML = "Råstek@Bajs.se";
    });

    $('#listGroupJava1').click(function (e) {
        fName.innerHTML = "fen";
        eName.innerHTML = "son";
        persNr.innerHTML = "1332";
        eMail.innerHTML = "stek@Bajs.se";
    });

    $('#listGroupNet1').click(function (e) {
        fName.innerHTML = "Satan";
        eName.innerHTML = "Luciferson";
        persNr.innerHTML = "666";
        eMail.innerHTML = "Plåga@downtown.se";
    });

    $('#listGroupNet2').click(function (e) {
        fName.innerHTML = "Gudars";
        eName.innerHTML = "Skymningsson";
        persNr.innerHTML = "777";
        eMail.innerHTML = "vinTillVattenLOL@upstairs.se";
    });

    $('#saveAnsRow').click(function (e) {
        $('.btn-group').prepend('<button type="button" class="btn btn-default">'+butValue+'</button>');
    })
    
});





