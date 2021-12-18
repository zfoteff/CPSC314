
$(window).on('load', function(req, res) {
    console.log("Settings window loaded successfully");
    $('#change-username').on('click', function(req, res) {
        var newUsername = window.prompt("Enter new username");
        if (newUsername != null || newUsername != "")
            $.post('/settings/changeUsername', {"newUsername":newUsername}, function(error) {
                if (error) console.log(error);
                console.log("changed username successfully");
            })
    });

    $('#change-password').on('click', function(req, res) {
        var newPass = window.prompt("Enter new Password");
        if (newPass != null || newPass != ""){
            bcrypt.hash(newPass, 10, function (err, hash) {
                if (err) next(err);
                $.post('/settings/changePassword', {"newPass":hash}, function(error) {
                    if (error) console.log(error);
                    console.log("changed password successfully");
                })
            })
        }
    });
})