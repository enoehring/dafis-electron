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

    var inputFile = $("#fileDrop").prop("files")[0];

    var fileExists = false;

    if ($("#inputDate")[0].value != "" && $("#fileDrop")[0].value != "") {
        var Description = $("#inputDescription")[0].value;
        var Category = JSON.stringify(Categories);

        var form_data = new FormData();

        form_data.append("File", inputFile);
        form_data.append("Description", Description);
        form_data.append("Category", Category);
        form_data.append("Clients", Clients);
        form_data.append("ExecutingUserId", user);
        form_data.append("SessionToken", token);
        form_data.append("Company", company);
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