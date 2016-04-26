/**
 * Created by robin on 2016-04-26.
 */
// $(document).ready(function () {
//     $(".questions div").each(function(e){
//         if(e != 0)
//             $(this).hide();
//     });
//
//     $(".nextBut").click(function () {
//         if($(".questions div:visible").next().length != 0)
//             $(".questions div:visible").next().show().prev().hide();
//         else {
//             $(".questions div:visible").hide();
//             $(".questions div:first").show();
//         }
//         return false;
//     });
//     $(".prevBut").click(function () {
//         if($(".questions div:visible").prev().length != 0)
//             $(".questions div:visible").prev().show().next().hide();
//         else{
//             $(".questions div:visible").hide();
//             $(".questions div:last").show();
//         }
//         return false
//     });
// });

    $(document).ready(function(){

        $('.ExamForm').hide().first().show();
        

    });
   
  
