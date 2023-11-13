import DataTable from 'datatables.net-dt';
import { Modal } from 'bootstrap';
import * as mdb from 'mdb-ui-kit'; // lib
import { Input } from 'mdb-ui-kit'; // module
import * as toastr from 'toastr';

require('dropify');
window.$ = window.jQuery = require("jquery");
  require('select2')();
  require('toastr');

$(".draggable").draggable();
var dropControl = $('.dropify').dropify();

let loginSession;

var table = new DataTable('#file-table', {
    paging: false,
    bInfo: false,
    responsive: true,
    keys: true,
    // processing: true,
    // serverSide: true,
    // data: $.files,
    ajax: "http://dev.dafis-api.inoclad.corp/File/GetAllForElectron",
    order: [[1, 'desc']],
    columns: [
        { data: 'FileDescriptorId', visible: false},
        {data: function ( row, type, val, meta ) {
          return row["FileName"] + "." + row["Extension"];
        }},
        { data: 'Notes', width: "35%" },
        { data: function ( row, type, val, meta ) {
          var date = new Date(row["CreatedDate"]);
          var FormattedDate = new Intl.DateTimeFormat('de').format(date) + " " + date.getHours() + ":" + date.getMinutes();
          return FormattedDate;
        }, width: "15%"},
        { data: 'Creator', width: "15%" },
        {data: 'CategoryId', visible: false},
    ],
    initComplete: function( settings, json ) {
      // JSON IN COOKIE ABLEGEN
    }
});

new $.fn.dataTable.ColReorder( table, {
  // options
} );

var TreeView = require('js-treeview');
 
// $.ajax({
//   url: "https://localhost:44349/Category/GetAllForElectron",
//   success: function(data) {
//     var tree = new TreeView(data, 'tree');
//   },
//   error: function(data) {

//   }
// })

var tree = new TreeView($.categories, 'tree');

$(".tree-leaf-content").click(function(e) {
  console.log($(this).data("item").CategoryID);
  var search = "^" + $(this).data("item").CategoryID + "$";
  table.column(5).search(search, true, false, true).draw();
});

$($.categories).each(function(index, item) {
  var option = document.createElement("option");
  option.value = item.CategoryID;
  option.text = item.name;
  $("#inputCategory").append(option);
});

$.loginSession = function() {
    return loginSession;
};

$(document).ready(function() {
    // $('.tree-leaf-text').append('<i class="fa fa-check"></i>');

    (async () => {
      loginSession = await window.get.session();
    })();

    $('.tree-leaf-text').each(function() {
        $(this).html('<i class="fa-solid fa-folder tree-folder-icon"></i> ' + $(this).text());
        $(this).closest(".tree-leaf-content").addClass("ripple");
      });


      $(".select2").select2({
        width: "100%",
        closeOnSelect: false,
      });
});


$("#tree .tree-leaf-content").not(".tree-expando").click(function(e) {
    $(".tree-leaf-content").removeClass("folderSelected");
    $(this).addClass("folderSelected");
});

var files;

document.addEventListener('drop', (event) => {
  event.preventDefault();
  event.stopPropagation();

  files = event.dataTransfer.files;

  for (const f of event.dataTransfer.files) {
      setFormFileDetails(f);
    }
});

function setFormFileDetails(uploadedFile) {

    $("#inputFilename").val(uploadedFile.name);
    var timeStamp = new Date(uploadedFile.lastModified).toLocaleDateString("de-DE", $.dateOptions());
    $("#inputDate").val(timeStamp);
    setNewFile(uploadedFile.path);

    if(!$('#upload_file_modal').hasClass('show')) {
      var uploadModal = new Modal(document.getElementById('upload_file_modal'));
      uploadModal.show();
    }
}

function setNewFile(path) {
  dropControl = $('.dropify').dropify();
  dropControl = dropControl.data('dropify');
  dropControl.resetPreview();
  dropControl.clearElement();
  dropControl.settings.defaultFile = path;
  dropControl.destroy();
  dropControl.init();
}

