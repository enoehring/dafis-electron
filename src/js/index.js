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

var table = new DataTable('#file-table', {
    searching: false,
    paging: false,
    bInfo: false,
    responsive: true,
    // processing: true,
    // serverSide: true,
    // data: $.files,
    ajax: "https://localhost:44349/File/GetAllForElectron",
    order: [1, "desc"],
    columns: [
        { data: 'FileDescriptorId', visible: false},
        {targets: 0, data: function ( row, type, val, meta ) {
          return row["FileName"] + "." + row["Extension"];
        }},
        { data: 'Notes', width: "35%" },
        {targets: 0, data: function ( row, type, val, meta ) {
          var date = new Date(row["CreatedDate"]);
          var FormattedDate = new Intl.DateTimeFormat('de').format(date) + " " + date.getHours() + ":" + date.getMinutes();
          return FormattedDate;
        }, width: "15%"},
        { data: 'Creator', width: "15%" },
    ]
});

var TreeView = require('js-treeview');
 
var tree = new TreeView($.categories, 'tree');

$($.categories).each(function(index, item) {
  var option = document.createElement("option");
  option.value = item.CategoryID;
  option.text = item.name;
  $("#inputCategory").append(option);
});

$(document).ready(function() {
    // $('.tree-leaf-text').append('<i class="fa fa-check"></i>');
    $('.tree-leaf-text').each(function() {
        $(this).html('<i class="fa-solid fa-folder tree-folder-icon"></i> ' + $(this).text());
        $(this).closest(".tree-leaf-content").addClass("ripple");
      });


      $(".select2").select2({
        width: "100%",
        placeholder: "Kategorien",
        closeOnSelect: false,
      });
});


$("#tree .tree-leaf-content").not(".tree-expando").click(function(e) {
    $(".tree-leaf-content").removeClass("folderSelected");
    $(this).addClass("folderSelected");
});

document.addEventListener('drop', (event) => {
  event.preventDefault();
  event.stopPropagation();

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

$("body").on('contextmenu', "#file-table tbody tr", function(e) {
  // table.row(this).data().id --- ID der aktuellen row
  currentClickedRowData = table.row(this).data();
  rightClick(e);
});

$("body").on('click', '#file-table tbody tr', function(e) {
  var data = table.row(this).data();
  showDetails(data);
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
    url: "https://localhost:44349/File/GetDownload",
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
  var file_path = "https://localhost:44349/File/GetDownload?fileId=" + id + "&fileversion=0";
  var a = document.createElement('A');
  a.href = file_path;
  document.body.appendChild(a);
  a.click();

  document.body.removeChild(a);
  $.unblockUI();
 });

 $("#contextBtnMoveTo").click(function(e) {
  
  const filePath = path.join(app.getPath('userData'), '/some.file')
 });