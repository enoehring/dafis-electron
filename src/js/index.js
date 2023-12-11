import DataTable from 'datatables.net-dt';
import { Modal, Collapse } from 'bootstrap';
import * as mdb from 'mdb-ui-kit'; // lib
import { Input } from 'mdb-ui-kit'; // module
import * as toastr from 'toastr';
import { error } from 'jquery';

require('dropify');
window.$ = window.jQuery = require("jquery");
  require('select2')();
  require('toastr');

$(".draggable").draggable();

$(".resizable").resizable({
  handles: "n, e, s, w",
  helper: "resizable-helper"
});

let LeaderLine = require("leader-line-new");

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
      $("#file-table tbody tr").attr("draggable", "true");

      $("#file-table tbody tr").on("dragstart", function(event) {
        event.preventDefault();
        var rowData = table.row(this).data();

        var id = rowData.FileDescriptorId;     
        $.ajax({
          url: "http://dev.dafis-api.inoclad.corp/File/GetDownload",
          data: {
            fileId: id,
            fileversion: 0,
            returnByte: true
          },
          success: function(data) {
            var name = rowData.FileName + "." + rowData.Extension;
            window.file.save(data, name, false);
            window.electron.startDrag(name);
          },
          error: function(data) {
            console.log("Error");
          }
        });
      });
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
  var search = "^" + $(this).data("item").CategoryID + "$";
  table.column(5).search(search, true, false, true).draw();

  currentCategory = $(this).data("item").CategoryID;

  var breadcrumbString = getCategoryBreadcrumb($(this).data("item").CategoryID).join('');
  $("#category-navigation").html(breadcrumbString);
});

function getCategoryBreadcrumb(categoryId) {
  function findCategory(currentCategory, targetId, currentPath) {
      // Füge die aktuelle Kategorie zum Pfad hinzu
      currentPath.push(`<li class="breadcrumb-item"><a href="#">${currentCategory.CategoryName}</a></li>`);

      // Überprüfe, ob die aktuelle Kategorie die gesuchte Kategorie ist
      if (currentCategory.CategoryID === targetId) {
          return currentPath; // Gibt das Array mit den Breadcrumb-Elementen zurück
      }

      // Durchsuche die Unterkategorien, falls vorhanden
      if (currentCategory.children && currentCategory.children.length > 0) {
          for (const child of currentCategory.children) {
              const path = findCategory(child, targetId, [...currentPath]); // Kopiere den aktuellen Pfad
              if (path) {
                  return path; // Wenn der Pfad gefunden wurde, beende die Suche
              }
          }
      }

      return null; // Wenn die Kategorie nicht gefunden wurde, gib null zurück
  }

  // Starte die rekursive Suche mit der Wurzelkategorie
  for (const category of $.categories) {
      const breadcrumb = findCategory(category, categoryId, []);
      if (breadcrumb) {          
          // Füge das Attribut und die Klasse zum letzten Element hinzu
          breadcrumb[breadcrumb.length - 1] = breadcrumb[breadcrumb.length - 1].replace('<li class="breadcrumb-item"><a href="#">', '<li aria-current="page" class="active breadcrumb-item">').replace('</a>', '');

          return breadcrumb; // Wenn der Pfad gefunden wurde, gib das Array mit den Breadcrumb-Elementen zurück
      }
  }

  return ['<li class="breadcrumb-item">Kategorie nicht gefunden</li>']; // Wenn die Kategorie nicht gefunden wurde, gib eine Meldung aus
}

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


let currentCategory = "";
$("#tree .tree-leaf-content").not(".tree-expando").click(function(e) {
    $(".tree-leaf-content").removeClass("folderSelected");
    $(this).addClass("folderSelected");

    console.log($(this));

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

      var name = currentClickedRowData.FileName + "." + currentClickedRowData.Extension;

      window.file.save(data, name);

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
  table.column(5).search("", true, false, true).draw();
  $(".tree-leaf-content").removeClass("folderSelected");
  tree.collapseAll();

  $("#category-navigation").html('<li class="breadcrumb-item active" aria-current="page">Hauptverzeichnis</li>');
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

$("#contextBtnProperties").click(function(e) {

  $("#file-details-version-list").html($("#version-placeholder").html());
  $("#inputDetailsCategory").html($("#category-placeholder").html());

// document.getElementById('file_details_modal').addEventListener('show.bs.modal', () => {
//   var line1 = new LeaderLine(
//     document.getElementById('start1'),
//     document.getElementById('end1'), {
//       endPlug: 'behind',
//       color: 'rgba(var(--bs-secondary-bg-rgb), 0.5)', // translucent
//     }
// );

// var line2 = new LeaderLine(
//     document.getElementById('end1'),
//     document.getElementById('end2'), {
//       endPlug: 'behind',
//       color: 'rgba(var(--bs-secondary-bg-rgb), 0.5)', // translucent
//     }
// );

  $.ajax({
    url: "http://dev.dafis-api.inoclad.corp/File/GetDetails",
    data: {
      fileDescriptorId: currentClickedRowData.FileDescriptorId
    },
    headers: {
        UserId: loginSession.UserId,
        SessionToken: loginSession.SessionToken,
        Company: loginSession.Company
    },
    success: function(data) {
        console.log(JSON.parse(data.result));

        if(data.success) {
          var result = JSON.parse(data.result);

          $("#file-details-version-list").html("");
          result.Versions.forEach(function(item) {
            $("#file-details-version-list").append(item);
          });

          $("#inputDetailsCategory").html("");
          result.Categories.forEach(function(item) {
            $("#inputDetailsCategory").append(item);
          });
        }
    },
    error: function(data) {
        console.log(error);
    }
  });
});


document.getElementById('upload_file_modal').addEventListener('show.bs.modal', () => {
    $("#inputCategory").val(currentCategory);
    $("#inputCategory").trigger('change');
});


$("#checkbox").on("change", () => {
  var html = $("html");

  if(html.attr("data-bs-theme") == "dark") {
    html.attr("data-bs-theme", "light");
  }
  else {
    html.attr("data-bs-theme", "dark");
  }
})


document.getElementsByClassName('odd').ondragstart = (event) => {
  event.preventDefault()
  window.electron.startDrag('drag-and-drop-2.md')
}


  document.querySelectorAll('.sidebar .nav-link').forEach(function(element){
    
    element.addEventListener('click', function (e) {

      let nextEl = element.nextElementSibling;
      let parentEl  = element.parentElement;	

        if(nextEl) {
            e.preventDefault();
            let mycollapse = new Collapse(nextEl);
            
            if(nextEl.classList.contains('show')){
              mycollapse.hide();
            } else {
                mycollapse.show();
                // find other submenus with class=show
                var opened_submenu = parentEl.parentElement.querySelector('.submenu.show');
                // if it exists, then close all of them
                if(opened_submenu){
                  new Collapse(opened_submenu);
                }
            }
        }
    }); // addEventListener
  }) // forEach