document.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.stopPropagation();
});

document.addEventListener('dragenter', (event) => {
  console.log('File is in the Drop Space');
});

document.addEventListener('dragleave', (event) => {
  console.log('File has left the Drop Space');
});

dropControl.on('dropify.beforeClear', function(event, element){
  // $("#upload_file_form").trigger("reset");
  console.log(dropControl);
});

dropControl.on('change', function(data) {
  var files = $("#fileDrop")[0].files;
  for (var f of files) {
    setFormFileDetails(f);
  }
});

document.onclick = hideMenu;

var currentClickedRowData = [];

$("#file-table").on('key-focus', function (e, datatable, cell) {
var company = $.getCookie("Company");
console.log(document.cookie);

  var row = $(datatable.row(cell[0][0].row).node());
  $("#file-table tbody tr").removeClass("selected");
  row.toggleClass('selected');
  var data = table.row(row).data();

  $.ajax({
    url: 'http://dev.dafis-api.inoclad.corp/File/GetFilePreview',
    data: { fileDescriptorId: data.FileDescriptorId },
    type: "POST",
    success: function (result) {

      if(result.success){
        var infos = JSON.parse(result.result);
        $("#file-preview").html("");
        $("#file-preview").append(infos.fileLocation);
        showDetails(data);
      }
      else {
        $.errorToastr("Error while previewing the File!");
      }
    },
    error: function(result) {
      $.errorToastr("Error while previewing the File!");
    }
});
});

$("body").on('contextmenu', "#file-table tbody tr", function(e) {
  // table.row(this).data().id --- ID der aktuellen row
  currentClickedRowData = table.row(this).data();
  rightClick(e);
});

$("body").on('click', '#file-table tbody tr', function(e) {
//   $("#file-table tbody tr").removeClass("selected");
//   $(this).toggleClass('selected');
//   var data = table.row(this).data();

//   $.ajax({
//     url: 'https://localhost:44349/File/GetFilePreview',
//     data: { fileDescriptorId: data.FileDescriptorId },
//     type: "POST",
//     success: function (result) {

//       if(result.success){
//         var infos = JSON.parse(result.result);
//         $("#file-preview").html("");
//         $("#file-preview").append(infos.fileLocation);
//         showDetails(data);
//       }
//       else {
//         $.errorToastr("Error while previewing the File!");
//       }
//     },
//     error: function(result) {
//       $.errorToastr("Error while previewing the File!");
//     }
// });
});

