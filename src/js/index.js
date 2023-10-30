import DataTable from 'datatables.net-dt';
import { Modal } from 'bootstrap';
import * as mdb from 'mdb-ui-kit'; // lib
import { Input } from 'mdb-ui-kit'; // module

require('dropify');
window.$ = window.jQuery = require("jquery");
  require('select2')();

$(".draggable").draggable();

var dropControl = $('.dropify').dropify();

var table = new DataTable('#file-table', {
    searching: false,
    paging: false,
    bInfo: false,
    responsive: true,
    data: $.files,
    order: [1, "desc"],
    columns: [
        { data: 'FileDescriptorId', visible: false},
        { data: 'FileName', width: "35%" },
        { data: 'Notes', width: "35%" },
        { data: 'CreatedDate', width: "20%" },
        { data: 'Creator', width: "10%" },
    ]
});

var TreeView = require('js-treeview');
 
var tree = new TreeView($.categories, 'tree');

$(document).ready(function() {
    // $('.tree-leaf-text').append('<i class="fa fa-check"></i>');
    $('.tree-leaf-text').each(function() {
        $(this).html('<i class="fa-solid fa-folder tree-folder-icon"></i> ' + $(this).text());
        $(this).closest(".tree-leaf-content").addClass("ripple");
      });


      $(".select2").select2({
        placeholder: "Kategorien"
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
    var timeStamp = new Date(uploadedFile.lastModified).toLocaleDateString("de-DE") + " " + new Date(uploadedFile.lastModified).toLocaleTimeString("de-DE");
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

$("#file-table tbody tr").on('contextmenu', function(e) {
  // table.row(this).data().id --- ID der aktuellen row
  currentClickedRowData = table.row(this).data();
  rightClick(e);
});

$("#file-table tbody tr").on('click', function(e) {
  var data = table.row(this).data();
  showDetails(data);
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
    console.log(data);
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
  $("#inputDetailsDate").val(currentClickedRowData.CreatedDate)
  $("#inputDetailsCreator").val(currentClickedRowData.Creator);
  $("#inputDetailsFilesize").val(currentClickedRowData.Filesize);
 });

// $("#abortUpload").click(function(e) {
//   hideBackdrop();
// });

//  function hideBackdrop() {
//   $(".modal-backdrop.fade.show").css("display", "none");
//  }