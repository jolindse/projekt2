/**
 * Created by robin on 2016-04-26.
 */
$(document).ready(function () {

   var maxForms = $("div .ExamForm").length;
   var count = 1;

   var pageMax = document.getElementById("max");
   var pageCount = document.getElementById("count");

    pageCount.innerHTML = count;
    pageMax.innerHTML = maxForms;

    $(".examForms .ExamForm").each(function(e){
        if(e != 0)
            $(this).hide();
    });

    $(".nextBut").click(function () {

        if(count < maxForms){
            count++;
            pageCount.innerHTML = count;
        }
        if($(".examForms .ExamForm:visible").next().length != 0)
            $(".examForms .ExamForm:visible").next().show().prev().hide();
        else {
            $(".examForms .ExamForm:visible").hide();
            $(".examForms .ExamForm:first").show();
            count = 1;
            pageCount.innerHTML = count;
        }
        return false;
    });

    $(".prevBut").click(function () {
        if(count > 1){
            count--;
            pageCount.innerHTML = count;
        }
        if($(".examForms .ExamForm:visible").prev().length != 0)
            $(".examForms .ExamForm:visible").prev().show().next().hide();
        else{
            $(".examForms .ExamForm:visible").hide();
            $(".examForms .ExamForm:last").show();
            count = maxForms;
            pageCount.innerHTML = count;
        }
        return false
    });
});
   
  
