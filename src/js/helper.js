import * as toastr from 'toastr';

$.successToastr = function() {
    toastr.success('Datei erfolgreich Heruntergeladen!', {
      "closeButton": false,
      "debug": false,
      "newestOnTop": true,
      "progressBar": true,
      "positionClass": "toast-top-right",
      "preventDuplicates": false,
      "onclick": null,
      "showDuration": "300",
      "hideDuration": "1000",
      "timeOut": "5000",
      "extendedTimeOut": "1000",
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut"
    });
  }
  
   $.blockUI = function() {
    $("#overlay").fadeIn(300);
   }
  
   $.unblockUI = function() {
    setTimeout(function(){
      $("#overlay").fadeOut(300);
    },500);
   }

   $.dateOptions = function() {
    return { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
   }