import DataTable from 'datatables.net-dt';
import {Modal, Collapse} from 'bootstrap';
import * as mdb from 'mdb-ui-kit'; // lib
import {Input} from 'mdb-ui-kit'; // module
import * as toastr from 'toastr';
import {error} from 'jquery';
import Swal from 'sweetalert2';
import * as signalR from '@microsoft/signalr';
import moment from "moment";

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
let downloadPath;
let enableFiltering = true;
let timer = null;

var TreeView = require('js-treeview');

let tree;

// tree = new TreeView($.categories, 'tree');

$("body").on("click", ".tree-leaf-content", function (e) {
    // $(this).closest(".tree").find(".tree-leaf").each(function (e) {
    //     // Get the tree-leaf-text of the tree-child-leaves
    //     $(this).find(".tree-leaf-content").each(function (e) {
    //         //Replace the <i class="fa-solid fa-folder-open"></i> item of the tree-leaf-text with the <i class="fa-solid fa-folder"></i> item
    //         $(this).find(".tree-leaf-text").html('<i class="fa-solid fa-folder"></i> ' + $(this).text());
    //     });
    // });
    //
    // //Replace the fa-folder-open with fa-folder on each child of the tree-leaf-text
    // $(this).closest(".tree-leaf").find(".tree-child-leaves").each(function (e) {
    //    // Get the tree-leaf-text of the tree-child-leaves
    //     $(this).find(".tree-leaf-text").each(function (e) {
    //         //Replace the <i class="fa-solid fa-folder-open"></i> item of the tree-leaf-text with the <i class="fa-solid fa-folder"></i> item
    //         $(this).html('<i class="fa-solid fa-folder"></i> ' + $(this).text());
    //     });
    // });
    //
    // $(this).closest(".tree-child-leaves").find(".tree-leaf-content").each(function (e) {
    //     // Get the tree-leaf-text of the tree-child-leaves
    //     $(this).find(".tree-leaf-text").each(function (e) {
    //         //Replace the <i class="fa-solid fa-folder-open"></i> item of the tree-leaf-text with the <i class="fa-solid fa-folder"></i> item
    //         $(this).html('<i class="fa-solid fa-folder"></i> ' + $(this).text());
    //     });
    // });
    //
    // //Replace the <i class="fa-solid fa-folder"></i> item of the tree-leaf-text with the <i class="fa-solid fa-folder-open"></i> item
    // $(this).find(".tree-leaf-text").html('<i class="fa-solid fa-folder-open"></i> ' + $(this).find(".tree-leaf-text").text());

    if ($(e.target).hasClass("tree-expando")) {
        return;
    }

    if (enableFiltering) {
        $(".tree-leaf-content").removeClass("folderSelected");
        $(this).addClass("folderSelected");

        var search = "^" + $(this).data("item").categoryID + "$";
        table.column(5).search(search, true, false, true).draw();

        currentCategory = $(this).data("item").categoryID;

        var breadcrumbString = getCategoryBreadcrumb($(this).data("item").categoryID).join('');
        $("#category-navigation").html(breadcrumbString);
    }
});

