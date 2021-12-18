$(window).on('load', function() {
    console.log("Login window loaded successfully");
    $('#clear-button').on('click', function() {
        console.log("Cleared input");
        $('#uid').val("");
        $('#password').val("");
    });
})