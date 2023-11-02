function uploadFile() {
    var article = document.querySelector('#lblCurrentFolder');
    var crDate;
    var options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };


    var Categories = [];
    $("#inputSelect_Categories option:selected").each(function () {
        Categories.push($(this).val());
    });

    var Clients = [];
    $("#inputSelect_Clients option:selected").each(function () {
        Clients.push($(this).val());
    });

    var inpfile = $("#file_upload").prop("files")[0];

    if (inpfile == undefined) {
        inpfile = clickUploadedFile;
    }

    var cookies = document.cookie.split(";");
    var user, token, company;

    cookies.forEach(function (cookie) {
        if (cookie.includes("UserID")) {
            user = cookie.split("=")[1].trim();
        }
        if (cookie.includes("SessionToken")) {
            token = cookie.split("=")[1].trim();
        }
        if (cookie.includes("Company")) {
            company = cookie.split("=")[1].trim();
        }
    });

    if ($("#inputCreationDate")[0].value != "" && $("#inputFile")[0].value != "") {
        var File = inpfile;
        var Description = $("#inputDescription")[0].value;
        var Category = JSON.stringify(Categories);

        var form_data = new FormData();

        form_data.append("File", File);
        form_data.append("Description", Description);
        form_data.append("Category", Category);
        form_data.append("Clients", Clients);
        form_data.append("ExecutingUserId", user);
        form_data.append("SessionToken", token);
        form_data.append("Company", company);
        form_data.append("AlreadyExists", fileExists);

        if (fileExists) {
            form_data.append("FileID", article.dataset.fileId);
            form_data.append("FileName", $("#inputFile")[0].value);
            form_data.append("OldFileName", article.dataset.filename);
        }

        if (inpfile) {
            crDate = new Date(inpfile.lastModified);
            form_data.append("FileCreationDate", crDate.toLocaleDateString('de-DE', options));
        }
        
        $.ajax({
            url: '@($"{apiUrl}File/UploadFile/")',
            crossOrigin: true,
            type: "POST",
            contentType: false,
            processData: false,
            data: form_data,
            success: function (data) {
                if (data.success) {
                    showSuccessModal();
                }
                else {
                    showErrorModal();
                }

                fileExists = false;
            },
            error: function (data) {
                showErrorModal();
            }
        });

        fileExists = false;
    }
    else {

        toastr.options = {
            "closeButton": false,
            "debug": false,
            "newestOnTop": true,
            "progressBar": false,
            "positionClass": "toast-top-center",
            "preventDuplicates": true,
            "onclick": null,
            "showDuration": "2000",
            "hideDuration": "2000",
            "timeOut": "2000",
            "extendedTimeOut": "2000",
            "showEasing": "swing",
            "hideEasing": "linear",
            "showMethod": "fadeIn",
            "hideMethod": "fadeOut"
        };

        toastr.error('Please input a File');
    }
}