$("body").on('dblclick', '#file-table tbody tr', function(e) {
  var data = table.row(this).data();
  if(!$('#file_details_modal').hasClass('show')) {
    $("#lblDetailsFilename").text(data.FileName + "." + data.Extension)
    $("#inputDetailsDescription").val(data.Notes);
    $("#inputDetailsDate").val(new Date(data.CreatedDate).toLocaleDateString("de-DE", $.dateOptions()))
    $("#inputDetailsCreator").val(data.Creator);
    $("#inputDetailsFilesize").val(data.Filesize);
    var detailsModal = new Modal(document.getElementById('file_details_modal'));
    detailsModal.show();
  }
});

 function hideMenu() { 
     document.getElementById("contextMenu") 
             .style.display = "none" 
 } 

 function rightClick(e) { 
     e.preventDefault(); 

     if (document.getElementById("contextMenu") .style.display == "block"){ 
         hideMenu(); 
     }else{ 
         var menu = document.getElementById("contextMenu")      
         menu.style.display = 'block'; 
         menu.style.left = e.pageX + "px"; 
         menu.style.top = e.pageY + "px"; 
     } 
 } 

 function showDetails(data) {
    $("#lblDescription").val(data.Notes);
    $("#lblLastVersion").val(data.VersionNotes);
    $("#lblFileSize").val(data.Filesize);
    $('#filePreviewDialog').css('display', 'block');
 }

 function hideDetails() {
    $('#filePreviewDialog').css('display', 'none');
 }

 $("#btnClosePreview").click(function(e) {
  hideDetails();
 })

 $("#contextBtnProperties").click(function(e) {
  $("#lblDetailsFilename").text(currentClickedRowData.FileName + "." + currentClickedRowData.Extension)
  $("#inputDetailsDescription").val(currentClickedRowData.Notes);
  $("#inputDetailsDate").val(new Date(currentClickedRowData.CreatedDate).toLocaleDateString("de-DE", $.dateOptions()));
  $("#inputDetailsCreator").val(currentClickedRowData.Creator);
  $("#inputDetailsFilesize").val(currentClickedRowData.Filesize);
 });

 $("#contextBtnCheckout").click(function(e) {
  var id = currentClickedRowData.FileDescriptorId;
  
  $.blockUI();

  $.ajax({
    url: "http://dev.dafis-api.inoclad.corp/File/GetDownload",
    data: {
      fileId: id,
      fileversion: 0,
      returnByte: true
    },
    success: function(data) {
      $.successToastr();

      var bytes = data;

      $.unblockUI();

    },
    error: function(data) {
      console.log("Error");
    }
  });
 });

 $("#contextBtnDownload").click(function(e) {
  var id = currentClickedRowData.FileDescriptorId;
  $.blockUI();
  var file_path = "http://dev.dafis-api.inoclad.corp/File/GetDownload?fileId=" + id + "&fileversion=0";
  var a = document.createElement('A');
  a.href = file_path;
  a.value = currentClickedRowData.FileName;
  a.setAttribute("data-title", currentClickedRowData.FileName);
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  $.unblockUI();
 });

 $("#contextBtnMoveTo").click(function(e) {
  
  const filePath = path.join(app.getPath('userData'), '/some.file')
 });

 $("#btnHome").click(function(e) {

  console.log($.loginSession());

  table.column(5).search("", true, false, true).draw();
  $(".tree-leaf-content").removeClass("folderSelected");
  tree.collapseAll();
 });


 $("body").on("click", "#btnUploadFile", function(e) {
  upload_file_to_Api();
});

function upload_file_to_Api() {
  console.log("UPload button click");
  var article = document.querySelector('#lblCurrentFolder');
  var crDate;
  var options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };

  var _categories = [];
  $("#inputCategory option:selected").each(function () {
      _categories.push($(this).val());
  });

  var inputFile = files[0];

  var fileExists = false;

  console.log(inputFile);

  if ($("#inputDate")[0].value != "") {
      var Description = $("#inputDescription")[0].value;

      var form_data = new FormData();

      form_data.append("File", inputFile);
      form_data.append("FileName", $("#inputFilename").val());
      form_data.append("Description", Description);
      form_data.append("Category", JSON.stringify(_categories));
      form_data.append("Clients", $.loginSession().Company);
      form_data.append("ExecutingUserId", $.loginSession().UserId);
      form_data.append("SessionToken", $.loginSession().SessionToken);
      form_data.append("Company", $.loginSession().Company);
      form_data.append("AlreadyExists", fileExists);

      // if (fileExists) {
      //     form_data.append("FileID", article.dataset.fileId);
      //     form_data.append("FileName", $("#fileDrop")[0].value);
      //     form_data.append("OldFileName", article.dataset.filename);
      // }

      crDate = new Date(inputFile.lastModified);
      form_data.append("FileCreationDate", crDate.toLocaleDateString('de-DE', options));
      
      $.ajax({
          url: 'https://localhost:44349/File/UploadFile',
          crossOrigin: true,
          type: "POST",
          contentType: false,
          processData: false,
          data: form_data,
          success: function (data) {
              if (data.success) {
                  $.successToastr();
                  clearUploadForm();
              }
              else {
                  $.errorToastr("Fehler beim Hochladen der Datei!");
              }

              fileExists = false;
          },
          error: function (data) {
              $.errorToastr("Fehler beim Hochladen der Datei!");
          }
      });

      fileExists = false;
  }
  else {

  }
}

function clearUploadForm() {
  $(".dropify-clear").trigger("click");
  $("#upload_file_form").trigger("reset");
  files = [];
}