function getCategoryBreadcrumb(categoryId) {
    function findCategory(currentCategory, targetId, currentPath) {
        // Füge die aktuelle Kategorie zum Pfad hinzu

        currentPath.push(`<li class="breadcrumb-item"><a href="#">${currentCategory.categoryName}</a></li>`);

        // Überprüfe, ob die aktuelle Kategorie die gesuchte Kategorie ist
        if (currentCategory.categoryID === targetId) {
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
    for (const category of categories) {
        const breadcrumb = findCategory(category, categoryId, []);
        if (breadcrumb) {
            // Füge das Attribut und die Klasse zum letzten Element hinzu
            breadcrumb[breadcrumb.length - 1] = breadcrumb[breadcrumb.length - 1].replace('<li class="breadcrumb-item"><a href="#">', '<li aria-current="page" class="active breadcrumb-item">').replace('</a>', '');

            return breadcrumb; // Wenn der Pfad gefunden wurde, gib das Array mit den Breadcrumb-Elementen zurück
        }
    }

    return ['<li class="breadcrumb-item">Kategorie nicht gefunden</li>']; // Wenn die Kategorie nicht gefunden wurde, gib eine Meldung aus
}

function setCategoryOpenFolderIcon(categoryId) {
    function findCategoryIcon(currentCategory, targetId, currentPath) {
        // Füge die aktuelle Kategorie zum Pfad hinzu

        //Find the tree-leaf-text item that contains the categoryName as text
        var treeLeafText = $(`.tree-leaf-text:contains('${currentCategory.categoryName}')`);

        // Replace the <i class="fa-solid fa-folder"></i> item of the tree-leaf-text with the <i class="fa-solid fa-folder-open"></i> item
        treeLeafText.html('<i class="fa-solid fa-folder-open"></i> ' + treeLeafText.text());

        // Überprüfe, ob die aktuelle Kategorie die gesuchte Kategorie ist
        if (currentCategory.categoryID === targetId) {
            return currentPath; // Gibt das Array mit den Breadcrumb-Elementen zurück
        }

        // Durchsuche die Unterkategorien, falls vorhanden
        if (currentCategory.children && currentCategory.children.length > 0) {
            for (const child of currentCategory.children) {
                const path = findCategory(child, targetId, [...currentPath]); // Kopiere den aktuellen Pfad
                if (path) {
                    //Find the tree-leaf-text item that contains the categoryName as text
                    var treeLeafText = $(`.tree-leaf-text:contains('${currentCategory.categoryName}')`);

                    // Replace the <i class="fa-solid fa-folder"></i> item of the tree-leaf-text with the <i class="fa-solid fa-folder-open"></i> item
                    treeLeafText.html('<i class="fa-solid fa-folder-open"></i> ' + treeLeafText.text());
                    return path;
                }
            }
        }

        return null; // Wenn die Kategorie nicht gefunden wurde, gib null zurück
    }

    // Starte die rekursive Suche mit der Wurzelkategorie
    for (const category of categories) {
        const breadcrumb = findCategoryIcon(category, categoryId, []);
        if (breadcrumb) {
            // Füge das Attribut und die Klasse zum letzten Element hinzu
            breadcrumb[breadcrumb.length - 1] = breadcrumb[breadcrumb.length - 1].replace('<li class="breadcrumb-item"><a href="#">', '<li aria-current="page" class="active breadcrumb-item">').replace('</a>', '');

            return breadcrumb; // Wenn der Pfad gefunden wurde, gib das Array mit den Breadcrumb-Elementen zurück
        }
    }

    return ['<li class="breadcrumb-item">Kategorie nicht gefunden</li>']; // Wenn die Kategorie nicht gefunden wurde, gib eine Meldung aus
}

$(categories).each(function (index, item) {
    var option = document.createElement("option");
    option.value = item.CategoryID;
    option.text = item.name;
    $("#inputCategory").append(option);
    $("#inputCategoryEdit").append(option);
});

$.loginSession = function () {
    return loginSession;
};

let categories = [];
let fileList = [];
let table;

$(document).ready(function () {
    // $('.tree-leaf-text').append('<i class="fa fa-check"></i>');

    (async () => {
        var cookies = await window.loginSession.get();
        loginSession = cookies.sessionData;
        downloadPath = cookies.pathObj.downloadPath;

        $("#defaultDownload").attr("filename", downloadPath);

        $("#userNameLabel").text(loginSession.FullName);


        $.ajax({
            url: "https://dafis-api.int.ino.group/DafisUser/GetCompanies",
            type: "POST",
            data: {
                username: loginSession.UserName
            },
            success: function (data) {
                data.result.forEach(function (item) {
                    var option = document.createElement("option");
                    option.value = item.companyName;
                    option.text = item.companyName;
                    if (item.companyName == loginSession.Company) {
                        option.selected = true;
                    }
                    $("#inputCompany").append(option);
                });
            }
        });

        $.ajax({
            url: "https://dafis-api.int.ino.group/Category/GetAllForElectron",
            headers: {
                executingUserId: loginSession.UserId,
                SessionToken: loginSession.SessionToken,
                Company: loginSession.Company,
                ExecuteAs: -1,
            },
            success: function (data) {
                categories = data;
                tree = new TreeView(data, 'tree');

                // Prepend the <i class="fa-solid fa-folder"></i> item to the text of the tree-leaf-text
                $('.tree-leaf-text').each(function () {
                    $(this).html('<i class="fa-solid fa-folder tree-folder-icon"></i> ' + $(this).text());
                    $(this).closest(".tree-leaf-content").addClass("ripple");
                });
            },
            error: function (data) {

            }
        });

        moment();

        $.fn.dataTable.moment('DD.MM.YYYY HH:mm');

        // Funktion zum Hinzufügen führender Nullen
        function pad(number) {
            if (number < 10) {
                return '0' + number;
            }
            return number;
        }

        table = new DataTable('#file-table', {
            paging: false,
            bInfo: false,
            responsive: true,
            keys: true,
            // processing: true,
            // serverSide: true,
            //data: $.files,
            ajax: {
                url: "https://dafis-api.int.ino.group/File/GetAllForElectron",
                headers: {
                    executingUserId: loginSession.UserId,
                    SessionToken: loginSession.SessionToken,
                    Company: loginSession.Company,
                    ExecuteAs: -1,
                }
            },
            order: [[3, 'desc']],
            columns: [
                {data: 'FileDescriptorId', visible: false},
                {
                    data: function (row, type, val, meta) {
                        return returnIconByFileExtension(row["Extension"])+" "+row["FileName"] + "." + row["Extension"];
                    }
                },
                {data: 'Notes', width: "35%"},
                {
                    data: function (row, type, val, meta) {
                        var date = new Date(row["CreatedDate"]);
                        var FormattedDate = new Intl.DateTimeFormat('de', {year: "numeric", day: "2-digit", month: "2-digit"}).format(date) + " " + pad(date.getHours()) + ":" + pad(date.getMinutes());
                        return FormattedDate;
                    }, width: "15%", type: "date"
                },
                {data: 'Creator', width: "15%"},
                {data: 'CategoryId', visible: false},
            ],
            initComplete: function (settings, json) {
                // JSON IN COOKIE ABLEGEN
                fileList = json.data;


                $("#file-table tbody tr").attr("draggable", "true");

                $("#file-table tbody tr").on("dragstart", function (event) {
                    event.preventDefault();
                    var rowData = table.row(this).data();

                    var id = rowData.FileDescriptorId;
                    $.ajax({
                        url: "https://dafis-api.int.ino.group/File/GetDownload",
                        data: {
                            fileId: id,
                            fileversion: 0,
                            returnByte: true
                        },
                        headers: {
                            executingUserId: loginSession.UserId,
                            SessionToken: loginSession.SessionToken,
                            Company: loginSession.Company
                        },
                        success: function (data) {
                            var name = rowData.FileName + "." + rowData.Extension;
                            window.file.save(data, name, false);
                            window.electron.startDrag(name);
                        },
                        error: function (data) {
                            console.log("Error");
                        }
                    });
                });

                $("#file-table tbody tr").hover(function (event) {

                    //clear timeout if already applied
                    if (timer) {

                        clearTimeout(timer);
                        timer = null;

                    }

                    //set new timeout
                    timer = setTimeout(function () {

                        //call wait-function and clear timeout
                        var divid = "#hoverPreview";
                        var y = event.clientY + this.scrollY;
                        $(divid).css({top: y, left: event.clientX}).show();

                        clearTimeout(timer);
                        timer = null;

                    }, 1000);
                }, function () {
                    var divid = "#hoverPreview";
                    $(divid).hide();

                    //clear timeout if already applied
                    if (timer) {

                        clearTimeout(timer);
                        timer = null;

                    }
                });
            }
        });

        new $.fn.dataTable.ColReorder(table, {
            // options
        });
    })();

    function returnIconByFileExtension(extension) {
        switch (extension) {
            case "pdf":
                return '<i class="fa-solid fa-lg me-2 fa-file-pdf"></i>';
            case "doc":
            case "docx":
                return '<i class="fa-solid fa-lg me-2 fa-file-word"></i>';
            case "xls":
            case "xlsx":
                return '<i class="fa-solid fa-lg me-2 fa-file-excel"></i>';
            case "ppt":
            case "pptx":
                return '<i class="fa-solid fa-lg me-2 fa-file-powerpoint"></i>';
            case "txt":
                return '<i class="fa-solid fa-lg me-2 fa-file-alt"></i>';
            case "zip":
            case "rar":
                return '<i class="fa-solid fa-lg me-2 fa-file-archive"></i>';
            case "png":
            case "jpg":
            case "jpeg":
            case "gif":
                return '<i class="fa-solid fa-lg me-2 fa-file-image"></i>';
            case "mp3":
            case "wav":
            case "flac":
                return '<i class="fa-solid fa-lg me-2 fa-file-audio"></i>';
            case "mp4":
            case "avi":
            case "mov":
                return '<i class="fa-solid fa-lg me-2 fa-file-video"></i>';
            default:
                return '<i class="fa-solid fa-lg me-2 fa-file"></i>';
        }
    }

    $('.tree-leaf-text').each(function () {
        $(this).html('<i class="fa-solid fa-folder tree-folder-icon"></i> ' + $(this).text());
        $(this).closest(".tree-leaf-content").addClass("ripple");
    });


    $(".select2").select2({
        width: "100%",
        closeOnSelect: false,
    });

    var progressContainer = $('#progress-container');

    // $(document).ajaxStart(function(event, xhr, options) {
    //     progressContainer.empty().show();
    // });

    // $(document).ajaxComplete(function() {
    //     progressContainer.hide();
    // });

    $(document).ajaxSend(function (event, xhr, options) {
        if (options.type === 'GET' && options.url.includes("File/GetDownload") || options.url.includes("File/TestDownload")) {
            progressContainer.show();

            var fileName = options.url.split('/').pop(); // Hier wird der Dateiname extrahiert
            var name = getFileNameFromUrl(fileName);

            var progressItem = $('<div class="progress-item"></div>');
            var fileInfo = $('<div class="file-info"><i class="fa-solid fa-cloud-arrow-down fa-2x"></i></div>');
            var fileProgress = $('<div class="file-progress"></div>');
            var progressBar = $('<div class="progress-bar"></div>');
            var progressLabel = $('<div class="progress-label" data-fileName="' + name + '">0%</div>');
            var progressInner = $('<div class="progress-inner" data-fileName="' + name + '"></div>');

            fileProgress.append('<div class="file-name">' + name + '</div>');
            progressBar.append(progressInner);
            fileProgress.append(progressBar);
            fileProgress.append(progressLabel);


            fileInfo.append(fileProgress);
            progressContainer.append($('<div id="close-progress" class="close-progress">&times;</div>'));
            progressContainer.append(progressItem);

            progressItem.append(fileInfo);

            // Füge die innere Fortschrittsleiste zur äußeren Fortschrittsleiste hinzu
            $(this).find('.progress-item:last-child .progress-bar').append(progressInner);

            const connection = new signalR.HubConnectionBuilder()
                .withUrl("https://dafis-api.int.ino.group/progressHub")
                .build();

            connection.on("ReceiveProgress", function (fileName, progress) {
                // Hier den Fortschritt anzeigen
                // Find the progress bar for the current file
                var progressInner = $('.progress-inner[data-fileName="' + fileName + '"]');
                var progressLabel = $('.progress-label[data-fileName="' + fileName + '"]');
                progressInner.css('width', progress + '%');
                progressLabel.text(progress + "%");
                console.log("Fortschritt: " + progress + "%, von Datei: " + fileName);
            });

            connection.start().then(function () {
                console.log("SignalR-Verbindung hergestellt");
            }).catch(function (err) {
                return console.error(err.toString());
            });
        }
    });
});

$("body").on("click", "#close-progress", function (e) {
    $('#progress-container').empty().hide();
});

// Funktion zum Extrahieren des Werts des Parameters fileName aus der URL
function getFileNameFromUrl(url) {
    console.log(url);
    //Zerlegen Sie die URL anhand des Fragezeichens, um den Query-String zu erhalten
    var queryString = url.split('?')[1];

    // Zerlegen Sie den Query-String anhand des Ampersands, um die einzelnen Parameter zu erhalten
    var params = queryString.split('&');

    // Durchlaufen Sie die Parameter, um den Wert des fileName-Parameters zu finden
    for (var i = 0; i < params.length; i++) {
        var param = params[i].split('=');
        if (param[0] === 'fileName') {
            return decodeURIComponent(param[1]); // DecodeURIComponent, um URL-codierte Zeichen zu entschlüsseln
        }
    }
    //Falls der Parameter fileName nicht gefunden wird, geben Sie null zurück oder einen anderen Standardwert
    return null;
}

$("#btnSwitchCompany").click(function (e) {
    var company = $("#inputCompany option:selected").val();

    changeMandant(company);
});


let currentCategory = "";

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

    if (!$('#upload_file_modal').hasClass('show')) {
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

dropControl.on('dropify.beforeClear', function (event, element) {
    // $("#upload_file_form").trigger("reset");
    console.log(dropControl);
});

dropControl.on('change', function (data) {
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
        url: 'https://dafis-api.int.ino.group/File/GetFilePreview',
        data: {
            fileDescriptorId: data.FileDescriptorId
        },
        headers: {
            executingUserId: loginSession.UserId,
            SessionToken: loginSession.SessionToken,
            Company: loginSession.Company
        },
        type: "POST",
        success: function (result) {

            if (result.success) {
                var infos = JSON.parse(result.result);
                $("#file-preview").html("");
                $("#file-preview").append(infos.fileLocation);
                showDetails(data);
            } else {
                $.errorToastr("Error while previewing the File!");
            }
        },
        error: function (result) {
            $.errorToastr("Error while previewing the File!");
        }
    });
});

$("body").on('contextmenu', "#file-table tbody tr", function (e) {
    // table.row(this).data().id --- ID der aktuellen row
    currentClickedRowData = table.row(this).data();
    rightClick(e);
});

$("body").on('dblclick', '#file-table tbody tr', function (e) {
    var data = table.row(this).data();
    if (!$('#file_details_modal').hasClass('show')) {
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

    if (document.getElementById("contextMenu").style.display == "block") {
        hideMenu();
    } else {
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

$("#btnClosePreview").click(function (e) {
    hideDetails();
})

$("#contextBtnProperties").click(function (e) {
    $("#lblDetailsFilename").text(currentClickedRowData.FileName + "." + currentClickedRowData.Extension)
    $("#inputDetailsDescription").val(currentClickedRowData.Notes);
    $("#inputDetailsDate").val(new Date(currentClickedRowData.CreatedDate).toLocaleDateString("de-DE", $.dateOptions()));
    $("#inputDetailsCreator").val(currentClickedRowData.Creator);
    $("#inputDetailsFilesize").val(currentClickedRowData.Filesize);
});

$("#contextBtnCheckout").click(function (e) {
    var id = currentClickedRowData.FileDescriptorId;

    //$.blockUI();

    $.ajax({
        url: "https://dafis-api.int.ino.group/File/GetDownload",
        data: {
            fileId: id,
            fileversion: 0,
            fileName: currentClickedRowData.FileName + "." + currentClickedRowData.Extension,
            returnByte: true
        },
        headers: {
            executingUserId: loginSession.UserId,
            SessionToken: loginSession.SessionToken,
            Company: loginSession.Company
        },
        success: function (data) {
            $.successToastr();

            var name = currentClickedRowData.FileName + "." + currentClickedRowData.Extension;

            window.file.save(data, name);

            $.unblockUI();

        },
        error: function (data) {
            console.log("Error");
        }
    });

    // $.ajax({
    //     url: "https://localhost:44349/File/TestDownload?fileId=" + id + "&fileversion=0&fileName=" + currentClickedRowData.FileName + "." + currentClickedRowData.Extension + "&returnByte=true",
    //     type: "POST",
    //     data: {
    //         fileId: id,
    //         fileversion: 0,
    //         fileName: currentClickedRowData.FileName + "." + currentClickedRowData.Extension,
    //         returnByte: true
    //     },
    //     success: function(data) {
    //         $.successToastr();
    //         console.log(data);
    //     },
    //    error: function(data) {
    //        console.log(data);
    //    }
    //
    // });
});

$("#contextBtnDownload").click(function (e) {
    var id = currentClickedRowData.FileDescriptorId;
    $.blockUI();
    var file_path = "https://dafis-api.int.ino.group/File/GetDownload?fileId=" + id + "&fileversion=0";
    var a = document.createElement('A');
    a.href = file_path;
    a.value = currentClickedRowData.FileName;
    a.setAttribute("data-title", currentClickedRowData.FileName);
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    $.unblockUI();
});

$("#contextBtnMoveTo").click(function (e) {
    Swal.fire({
        title: "Wählen Sie in der Kategorieliste die gewünschte Kategorie aus, und drücken anschließend auf 'Speichern'",
        icon: "info",
        showCancelButton: true,
    }).then((result) => {
        if (result.isConfirmed) {
            enableFiltering = false;

            $("#folderBrowser").css("animation", "bg 2s ease-in");
            $("#btnMoveFileSave").css("display", "block");
        }
    });
});

$("#btnHome").click(function (e) {
    table.column(5).search("", true, false, true).draw();
    $(".tree-leaf-content").removeClass("folderSelected");
    tree.collapseAll();

    $("#category-navigation").html('<li class="breadcrumb-item active" aria-current="page">Hauptverzeichnis</li>');
});


$("body").on("click", "#btnUploadFile", function (e) {
    upload_file_to_Api();
});

function upload_file_to_Api() {
    console.log("UPload button click");
    var article = document.querySelector('#lblCurrentFolder');
    var crDate;
    var options = {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'};

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
        form_data.append("Clients", loginSession.Company);
        form_data.append("ExecutingUserId", loginSession.UserId);
        form_data.append("SessionToken", loginSession.SessionToken);
        form_data.append("Company", loginSession.Company);
        form_data.append("AlreadyExists", fileExists);

        // if (fileExists) {
        //     form_data.append("FileID", article.dataset.fileId);
        //     form_data.append("FileName", $("#fileDrop")[0].value);
        //     form_data.append("OldFileName", article.dataset.filename);
        // }

        crDate = new Date(inputFile.lastModified);
        form_data.append("FileCreationDate", crDate.toLocaleDateString('de-DE', options));

        $.ajax({
            url: 'https://dafis-api.int.ino.group/File/UploadFile',
            crossOrigin: true,
            type: "POST",
            contentType: false,
            processData: false,
            data: form_data,
            success: function (data) {
                if (data.success) {
                    $.successToastr();
                    clearUploadForm();
                } else {
                    $.errorToastr("Fehler beim Hochladen der Datei!");
                }

                fileExists = false;
            },
            error: function (data) {
                $.errorToastr("Fehler beim Hochladen der Datei!");
            }
        });

        fileExists = false;
    } else {

    }
}

function clearUploadForm() {
    $(".dropify-clear").trigger("click");
    $("#upload_file_form").trigger("reset");
    files = [];
}

$("#contextBtnProperties").click(function (e) {

    $("#file-details-version-list").html($("#version-placeholder").html());
    $("#inputDetailsCategory").html($("#category-placeholder").html());
    $("#inputDetailsFiletags").html($("#tag-placeholder").html());


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
        url: "https://dafis-api.int.ino.group/File/GetDetails",
        data: {
            fileDescriptorId: currentClickedRowData.FileDescriptorId
        },
        headers: {
            executingUserId: loginSession.UserId,
            SessionToken: loginSession.SessionToken,
            Company: loginSession.Company
        },
        success: function (data) {
            console.log(JSON.parse(data.result));

            if (data.success) {
                var result = JSON.parse(data.result);

                $("#file-details-version-list").html("");
                result.Versions.forEach(function (item) {
                    $("#file-details-version-list").append(item);
                });

                $("#inputDetailsCategory").html("");
                result.Categories.forEach(function (item) {
                    $("#inputDetailsCategory").append(item);
                });
            }
        },
        error: function (data) {
            console.log(error);
        }
    });
});

document.getElementById('update_file_modal').addEventListener('show.bs.modal', () => {
    var name = currentClickedRowData.FileName + "." + currentClickedRowData.Extension;
    $("#lblDetailsFilenameEdit").text(name);
    $("#inputDetailsDescriptionEdit").val(currentClickedRowData.VersionNotes);
    $("#inputDetailsFilenameEdit").val(name);
});

document.getElementById('upload_file_modal').addEventListener('show.bs.modal', () => {
    $("#inputCategory").val(currentCategory);
    $("#inputCategory").trigger('change');
});


$("#checkbox").on("change", () => {
    var html = $("html");

    if (html.attr("data-bs-theme") == "dark") {
        html.attr("data-bs-theme", "light");
    } else {
        html.attr("data-bs-theme", "dark");
    }
})


document.getElementsByClassName('odd').ondragstart = (event) => {
    event.preventDefault()
    window.electron.startDrag('drag-and-drop-2.md')
}


// document.querySelectorAll('.sidebar .nav-link').forEach(function(element){

//   element.addEventListener('click', function (e) {

//     let nextEl = element.nextElementSibling;
//     let parentEl  = element.parentElement;

//       if(nextEl) {
//           e.preventDefault();
//           let mycollapse = new Collapse(nextEl);

//           if(nextEl.classList.contains('show')){
//             mycollapse.hide();
//           } else {
//               mycollapse.show();
//               // find other submenus with class=show
//               var opened_submenu = parentEl.parentElement.querySelector('.submenu.show');
//               // if it exists, then close all of them
//               if(opened_submenu){
//                 new Collapse(opened_submenu);
//               }
//           }
//       }
//   }); // addEventListener
// }) // forEach


$("#btnUpdateFile").click(function (e) {
    $.ajax({
        url: "https://dafis-api.int.ino.group/File/UpdateFile",
        type: "POST",
        data: {
            "fileDescriptorId": currentClickedRowData.FileDescriptorId,
            "fileName": $("#inputDetailsFilenameEdit").val(),
            "notes": $("#inputDetailsDescriptionEdit").val(),
        },
        headers: {
            executingUserID: loginSession.UserId,
            SessionToken: loginSession.SessionToken,
            Company: loginSession.Company
        },
        success: function (data) {

        },
        error: function (data) {

        }
    });
})

$(".themeSelect").click(function (e) {
    $(".themeSelect").removeClass("active-theme");
    $(this).addClass("active-theme");

    var selectedTheme = $(this).data("value");

    $("html").attr("data-bs-theme", selectedTheme);
});


$("#btnMoveFile").click(function (e) {
    console.log($(".folderSelected").data("item"));

    Swal.fire({
        title: "Sind Sie ",
        icon: "question",
        showCancelButton: true,
    }).then((result) => {
        if (result.isConfirmed) {
            $("#folderBrowser").css("animation", "bg 2s ease-in");
            $("#btnMoveFileSave").css("display", "block");
        }
    });
});

$(".nav-link").not(".btnUser").click(function (event) {
    $(".nav-link").removeClass("activeNav");
    $(this).toggleClass("activeNav");
});


function changeMandant(newMandant) {
    // Login the user in the new mandant to get the login session
    $.ajax({
        url: "https://dafis-api.int.ino.group/DafisUser/SetSession",
        type: "POST",
        data: {
            username: loginSession.UserName,
            userId: loginSession.UserId,
            company: newMandant,
            userAgent: navigator.userAgent,
        },
        headers: {
            "company": loginSession.Company,
        },
        success: function (result) {
            if (result.success) {
                var loginData = result.result;

                window.create.session(loginData.fingerprint, loginData.dafisUserID, newMandant, loginSession.FullName, loginSession.UserName);
                window.api.loadscript('electron');

                location.reload();
            } else {
                errorToastr("Password oder Nutzername falsch");
            }
        },
        error: function (data) {
            console.log(data);
        }
    });
}

$("#defaultDownload").on("change", function (event) {
    const selectedFolder = event.target.files[0];
    console.log("Der ausgewählte Ordner ist: ", selectedFolder.path);
    // Hier kannst du die Logik implementieren, um den ausgewählten Ordner als Standard-Download-Ordner festzulegen
});

$("#input").on("change", function (event) {
    // Input is the search bar at the top of the page, when the user types in the search bar, the table will be filtered, after a timeout of 1 second
    var value = $(this).val();
    table.search(value).draw();
});